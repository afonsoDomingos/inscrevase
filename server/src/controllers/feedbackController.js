const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createFeedback = async (req, res) => {
    try {
        const { name, email, type, rating, message, targetUserId } = req.body;
        const userId = req.user ? req.user.id : null;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Nome, email e mensagem são obrigatórios' });
        }

        const feedback = new Feedback({
            user: userId,
            name,
            email,
            type: type || 'suggestion',
            rating: rating || 5,
            message,
            targetUser: targetUserId || null
        });

        await feedback.save();

        // Reward the user with points if they are logged in
        let rewardMessage = 'Feedback enviado com sucesso!';
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                $inc: { referralPoints: 10 } // Reward 10 points for feedback
            });
            rewardMessage += ' Ganhaste 10 pontos.';
        }

        // If target exists, notify them
        if (targetUserId) {
            const admin = await User.findOne({ role: 'admin' });
            const notification = new Notification({
                recipient: targetUserId,
                sender: userId || (admin ? admin._id : targetUserId),
                type: 'feedback',
                title: 'Novo Feedback Recebido',
                content: `${name || 'Alguém'} enviou uma sugestão: "${message.substring(0, 50)}..."`,
                actionUrl: '/dashboard/mentor?tab=feedback'
            });
            await notification.save();
        }

        res.status(201).json({ message: rewardMessage, feedback });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ message: 'Erro ao enviar feedback' });
    }
};

exports.getFeedbacksForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const feedbacks = await Feedback.find({ targetUser: userId }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar feedbacks' });
    }
};

exports.getAllFeedbacksAdmin = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar todos os feedbacks' });
    }
};

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar feedback' });
    }
};
