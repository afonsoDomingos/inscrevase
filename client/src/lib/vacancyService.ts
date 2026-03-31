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
    email: string;
    phone: string;
    city: string;
    cvUrl: string;
    motivationLetter?: string;
    status: string;
    answers: { question: string, answer: string }[];
    createdAt: string;
}

export const vacancyService = {
    // Public
    getPublicVacancies: async (): Promise<Vacancy[]> => {
        const res = await fetch(`${API_URL}/vacancies`);
        return res.json();
    },

    getVacancyBySlug: async (slug: string): Promise<Vacancy> => {
        const res = await fetch(`${API_URL}/vacancies/${slug}`);
        if (!res.ok) throw new Error('Vaga não encontrada');
        return res.json();
    },

    submitApplication: async (data: any): Promise<any> => {
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

    createVacancy: async (data: any): Promise<Vacancy> => {
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

    deleteVacancy: async (id: string): Promise<any> => {
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

    uploadCV: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const token = Cookies.get('token');
        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        return data.url;
    }
};
