const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Order creation
router.post('/subscription/create', authMiddleware, paypalController.createSubscriptionOrder);
router.post('/checkout/create', paypalController.createEventOrder);
router.post('/checkout/ad', authMiddleware, paypalController.createAdOrder);

// Order capture
router.post('/orders/capture', paypalController.captureOrder);

// Webhook
router.post('/webhook', paypalController.handleWebhook);

// Admin routes
const { adminMiddleware } = require('../middleware/authMiddleware');
router.get('/admin/payouts', authMiddleware, adminMiddleware, paypalController.getPayPalPayouts);

module.exports = router;
