const mongoose = require('mongoose');

const motivaEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    phase: {
        type: Number,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    contactName: String,
    contactWhatsApp: String,
    contactEmail: String
}, { timestamps: true });

// Pre-save to keep likeCount updated for easier sorting
motivaEntrySchema.pre('save', function(next) {
    if (this.likes) {
        this.likeCount = this.likes.length;
    }
    next();
});

module.exports = mongoose.model('MotivaEntry', motivaEntrySchema);
