import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface MotivaContest {
    _id: string;
    phase: number;
    rewardTitle: string;
    rewardValue: string;
    startDate: string;
    endDate: string;
    maxUploads: number;
    isActive: boolean;
    winner?: {
        name: string;
        videoTitle: string;
        videoUrl: string;
        likes: number;
    };
}

export interface MotivaEntry {
    _id: string;
    user: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    phase: number;
    videoUrl: string;
    title: string;
    status: string;
    likes: string[];
    likeCount: number;
    contactName?: string;
    liked?: boolean; // Client-side helper
}

export const motivaService = {
    getActiveContest: async () => {
        try {
            const response = await fetch(`${API_URL}/motiva/active`);
            if (!response.ok) throw new Error('Falha ao carregar concurso ativo.');
            return await response.json();
        } catch (error) {
            console.error('Error in getActiveContest:', error);
            return null;
        }
    },

    getEntries: async (phase: number) => {
        try {
            const response = await fetch(`${API_URL}/motiva/entries/${phase}`);
            if (!response.ok) throw new Error('Falha ao carregar participantes.');
            return await response.json();
        } catch (error) {
            console.error('Error in getEntries:', error);
            return [];
        }
    },

    getWinners: async () => {
        try {
            const response = await fetch(`${API_URL}/motiva/winners`);
            if (!response.ok) throw new Error('Falha ao carregar vencedores.');
            return await response.json();
        } catch (error) {
            console.error('Error in getWinners:', error);
            return [];
        }
    },

    uploadEntry: async (data: { title: string; videoUrl: string; phase: number; contactName?: string; contactWhatsApp?: string; contactEmail?: string }) => {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/motiva/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao enviar vídeo.');
        return result;
    },

    toggleLike: async (entryId: string) => {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/motiva/like/${entryId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao votar.');
        return result;
    }
};
