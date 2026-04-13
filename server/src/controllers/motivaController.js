const MotivaContest = require('../models/MotivaContest');
const MotivaEntry = require('../models/MotivaEntry');
const User = require('../models/User');
const whatsappService = require('../services/whatsappService');
const sendEmail = require('../utils/emailService');
const { 
    generateMotivaSubmissionEmail, 
    generateMotivaApprovalEmail, 
    generateMotivaPhaseLaunchEmail 
} = require('../utils/emailTemplates');

// PUBLIC METHODS

exports.getActiveContest = async (req, res) => {
    try {
        const contest = await MotivaContest.findOne({ isActive: true });
        if (!contest) {
            return res.status(404).json({ message: 'Nenhum concurso ativo no momento.' });
        }
        
        // Count entries in this phase
        const entryCount = await MotivaEntry.countDocuments({ 
            phase: contest.phase,
            status: 'approved' 
        });

        res.json({ contest, entryCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEntries = async (req, res) => {
    try {
        const { phase } = req.params;
        const entries = await MotivaEntry.find({ 
            phase: phase, 
            status: 'approved' 
        })
        .populate('user', 'name profileImage')
        .sort({ likeCount: -1 });

        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHistoricalWinners = async (req, res) => {
    try {
        const winners = await MotivaContest.find({ 
            isActive: false, 
            winner: { $exists: true } 
        }).sort({ phase: -1 });
        
        res.json(winners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadEntry = async (req, res) => {
    try {
        const { title, videoUrl, phase } = req.body;
        const userId = req.user.id;

        // Check if phase exists and is active
        const contest = await MotivaContest.findOne({ phase, isActive: true });
        if (!contest) {
            return res.status(400).json({ message: 'Fase inválida ou encerrada.' });
        }

        // Check upload limit
        const entryCount = await MotivaEntry.countDocuments({ phase, status: { $ne: 'rejected' } });
        if (entryCount >= contest.maxUploads) {
            return res.status(400).json({ 
                message: `O limite de ${contest.maxUploads} vídeos já foi alcançado. Aguarde a próxima fase!`,
                limitReached: true
            });
        }

        // Check if user already uploaded for this phase
        const existingEntry = await MotivaEntry.findOne({ user: userId, phase });
        if (existingEntry) {
            return res.status(400).json({ message: 'Você já enviou um vídeo para esta fase.' });
        }

        const newEntry = new MotivaEntry({
            user: userId,
            phase,
            title,
            videoUrl,
            contactName: req.body.contactName || req.user.name,
            contactWhatsApp: req.body.contactWhatsApp,
            contactEmail: req.body.contactEmail || req.user.email,
            status: 'pending' // Needs admin approval
        });

        await newEntry.save();

        // Send Notifications (Non-blocking)
        const contactEmail = newEntry.contactEmail;
        const contactWhatsApp = newEntry.contactWhatsApp;
        const contactName = newEntry.contactName;

        if (contactWhatsApp) {
            whatsappService.sendMessage(contactWhatsApp, `Olá ${contactName}! 🌟\n\nRecebemos o teu vídeo "${title}" para o Prémio MOTIVA (Fase ${phase}).\n\nO nosso júri vai agora validar a tua submissão. Assim que for aprovado, receberás outra mensagem e o teu vídeo aparecerá no ranking público!\n\nBoa sorte! 🚀`).catch(e => console.error('WA Error:', e));
        }

        if (contactEmail) {
            const emailHtml = generateMotivaSubmissionEmail(contactName, title);
            sendEmail(contactEmail, `Vídeo Recebido! 🎬 - Prémio MOTIVA`, emailHtml)
                .catch(e => console.error('Email Error:', e));
        }

        res.status(201).json({ message: 'Vídeo enviado com sucesso! Aguarde aprovação.', entry: newEntry });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const { entryId } = req.params;
        const userId = req.user.id;

        const entry = await MotivaEntry.findById(entryId);
        if (!entry) return res.status(404).json({ message: 'Vídeo não encontrado.' });

        const likeIndex = entry.likes.indexOf(userId);
        if (likeIndex > -1) {
            entry.likes.splice(likeIndex, 1);
        } else {
            entry.likes.push(userId);
        }

        await entry.save();
        res.json({ likes: entry.likes.length, liked: entry.likes.includes(userId) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN METHODS

exports.adminCreatePhase = async (req, res) => {
    try {
        const { phase, rewardTitle, rewardValue, endDate, maxUploads } = req.body;

        // Deactivate all other phases
        await MotivaContest.updateMany({}, { isActive: false });

        const newContest = new MotivaContest({
            phase,
            rewardTitle,
            rewardValue,
            endDate,
            maxUploads: maxUploads || 10,
            isActive: true
        });

        await newContest.save();

        // Marketing Broadcast (Non-blocking)
        const broadcastNewPhase = async () => {
            try {
                // Fetch all users and newsletter subscribers
                const NewsletterSubscriber = require('../models/NewsletterSubscriber');
                const [users, subscribers] = await Promise.all([
                    User.find({ role: { $ne: 'admin' } }).select('email name'),
                    NewsletterSubscriber.find({ status: 'active' }).select('email')
                ]);

                // Combine emails and remove duplicates
                const allEmails = new Set([
                    ...users.map(u => u.email),
                    ...subscribers.map(s => s.email)
                ]);

                console.log(`📣 [Motiva Marketing] Broadcasting new phase to ${allEmails.size} recipients...`);

                for (const email of allEmails) {
                    const emailHtml = generateMotivaPhaseLaunchEmail(phase, rewardTitle, rewardValue);
                    await sendEmail(email, `🔥 Nova Fase do Prémio MOTIVA Disponível!`, emailHtml);
                    // Small delay to avoid rate limits if any
                    await new Promise(r => setTimeout(r, 100));
                }
            } catch (err) {
                console.error('Broadcast error:', err);
            }
        };

        broadcastNewPhase();

        res.status(201).json(newContest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.adminUpdateEntryStatus = async (req, res) => {
    try {
            const { entryId } = req.params;
        const { status } = req.body; // approved, rejected

        const entry = await MotivaEntry.findByIdAndUpdate(entryId, { status }, { new: true });
        
        if (status === 'approved' && entry) {
            const { contactName, contactWhatsApp, contactEmail, title, phase } = entry;
            
            if (contactWhatsApp) {
                whatsappService.sendMessage(contactWhatsApp, `🎉 Boas notícias, ${contactName}!\n\nO teu vídeo "${title}" foi APROVADO! 🚀\n\nJá podes ver e partilhar a tua participação para ganhar votos (likes) na Fase ${phase} do Prémio MOTIVA.\n\nVai agora a: https://inscreva-se.com/motiva\n\nMuita força! 💪`).catch(e => console.error('WA Error:', e));
            }

            if (contactEmail) {
                const emailHtml = generateMotivaApprovalEmail(contactName, title);
                sendEmail(contactEmail, `Vídeo APROVADO! 🚀 - Prémio MOTIVA`, emailHtml)
                    .catch(e => console.error('Email Error:', e));
            }
        }

        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.adminSetWinner = async (req, res) => {
    try {
        const { phaseId, entryId } = req.body;

        const entry = await MotivaEntry.findById(entryId).populate('user', 'name');
        if (!entry) return res.status(404).json({ message: 'Entrada não encontrada.' });

        const contest = await MotivaContest.findById(phaseId);
        if (!contest) return res.status(404).json({ message: 'Fase não encontrada.' });

        contest.winner = {
            userId: entry.user._id,
            name: entry.user.name,
            videoTitle: entry.title,
            videoUrl: entry.videoUrl,
            likes: entry.likeCount
        };
        contest.isActive = false;

        await contest.save();
        res.json({ message: 'Vencedor definido e fase encerrada.', contest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.adminGetAllEntries = async (req, res) => {
    try {
        const entries = await MotivaEntry.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

