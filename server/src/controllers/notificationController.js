const Notification = require('../models/Notification');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

exports.sendNotification = async (req, res) => {
    try {
        const { recipientId, title, content, type, actionUrl, department, attachmentUrl } = req.body;
        const senderId = req.user.id;

        // Send to multiple specific recipients
        if (Array.isArray(recipientId)) {
            await Promise.all(recipientId.map(id =>
                NotificationService.notify({
                    recipient: id,
                    sender: senderId,
                    title,
                    content,
                    type: type || 'announcement',
                    actionUrl,
                    department,
                    attachmentUrl
                })
            ));
            return res.status(201).json({ message: 'Mensagens enviadas com sucesso' });
        }

        // If recipientId is 'all', broadcast
        if (recipientId === 'all') {
            await NotificationService.broadcast({
                sender: senderId,
                title,
                content,
                type: type || 'announcement'
            });
            return res.status(201).json({ message: 'Broadcast enviado com sucesso' });
        }

        const notification = await NotificationService.notify({
            recipient: recipientId,
            sender: senderId,
            title,
            content,
            type: type || 'personal',
            actionUrl,
            department,
            attachmentUrl
        });

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name profilePhoto');
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
