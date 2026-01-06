const express = require('express');
const router = express.Router();
const { getAdminStats, getRecentForms } = require('../controllers/dashboardController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, adminMiddleware, getAdminStats);
router.get('/recent-forms', authMiddleware, adminMiddleware, getRecentForms);

module.exports = router;
