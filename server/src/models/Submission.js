const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    data: { type: Map, of: mongoose.Schema.Types.Mixed }, // Dynamic response data
    paymentProof: { type: String }, // Cloudinary URL
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'pending'],
        default: 'unpaid'
    },
    stripePaymentIntentId: { type: String },
    stripeSessionId: { type: String },
    aiAnalysis: {
        transactionId: String,
        amount: Number,
        currency: String,
        date: String,
        isValid: Boolean,
        confidence: Number,
        warning: String
    },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
