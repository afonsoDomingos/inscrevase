const mongoose = require('mongoose');

const marketingRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceType: {
        type: String,
        enum: ['boost_social', 'meta_ads', 'gestion_360'],
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    whatsapp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    companyName: {
        type: String
    },
    details: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    adminNotes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient querying
marketingRequestSchema.index({ userId: 1, status: 1 });
marketingRequestSchema.index({ status: 1 });

module.exports = mongoose.model('MarketingRequest', marketingRequestSchema);
