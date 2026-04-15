import Cookies from 'js-cookie';

export const subscriptionService = {
    /**
     * Get Stripe Billing Portal URL
     */
    async getStripePortal() {
        const token = Cookies.get('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/stripe/portal`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao carregar portal de faturação');
        return data.url;
    },

    /**
     * Cancel PayPal Recurring Subscription
     */
    async cancelPaypal(subscriptionId: string) {
        const token = Cookies.get('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/paypal/cancel`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subscriptionId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao cancelar no PayPal');
        return data;
    }
};
