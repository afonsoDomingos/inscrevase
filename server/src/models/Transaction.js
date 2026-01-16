const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
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
        required: true
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
    paymentMethod: {
        type: String,
        enum: ['stripe', 'manual'],
        default: 'manual'
    },
    metadata: {
        type: Map,
        of: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
