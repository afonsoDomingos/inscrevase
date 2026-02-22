const mongoose = require('mongoose');

const smartLinkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['direct', 'bio'],
        default: 'direct'
    },
    originalUrl: {
        type: String,
        required: false // Optional if type is 'bio'
    },
    // For Multi-link (Type: bio)
    links: [{
        title: String,
        url: String,
        icon: String,
        color: String,
        clicks: { type: Number, default: 0 }
    }],
    bioSettings: {
        bioText: String,
        avatarUrl: String,
        theme: { type: String, default: 'aura-teal' }, // dark, light, orange-white, aura-teal, aura-candy, aura-sunset, aura-nordic, royal, aurora, aura-sunset-deep, aura-lavender, aura-rose, aura-forest, aura-sky
        layout: { type: String, default: 'compact' },
        socialLinks: {
            whatsapp: String,
            instagram: String,
            telegram: String,
            youtube: String,
            linkedin: String,
            twitter: String
        }
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'expired'],
        default: 'active'
    },
    category: {
        type: String,
        default: 'general'
    },
    // Tracking/Marketing
    facebookPixelId: String,
    googleAnalyticsId: String,

    // Analytics Snapshots
    totalClicks: {
        type: Number,
        default: 0
    },
    analytics: [{
        timestamp: { type: Date, default: Date.now },
        ip: String,
        userAgent: String,
        referer: String,
        country: String,
        city: String,
        device: String, // mobile, desktop, tablet
        browser: String
    }],

    // Settings
    password: {
        type: String,
        select: false
    },
    expiresAt: Date,

    // Aesthetic (Premium)
    brandingColor: {
        type: String,
        default: '#FFD700'
    },
    isPremium: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster redirections
smartLinkSchema.index({ slug: 1 });
smartLinkSchema.index({ userId: 1 });

module.exports = mongoose.model('SmartLink', smartLinkSchema);
