import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PaymentAttemptLog {
    _id?: string;
    userId?: {
        _id: string;
        name: string;
        email: string;
        businessName?: string;
    };
    type: 'subscription' | 'event_registration' | 'ad_purchase';
    method: 'stripe' | 'paypal' | 'manual';
    status: 'initiated' | 'cancelled' | 'failed' | 'blocked_maintenance' | 'capture_started' | 'capture_failed' | 'completed';
    amount?: number;
    currency?: string;
    metadata?: Record<string, string | number | boolean | undefined>;
    createdAt?: string;
}

export const logService = {
    async logPaymentAttempt(data: PaymentAttemptLog): Promise<void> {
        try {
            const token = Cookies.get('token');
            if (!token) return;

            await fetch(`${API_URL}/settings/log-attempt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('🔴 Error logging payment attempt:', error);
        }
    },

    async getPaymentAttempts(): Promise<PaymentAttemptLog[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/settings/payment-attempts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar tentativas de pagamento');
        return response.json();
    }
};
