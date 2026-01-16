const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/send', authMiddleware, adminMiddleware, notificationController.sendNotification);
router.get('/my', authMiddleware, notificationController.getMyNotifications);
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
