const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    subscription: {
        endpoint: { type: String, required: true },
        expirationTime: { type: Number },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        }
    },
    deviceType: { type: String }, // 'mobile', 'desktop'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
