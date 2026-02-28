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
    user?: {
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
    baseAmount: number;
    exchangeRate: number;
    platformFee: number;
    basePlatformFee: number;
    mentorEarnings?: number;
    baseMentorEarnings?: number;
    status: 'pending' | 'completed' | 'failed' | 'rejected';
    paymentMethod: 'stripe' | 'manual' | 'paypal';
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
    exchangeRate?: number;
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
        return { ...data.summary, exchangeRate: data.currentRate } as FinancialSummary;
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

    async rejectPayment(transactionId: string) {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/admin/reject-payment/${transactionId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    async deleteTransaction(transactionId: string) {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/admin/transaction/${transactionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    async createSubscription(plan: string, currency: string = 'USD') {
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
    },

    async refreshExchangeRate() {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/admin/refresh-rate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }
};

