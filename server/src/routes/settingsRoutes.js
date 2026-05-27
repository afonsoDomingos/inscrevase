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

/**
 * GLOBAL PIXEL
 */
router.get('/meta-pixel', settingsController.getGlobalPixel);
router.put('/meta-pixel', authMiddleware, adminMiddleware, settingsController.updateGlobalPixel);

/**
 * SUPPORT WHATSAPP
 */
router.get('/support-whatsapp', settingsController.getSupportWhatsapp);
router.put('/support-whatsapp', authMiddleware, adminMiddleware, settingsController.updateSupportWhatsapp);

/**
 * OWNER WHATSAPP (critical platform alerts)
 */
router.get('/owner-whatsapp', settingsController.getOwnerWhatsapp);
router.put('/owner-whatsapp', authMiddleware, adminMiddleware, settingsController.updateOwnerWhatsapp);

module.exports = router;
