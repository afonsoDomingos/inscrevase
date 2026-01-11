const SupportTicket = require('../models/SupportTicket');

exports.createTicket = async (req, res) => {
    try {
        const { subject, message, attachment } = req.body;
        const ticket = await SupportTicket.create({
            user: req.user.id,
            subject,
            messages: [{ sender: 'user', content: message, attachment: attachment || null }]
        });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar ticket', error: error.message });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar tickets', error: error.message });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar tickets', error: error.message });
    }
};

exports.addMessage = async (req, res) => {
    try {
        const { content, attachment } = req.body;
        const { id } = req.params;

        // Check if user is admin or SuperAdmin
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';
        const role = isAdmin ? 'admin' : 'user';

        const ticket = await SupportTicket.findById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });

        // Handle both ObjectId and populated user object
        const ticketUserId = ticket.user._id ? ticket.user._id.toString() : ticket.user.toString();

        // Allow if user owns the ticket OR if user is admin/SuperAdmin
        if (ticketUserId !== req.user.id && !isAdmin) {
            console.log('Authorization failed:', { ticketUserId, userId: req.user.id, userRole: req.user.role });
            return res.status(403).json({ message: 'Não autorizado' });
        }

        ticket.messages.push({ sender: role, content, attachment: attachment || null });
        if (role === 'admin') ticket.status = 'answered';
        else ticket.status = 'open';

        await ticket.save();

        // Populate user data before returning
        await ticket.populate('user', 'name email');

        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error in addMessage:', error);
        res.status(500).json({ message: 'Erro ao responder', error: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        let unreadCount = 0;

        if (isAdmin) {
            // For admin: count tickets where last message is from user and newer than lastReadByAdmin
            const tickets = await SupportTicket.find({ status: { $ne: 'closed' } });

            unreadCount = tickets.filter(ticket => {
                if (ticket.messages.length === 0) return false;

                const lastMessage = ticket.messages[ticket.messages.length - 1];

                // If last message is from user
                if (lastMessage.sender === 'user') {
                    // Check if admin hasn't read it yet or if message is newer than last read
                    if (!ticket.lastReadByAdmin || lastMessage.createdAt > ticket.lastReadByAdmin) {
                        return true;
                    }
                }
                return false;
            }).length;
        } else {
            // For user: count tickets where last message is from admin and newer than lastReadByUser
            const tickets = await SupportTicket.find({ user: req.user.id, status: { $ne: 'closed' } });

            unreadCount = tickets.filter(ticket => {
                if (ticket.messages.length === 0) return false;

                const lastMessage = ticket.messages[ticket.messages.length - 1];

                // If last message is from admin
                if (lastMessage.sender === 'admin') {
                    // Check if user hasn't read it yet or if message is newer than last read
                    if (!ticket.lastReadByUser || lastMessage.createdAt > ticket.lastReadByUser) {
                        return true;
                    }
                }
                return false;
            }).length;
        }

        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error('Error in getUnreadCount:', error);
        res.status(500).json({ message: 'Erro ao buscar notificações', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        const ticket = await SupportTicket.findById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });

        // Update the appropriate lastRead field
        if (isAdmin) {
            ticket.lastReadByAdmin = new Date();
        } else {
            // Verify user owns the ticket
            const ticketUserId = ticket.user._id ? ticket.user._id.toString() : ticket.user.toString();
            if (ticketUserId !== req.user.id) {
                return res.status(403).json({ message: 'Não autorizado' });
            }
            ticket.lastReadByUser = new Date();
        }

        await ticket.save();
        res.status(200).json({ message: 'Marcado como lido' });
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ message: 'Erro ao marcar como lido', error: error.message });
    }
};



// Public contact form (no authentication required)
const SupportMessage = require('../models/SupportMessage');

// Try to load nodemailer with multiple fallbacks
let nodemailer;
try {
    const nodemailerModule = require('nodemailer');
    console.log('[Email] Nodemailer module type:', typeof nodemailerModule);
    console.log('[Email] Nodemailer keys:', Object.keys(nodemailerModule || {}).join(', '));

    // Try different ways to get createTransporter
    if (typeof nodemailerModule === 'function') {
        // If nodemailer itself is a function
        nodemailer = nodemailerModule;
    } else if (nodemailerModule && nodemailerModule.default) {
        // ES module with default export
        nodemailer = nodemailerModule.default;
        console.log('[Email] Using default export');
    } else if (nodemailerModule && typeof nodemailerModule.createTransport === 'function') {
        // Note: it's createTransport, not createTransporter!
        nodemailer = nodemailerModule;
        console.log('[Email] Found createTransport (not createTransporter)');
    } else {
        // Use as-is
        nodemailer = nodemailerModule;
    }

    console.log('[Email] Final nodemailer type:', typeof nodemailer);
    console.log('[Email] Has createTransport?', typeof nodemailer?.createTransport);
    console.log('[Email] Has createTransporter?', typeof nodemailer?.createTransporter);
} catch (error) {
    console.error('[Email] Failed to load nodemailer:', error.message);
}



exports.createPublicMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: 'Todos os campos são obrigatórios'
            });
        }

        const supportMessage = new SupportMessage({
            name,
            email,
            subject,
            message
        });

        await supportMessage.save();

        // Verificar se as credenciais de email estão configuradas
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;

        if (!emailUser || !emailPassword) {
            console.warn('[Email] Email credentials not configured. Message saved but email not sent.');
            return res.status(201).json({
                message: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
                id: supportMessage._id,
                emailSent: false
            });
        }

        // Verificar se nodemailer está disponível
        const createTransportFn = nodemailer?.createTransport || nodemailer?.createTransporter;
        if (!nodemailer || typeof createTransportFn !== 'function') {
            console.error('[Email] Nodemailer not properly loaded. Type:', typeof nodemailer);
            console.error('[Email] createTransport type:', typeof nodemailer?.createTransport);
            console.error('[Email] createTransporter type:', typeof nodemailer?.createTransporter);
            return res.status(201).json({
                message: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
                id: supportMessage._id,
                emailSent: false,
                error: 'Email service temporarily unavailable'
            });
        }

        // Configurar transporter de email (dentro da função)
        try {
            const transporter = createTransportFn({
                service: 'gmail',
                auth: {
                    user: emailUser,
                    pass: emailPassword
                },
                connectionTimeout: 5000, // 5 seconds
                greetingTimeout: 5000,
                socketTimeout: 5000
            });

            // Verificar conexão antes de enviar (com timeout)
            const verifyPromise = transporter.verify();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('SMTP connection timeout')), 5000)
            );

            await Promise.race([verifyPromise, timeoutPromise]);
            console.log('[Email] SMTP connection verified');

            // Enviar email de notificação para o admin
            await transporter.sendMail({
                from: `"Inscreva-se Suporte" <${emailUser}>`,
                to: 'karinganastudio23@gmail.com',
                subject: `Nova Mensagem de Suporte: ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #171A20;">Nova Mensagem de Suporte</h2>
                        <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <p><strong>Nome:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Assunto:</strong> ${subject}</p>
                        </div>
                        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h3>Mensagem:</h3>
                            <p style="line-height: 1.6;">${message}</p>
                        </div>
                        <p style="color: #666; font-size: 12px; margin-top: 20px;">
                            ID: ${supportMessage._id}<br>
                            Data: ${new Date().toLocaleString('pt-BR')}
                        </p>
                    </div>
                `
            });

            // Email de confirmação para o usuário
            await transporter.sendMail({
                from: `"Inscreva-se Suporte" <${emailUser}>`,
                to: email,
                subject: 'Recebemos sua mensagem - Inscreva-se',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #171A20;">Olá, ${name}!</h2>
                        <p style="font-size: 16px; line-height: 1.6;">
                            Recebemos sua mensagem e entraremos em contato em breve.
                        </p>
                        <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <p><strong>Assunto:</strong> ${subject}</p>
                            <p><strong>Sua mensagem:</strong></p>
                            <p style="color: #666;">${message}</p>
                        </div>
                        <p style="color: #666;">
                            Nossa equipe geralmente responde em até 24 horas durante dias úteis.
                        </p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            Protocolo: #${supportMessage._id.toString().slice(-8).toUpperCase()}
                        </p>
                    </div>
                `
            });

            console.log('[Email] Emails sent successfully for message:', supportMessage._id);

        } catch (emailError) {
            console.error('[Email] Erro ao enviar email:', emailError.message);

            // Se for timeout de conexão, é provável que o Render esteja bloqueando SMTP
            if (emailError.message.includes('timeout') || emailError.message.includes('ETIMEDOUT')) {
                console.warn('[Email] SMTP ports may be blocked by hosting provider (Render)');
                console.warn('[Email] Consider using SendGrid, Mailgun, or AWS SES instead');
            }

            // Não falha a requisição se o email não for enviado
            return res.status(201).json({
                message: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
                id: supportMessage._id,
                emailSent: false,
                note: 'Email temporariamente indisponível. Sua mensagem foi salva.'
            });
        }

        res.status(201).json({
            message: 'Mensagem enviada com sucesso! Verifique seu email.',
            id: supportMessage._id,
            emailSent: true
        });

    } catch (error) {
        console.error('Erro ao criar mensagem:', error);
        res.status(500).json({
            message: 'Erro ao enviar mensagem. Tente novamente.',
            error: error.message
        });
    }
};


