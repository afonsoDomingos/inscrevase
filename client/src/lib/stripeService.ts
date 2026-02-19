import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const stripeService = {
    async createPortalSession() {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/subscription/portal`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao abrir portal de faturação');
        return data as { url: string };
    },

    async refundPayment(submissionId: string) {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/refund/${submissionId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao processar reembolso');
        return data as { message: string };
    },

    async getStatus() {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/connect/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao buscar status do Stripe');
        return data;
    },

    async verifyPayment(sessionId: string) {
        const response = await fetch(`${API_URL}/stripe/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Falha na verificação do pagamento');
        return data;
    }
};
