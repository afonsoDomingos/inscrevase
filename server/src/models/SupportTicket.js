const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'answered', 'closed'],
        default: 'open'
    },
    messages: [{
        sender: { type: String, enum: ['user', 'admin'], required: true },
        content: { type: String, required: true },
        attachment: {
            type: String,
            default: null
        },
        createdAt: { type: Date, default: Date.now }
    }],
    lastReadByUser: {
        type: Date,
        default: null
    },
    lastReadByAdmin: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
