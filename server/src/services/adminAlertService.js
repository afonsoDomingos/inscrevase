const User = require('../models/User');
const NotificationService = require('./notificationService');
const pushController = require('../controllers/pushController');

// In-memory cooldown guard to reduce notification noise.
// Key format recommendation: `${type}:${entityId}`
const recentAlertCache = new Map();

function shouldSkipByCooldown(key, cooldownMs = 10 * 60 * 1000) {
    if (!key) return false;
    const now = Date.now();
    const last = recentAlertCache.get(key);
    if (last && now - last < cooldownMs) return true;
    recentAlertCache.set(key, now);
    return false;
}

async function notifyAdmins({
    senderId = null,
    title,
    content,
    actionUrl = '/dashboard/admin',
    type = 'system',
    cooldownKey = null,
    cooldownMs = 10 * 60 * 1000
}) {
    if (!title || !content) return;
    if (shouldSkipByCooldown(cooldownKey, cooldownMs)) return;

    const admins = await User.find({ role: { $in: ['admin', 'SuperAdmin'] } }).select('_id');
    if (!admins.length) return;

    await Promise.all(admins.map(async (admin) => {
        // Avoid self-alerts when sender is also an admin
        if (senderId && admin._id.toString() === senderId.toString()) return;

        await NotificationService.notify({
            recipient: admin._id,
            sender: senderId || admin._id,
            title,
            content,
            type,
            actionUrl
        });

        await pushController.sendNotification(
            admin._id,
            title,
            content,
            '/logo.png',
            actionUrl
        );
    }));
}

module.exports = {
    notifyAdmins
};
