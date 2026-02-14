const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Who gave it
    name: { type: String, required: true },
    email: { type: String, required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Who receives it (null = platform)
    type: {
        type: String,
        enum: ['bug', 'suggestion', 'praise', 'other'],
        default: 'suggestion'
    },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['new', 'read', 'archived', 'resolved'],
        default: 'new'
    },
    createdAt: { type: Date, default: Date.now }
});

FeedbackSchema.index({ targetUser: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
