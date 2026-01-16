const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const {
    createTicket,
    getMyTickets,
    getAllTickets,
    addMessage,
    getUnreadCount,
    markAsRead,
    createPublicMessage,
    getAllPublicMessages,
    updateMessageStatus,
    deletePublicMessage
} = require('../controllers/supportController');

// Public route (no authentication)
router.post('/contact', createPublicMessage);

// Admin routes for public messages
router.get('/public/messages', authMiddleware, adminMiddleware, getAllPublicMessages);
router.patch('/public/messages/:id', authMiddleware, adminMiddleware, updateMessageStatus);
router.delete('/public/messages/:id', authMiddleware, adminMiddleware, deletePublicMessage);

// Authenticated user routes (tickets)
router.post('/', authMiddleware, createTicket);
router.get('/my', authMiddleware, getMyTickets);
router.get('/all', authMiddleware, adminMiddleware, getAllTickets);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.put('/:id/mark-read', authMiddleware, markAsRead);
router.post('/:id/message', authMiddleware, addMessage);

module.exports = router;

