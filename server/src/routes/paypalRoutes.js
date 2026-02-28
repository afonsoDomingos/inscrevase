const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Order creation
router.post('/subscription/create', authMiddleware, paypalController.createSubscriptionOrder);
router.post('/checkout/create', paypalController.createEventOrder);

// Order capture
router.post('/orders/capture', paypalController.captureOrder);

module.exports = router;
