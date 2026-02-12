const express = require('express');
const router = express.Router();
const adminCommunicationController = require('../controllers/adminCommunicationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/send-email', protect, adminOnly, adminCommunicationController.sendAdminEmail);
router.get('/logs', protect, adminOnly, adminCommunicationController.getCommunicationLogs);

module.exports = router;
