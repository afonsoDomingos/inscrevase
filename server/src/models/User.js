const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'mentor', 'SuperAdmin'], default: 'mentor' },
    profilePhoto: { type: String },
    whatsapp: { type: String },
    businessName: { type: String },
    bio: { type: String },
    socialLinks: {
        instagram: { type: String },
        linkedin: { type: String },
        facebook: { type: String },
        website: { type: String }
    },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
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
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
