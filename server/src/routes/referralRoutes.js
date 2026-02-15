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

// Protected (Admin)
router.get('/admin/ranking', authMiddleware, adminMiddleware, referralController.getAdminRanking);
router.post('/admin/reward', authMiddleware, adminMiddleware, referralController.assignReward);

module.exports = router;
