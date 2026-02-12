const mongoose = require('mongoose');

const CommunicationLogSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    recipientEmails: [{ type: String }],
    subject: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['email', 'notification'], default: 'email' },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunicationLog', CommunicationLogSchema);
