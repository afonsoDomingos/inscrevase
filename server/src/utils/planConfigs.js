const { PLANS } = require('../config/stripe');
const GlobalSettings = require('../models/GlobalSettings');

/**
 * Get dynamic plan configuration from database or fallback to static config
 */
async function getDynamicPlanConfig() {
    try {
        const settings = await GlobalSettings.findOne({ key: 'subscription_plans' });
        if (settings && settings.value) {
            // Merge with static config to ensure any missing fields are present
            const dynamicPlans = settings.value;
            const mergedPlans = JSON.parse(JSON.stringify(PLANS));

            for (const planKey in dynamicPlans) {
                if (mergedPlans[planKey]) {
                    mergedPlans[planKey] = { ...mergedPlans[planKey], ...dynamicPlans[planKey] };
                } else {
                    mergedPlans[planKey] = dynamicPlans[planKey];
                }
            }
            return mergedPlans;
        }
        return PLANS;
    } catch (error) {
        console.error('[PLANS] Error fetching dynamic plans:', error.message);
        return PLANS;
    }
}

module.exports = { getDynamicPlanConfig };
