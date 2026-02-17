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

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/cadastro?ref=${user.referralCode}`;

        res.json({
            referralCode: user.referralCode,
            inviteLink,
            points: user.referralPoints || 0,
            totalInvites: user.referralCount || 0,
            convertedCount: await Referral.countDocuments({ referrer: user._id, status: 'converted' })
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const redeemPoints = async (req, res) => {
    try {
        const { rewardId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        // Reward Tiers: 100 points = 30 days Pro
        const REWARDS = {
            'pro_30': { points: 100, days: 30, plan: 'pro', label: 'Plano Pro (30 dias)' }
        };

        const reward = REWARDS[rewardId];
        if (!reward) return res.status(400).json({ message: 'Recompensa inválida' });

        if ((user.referralPoints || 0) < reward.points) {
            return res.status(400).json({ message: `Saldo insuficiente. Precisas de ${reward.points} pontos.` });
        }

        // Deduct points and update plan
        user.referralPoints -= reward.points;
        user.plan = reward.plan;

        // In a more complete system, we'd handle plan expiration dates here.
        await user.save();

        // Notify user
        const notification = new Notification({
            recipient: user._id,
            sender: user._id, // Self-system notification
            title: 'Recompensa Resgatada! 🏆',
            content: `Parabéns! Você trocou ${reward.points} pontos por ${reward.label}. O seu acesso premium já está ativo!`,
            type: 'reward'
        });
        await notification.save();

        res.json({
            message: 'Resgate efetuado com sucesso!',
            points: user.referralPoints,
            plan: user.plan
        });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao processar resgate', error: err.message });
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

        const admin = await User.findOne({ role: { $in: ['admin', 'SuperAdmin'] } });
        const notification = new Notification({
            recipient: user._id,
            sender: admin ? admin._id : user._id,
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

const awardSocialPoints = async (req, res) => {
    try {
        const { missionId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if mission already completed
        if (user.completedMissions && user.completedMissions.includes(missionId)) {
            return res.status(400).json({ message: 'Missão já concluída anteriormente.' });
        }

        const POINTS_PER_MISSION = 5;

        // Update user
        user.referralPoints = (user.referralPoints || 0) + POINTS_PER_MISSION;
        if (!user.completedMissions) user.completedMissions = [];
        user.completedMissions.push(missionId);

        await user.save();

        // Notify user
        const notification = new Notification({
            recipient: user._id,
            sender: user._id,
            title: 'Missão Cumprida! 🎯',
            content: `Você ganhou ${POINTS_PER_MISSION} pontos por completar a missão "${missionId}". Continue assim!`,
            type: 'reward'
        });
        await notification.save();

        res.json({
            message: 'Pontos atribuídos com sucesso!',
            points: user.referralPoints,
            completedMissions: user.completedMissions
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getReferralStats,
    getReferralHistory,
    validateReferralCode,
    getAdminRanking,
    assignReward,
    redeemPoints,
    awardSocialPoints
};
