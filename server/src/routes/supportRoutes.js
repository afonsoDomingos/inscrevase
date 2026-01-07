const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createTicket, getMyTickets, getAllTickets, addMessage } = require('../controllers/supportController');

router.post('/', protect, createTicket);
router.get('/my', protect, getMyTickets);
router.get('/all', protect, authorize('admin'), getAllTickets);
router.post('/:id/message', protect, addMessage);

module.exports = router;
