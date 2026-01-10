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
            MZN: 49900, // 499.00 MT
            USD: 799    // 7.99 USD
        },
        interval: 'month'
    },
    enterprise: {
        name: 'Enterprise',
        commissionRate: 0.00, // 0% - Estratégia Taxa Zero
        prices: {
            MZN: 499000, // 4.990.00 MT
            USD: 7990    // 79.90 USD
        },
        interval: 'month'
    }
};

module.exports = { PLANS };
