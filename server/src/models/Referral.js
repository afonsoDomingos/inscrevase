const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    pointsEarned: { type: Number, default: 10 },
    status: { type: String, enum: ['pending', 'converted'], default: 'converted' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Referral', ReferralSchema);
