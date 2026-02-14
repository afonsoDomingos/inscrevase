const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createFeedback = async (req, res) => {
    try {
        const { name, email, type, rating, message, targetUserId } = req.body;
        const userId = req.user ? req.user.id : null;

        const feedback = new Feedback({
            user: userId,
            name,
            email,
            type,
            rating,
            message,
            targetUser: targetUserId || null
        });

        await feedback.save();

        // Reward the user with points if they are logged in
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                $inc: { referralPoints: 10 } // Reward 10 points for feedback
            });
        }

        // If target exists, notify them
        if (targetUserId) {
            const notification = new Notification({
                user: targetUserId,
                type: 'system',
                title: 'Novo Feedback Recebido',
                message: `${name} enviou uma sugestão: "${message.substring(0, 50)}..."`,
                link: '/dashboard/mentor?tab=feedback'
            });
            await notification.save();
        }

        res.status(201).json({ message: 'Feedback enviado com sucesso! Ganhaste 10 pontos.', feedback });
    } catch (error) {
        console.error(error);
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
