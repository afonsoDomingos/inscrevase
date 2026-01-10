const Notification = require('../models/Notification');
const User = require('../models/User');

exports.sendNotification = async (req, res) => {
    try {
        const { recipientId, title, content, type, actionUrl } = req.body;
        const senderId = req.user.id;

        // If recipientId is 'all', broadcast to all mentors
        if (recipientId === 'all') {
            const mentors = await User.find({ role: 'mentor' });
            const notifications = mentors.map(mentor => ({
                recipient: mentor._id,
                sender: senderId,
                title,
                content,
                type: type || 'announcement',
                actionUrl
            }));
            await Notification.insertMany(notifications);
            return res.status(201).json({ message: 'Broadcast enviado com sucesso' });
        }

        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            title,
            content,
            type: type || 'personal',
            actionUrl
        });

        await notification.save();
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
