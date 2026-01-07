const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createTicket, getMyTickets, getAllTickets, addMessage } = require('../controllers/supportController');

router.post('/', authMiddleware, createTicket);
router.get('/my', authMiddleware, getMyTickets);
router.get('/all', authMiddleware, adminMiddleware, getAllTickets);
router.post('/:id/message', authMiddleware, addMessage);

module.exports = router;
