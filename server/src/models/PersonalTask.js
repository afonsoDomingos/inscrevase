const mongoose = require('mongoose');

const personalTaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PersonalProject'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'late'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

// Middleware to calculate 'late' status automatically during save if applicable
personalTaskSchema.pre('save', function() {
    if (this.deadline && this.status !== 'completed' && this.deadline < new Date()) {
        this.status = 'late';
    }
    // Set completedAt when status changes to completed
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
});

module.exports = mongoose.model('PersonalTask', personalTaskSchema);
