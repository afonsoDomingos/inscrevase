const mongoose = require('mongoose');

const motivaContestSchema = new mongoose.Schema({
    phase: {
        type: Number,
        required: true,
        unique: true
    },
    rewardTitle: {
        type: String,
        required: true
    },
    rewardValue: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    maxUploads: {
        type: Number,
        default: 10
    },
    isActive: {
        type: Boolean,
        default: false
    },
    winner: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        videoTitle: String,
        videoUrl: String,
        likes: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('MotivaContest', motivaContestSchema);
