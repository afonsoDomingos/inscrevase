const mongoose = require('mongoose');

const personalProjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'on_hold', 'cancelled'],
        default: 'active'
    },
    totalBudget: {
        type: Number,
        default: 0
    },
    receivedAmount: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'MZN'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PersonalClient'
    }
}, { timestamps: true });

module.exports = mongoose.model('PersonalProject', personalProjectSchema);
