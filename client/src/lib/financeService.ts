import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface TransactionModel {
    _id: string;
    type: 'event_registration' | 'subscription';
    mentor?: {
        _id: string;
        name: string;
        email: string;
        businessName?: string;
    };
    form?: {
        _id: string;
        title: string;
    };
    amount: number;
    currency: string;
    platformFee: number;
    mentorEarnings?: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: 'stripe' | 'manual';
    proofUrl?: string;
    createdAt: string;
    metadata?: Record<string, string>;
}

export interface FinancialSummary {
    collectedFees: number;
    pendingFees: number;
    totalRevenue: number;
    subscriptionRevenue?: number;
    eventFeeRevenue?: number;
    monthlyStats?: { month: number; platformFees: number; revenue: number }[];
    paymentMethods?: { [key: string]: number };
    topMentors?: { name: string; business: string; totalGenerated: number; platformFees: number }[];
}

export const financeService = {
    async getAdminTransactions(status?: string, paymentMethod?: string) {
        const token = Cookies.get('token');
        let url = `${API_URL}/stripe/admin/transactions`;
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (paymentMethod) params.append('paymentMethod', paymentMethod);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.transactions as TransactionModel[];
    },

    async getAdminSummary() {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/admin/summary`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.summary as FinancialSummary;
    },

    async confirmPayment(transactionId: string) {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/admin/confirm-payment/${transactionId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    async createSubscription(plan: string, currency: string = 'MZN') {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/subscription/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan, currency })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Falha ao criar assinatura');
        }
        return response.json();
    }
};
