const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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
    checkedIn: { type: Boolean, default: false },
    certificateStatus: {
        type: String,
        enum: ['none', 'requested', 'approved'],
        default: 'none'
    },
    certificateIssuedAt: { type: Date },
    eventReminderSent: { type: Boolean, default: false },
    completionIncentiveSent: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
});

// Índices para performance em analytics
SubmissionSchema.index({ form: 1, submittedAt: -1 });
SubmissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Submission', SubmissionSchema);
