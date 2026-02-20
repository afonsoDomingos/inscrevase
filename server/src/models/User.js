const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Made optional for Google Auth
    googleId: { type: String, unique: true, sparse: true }, // Added googleId
    linkedinId: { type: String, unique: true, sparse: true }, // Added linkedinId
    role: { type: String, enum: ['admin', 'mentor', 'SuperAdmin', 'participant', 'company', 'specialist'], default: 'mentor' },
    profilePhoto: { type: String },
    whatsapp: { type: String },
    businessName: { type: String },
    country: { type: String },
    bio: { type: String },
    socialLinks: {
        instagram: { type: String },
        linkedin: { type: String },
        facebook: { type: String },
        website: { type: String }
    },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    stripeAccountId: { type: String },
    stripeOnboardingComplete: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false }, // Admins choose who appears publicly
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    badges: [{
        name: String,
        color: { type: String, default: '#FFD700' }
    }],
    profileVisits: { type: Number, default: 0 },
    canCreateEvents: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    verificationRequestedAt: { type: Date },
    facebookPixelId: { type: String, sparse: true }, // Meta Pixel ID for tracking
    favoriteLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralPoints: { type: Number, default: 0 },
    referralCount: { type: Number, default: 0 },
    onboardingNudgeSent: { type: Boolean, default: false },
    receivedFirstSubmissionNudge: { type: Boolean, default: false },
    lastReactivationNudgeAt: { type: Date },
    completedMissions: [{ type: String }], // Track social follows, etc.
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
