const mongoose = require('mongoose');

const adRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['event', 'service', 'product'],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaUrls: [{
        type: String
    }],
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    productPrice: {
        type: Number
    },
    durationWeeks: {
        type: Number,
        required: true,
        min: 1
    },
    priceTotal: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'manual', 'paypal'],
        required: true
    },
    paymentProofUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    clicks: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    targetUrl: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    stripePaymentIntentId: {
        type: String
    },
    stripeSessionId: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient querying
adRequestSchema.index({ userId: 1, status: 1 });
adRequestSchema.index({ status: 1, isActive: 1 });

module.exports = mongoose.model('AdRequest', adRequestSchema);
