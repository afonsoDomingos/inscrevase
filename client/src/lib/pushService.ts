import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BMtTcAY0hM6tIviS898L4RfC0Ia4vgCSXsty9yzlNfej4lOJRfM-obbOwI4GRC6TSOpO3v281v6ayvqBaqKx_H0';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const pushService = {
    async subscribeUser() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Check if user is already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                // To be safe, resend to server
                await this.sendSubscriptionToServer(existingSubscription);
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            await this.sendSubscriptionToServer(subscription);
            console.log('User subscribed to Push successfully');
        } catch (error) {
            console.error('Failed to subscribe to Push:', error);
        }
    },

    async sendSubscriptionToServer(subscription: PushSubscription) {
        const token = Cookies.get('token');
        if (!token) return;

        await fetch(`${API_URL}/push/subscribe`, {
            method: 'POST',
            body: JSON.stringify({
                subscription,
                deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }
};
