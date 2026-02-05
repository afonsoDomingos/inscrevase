const PLANS = {
    free: {
        name: 'Gratuito',
        commissionRate: 0.15, // 15%
        price: 0,
        currency: 'MZN'
    },
    pro: {
        name: 'Profissional',
        commissionRate: 0.10, // 10%
        prices: {
            MZN: 17500, // 175.00 MT
            USD: 299    // 2.99 USD
        },
        interval: 'month'
    },
    enterprise: {
        name: 'Enterprise',
        commissionRate: 0.00, // 0% - Estratégia Taxa Zero
        prices: {
            MZN: 175000, // 1.750.00 MT
            USD: 2799    // 27.99 USD
        },
        interval: 'month'
    }
};

module.exports = { PLANS };
