const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    visitorId: {
        type: String, // Um ID gerado no frontend (UUID) armazenado em cookie/localstorage
        required: true,
        index: true
    },
    ip: {
        type: String, // Opcional, para geolocalização aproximada (hash por privacidade se preferir)
    },
    page: {
        type: String,
        required: true
    },
    referrer: {
        type: String // De onde veio (Google, Link direto, etc)
    },
    browser: String,
    os: String,
    deviceType: {
        type: String,
        enum: ['mobile', 'desktop', 'tablet', 'unknown'],
        default: 'unknown'
    },
    country: String, // GeoIP lookup
    city: String,    // Cidade do visitante
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 90 // Opcional: Auto-delete após 90 dias para não lotar o banco? Deixar sem por enquanto.
    }
});

// Índices para consultas rápidas no dashboard
visitSchema.index({ timestamp: -1 });
visitSchema.index({ page: 1 });

module.exports = mongoose.model('Visit', visitSchema);
