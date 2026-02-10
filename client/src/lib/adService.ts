import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdRequestModel {
    _id?: string;
    userId?: string;
    title: string;
    description: string;
    category: 'event' | 'service' | 'product';
    imageUrl: string;
    durationWeeks: number;
    priceTotal: number;
    paymentMethod: 'stripe' | 'manual';
    paymentProofUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    targetUrl?: string;
    createdAt?: string;
}

export const adService = {
    async submitAdRequest(data: AdRequestModel): Promise<{ success: boolean; message: string; ad?: AdRequestModel }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/ads/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Falha ao enviar pedido de anúncio');
        return result;
    },

    async getAllAdRequestsAdmin(): Promise<AdRequestModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/ads/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar pedidos de anúncios');
        return response.json();
    },

    async updateAdRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<AdRequestModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/ads/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Falha ao atualizar status do anúncio');
        return response.json();
    },

    async getMyAdRequests(): Promise<AdRequestModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/ads/my-ads`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar seus pedidos de anúncios');
        return response.json();
    }
};
