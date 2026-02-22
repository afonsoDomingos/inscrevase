import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SmartLinkModel {
    _id?: string;
    title: string;
    type?: 'direct' | 'bio';
    originalUrl?: string;
    slug: string;
    status: 'active' | 'paused' | 'expired';
    category?: string;
    totalClicks?: number;
    facebookPixelId?: string;
    googleAnalyticsId?: string;
    brandingColor?: string;
    createdAt?: string;
    links?: Array<{ title: string; url: string; icon?: string; color?: string }>;
    bioSettings?: {
        bioText?: string;
        avatarUrl?: string;
        theme?: string;
        socialLinks?: Record<string, string>;
    };
}

export const smartLinkService = {
    async getLinkBySlug(slug: string): Promise<SmartLinkModel> {
        const res = await fetch(`${API_URL}/smartlinks/info/${slug}`);
        if (!res.ok) throw new Error('Link não encontrado');
        return res.json();
    },

    async getMyLinks(): Promise<SmartLinkModel[]> {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/smartlinks/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Falha ao buscar links');
        return res.json();
    },

    async createLink(data: Partial<SmartLinkModel>): Promise<{ success: boolean; smartLink: SmartLinkModel }> {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/smartlinks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erro ao criar link');
        return result;
    },

    async updateLink(id: string, data: Partial<SmartLinkModel>): Promise<{ success: boolean; link: SmartLinkModel }> {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/smartlinks/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erro ao atualizar link');
        return result;
    },

    async deleteLink(id: string): Promise<{ success: boolean }> {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/smartlinks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao excluir link');
        return res.json();
    }
};
