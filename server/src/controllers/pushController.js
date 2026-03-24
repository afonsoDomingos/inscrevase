const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Configurar chaves VAPID (Sempre usar try/catch para evitar crash do servidor se faltarem as chaves no Render)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(
            'mailto:suporte@inscreva-se.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        console.log('✅ Web Push: VAPID keys configured correctly.');
    } catch (err) {
        console.error('⚠️ Web Push Configuration Error:', err.message);
    }
} else {
    console.warn('⚠️ Web Push: VAPID keys missing in .env. Notifications disabled.');
}

exports.subscribe = async (req, res) => {
    try {
        const { subscription, deviceType } = req.body;
        const userId = req.user.id;

        // Validar e guardar a subscrição
        await PushSubscription.findOneAndUpdate(
            { user: userId },
            { user: userId, subscription, deviceType },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, message: 'Subscrição guardada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sendNotification = async (userId, title, body, icon, url) => {
    try {
        const subRecord = await PushSubscription.findOne({ user: userId });
        if (!subRecord) return;

        const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/logo.png',
            data: { url: url || '/' }
        });

        await webpush.sendNotification(subRecord.subscription, payload);
        console.log(`Push enviado para o utilizador ${userId}`);
    } catch (error) {
        console.error('Erro ao enviar push:', error);
    }
};
