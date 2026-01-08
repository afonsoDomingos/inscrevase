const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
require('dotenv').config(); // Fallback to current dir

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(require('./config/passport').initialize());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('Inscreva-se API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('--- Verificação de Ambiente ---');
    console.log('PORT:', PORT);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'CONFIGURADO' : 'AUSENTE');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'CONFIGURADO' : 'AUSENTE');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'CONFIGURADO' : 'AUSENTE');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'CONFIGURADO' : 'AUSENTE');
    console.log('-------------------------------');
});

// Force restart trigger
console.log('--- Servidor Reiniciado (Audit Mode): ' + new Date().toISOString() + ' ---');
// Cache cleared and server forced to reload envs.
