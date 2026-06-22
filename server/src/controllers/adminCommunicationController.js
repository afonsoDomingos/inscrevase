const User = require('../models/User');
const CommunicationLog = require('../models/CommunicationLog');
const Submission = require('../models/Submission');
const sendEmail = require('../utils/emailService');
const { generateBasicEmail } = require('../utils/emailTemplates');

exports.sendAdminEmail = async (req, res) => {
    try {
        const { recipientIds, subject, content, isAllMentors, isAllUsers, isAllParticipants, eventIdForParticipants, buttonText, buttonUrl } = req.body;
        const senderId = req.user.id;

        let targetUsers = [];
        let rawEmailTargets = []; // fallback for participants without accounts

        if (isAllParticipants && eventIdForParticipants) {
            // Fetch approved submissions for this event
            const submissions = await Submission.find({
                form: eventIdForParticipants,
                status: 'approved'
            }).populate('user', 'email name role');

            for (const sub of submissions) {
                if (sub.user && sub.user.email) {
                    // Participant has a platform account
                    targetUsers.push(sub.user);
                } else {
                    // Participant submitted without an account — extract email from form data
                    const dataMap = sub.data instanceof Map ? Object.fromEntries(sub.data) : sub.data;
                    const emailVal = dataMap?.email || dataMap?.Email || dataMap?.['E-mail'] || dataMap?.['e-mail'];
                    const nameVal = dataMap?.name || dataMap?.Name || dataMap?.Nome || dataMap?.nome || 'Participante';
                    if (emailVal) {
                        rawEmailTargets.push({ email: emailVal, name: nameVal });
                    }
                }
            }
        } else if (isAllUsers) {
            // Send to everyone registered
            targetUsers = await User.find({}, 'email name role');
        } else if (isAllMentors) {
            // Send only to business roles
            targetUsers = await User.find({ role: { $in: ['mentor', 'specialist', 'company'] } }, 'email name role');
        } else if (recipientIds && Array.isArray(recipientIds)) {
            // Send to select IDs
            targetUsers = await User.find({ _id: { $in: recipientIds } }, 'email name role');
        }

        if (targetUsers.length === 0 && rawEmailTargets.length === 0) {
            return res.status(400).json({ message: 'Nenhum participante aprovado encontrado para este evento.' });
        }

        const results = [];

        for (const user of targetUsers) {
            let dashboardUrl = 'https://inscreva-se.com/dashboard/participant';
            if (user.role === 'admin' || user.role === 'SuperAdmin') {
                dashboardUrl = 'https://inscreva-se.com/dashboard/admin';
            } else if (['mentor', 'specialist', 'company'].includes(user.role)) {
                dashboardUrl = 'https://inscreva-se.com/dashboard/mentor';
            }

            const html = generateBasicEmail(
                subject,
                user.name,
                content.replace(/\n/g, '<br>'),
                buttonText || 'Aceder ao Painel',
                buttonUrl || dashboardUrl
            );

            const sent = await sendEmail(user.email, subject, html);
            results.push({ email: user.email, success: sent });
        }

        // Also send to participants who don't have a platform account
        const rawResults = [];
        for (const participant of rawEmailTargets) {
            const html = generateBasicEmail(
                subject,
                participant.name,
                content.replace(/\n/g, '<br>'),
                buttonText || 'Ver Evento',
                buttonUrl || 'https://inscreva-se.com'
            );
            const sent = await sendEmail(participant.email, subject, html);
            rawResults.push({ email: participant.email, success: sent });
        }

        // Create a single log entry for successful broadcast
        const successfulUsers = targetUsers.filter((_, index) => results[index]?.success);
        const successfulRaw = rawEmailTargets.filter((_, index) => rawResults[index]?.success);
        const allSuccessEmails = [
            ...successfulUsers.map(m => m.email),
            ...successfulRaw.map(r => r.email)
        ];
        if (allSuccessEmails.length > 0) {
            await CommunicationLog.create({
                sender: senderId,
                recipients: successfulUsers.map(m => m._id),
                recipientEmails: allSuccessEmails,
                subject,
                content,
                type: 'email',
                status: 'sent'
            });
        }

        // Also log failures if any
        const failedUsers = targetUsers.filter((_, index) => !results[index]?.success);
        const failedRaw = rawEmailTargets.filter((_, index) => !rawResults[index]?.success);
        const allFailedEmails = [
            ...failedUsers.map(m => m.email),
            ...failedRaw.map(r => r.email)
        ];
        if (allFailedEmails.length > 0) {
            await CommunicationLog.create({
                sender: senderId,
                recipients: failedUsers.map(m => m._id),
                recipientEmails: allFailedEmails,
                subject,
                content,
                type: 'email',
                status: 'failed'
            });
        }

        const totalSent = targetUsers.length + rawEmailTargets.length;
        res.json({
            message: `Processo concluído para ${totalSent} participante(s).`,
            results: [...results, ...rawResults]
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

exports.getRecipientCount = async (req, res) => {
    try {
        const { mode, eventId } = req.query;

        if (mode === 'mentors') {
            const count = await User.countDocuments({ role: { $in: ['mentor', 'specialist', 'company'] } });
            return res.json({ count, label: 'mentores' });
        }

        if (mode === 'all') {
            const count = await User.countDocuments({});
            return res.json({ count, label: 'utilizadores' });
        }

        if (mode === 'participants' && eventId) {
            // Count approved submissions
            const userLinkedCount = await Submission.countDocuments({ form: eventId, status: 'approved', user: { $ne: null } });

            // Count submissions without a linked user account but with email in data
            const rawSubmissions = await Submission.find({ form: eventId, status: 'approved', user: null });
            let rawWithEmailCount = 0;
            for (const sub of rawSubmissions) {
                const dataMap = sub.data instanceof Map ? Object.fromEntries(sub.data) : sub.data;
                const emailVal = dataMap?.email || dataMap?.Email || dataMap?.['E-mail'] || dataMap?.['e-mail'];
                if (emailVal) rawWithEmailCount++;
            }
            const count = userLinkedCount + rawWithEmailCount;
            return res.json({ count, label: 'participantes aprovados' });
        }

        return res.json({ count: 0, label: '' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao contar destinatários', error: err.message });
    }
};
