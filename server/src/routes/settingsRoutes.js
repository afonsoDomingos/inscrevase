const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

/**
 * PUBLIC - Get manual payment methods
 */
router.get('/manual-methods', settingsController.getManualPaymentMethods);

/**
 * ADMIN - Update manual payment methods
 */
router.put('/manual-methods', authMiddleware, adminMiddleware, settingsController.updateManualPaymentMethods);

/**
 * ADMIN - Get all settings
 */
router.get('/all', authMiddleware, adminMiddleware, settingsController.getAllSettings);
router.post('/log-attempt', authMiddleware, settingsController.logPaymentAttempt);
router.get('/payment-attempts', authMiddleware, adminMiddleware, settingsController.getPaymentAttempts);

module.exports = router;
