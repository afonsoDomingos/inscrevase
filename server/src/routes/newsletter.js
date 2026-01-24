const express = require('express');
const router = express.Router();
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'E-mail é obrigatório' });
        }

        // Check if already subscribed
        const existingSubscriber = await NewsletterSubscriber.findOne({ email });
        if (existingSubscriber) {
            if (existingSubscriber.status === 'active') {
                return res.status(400).json({ message: 'Este e-mail já está inscrito' });
            } else {
                // Re-activate
                existingSubscriber.status = 'active';
                await existingSubscriber.save();
                return res.status(200).json({ message: 'Inscrição reativada com sucesso!' });
            }
        }

        const subscriber = await NewsletterSubscriber.create({ email });
        res.status(201).json({ message: 'Inscrição realizada com sucesso!', subscriber });
    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({ message: 'Erro ao processar inscrição' });
    }
});

// @desc    Get all subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
router.get('/subscribers', protect, admin, async (req, res) => {
    try {
        const subscribers = await NewsletterSubscriber.find().sort({ subscribedAt: -1 });
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar assinantes' });
    }
});

module.exports = router;
