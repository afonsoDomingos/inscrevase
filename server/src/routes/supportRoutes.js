const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createTicket, getMyTickets, getAllTickets, addMessage, getUnreadCount, markAsRead, createPublicMessage } = require('../controllers/supportController');

// Public route (no authentication)
router.post('/contact', createPublicMessage);

router.post('/', authMiddleware, createTicket);
router.get('/my', authMiddleware, getMyTickets);
router.get('/all', authMiddleware, adminMiddleware, getAllTickets);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.put('/:id/mark-read', authMiddleware, markAsRead);
router.post('/:id/message', authMiddleware, addMessage);

module.exports = router;
