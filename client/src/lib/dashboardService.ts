import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdminStats {
    mentors?: number;
    participants?: number;
    totalUsers?: number;
    forms: number;
    submissions: number;
    approved: number;
    pendingCertificates?: number;
    revenue?: number;
    earnings?: number;
    fees?: number;
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
    peakHours?: { hour: number; count: number }[];
    peakDays?: { day: number; count: number }[];
}

const handleResponse = async (response: Response, errorMsg: string) => {
    if (!response.ok) {
        if (response.status === 401) {
            const err = new Error('Unauthorized') as Error & { status?: number };
            err.status = 401;
            throw err;
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

export const dashboardService = {
    async getAdminStats(): Promise<AdminStats> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response, 'Falha ao buscar estatísticas');
    },

    async getRecentForms(): Promise<RecentForm[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/recent-forms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response, 'Falha ao buscar formulários recentes');
    },

    async getMentorStats(): Promise<AdminStats> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/mentor/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response, 'Falha ao buscar estatísticas do mentor');
    },

    async getAnalytics(): Promise<AnalyticsData> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/mentor/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response, 'Falha ao buscar dados analíticos');
    },

    async getTrafficStats(): Promise<TrafficStats> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/analytics/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response, 'Falha ao buscar tráfego');
    },

    async getTopMentors(): Promise<TopMentor[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/dashboard/top-mentors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response, 'Falha ao buscar top mentores');
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
            lastLoginDevice?: string;
            lastLoginOS?: string;
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
        return handleResponse(response, 'Falha ao buscar analytics do SuperAdmin');
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
        return handleResponse(response, 'Falha ao buscar repasses do PayPal');
    }
};
