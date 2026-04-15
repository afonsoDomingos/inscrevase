const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// All subscription management routes require authentication
router.post('/stripe/portal', protect, subscriptionController.createStripePortal);
router.post('/paypal/cancel', protect, subscriptionController.cancelPaypalSubscription);

module.exports = router;
