const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Centrailized Service to handle notifications (DB + Real-time)
 */
class NotificationService {
    static io = null;

    /**
     * Initialize the service with Socket.io instance
     * @param {object} io - Socket.io instance
     */
    static init(io) {
        this.io = io;
        console.log('[NotificationService] Initialized with Socket.io');
    }

    /**
     * Create and send a notification
     * @param {object} params - Notification parameters
     */
    static async notify({ recipient, sender, title, content, type = 'personal', actionUrl = null, department = null }) {
        try {
            const notification = new Notification({
                recipient,
                sender,
                title,
                content,
                type,
                actionUrl,
                department
            });

            await notification.save();

            // Real-time delivery via Socket.io
            if (this.io) {
                this.io.to(recipient.toString()).emit('new_notification', {
                    _id: notification._id,
                    title: notification.title,
                    content: notification.content,
                    type: notification.type,
                    createdAt: notification.createdAt,
                    actionUrl: notification.actionUrl
                });

                // Also trigger a count refresh
                this.io.to(recipient.toString()).emit('unread_count_update');
            }

            return notification;
        } catch (error) {
            console.error('[NotificationService] Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Broadcast notification to all users or specific roles
     */
    static async broadcast({ sender, title, content, role = null, type = 'announcement' }) {
        try {
            const query = role ? { role } : {};
            const users = await User.find(query).select('_id');

            const notifications = users.map(user => ({
                recipient: user._id,
                sender: sender,
                title,
                content,
                type,
                createdAt: new Date()
            }));

            await Notification.insertMany(notifications);

            if (this.io) {
                // If specific role, we might want to emit to a room or iterate
                // For now, simpler to let users poll or use general announcement room if it existed
                // But individual emits are better for the bell red dot
                users.forEach(user => {
                    this.io.to(user._id.toString()).emit('unread_count_update');
                });
            }
        } catch (error) {
            console.error('[NotificationService] Error in broadcast:', error);
        }
    }
}

module.exports = NotificationService;
