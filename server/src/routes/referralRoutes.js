const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public
router.get('/validate/:code', referralController.validateReferralCode);

// Protected (User)
router.get('/stats', authMiddleware, referralController.getReferralStats);
router.get('/history', authMiddleware, referralController.getReferralHistory);
router.post('/redeem', authMiddleware, referralController.redeemPoints);
router.post('/social-points', authMiddleware, referralController.awardSocialPoints);

// Protected (Admin)
router.get('/admin/ranking', authMiddleware, referralController.getAdminRanking);
router.get('/admin/user-referrals/:userId', authMiddleware, adminMiddleware, referralController.getAdminUserReferrals);
router.post('/admin/reward', authMiddleware, adminMiddleware, referralController.assignReward);

module.exports = router;
