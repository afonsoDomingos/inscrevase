const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');

exports.createTicket = async (req, res) => {
    try {
        const { subject, message, attachment, mentorId } = req.body;
        const ticket = await SupportTicket.create({
            user: req.user.id,
            mentor: mentorId || null,
            subject,
            messages: [{ sender: 'user', content: message, attachment: attachment || null }],
            unreadByAdmin: !mentorId, // If no mentor, it's for admin
            unreadByMentor: !!mentorId // If mentor, it's for mentor
        });

        // Notify Mentor if applicable
        if (mentorId) {
            await Notification.create({
                user: mentorId,
                type: 'info',
                title: 'Nova Mensagem de Suporte',
                message: `Novo ticket de suporte: ${subject}`,
                link: '/dashboard/mentor?tab=support' // Assuming support tab or modal logic
            });
        }

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar ticket', error: error.message });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        // Find tickets where I am the user OR I am the mentor
        const tickets = await SupportTicket.find({
            $or: [
                { user: req.user.id },
                { mentor: req.user.id }
            ]
        }).populate('user', 'name email').populate('mentor', 'name businessName').sort({ createdAt: -1 });
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

        const ticket = await SupportTicket.findById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });

        // Determine role
        let role = 'user';
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';
        const isMentor = ticket.mentor && ticket.mentor.toString() === req.user.id;
        const isOwner = ticket.user.toString() === req.user.id;

        if (isAdmin) {
            role = 'admin';
        } else if (isMentor) {
            role = 'mentor';
        } else if (isOwner) {
            role = 'user';
        } else {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        ticket.messages.push({
            sender: role,
            content,
            attachment: attachment || null
        });

        // Set unread flags and send Notifications
        const notificationData = {
            type: 'info',
            title: 'Nova Resposta no Suporte',
            message: `Nova resposta no ticket: ${ticket.subject}`,
            link: role === 'user' ? '/dashboard/mentor?tab=support' : '/dashboard/participant?tab=tickets'
        };

        if (role === 'admin') {
            ticket.unreadByUser = true;
            ticket.unreadByMentor = ticket.mentor ? true : false;
            // Notify User
            await Notification.create({ ...notificationData, user: ticket.user, link: '/dashboard/participant?tab=tickets' });
            // Notify Mentor if involved
            if (ticket.mentor) {
                await Notification.create({ ...notificationData, user: ticket.mentor, link: '/dashboard/mentor?tab=support' });
            }

        } else if (role === 'mentor') {
            ticket.unreadByUser = true;
            ticket.unreadByAdmin = false;
            // Notify User
            await Notification.create({ ...notificationData, user: ticket.user, link: '/dashboard/participant?tab=tickets' });

        } else if (role === 'user') {
            if (ticket.mentor) {
                ticket.unreadByMentor = true;
                // Notify Mentor
                await Notification.create({ ...notificationData, user: ticket.mentor, link: '/dashboard/mentor?tab=support' });
            } else {
                ticket.unreadByAdmin = true;
                // Notify Admin (optional, or just rely on unread flag)
            }
        }

        await ticket.save();
        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar mensagem', error: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        if (isAdmin) {
            const count = await SupportTicket.countDocuments({ unreadByAdmin: true });
            return res.status(200).json({ count });
        } else {
            // Check as user AND check as mentor
            const userCount = await SupportTicket.countDocuments({
                user: req.user.id,
                unreadByUser: true
            });
            const mentorCount = await SupportTicket.countDocuments({
                mentor: req.user.id,
                unreadByMentor: true
            });
            return res.status(200).json({ count: userCount + mentorCount });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao contar mensagens não lidas', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        const ticket = await SupportTicket.findById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });

        if (isAdmin) {
            ticket.unreadByAdmin = false;
        } else if (ticket.mentor && ticket.mentor.toString() === req.user.id) {
            ticket.unreadByMentor = false;
        } else if (ticket.user.toString() === req.user.id) {
            ticket.unreadByUser = false;
        } else {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        await ticket.save();
        res.status(200).json({ message: 'Marcado como lido' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao marcar como lido', error: error.message });
    }
};


// Public contact form (no authentication required)
const SupportMessage = require('../models/SupportMessage');
const { Resend } = require('resend');

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
        console.log('[Support] Message saved:', supportMessage._id);

        // Verificar se Resend está configurado
        const resendKey = process.env.RESEND_API_KEY;

        if (!resendKey) {
            console.warn('[Email] Resend API key not configured');
            return res.status(201).json({
                message: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
                id: supportMessage._id,
                emailSent: false
            });
        }

        // Configurar Resend
        const resend = new Resend(resendKey);

        try {
            // NOTA: Resend em modo sandbox só permite enviar para karinganastudio23@gmail.com
            // Até verificar um domínio, ambos os emails vão para o admin

            // Enviar ambos os emails
            const [adminResult, userResult] = await Promise.all([
                // Email para o admin
                resend.emails.send({
                    from: 'Inscreva-se <onboarding@resend.dev>',
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
                                Data: ${new Date().toLocaleString('pt-BR')}<br>
                                <a href="mailto:${email}" style="color: #171A20; font-weight: bold;">Responder para ${email}</a>
                            </p>
                        </div>
                    `
                }),
                // Email de confirmação (também para admin enquanto em sandbox)
                resend.emails.send({
                    from: 'Inscreva-se <onboarding@resend.dev>',
                    to: 'karinganastudio23@gmail.com', // Temporariamente para admin
                    subject: `[CONFIRMAÇÃO PARA ${name}] Recebemos sua mensagem`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                                <p style="margin: 0; color: #856404;">
                                    <strong>⚠️ MODO SANDBOX:</strong> Este email deveria ir para <strong>${email}</strong>, 
                                    mas o Resend está em modo de teste. Você pode copiar e enviar manualmente.
                                </p>
                            </div>
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
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            <p style="font-size: 12px; color: #999; text-align: center;">
                                Inscreva-se - Plataforma de Gestão de Eventos<br>
                                WhatsApp: +258 84 787 7405<br>
                                Email: karinganastudio23@gmail.com
                            </p>
                        </div>
                    `
                })
            ]);

            console.log('[Email] Emails sent successfully via Resend');
            console.log('[Email] Admin email result:', JSON.stringify(adminResult, null, 2));
            console.log('[Email] User email result:', JSON.stringify(userResult, null, 2));

            // Check if user email failed
            if (userResult.error) {
                console.error('[Email] User email failed:', userResult.error);
            }

            res.status(201).json({
                message: 'Mensagem enviada com sucesso! Verifique seu email.',
                id: supportMessage._id,
                emailSent: true,
                adminEmailSent: !!adminResult.data?.id,
                userEmailSent: !!userResult.data?.id
            });

        } catch (emailError) {
            console.error('[Email] Resend error:', emailError);

            // Mensagem salva, mas email falhou
            return res.status(201).json({
                message: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
                id: supportMessage._id,
                emailSent: false,
                note: 'Email temporariamente indisponível'
            });
        }

    } catch (error) {
        console.error('[Support] Error creating message:', error);
        res.status(500).json({
            message: 'Erro ao enviar mensagem. Tente novamente.',
            error: error.message
        });
    }
};

// Admin functions for public support messages
exports.getAllPublicMessages = async (req, res) => {
    try {
        const { status, priority } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const messages = await SupportMessage.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        const stats = {
            total: await SupportMessage.countDocuments(),
            pending: await SupportMessage.countDocuments({ status: 'pending' }),
            resolved: await SupportMessage.countDocuments({ status: 'resolved' }),
            closed: await SupportMessage.countDocuments({ status: 'closed' })
        };

        res.status(200).json({ messages, stats });
    } catch (error) {
        console.error('[Support] Error fetching messages:', error);
        res.status(500).json({
            message: 'Erro ao buscar mensagens',
            error: error.message
        });
    }
};

exports.updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, response } = req.body;

        const message = await SupportMessage.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Mensagem não encontrada' });
        }

        if (status) message.status = status;
        if (priority) message.priority = priority;
        if (response) {
            message.response = response;
            message.respondedAt = new Date();
            message.respondedBy = req.user.id;
        }

        await message.save();

        // Se houver resposta, enviar email para o usuário
        if (response && process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);

            try {
                await resend.emails.send({
                    from: 'Inscreva-se <onboarding@resend.dev>',
                    to: message.email,
                    subject: `Resposta: ${message.subject}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #171A20;">Olá, ${message.name}!</h2>
                            <p style="font-size: 16px; line-height: 1.6;">
                                Recebemos uma resposta para sua mensagem:
                            </p>
                            <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                <p><strong>Sua mensagem original:</strong></p>
                                <p style="color: #666;">${message.message}</p>
                            </div>
                            <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4caf50;">
                                <p><strong>Nossa resposta:</strong></p>
                                <p style="line-height: 1.6;">${response}</p>
                            </div>
                            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                                Protocolo: #${message._id.toString().slice(-8).toUpperCase()}
                            </p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            <p style="font-size: 12px; color: #999; text-align: center;">
                                Inscreva-se - Plataforma de Gestão de Eventos<br>
                                WhatsApp: +258 84 787 7405<br>
                                Email: karinganastudio23@gmail.com
                            </p>
                        </div>
                    `
                });
                console.log('[Email] Response sent to user:', message.email);
            } catch (emailError) {
                console.error('[Email] Error sending response:', emailError);
            }
        }

        res.status(200).json({
            message: 'Mensagem atualizada com sucesso',
            data: message
        });
    } catch (error) {
        console.error('[Support] Error updating message:', error);
        res.status(500).json({
            message: 'Erro ao atualizar mensagem',
            error: error.message
        });
    }
};

exports.deletePublicMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await SupportMessage.findByIdAndDelete(id);
        if (!message) {
            return res.status(404).json({ message: 'Mensagem não encontrada' });
        }

        res.status(200).json({ message: 'Mensagem deletada com sucesso' });
    } catch (error) {
        console.error('[Support] Error deleting message:', error);
        res.status(500).json({
            message: 'Erro ao deletar mensagem',
            error: error.message
        });
    }
};
