const axios = require('axios');
const GlobalSettings = require('../models/GlobalSettings');

// Simple in-memory cache
let cachedExchangeRate = 63.8;
let lastRateFetch = 0;

/**
 * Fetches and caches the latest USD to MZN exchange rate with a safety margin
 */
async function getLatestRate() {
    try {
        // 1. Database check
        let settings = await GlobalSettings.findOne({ key: 'exchange_rate_usd_mzn' });
        const now = Date.now();
        const RATE_TTL = 1000 * 60 * 60 * 24; // 24 hours

        if (settings && (now - new Date(settings.lastUpdated).getTime() < RATE_TTL)) {
            return settings.value;
        }

        // 2. Fetch from API
        console.log('[CURRENCY] Updating daily exchange rate via API...');
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');

        if (response.data && response.data.rates && response.data.rates.MZN) {
            const marketRate = response.data.rates.MZN;

            // 3. Safety Margin (1.5%)
            const safetyMargin = 0.015;
            const adjustedRate = marketRate * (1 - safetyMargin);

            if (!settings) {
                settings = new GlobalSettings({
                    key: 'exchange_rate_usd_mzn',
                    value: adjustedRate,
                    lastUpdated: now
                });
            } else {
                settings.value = adjustedRate;
                settings.lastUpdated = now;
            }

            await settings.save();
            cachedExchangeRate = adjustedRate;
            lastRateFetch = now;
            console.log(`[CURRENCY] Rate updated: 1 USD = ${marketRate} MT (Adjusted to ${adjustedRate.toFixed(2)} MT)`);
            return adjustedRate;
        }

        return settings ? settings.value : cachedExchangeRate;
    } catch (error) {
        console.error('[CURRENCY] Exchange rate sync failed:', error.message);
        return cachedExchangeRate;
    }
}

module.exports = { getLatestRate };
