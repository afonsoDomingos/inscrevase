const MotivaContest = require('../models/MotivaContest');
const MotivaEntry = require('../models/MotivaEntry');
const User = require('../models/User');
const whatsappService = require('../services/whatsappService');
const sendEmail = require('../utils/emailService');

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
            sendEmail(contactEmail, `Confirmação de Participação - Prémio MOTIVA`, `
                <h2>Olá ${contactName}!</h2>
                <p>Recebemos com sucesso a tua participação no <b>Prémio MOTIVA - Fase ${phase}</b>.</p>
                <p><b>Vídeo:</b> ${title}</p>
                <p>O teu vídeo está agora em fase de moderação. Assim que for aprovado, ele será listado no nosso site para votação pública.</p>
                <p>Fica atento ao teu WhatsApp e Email para actualizações!</p>
                <br/>
                <p>Atenciosamente,<br/>Equipa Inscreva-se</p>
            `).catch(e => console.error('Email Error:', e));
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
                    await sendEmail(email, `🔥 Nova Fase do Prémio MOTIVA Disponível!`, `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
                            <h1 style="color: #B8860B; text-align: center;">O Prémio MOTIVA voltou! 🏆</h1>
                            <p>Olá,</p>
                            <p>Temos o prazer de anunciar que a <b>Fase ${phase}</b> do Prémio MOTIVA acaba de ser lançada!</p>
                            <div style="background: #fdfdfd; padding: 25px; border: 1px solid #eee; border-radius: 15px; margin: 25px 0;">
                                <h2 style="margin-top: 0;">Prémio desta Fase:</h2>
                                <p style="font-size: 1.5rem; font-weight: 800; color: #B8860B;">${rewardTitle}</p>
                                <p>${rewardValue}</p>
                            </div>
                            <p><b>O que precisas de fazer?</b></p>
                            <ul>
                                <li>Grava um vídeo de até 60 segundos com conteúdo inspirador.</li>
                                <li>Faz o upload na plataforma <b>Inscreva-se</b>.</li>
                                <li>Partilha e ganha likes para chegar ao topo do ranking!</li>
                            </ul>
                            <div style="text-align: center; margin-top: 40px;">
                                <a href="https://inscreva-se.com/motiva" style="background: #FFD700; color: #000; padding: 15px 30px; border-radius: 30px; text-decoration: none; fontWeight: 800; display: inline-block;">PARTICIPAR AGORA</a>
                            </div>
                            <hr style="margin: 40px 0; border: 0; border-top: 1px solid #eee;"/>
                            <p style="font-size: 0.8rem; color: #888; text-align: center;">Atenciosamente, <br/><b>Equipa Inscreva-se</b></p>
                        </div>
                    `);
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
                sendEmail(contactEmail, `A tua participação foi APROVADA - Prémio MOTIVA`, `
                    <h2>Parabéns ${contactName}!</h2>
                    <p>O teu vídeo <b>"${title}"</b> foi aprovado pela nossa equipa e já está disponível para votação pública!</p>
                    <p>Agora é hora de partilhar com os teus amigos e ganhar o máximo de votos possível para garantir o grande prémio da Fase ${phase}.</p>
                    <p><a href="https://inscreva-se.com/motiva">Ver no Ranking Público</a></p>
                    <br/>
                    <p>Boa sorte!<br/>Equipa Inscreva-se</p>
                `).catch(e => console.error('Email Error:', e));
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

