import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface MarketingRequest {
    _id: string;
    userId: string;
    serviceType: 'boost_social' | 'meta_ads' | 'gestion_360';
    contactName: string;
    whatsapp: string;
    email: string;
    companyName?: string;
    details: string;
    status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export const marketingService = {
    async createRequest(data: {
        serviceType: string;
        contactName: string;
        whatsapp: string;
        email: string;
        companyName?: string;
        details: string;
    }) {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/marketing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao enviar pedido');
        }

        return response.json();
    },

    async getMyRequests(): Promise<MarketingRequest[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/marketing/my`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar pedidos');
        }

        return response.json();
    },

    async getAllRequests(): Promise<MarketingRequest[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/marketing/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar todos os pedidos');
        }

        return response.json();
    },

    async updateStatus(id: string, status: string, adminNotes?: string) {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/marketing/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, adminNotes })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar status');
        }

        return response.json();
    }
};
