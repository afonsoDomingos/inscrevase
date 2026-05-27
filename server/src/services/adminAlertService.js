const User = require('../models/User');
const GlobalSettings = require('../models/GlobalSettings');
const NotificationService = require('./notificationService');
const pushController = require('../controllers/pushController');
const whatsappService = require('./whatsappService');

const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP;

async function getOwnerWhatsapp() {
    const ownerSetting = await GlobalSettings.findOne({ key: 'owner_whatsapp' }).select('value');
    return ownerSetting?.value || OWNER_WHATSAPP || null;
}

function toAbsoluteUrl(url) {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.CLIENT_URL || 'https://inscreva-se.com';
    return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}

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
    cooldownMs = 10 * 60 * 1000,
    notifyOwner = true
}) {
    if (!title || !content) return;
    if (shouldSkipByCooldown(cooldownKey, cooldownMs)) return;

    const admins = await User.find({ role: { $in: ['admin', 'SuperAdmin'] } }).select('_id');
    if (!admins.length) return;

    const ownerUrl = toAbsoluteUrl(actionUrl);
    const ownerMessage = ownerUrl
        ? `🚨 *${title}*\n${content}\n🔗 ${ownerUrl}`
        : `🚨 *${title}*\n${content}`;

    const ownerWhatsapp = await getOwnerWhatsapp();
    const ownerPromise = (ownerWhatsapp && notifyOwner)
        ? whatsappService.sendMessage(ownerWhatsapp, ownerMessage).catch(() => null)
        : Promise.resolve(null);

    await Promise.all([
        Promise.all(admins.map(async (admin) => {
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
        })),
        ownerPromise
    ]);
}

module.exports = {
    notifyAdmins,
    getOwnerWhatsapp
};
