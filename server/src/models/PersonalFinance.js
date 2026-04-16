const mongoose = require('mongoose');

const personalFinanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PersonalProject'
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'MZN'
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['paid', 'pending'],
        default: 'paid'
    }
}, { timestamps: true });

module.exports = mongoose.model('PersonalFinance', personalFinanceSchema);
