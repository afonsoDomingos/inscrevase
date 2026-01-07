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
