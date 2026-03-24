const mongoose = require('mongoose');

const whatsappLogSchema = new mongoose.Schema({
    to: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'error'],
        required: true
    },
    errorReason: {
        type: String,
        default: null
    },
    type: {
        type: String,
        enum: ['notification', 'test', 'system', 'marketing'],
        default: 'notification'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.WhatsAppLog || mongoose.model('WhatsAppLog', whatsappLogSchema);
