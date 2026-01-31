const mongoose = require('mongoose');

const LessonProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    lastWatchedAt: {
        type: Date,
        default: Date.now
    },
    watchTime: {
        type: Number, // seconds watched
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to ensure one progress record per user per lesson
LessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('LessonProgress', LessonProgressSchema);
