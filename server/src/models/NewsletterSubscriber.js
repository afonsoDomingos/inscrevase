const mongoose = require('mongoose');

const NewsletterSubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed'],
        default: 'active'
    }
});

module.exports = mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
