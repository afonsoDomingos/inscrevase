const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const LessonProgress = require('../models/LessonProgress');
const User = require('../models/User');
const { authMiddleware: protect } = require('../middleware/authMiddleware');

// @route   POST /api/certificates/generate
// @desc    Generate a new certificate based on current progress
// @access  Private
router.post('/generate', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Calculate functionality
        const progress = await LessonProgress.find({ user: userId, isCompleted: true }).populate('lesson');

        if (!progress || progress.length === 0) {
            return res.status(400).json({ message: 'Você precisa concluir aulas para gerar um certificado.' });
        }

        const completedLessonsCount = progress.length;
        // Sum duration (assuming duration is in minutes in Lesson model)
        // If duration is not populated or null, treat as 0
        const totalMinutes = progress.reduce((acc, p) => acc + (p.lesson ? (p.lesson.duration || 0) : 0), 0);
        const totalHours = Math.floor(totalMinutes / 60);

        // Optional: Check minimum requirements (e.g. at least 1 hour)
        if (totalMinutes < 1) { // Just a sanity check, maybe strict later
            // For MVP, letting generate if at least 1 lesson completed
        }

        // Create Certificate
        const code = crypto.randomUUID().substring(0, 8).toUpperCase(); // Short code like "A1B2-C3D4"

        const certificate = await Certificate.create({
            user: userId,
            code,
            hours: Math.max(1, totalHours), // Min 1 hour for display beauty
            completedLessons: completedLessonsCount
        });

        res.status(201).json(certificate);

    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({ message: 'Erro ao gerar certificado' });
    }
});

// @route   GET /api/certificates/my-certificates
// @desc    Get logged in user certificates
// @access  Private
router.get('/my-certificates', protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({ user: req.user._id }).sort({ issuedAt: -1 });
        res.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: 'Erro ao buscar certificados' });
    }
});

// @route   GET /api/certificates/:code
// @desc    Get certificate by code (Public validation)
// @access  Public
router.get('/:code', async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ code: req.params.code }).populate('user', 'name email');

        if (!certificate) {
            return res.status(404).json({ message: 'Certificado não encontrado' });
        }

        res.json(certificate);
    } catch (error) {
        console.error('Error fetching certificate:', error);
        res.status(500).json({ message: 'Erro ao buscar certificado' });
    }
});

module.exports = router;
