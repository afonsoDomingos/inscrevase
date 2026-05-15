import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Vacancy {
    _id: string;
    title: string;
    slug: string;
    description: string;
    requirements: string[];
    location: string;
    type: string;
    image?: string;
    active: boolean;
    category: string;
    questions?: Question[];
    createdAt: string;
}

export interface Question {
    label: string;
    required: boolean;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
}

export interface JobApplication {
    _id: string;
    vacancyId: string | { _id: string, title: string };
    fullName: string;
    age?: number;
    email: string;
    phone: string;
    city: string;
    cvUrl: string;
    photoUrl?: string;
    motivationLetter?: string;
    status: string;
    answers: { question: string, answer: string }[];
    createdAt: string;
}

const defaultFallbackVacancies: Vacancy[] = [
    {
        _id: 'v-fallback-1',
        title: "Especialista em Marketing Digital",
        slug: "especialista-marketing-digital-remoto",
        description: "Estamos à procura de um Especialista em Marketing Digital para ajudar a escalar o ecossistema Inscreva-se. Irá trabalhar na criação de campanhas de performance, gestão de redes sociais e funis de vendas para mentores.",
        requirements: [
            "Mínimo 2 anos de experiência em tráfego pago (Meta Ads, Google Ads)",
            "Conhecimento profundo de Copywriting",
            "Capacidade analítica e foco em resultados",
            "Fluência em Português"
        ],
        location: "Remoto / Luanda",
        type: "Full-time",
        category: "Marketing",
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        _id: 'v-fallback-2',
        title: "Desenvolvedor Full Stack (Next.js/Node.js)",
        slug: "desenvolvedor-fullstack-junior",
        description: "Junte-se à equipa técnica da Inscreva-se. Irá participar no desenvolvimento de novas funcionalidades, optimização de performance e integração de APIs de pagamento locais.",
        requirements: [
            "Conhecimento sólido em React, Next.js e TypeScript",
            "Experiência com Node.js e MongoDB",
            "Interesse em Fintech e sistemas de eventos",
            "Proactividade e vontade de aprender"
        ],
        location: "Remoto / Maputo",
        type: "Full-time",
        category: "Tecnologia",
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        _id: 'v-fallback-3',
        title: "Gestor de Comunidade e Suporte",
        slug: "gestor-comunidade-suporte-ao-cliente",
        description: "Buscamos alguém apaixonado por pessoas para gerir a nossa comunidade de mentores e organizadores. Irá prestar suporte técnico e garantir que todos tenham uma experiência incrível na plataforma.",
        requirements: [
            "Excelente comunicação escrita e verbal",
            "Paciência e empatia no atendimento",
            "Conhecimento básico da plataforma Inscreva-se",
            "Disponibilidade para turnos rotativos"
        ],
        location: "Luanda, Angola",
        type: "Part-time",
        category: "Suporte",
        active: true,
        createdAt: new Date().toISOString()
    }
];

export const vacancyService = {
    // Public
    getPublicVacancies: async (): Promise<Vacancy[]> => {
        try {
            const res = await fetch(`${API_URL}/vacancies`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
        } catch (error) {
            console.error('API Error fetching vacancies, using fallbacks', error);
        }
        return defaultFallbackVacancies;
    },

    getVacancyBySlug: async (slug: string): Promise<Vacancy> => {
        try {
            const res = await fetch(`${API_URL}/vacancies/${slug}`);
            if (res.ok) {
                return res.json();
            }
        } catch (error) {
            console.error('Error fetching vacancy by slug', error);
        }
        
        const fallback = defaultFallbackVacancies.find(v => v.slug === slug);
        if (fallback) return fallback;
        throw new Error('Vaga não encontrada');
    },

    submitApplication: async (data: Partial<JobApplication> & { answers: { question: string, answer: string }[] }): Promise<{ success: boolean, message?: string }> => {
        const res = await fetch(`${API_URL}/vacancies/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Admin
    getAdminVacancies: async (): Promise<Vacancy[]> => {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/vacancies/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    createVacancy: async (data: Partial<Vacancy>): Promise<Vacancy> => {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/vacancies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    updateVacancy: async (id: string, data: Partial<Vacancy>): Promise<Vacancy> => {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/vacancies/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    deleteVacancy: async (id: string): Promise<{ success: boolean }> => {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/vacancies/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    getApplications: async (vacancyId?: string): Promise<JobApplication[]> => {
        const token = Cookies.get('token');
        const url = vacancyId ? `${API_URL}/vacancies/admin/applications?vacancyId=${vacancyId}` : `${API_URL}/vacancies/admin/applications`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    deleteApplication: async (id: string): Promise<{ success: boolean, message?: string }> => {
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/vacancies/admin/applications/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    uploadCV: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json() as { url: string };
        return data.url;
    }
};
