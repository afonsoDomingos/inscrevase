const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const http = require('http'); // Import http
const { Server } = require('socket.io'); // Import Socket.IO
const pino = require('pino');

// --- CONFIGURAÇÕES DE AMBIENTE (TOP IMPORTANCE) ---
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config(); // Fallback to current dir

const whatsappService = require('./services/whatsappService');
const User = require('./models/User');
const AdminAlertService = require('./services/adminAlertService');
// Iniciar Motor do WhatsApp IMEDIATAMENTE (agora com envs carregados)
whatsappService.init().catch(err => console.error('⚠️ WhatsApp Init Error:', err));

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Trust Proxy for Render/Proxy environments
app.set('trust proxy', 1);

// --- REQUEST LOGGER (SAFE FOR PRODUCTION) ---
const logger = pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["set-cookie"]'
        ],
        remove: true
    }
});

app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        // Avoid logging raw query strings (can include tokens/emails).
        // Use `req.path` instead of `req.originalUrl`.
        const payload = {
            req: {
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('user-agent')
            },
            res: {
                statusCode: res.statusCode
            },
            durationMs: Date.now() - start
        };

        // Keep dev output more visible; keep production lean.
        if (process.env.NODE_ENV === 'production') {
            logger.info(payload, 'http');
        } else {
            logger.debug(payload, 'http');
        }
    });

    next();
});

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Desativar CSP temporariamente para garantir que as imagens carregam no iframe
    crossOriginEmbedderPolicy: false,
    frameguard: {
        action: 'sameorigin' // Permitir que o teu site use iframes do teu próprio API
    }
})); // Set security HTTP headers

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'https://inscrevase.com',
    'https://www.inscrevase.com',
    'https://inscreva-se.com',
    'https://www.inscreva-se.com'
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Check if origin is a vercel preview deployment
            if (origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    maxHttpBufferSize: 5e7 // 50MB
});

// Middleware de Autenticação para Socket.IO
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        console.error(`[Socket.IO] Conexão recusada (${socket.id}): Token não fornecido.`);
        return next(new Error("Authentication error: Token required"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error(`[Socket.IO] Erro de Token (${socket.id}):`, err.message); // Log exato do erro (Expired, Invalid, etc)
            return next(new Error("Authentication error: Invalid token"));
        }
        // Anexar o ID do usuário autenticado ao socket
        socket.userId = decoded.id;
        console.log(`[Socket.IO] Autenticado com sucesso: User ${decoded.id} (Socket ${socket.id})`);
        next();
    });
});

// Presence System (In-Memory)
// Map<UserId, Set<SocketId>>
const onlineUsers = new Map();

// Initialize services
const NotificationService = require('./services/notificationService');
const LiveBoardService = require('./services/liveBoardService');
NotificationService.init(io);
LiveBoardService.init(io);

async function notifyAdminsUserOnline(userId) {
    try {
        const onlineUser = await User.findById(userId).select('name email role');
        if (!onlineUser) return;

        const displayName = onlineUser.name || onlineUser.email || 'Utilizador';
        await AdminAlertService.notifyAdmins({
            senderId: onlineUser._id,
            title: 'Utilizador online',
            content: `${displayName} esta online agora.`,
            actionUrl: '/dashboard/admin?tab=users',
            type: 'system',
            cooldownKey: `online:${onlineUser._id}`,
            cooldownMs: 5 * 60 * 1000
        });
    } catch (error) {
        console.error('[ONLINE ALERT] Failed to notify admins:', error.message);
    }
}

io.on('connection', (socket) => {
    // UserId agora vem do middleware de autenticação (seguro)
    const userId = socket.userId;

    if (userId) {
        // Join individual room for direct notifications
        socket.join(userId.toString());
        console.log(`[Socket.IO] User ${userId} joined their private room.`);
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        // Notify everyone (including sender) if status changed to ONLINE
        if (onlineUsers.get(userId).size === 1) {
            io.emit('user_status_change', { userId, status: 'online' });
            console.log(`User ${userId} is now ONLINE (${socket.id})`);
            notifyAdminsUserOnline(userId);
        }

        // Send current list ONLY to the new client
        socket.emit('online_users_list', Array.from(onlineUsers.keys()));

        // Hook LiveBoard events
        LiveBoardService.handleSocket(socket);
    } else {
        console.log('Socket connection without userId (should be caught by middleware)');
    }

    // Community Chat Rooms
    socket.on('join_community', (formId) => {
        socket.join(`community_${formId}`);
        console.log(`User ${userId} joined community room: community_${formId}`);
    });

    socket.on('leave_community', (formId) => {
        socket.leave(`community_${formId}`);
        console.log(`User ${userId} left community room: community_${formId}`);
    });

    socket.on('disconnect', () => {
        if (userId && onlineUsers.has(userId)) {
            const userSockets = onlineUsers.get(userId);
            userSockets.delete(socket.id);

            // If no more connections for this user, mark as OFFLINE
            if (userSockets.size === 0) {
                onlineUsers.delete(userId);
                io.emit('user_status_change', { userId, status: 'offline' });
                console.log(`User ${userId} is now OFFLINE`);
            }
        }
    });
});

// Attach io to req for usage in controllers if needed
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: 'Muitas requisições. Por favor, aguarde alguns minutos e tente novamente.' },
    handler: (req, res) => {
        console.warn(`[SECURITY] Rate limit excedido: IP ${req.ip} tentou acessar ${req.originalUrl}`);
        res.status(429).json({ message: 'Muitas requisições. Por favor, aguarde alguns minutos e tente novamente.' });
    }
});
app.use(limiter);

// Auth Rate Limiter (More strict for login/register)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 auth requests per hour
    message: { message: 'Muitas tentativas de autenticação. Por favor, tente novamente em uma hora.' },
    handler: (req, res) => {
        console.warn(`[SECURITY] Auth Rate limit excedido: IP ${req.ip} tentou acesso em ${req.originalUrl}`);
        res.status(429).json({ message: 'Muitas tentativas de autenticação. Por favor, tente novamente em uma hora.' });
    }
});
// Webhook Route - Must be defined BEFORE express.json() to capture raw body
const stripeController = require('./controllers/stripeController');
const smartLinkController = require('./controllers/smartLinkController'); // Added for global redirects
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// --- TESTE DE ATUALIZAÇÃO ---
app.get('/qr-test', (req, res) => {
    res.send('✅ O Servidor da Inscreva-se está Atualizado!');
});

// Standard Middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for larger form submissions
app.use(require('./config/passport').initialize());

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/stripe', require('./routes/stripeRoutes'));
app.use('/api/paypal', require('./routes/paypalRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/exchange-rates', require('./routes/exchangeRate'));
app.use('/api/admin/communication', require('./routes/adminCommunicationRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/smartlinks', require('./routes/smartLinkRoutes'));
app.use('/api/marketing', require('./routes/marketingRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/vacancies', require('./routes/vacancyRoutes'));
app.use('/api/push', require('./routes/pushRoutes'));
app.use('/api/admin/whatsapp', require('./routes/whatsappRoutes'));
app.use('/api/motiva', require('./routes/motivaRoutes')); // Motiva Official Route
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/personal', require('./routes/personalManagementRoutes'));

// --- GLOBAL SMARTLINK REDIRECT ---
// This allows clean links like inscreva-se.com/l/meu-evento
app.get('/l/:slug', smartLinkController.handleRedirect);

// Endpoint to get all online users
app.get('/api/users/status/online', (req, res) => {
    res.json(Array.from(onlineUsers.keys()));
});

// Basic Routes
app.get('/api', (req, res) => {
    res.json({ message: 'Inscreva-se API is working...', version: '1.2.0' });
});

app.get('/', (req, res) => {
    res.send('Inscreva-se API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');

        // Initialize automations
        const { initAutomations } = require('./services/automationService');
        initAutomations();

        // Initialize exchange rates on startup
        const exchangeRateService = require('./services/exchangeRateService');
        exchangeRateService.getCurrentRates()
            .then(() => console.log('✅ Exchange rates initialized'))
            .catch(err => console.error('⚠️  Failed to initialize exchange rates:', err.message));
    })
    .catch(err => console.log('MongoDB Connection Error:', err));

// Use server.listen instead of app.listen
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('--- Verificação de Ambiente ---');
    console.log('PORT:', PORT);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'CONFIGURADO' : 'AUSENTE');
    console.log('SOCKET.IO:', 'INICIALIZADO');
    console.log('-------------------------------');
});

// Force restart trigger
console.log('--- Servidor Atualizado com Socket.IO: ' + new Date().toISOString() + ' ---');

