import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdminStats {
    mentors?: number;
    participants?: number;
    forms: number;
    submissions: number;
    approved: number;
    pendingCertificates?: number;
    revenue?: number;
    subscriptionRevenue?: number;
    eventFeeRevenue?: number;
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
    dailyStats: { date: string; count: number; visits: number; revenue: number }[];
    geoStats: { name: string; value: number }[];
}

export interface TopMentor {
    id: string;
    submissions: number;
    visits: number;
    user: {
        _id: string;
        name: string;
        email: string;
        profilePhoto?: string;
    }
}

export interface TrafficStats {
    visitsToday: number;
    uniqueVisitorsToday: number;
    totalVisits: number;
    topPages: { page: string; count: number }[];
    topCountries: { country: string; count: number }[];
    trafficByHour: { hour: number; count: number }[];
    trafficByMonth: { month: number; count: number }[];
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
    },

    async getTrafficStats(): Promise<TrafficStats> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/analytics/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar tráfego');
        return response.json();
    },

    async getTopMentors(): Promise<TopMentor[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/top-mentors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar top mentores');
        return response.json();
    },

    async getSuperAdminAnalytics(): Promise<{
        recentLogins: {
            _id: string;
            name: string;
            email: string;
            lastLoginAt: string;
            loginCount: number;
            profilePhoto?: string;
            role: string;
        }[],
        activeUsers: {
            _id: string;
            name: string;
            email: string;
            loginCount: number;
            profilePhoto?: string;
            role: string;
        }[]
    }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/super-admin/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar analytics do SuperAdmin');
        return response.json();
    },
    async getPayPalPayouts(): Promise<{
        _id: string;
        paymentMethod: string;
        createdAt: string;
        amount: number;
        mentorEarnings: number;
        currency: string;
        stripePaymentIntentId?: string;
        mentor?: { name: string; paypalEmail?: string; stripeAccountId?: string };
        form?: { title: string };
        user?: { name: string };
    }[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/paypal/admin/payouts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar repasses do PayPal');
        return response.json();
    }
};
