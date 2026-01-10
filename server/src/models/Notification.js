const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['welcome', 'announcement', 'personal', 'alert'],
        default: 'personal'
    },
    department: {
        type: String, // 'finance', 'support', 'marketing', 'general', etc.
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String,
        default: null
    },
    attachmentUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
