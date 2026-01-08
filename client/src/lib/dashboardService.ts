import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdminStats {
    mentors?: number;
    forms: number;
    submissions: number;
    approved: number;
    revenue?: number;
    authStats?: {
        google: number;
        linkedin: number;
        native: number;
    };
}

export interface RecentForm {
    _id: string;
    title: string;
    slug: string;
    creator: {
        name: string;
        businessName: string;
    };
    createdAt: string;
}

export interface AnalyticsData {
    dailyStats: { date: string; count: number; revenue: number }[];
    geoStats: { name: string; value: number }[];
}

export const dashboardService = {
    async getAdminStats(): Promise<AdminStats> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar estatísticas');
        return response.json();
    },

    async getRecentForms(): Promise<RecentForm[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/recent-forms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar formulários recentes');
        return response.json();
    },

    async getMentorStats(): Promise<AdminStats> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/mentor/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar estatísticas do mentor');
        return response.json();
    },

    async getAnalytics(): Promise<AnalyticsData> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/mentor/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar dados analíticos');
        return response.json();
    }
};
