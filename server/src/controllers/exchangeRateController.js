const exchangeRateService = require('../services/exchangeRateService');

/**
 * Get current exchange rates
 */
exports.getCurrentRates = async (req, res) => {
    try {
        const rates = await exchangeRateService.getCurrentRates();

        res.status(200).json({
            success: true,
            rates: rates,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error getting exchange rates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exchange rates',
            error: error.message
        });
    }
};

/**
 * Convert amount between currencies
 */
exports.convertCurrency = async (req, res) => {
    try {
        const { amount, from, to } = req.query;

        if (!amount || !from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: amount, from, to'
            });
        }

        const result = await exchangeRateService.convert(
            parseFloat(amount),
            from.toUpperCase(),
            to.toUpperCase()
        );

        res.status(200).json({
            success: true,
            conversion: result
        });
    } catch (error) {
        console.error('Error converting currency:', error);
        res.status(500).json({
            success: false,
            message: 'Error converting currency',
            error: error.message
        });
    }
};

/**
 * Force update exchange rates (Admin only)
 */
exports.forceUpdateRates = async (req, res) => {
    try {
        // Verifica se é admin
        if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can force update exchange rates'
            });
        }

        const updatedRates = await exchangeRateService.forceUpdate();

        res.status(200).json({
            success: true,
            message: 'Exchange rates updated successfully',
            rates: updatedRates.rates,
            lastUpdated: updatedRates.lastUpdated
        });
    } catch (error) {
        console.error('Error forcing exchange rate update:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating exchange rates',
            error: error.message
        });
    }
};
