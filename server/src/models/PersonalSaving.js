const mongoose = require('mongoose');

const personalSavingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    account: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    linkedTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PersonalFinance',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('PersonalSaving', personalSavingSchema);
