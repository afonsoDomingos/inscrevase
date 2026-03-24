const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pushController = require('../controllers/pushController');

// Endpoint para o telemóvel subscrever
router.post('/subscribe', authMiddleware, pushController.subscribe);

module.exports = router;
