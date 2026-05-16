import Cookies from 'js-cookie';
import { UserData } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const defaultFallbackMentors: UserData[] = [
    {
        id: 'm-fallback-1',
        _id: 'm-fallback-1',
        name: "Afonso Domingos",
        email: "afonso@muv.digital",
        businessName: "MUV Digital",
        role: "specialist",
        bio: "Especialista em desenvolvimento de ecossistemas digitais e automação de negócios. Mentor de mais de 500 alunos em Angola.",
        profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
        followers: new Array(150).fill(null),
        profileVisits: 2500,
        badges: [{ name: 'Elite', color: '#FFD700' }],
        plan: 'premium'
    },
    {
        id: 'm-fallback-2',
        _id: 'm-fallback-2',
        name: "Cláudio Kiala",
        email: "claudio@kiala.com",
        businessName: "Kiala Mentoria",
        role: "mentor",
        bio: "Mentor de carreira e liderança. Ajudo profissionais a alcançarem o topo do mercado corporativo em Moçambique e Angola.",
        profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
        followers: new Array(85).fill(null),
        profileVisits: 1200,
        badges: [{ name: 'Verificado', color: '#4299e1' }],
        plan: 'free'
    },
    {
        id: 'm-fallback-3',
        _id: 'm-fallback-3',
        name: "Sara Santos",
        email: "sara@sara.design",
        businessName: "Sara Design Studio",
        role: "specialist",
        bio: "Especialista em Branding e UI/UX Design. Criadora de identidades visuais de alto impacto para eventos internacionais.",
        profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
        followers: new Array(210).fill(null),
        profileVisits: 3100,
        badges: [{ name: 'Top Expert', color: '#FFD700' }],
        plan: 'premium'
    },
    {
        id: 'm-fallback-4',
        _id: 'm-fallback-4',
        name: "Inscreva-se Academy",
        email: "academy@inscrevase.com",
        businessName: "Formação Corporativa",
        role: "company",
        bio: "A maior escola de gestão de eventos da lusofonia. Certificamos mais de 1000 organizadores anualmente.",
        profilePhoto: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
        followers: new Array(500).fill(null),
        profileVisits: 8900,
        badges: [{ name: 'Institucional', color: '#1452AD' }],
        plan: 'premium'
    }
];

export const userService = {
    async getAllUsers(): Promise<UserData[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar usuários');
        return response.json();
    },

    async updateUser(id: string, data: Partial<UserData>): Promise<UserData> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Falha ao atualizar usuário');
        return response.json();
    },

    async deleteUser(id: string): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao excluir usuário');
    },

    async getPublicMentors(): Promise<UserData[]> {
        try {
            const response = await fetch(`${API_URL}/auth/public/mentors`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) return data;
            }
        } catch (error) {
            console.error('Error fetching mentors, using fallbacks', error);
        }
        return defaultFallbackMentors;
    },

    async getPublicMentorById(id: string): Promise<UserData> {
        try {
            const response = await fetch(`${API_URL}/auth/public/mentors/${id}`);
            if (response.ok) return response.json();
        } catch (error) {
            console.error('Error fetching mentor by id', error);
        }

        const fallback = defaultFallbackMentors.find(m => m.id === id || m._id === id);
        if (fallback) return fallback;
        throw new Error('Mentor não encontrado');
    },

    async toggleFollow(id: string): Promise<{ followersCount: number, isFollowing: boolean }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/mentors/${id}/follow`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao seguir mentor');
        return response.json();
    },

    async recordVisit(id: string): Promise<void> {
        await fetch(`${API_URL}/auth/public/mentors/${id}/visit`, {
            method: 'POST'
        });
    }
};
