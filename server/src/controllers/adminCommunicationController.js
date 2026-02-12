const User = require('../models/User');
const CommunicationLog = require('../models/CommunicationLog');
const sendEmail = require('../utils/emailService');
const { generateBasicEmail } = require('../utils/emailTemplates');

exports.sendAdminEmail = async (req, res) => {
    try {
        const { recipientIds, subject, content, isAllMentors } = req.body;
        const senderId = req.user.id;

        let mentors = [];
        if (isAllMentors) {
            mentors = await User.find({ role: { $in: ['mentor', 'specialist', 'company'] } }, 'email name');
        } else if (recipientIds && Array.isArray(recipientIds)) {
            mentors = await User.find({ _id: { $in: recipientIds } }, 'email name');
        }

        if (mentors.length === 0) {
            return res.status(400).json({ message: 'Nenhum mentor selecionado ou encontrado.' });
        }

        const results = [];

        for (const mentor of mentors) {
            const html = generateBasicEmail(
                subject,
                mentor.name,
                content.replace(/\n/g, '<br>'),
                'Aceder ao Painel',
                'https://inscreva-se.com/dashboard/mentor'
            );

            const sent = await sendEmail(mentor.email, subject, html);
            results.push({ email: mentor.email, success: sent });
        }

        // Create a single log entry for successful broadcast
        const successfulMentors = mentors.filter((_, index) => results[index].success);
        if (successfulMentors.length > 0) {
            await CommunicationLog.create({
                sender: senderId,
                recipients: successfulMentors.map(m => m._id),
                recipientEmails: successfulMentors.map(m => m.email),
                subject,
                content,
                type: 'email',
                status: 'sent'
            });
        }

        // Also log failures if any
        const failedMentors = mentors.filter((_, index) => !results[index].success);
        if (failedMentors.length > 0) {
            await CommunicationLog.create({
                sender: senderId,
                recipients: failedMentors.map(m => m._id),
                recipientEmails: failedMentors.map(m => m.email),
                subject,
                content,
                type: 'email',
                status: 'failed'
            });
        }

        res.json({
            message: `Processo concluído para ${mentors.length} mentor(es).`,
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
