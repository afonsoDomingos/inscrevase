const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
    baseCurrency: {
        type: String,
        default: 'USD',
        required: true
    },
    rates: {
        USD: { type: Number, required: true, default: 1 },
        EUR: { type: Number, required: true },
        MZN: { type: Number, required: true },
        AOA: { type: Number, required: true },
        CVE: { type: Number, required: true },
        XOF: { type: Number, required: true }
    },
    source: {
        type: String,
        default: 'exchangerate-api.com'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    nextUpdate: {
        type: Date
    }
}, {
    timestamps: true
});

// Método para verificar se precisa atualizar (mais de 24h)
exchangeRateSchema.methods.needsUpdate = function () {
    const now = new Date();
    const lastUpdate = new Date(this.lastUpdated);
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    return hoursSinceUpdate >= 24;
};

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
