const PLANS = {
    free: {
        name: 'Gratuito',
        commissionRate: 0.15, // 15%
        price: 0,
        currency: 'USD'
    },
    pro: {
        name: 'Profissional',
        commissionRate: 0.05, // 5%
        prices: {
            MZN: 125000, // 1.250 MT
            USD: 1959    // 19.59 USD
        },
        interval: 'month'
    },
    enterprise: {
        name: 'Enterprise',
        commissionRate: 0.00, // 0% - Estratégia Taxa Zero
        prices: {
            MZN: 499900, // 4.999 MT
            USD: 7979    // 79.79 USD
        },
        interval: 'month'
    },
    premium: {
        name: 'Premium',
        commissionRate: 0.02, // 2%
        prices: {
            MZN: 250000, // 2.500 MT
            USD: 3959    // 39.59 USD
        },
        interval: 'month'
    }
};

module.exports = { PLANS };
