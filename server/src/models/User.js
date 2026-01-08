const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Made optional for Google Auth
    googleId: { type: String, unique: true, sparse: true }, // Added googleId
    linkedinId: { type: String, unique: true, sparse: true }, // Added linkedinId
    role: { type: String, enum: ['admin', 'mentor', 'SuperAdmin'], default: 'mentor' },
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
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    isPublic: { type: Boolean, default: false }, // Admins choose who appears publicly
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profileVisits: { type: Number, default: 0 },
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
