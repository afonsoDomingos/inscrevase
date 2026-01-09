import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface TransactionModel {
    _id: string;
    mentor: {
        _id: string;
        name: string;
        email: string;
        businessName?: string;
    };
    form: {
        _id: string;
        title: string;
    };
    amount: number;
    currency: string;
    platformFee: number;
    mentorEarnings: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: 'stripe' | 'manual';
    createdAt: string;
}

export interface FinancialSummary {
    collectedFees: number;
    pendingFees: number;
    totalRevenue: number;
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
    }
};
