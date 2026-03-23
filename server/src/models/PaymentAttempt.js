const mongoose = require('mongoose');

const paymentAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['subscription', 'event_registration', 'ad_purchase'],
        required: true
    },
    method: {
        type: String,
        enum: ['stripe', 'paypal', 'manual'],
        required: true
    },
    status: {
        type: String,
        enum: ['initiated', 'cancelled', 'failed', 'blocked_maintenance'],
        default: 'initiated'
    },
    amount: {
        type: Number
    },
    currency: {
        type: String,
        default: 'MZN'
    },
    metadata: {
        type: Map,
        of: String
    },
    ip: String,
    userAgent: String
}, {
    timestamps: true
});

paymentAttemptSchema.index({ userId: 1, createdAt: -1 });
paymentAttemptSchema.index({ type: 1 });
paymentAttemptSchema.index({ status: 1 });

module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);
