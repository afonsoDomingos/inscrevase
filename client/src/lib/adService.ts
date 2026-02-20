import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdRequestModel {
    _id?: string;
    userId?: string | { _id: string; name: string; email: string };
    title: string;
    description: string;
    category: 'event' | 'service' | 'product';
    mediaUrl: string;
    mediaType: 'image' | 'video';
    durationWeeks: number;
    priceTotal: number;
    currency?: string;
    paymentMethod: 'stripe' | 'manual';
    paymentProofUrl?: string;
    paymentStatus?: 'pending' | 'paid' | 'failed';
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    isActive?: boolean;
    clicks?: number;
    views?: number;
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

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Falha ao enviar pedido de anúncio');
            return result;
        } else {
            const text = await response.text();
            console.error('🔴 [adService] Non-JSON response:', text);
            throw new Error('Servidor retornou um erro inesperado (HTML). Verifique se a rota da API está configurada corretamente.');
        }
    },

    async getAllAdRequestsAdmin(): Promise<AdRequestModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/ads/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar pedidos de anúncios');
        return response.json();
    },

    async updateAdRequestStatus(id: string, status: 'approved' | 'rejected' | 'suspended'): Promise<AdRequestModel> {
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
    },

    async updateAdRequest(id: string, data: Partial<AdRequestModel>): Promise<AdRequestModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/ads/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Falha ao atualizar anúncio');
        return response.json();
    },

    async deleteAdRequest(id: string): Promise<{ success: boolean }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/ads/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao excluir anúncio');
        return response.json();
    },

    async toggleAdStatus(id: string, isActive: boolean): Promise<AdRequestModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/ads/${id}/toggle`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isActive })
        });
        if (!response.ok) throw new Error('Falha ao alterar status do anúncio');
        return response.json();
    },

    async trackAdImpression(id: string): Promise<void> {
        // No token needed for impressions
        await fetch(`${API_URL}/ads/${id}/view`, { method: 'POST' });
    },

    async trackAdClick(id: string): Promise<void> {
        // No token needed for clicks
        await fetch(`${API_URL}/ads/${id}/click`, { method: 'POST' });
    },

    async createAdCheckout(adData: AdRequestModel): Promise<{ success: boolean; url: string }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/stripe/checkout/ad`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ adData })
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || 'Falha ao criar checkout de anúncio');
        }
        return response.json();
    },

    async getActiveAds(category?: string): Promise<AdRequestModel[]> {
        const url = category ? `${API_URL}/ads/active?category=${category}` : `${API_URL}/ads/active`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao buscar anúncios ativos');
        return response.json();
    }
};
