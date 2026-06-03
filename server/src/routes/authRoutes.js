const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { register, login, getProfile, updateProfile, requestVerification, getUsers, updateByAdmin, deleteByAdmin, getPublicMentors, getPublicMentorById, toggleFollow, recordVisit, downgradeToParticipant, restoreMentorRole, searchMentors, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, migrateVerifiedUsers, migrationStatus, getSuperAdminAnalytics, linkOrphanedSubmissions } = require('../controllers/authController');
const { authMiddleware, adminMiddleware, superAdminMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/migrate-verified-users', authMiddleware, adminMiddleware, migrateVerifiedUsers);
router.get('/migration-status', authMiddleware, adminMiddleware, migrationStatus);
router.post('/resend-verification', authMiddleware, resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/verification', authMiddleware, requestVerification);
router.post('/downgrade', authMiddleware, downgradeToParticipant);
router.post('/restore-mentor', authMiddleware, restoreMentorRole);
router.get('/public/mentors', getPublicMentors);
router.get('/public/mentors/:id', getPublicMentorById);
router.post('/public/mentors/:id/visit', recordVisit);
router.post('/mentors/:id/follow', authMiddleware, toggleFollow);

router.get('/search-mentors', authMiddleware, searchMentors);

// Google Auth Routes
router.get('/google', (req, res, next) => {
    const { role, referralCode } = req.query;
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: JSON.stringify({
            role: role || 'mentor',
            referralCode: referralCode || null
        })
    })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/entrar' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);

// LinkedIn Auth Routes
router.get('/linkedin', (req, res, next) => {
    const { role, referralCode } = req.query;
    passport.authenticate('linkedin', {
        state: JSON.stringify({
            role: role || 'mentor',
            referralCode: referralCode || null
        })
    })(req, res, next);
});

router.get('/linkedin/callback',
    passport.authenticate('linkedin', { session: false, failureRedirect: '/entrar' }),
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
router.get('/super-admin/analytics', authMiddleware, superAdminMiddleware, getSuperAdminAnalytics);
router.post('/super-admin/link-orphaned-submissions', authMiddleware, superAdminMiddleware, linkOrphanedSubmissions);

module.exports = router;
