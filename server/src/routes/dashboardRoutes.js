const express = require('express');
const router = express.Router();
const { getAdminStats, getRecentForms, getMentorStats, getAnalytics } = require('../controllers/dashboardController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, adminMiddleware, getAdminStats);
router.get('/recent-forms', authMiddleware, adminMiddleware, getRecentForms);
router.get('/mentor/stats', authMiddleware, getMentorStats);
router.get('/mentor/analytics', authMiddleware, getAnalytics);

module.exports = router;
