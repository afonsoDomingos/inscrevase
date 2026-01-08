const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { register, login, getProfile, updateProfile, getUsers, updateByAdmin, deleteByAdmin, getPublicMentors, getPublicMentorById } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/public/mentors', getPublicMentors);
router.get('/public/mentors/:id', getPublicMentorById);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);

// LinkedIn Auth Routes
router.get('/linkedin', passport.authenticate('linkedin'));

router.get('/linkedin/callback',
    passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);

// Admin Routes
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, updateByAdmin);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteByAdmin);

module.exports = router;
