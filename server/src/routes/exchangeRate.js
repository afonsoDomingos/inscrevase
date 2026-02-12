const express = require('express');
const router = express.Router();
const exchangeRateController = require('../controllers/exchangeRateController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public route - get current rates
router.get('/current', exchangeRateController.getCurrentRates);

// Public route - convert currency
router.get('/convert', exchangeRateController.convertCurrency);

// Admin only - force update rates
router.post('/force-update', authMiddleware, adminMiddleware, exchangeRateController.forceUpdateRates);

module.exports = router;
