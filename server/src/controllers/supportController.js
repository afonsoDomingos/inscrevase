const SupportTicket = require('../models/SupportTicket');

exports.createTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const ticket = await SupportTicket.create({
            user: req.user.id,
            subject,
            messages: [{ sender: 'user', content: message }]
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
        const { content } = req.body;
        const { id } = req.params;
        const role = req.user.role === 'admin' ? 'admin' : 'user';

        const ticket = await SupportTicket.findById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });

        if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        ticket.messages.push({ sender: role, content });
        if (role === 'admin') ticket.status = 'answered';
        else ticket.status = 'open';

        await ticket.save();
        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao responder', error: error.message });
    }
};
