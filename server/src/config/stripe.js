const PLANS = {
    free: {
        name: 'Gratuito',
        commissionRate: 0.15, // 15%
        price: 0,
        currency: 'USD'
    },
    pro: {
        name: 'Profissional',
        commissionRate: 0.10, // 10%
        prices: {
            MZN: 125000, // 1.250.00 MT
            USD: 1950    // ~19.50 USD
        },
        interval: 'month'
    },
    enterprise: {
        name: 'Enterprise',
        commissionRate: 0.00, // 0% - Estratégia Taxa Zero
        prices: {
            MZN: 1250000, // 12.500.00 MT
            USD: 19500    // ~195.00 USD
        },
        interval: 'month'
    }
};

module.exports = { PLANS };
