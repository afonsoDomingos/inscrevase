const User = require('../models/User');
const Referral = require('../models/Referral');
const Notification = require('../models/Notification');

const getReferralStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure user has a referral code
        if (!user.referralCode) {
            user.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            await user.save();
        }

        res.json({
            referralCode: user.referralCode,
            points: user.referralPoints,
            totalInvites: user.referralCount,
            convertedCount: await Referral.countDocuments({ referrer: user._id, status: 'converted' })
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getReferralHistory = async (req, res) => {
    try {
        const history = await Referral.find({ referrer: req.user.id })
            .populate('referredUser', 'name email createdAt')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const validateReferralCode = async (req, res) => {
    try {
        const { code } = req.params;
        const referrer = await User.findOne({ referralCode: code.toUpperCase() });
        if (!referrer) return res.status(404).json({ message: 'Referral code invalid' });

        res.json({ referrerName: referrer.name });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAdminRanking = async (req, res) => {
    try {
        const ranking = await User.find({ referralCount: { $gt: 0 } })
            .select('name email referralPoints referralCount plan')
            .sort({ referralPoints: -1 })
            .limit(50);
        res.json(ranking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const assignReward = async (req, res) => {
    try {
        const { userId, planType, days } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // In a real app, we would set an expiration date for the plan.
        // For now, we update the plan and send a notification.
        user.plan = planType;
        await user.save();

        const notification = new Notification({
            recipient: user._id,
            title: 'Parabéns! Recompensa Atribuída 🏆',
            content: `Pelo seu excelente trabalho a expandir a nossa comunidade, recebeu acesso ao plano ${planType.toUpperCase()} por ${days} dias. Continue a partilhar conhecimento!`,
            type: 'reward'
        });
        await notification.save();

        res.json({ message: 'Reward assigned successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getReferralStats,
    getReferralHistory,
    validateReferralCode,
    getAdminRanking,
    assignReward
};
