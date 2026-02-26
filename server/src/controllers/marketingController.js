const MarketingRequest = require('../models/MarketingRequest');
const NotificationService = require('../services/notificationService');

exports.createRequest = async (req, res) => {
    try {
        const { serviceType, contactName, whatsapp, email, companyName, details } = req.body;

        const newRequest = new MarketingRequest({
            userId: req.user.id,
            serviceType,
            contactName,
            whatsapp,
            email,
            companyName,
            details
        });

        await newRequest.save();

        // Notify Admins (Logic for notifying all admins could be added here)
        // For now, it's just saved in DB for the dashboard

        res.status(201).json({
            message: 'Pedido enviado com sucesso! A nossa equipa entrará em contacto em breve.',
            request: newRequest
        });
    } catch (error) {
        console.error('Error creating marketing request:', error);
        res.status(500).json({ message: 'Erro ao processar pedido. Tente novamente mais tarde.' });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await MarketingRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching my marketing requests:', error);
        res.status(500).json({ message: 'Erro ao carregar os seus pedidos.' });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        // Admin only route (enforced in routes)
        const requests = await MarketingRequest.find()
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching all marketing requests:', error);
        res.status(500).json({ message: 'Erro ao carregar pedidos.' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const updatedRequest = await MarketingRequest.findByIdAndUpdate(
            id,
            { status, adminNotes },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }

        // Notify the user about status change
        NotificationService.createNotification({
            userId: updatedRequest.userId,
            title: 'Atualização de Pedido de Marketing',
            message: `O status do seu pedido para "${updatedRequest.serviceType}" foi alterado para: ${status}`,
            type: 'system',
            metadata: { requestId: id, type: 'marketing_update' }
        });

        res.json({
            message: 'Status atualizado com sucesso.',
            request: updatedRequest
        });
    } catch (error) {
        console.error('Error updating marketing request status:', error);
        res.status(500).json({ message: 'Erro ao atualizar status.' });
    }
};
