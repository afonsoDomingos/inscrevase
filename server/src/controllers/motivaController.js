const MotivaContest = require('../models/MotivaContest');
const MotivaEntry = require('../models/MotivaEntry');
const User = require('../models/User');

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
            status: 'pending' // Needs admin approval
        });

        await newEntry.save();
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
