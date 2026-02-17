import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ReferralStats {
    referralCode: string;
    points: number;
    totalInvites: number;
    convertedCount: number;
}

export interface ReferralHistory {
    _id: string;
    referredUser: {
        name: string;
        email: string;
        createdAt: string;
    };
    pointsEarned: number;
    status: string;
    createdAt: string;
}

export interface ReferralRanking {
    _id: string;
    name: string;
    email: string;
    referralPoints: number;
    referralCount: number;
    plan: string;
}

export const referralService = {
    async getStats(): Promise<ReferralStats> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/referrals/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar estatísticas de convite');
        return response.json();
    },

    async getHistory(): Promise<ReferralHistory[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/referrals/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar histórico de convites');
        return response.json();
    },

    async validateCode(code: string): Promise<{ referrerName: string }> {
        const response = await fetch(`${API_URL}/referrals/validate/${code}`);
        if (!response.ok) throw new Error('Código de convite inválido');
        return response.json();
    },

    async getRanking(): Promise<ReferralRanking[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/referrals/admin/ranking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar ranking');
        return response.json();
    },

    async assignReward(userId: string, planType: string, days: number): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/referrals/admin/reward`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, planType, days })
        });
        if (!response.ok) throw new Error('Erro ao atribuir recompensa');
    },

    async awardSocialPoints(missionId: string): Promise<{ points: number }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/referrals/social-points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ missionId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao atribuir pontos sociais');
        return data;
    },

    async getAdminUserReferrals(userId: string): Promise<{ user: any, history: ReferralHistory[] }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/referrals/admin/user-referrals/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar auditoria de convites');
        return response.json();
    }
};
