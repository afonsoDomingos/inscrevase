const PLANS = {
    free: {
        name: 'Gratuito',
        commissionRate: 0.15, // 15%
        price: 0,
        currency: 'MT'
    },
    pro: {
        name: 'Profissional',
        commissionRate: 0.10, // 10%
        price: 4900, // em centavos (ex: 49.00 MT ou USD)
        currency: 'USD',
        interval: 'month'
    },
    enterprise: {
        name: 'Enterprise',
        commissionRate: 0.05, // 5%
        price: 14900,
        currency: 'USD',
        interval: 'month'
    }
};

module.exports = { PLANS };
