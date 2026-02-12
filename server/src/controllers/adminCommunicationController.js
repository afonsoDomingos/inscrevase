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
            mentors = await User.find({ role: 'mentor' }, 'email name');
        } else if (recipientIds && Array.isArray(recipientIds)) {
            mentors = await User.find({ _id: { $in: recipientIds } }, 'email name');
        }

        if (mentors.length === 0) {
            return res.status(400).json({ message: 'Nenhum mentor selecionado ou encontrado.' });
        }

        const results = [];
        const logs = [];

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

            if (sent) {
                logs.push({
                    sender: senderId,
                    recipients: [mentor._id],
                    recipientEmails: [mentor.email],
                    subject,
                    content,
                    type: 'email',
                    status: 'sent'
                });
            } else {
                logs.push({
                    sender: senderId,
                    recipients: [mentor._id],
                    recipientEmails: [mentor.email],
                    subject,
                    content,
                    type: 'email',
                    status: 'failed'
                });
            }
        }

        // Save logs to database
        if (logs.length > 0) {
            await CommunicationLog.insertMany(logs);
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
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar histórico', error: err.message });
    }
};
