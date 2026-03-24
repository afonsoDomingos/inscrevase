const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: String
    },
    paymentStatus: {
        type: String,
        default: 'completed' // Simple tracking for now
    }
});

// Avoid duplicate purchases for the same book/user
purchaseSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
