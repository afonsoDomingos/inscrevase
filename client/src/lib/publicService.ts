
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PublicImpactStats {
    topMentors: {
        id: string;
        name: string;
        businessName?: string;
        profilePhoto?: string;
        submissions: number;
        visits: number;
        impactScore: number;
    }[];
    topCountries: {
        country: string;
        count: number;
    }[];
    globalStats: {
        totalSubmissions: number;
        totalVisits: number;
        totalMentors: number;
        totalEvents: number;
        totalCountries: number;
        averageRating: number;
    };
}

export const publicService = {
    async getImpactStats(): Promise<PublicImpactStats> {
        const response = await fetch(`${API_URL}/analytics/public-impact`);
        if (!response.ok) throw new Error('Falha ao buscar dados de impacto');
        return response.json();
    }
};
