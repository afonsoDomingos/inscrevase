const express = require('express');
const router = express.Router();
const exchangeRateController = require('../controllers/exchangeRateController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public route - get current rates
router.get('/current', exchangeRateController.getCurrentRates);

// Public route - convert currency
router.get('/convert', exchangeRateController.convertCurrency);

// Admin only - force update rates
router.post('/force-update', authenticate, isAdmin, exchangeRateController.forceUpdateRates);

module.exports = router;
