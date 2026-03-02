const User = require('../models/User');
const CommunicationLog = require('../models/CommunicationLog');
const sendEmail = require('../utils/emailService');
const { generateBasicEmail } = require('../utils/emailTemplates');

exports.sendAdminEmail = async (req, res) => {
    try {
        const { recipientIds, subject, content, isAllMentors, isAllUsers } = req.body;
        const senderId = req.user.id;

        let targetUsers = [];
        if (isAllUsers) {
            // Send to everyone registered
            targetUsers = await User.find({}, 'email name');
        } else if (isAllMentors) {
            // Send only to business roles
            targetUsers = await User.find({ role: { $in: ['mentor', 'specialist', 'company'] } }, 'email name');
        } else if (recipientIds && Array.isArray(recipientIds)) {
            // Send to select IDs
            targetUsers = await User.find({ _id: { $in: recipientIds } }, 'email name');
        }

        if (targetUsers.length === 0) {
            return res.status(400).json({ message: 'Nenhum utilizador selecionado ou encontrado.' });
        }

        const results = [];

        for (const user of targetUsers) {
            const html = generateBasicEmail(
                subject,
                user.name,
                content.replace(/\n/g, '<br>'),
                'Aceder ao Painel',
                'https://inscreva-se.com/dashboard'
            );

            const sent = await sendEmail(user.email, subject, html);
            results.push({ email: user.email, success: sent });
        }

        // Create a single log entry for successful broadcast
        const successfulUsers = targetUsers.filter((_, index) => results[index].success);
        if (successfulUsers.length > 0) {
            await CommunicationLog.create({
                sender: senderId,
                recipients: successfulUsers.map(m => m._id),
                recipientEmails: successfulUsers.map(m => m.email),
                subject,
                content,
                type: 'email',
                status: 'sent'
            });
        }

        // Also log failures if any
        const failedUsers = targetUsers.filter((_, index) => !results[index].success);
        if (failedUsers.length > 0) {
            await CommunicationLog.create({
                sender: senderId,
                recipients: failedUsers.map(m => m._id),
                recipientEmails: failedUsers.map(m => m.email),
                subject,
                content,
                type: 'email',
                status: 'failed'
            });
        }

        res.json({
            message: `Processo concluído para ${targetUsers.length} utilizador(es).`,
            results
        });
    } catch (err) {
        console.error('Error in sendAdminEmail:', err);
        res.status(500).json({ message: 'Erro ao enviar emails', error: err.message });
    }
};

exports.getCommunicationLogs = async (req, res) => {
    try {
        const logs = await CommunicationLog.find()
            .populate('sender', 'name email')
            .populate('recipients', 'name email')
            .sort({ sentAt: -1 })
            .limit(500);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar histórico', error: err.message });
    }
};
