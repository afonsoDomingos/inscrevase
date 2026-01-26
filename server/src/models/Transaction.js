const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['event_registration', 'subscription'],
        default: 'event_registration'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return this.type === 'event_registration'; }
    },
    form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: function () { return this.type === 'event_registration'; }
    },
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'MT'
    },
    platformFee: {
        type: Number,
        default: 0
    },
    mentorEarnings: {
        type: Number,
        required: function () { return this.type === 'event_registration'; }
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    stripePaymentIntentId: {
        type: String,
        unique: true,
        sparse: true
    },
    stripeSessionId: {
        type: String
    },
    subscriptionId: {
        type: String
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'manual'],
        default: 'manual'
    },
    proofUrl: {
        type: String
    },
    metadata: {
        type: Map,
        of: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
