import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ServiceModel {
    _id: string;
    creator: {
        _id: string;
        name: string;
        businessName?: string;
        profilePhoto?: string;
        role: string;
        country?: string;
        whatsapp?: string;
    };
    title: string;
    description: string;
    category: string;
    price?: number;
    currency: string;
    images: string[];
    featured: boolean;
    active: boolean;
    tags: string[];
    contactInfo?: {
        email?: string;
        phone?: string;
        whatsapp?: string;
        website?: string;
    };
    delivery: 'Online' | 'Presencial' | 'Híbrido';
    duration?: string;
    views: number;
    inquiries: number;
    ctaText?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceData {
    title: string;
    description: string;
    category: string;
    price?: number;
    currency?: string;
    images?: string[];
    tags?: string[];
    contactInfo?: {
        email?: string;
        phone?: string;
        whatsapp?: string;
        website?: string;
    };
    delivery?: string;
    duration?: string;
    ctaText?: string;
}

const defaultFallbackServices: ServiceModel[] = [
    {
        _id: 'fallback-s1',
        title: 'Mentoria Estratégica para Eventos Corporativos',
        description: 'Aprenda a planejar e executar eventos de alto impacto para o setor corporativo. Metodologia testada e aprovada por grandes marcas.',
        category: 'Mentoria',
        price: 25000,
        currency: 'MZN',
        images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87'],
        featured: true,
        active: true,
        tags: ['eventos', 'estrategia', 'corporativo'],
        delivery: 'Online',
        duration: '60 min',
        views: 1250,
        inquiries: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
            _id: 'f-c1',
            name: 'Afonso Vibe',
            businessName: 'Vibe Solutions',
            role: 'mentor',
            profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
        }
    },
    {
        _id: 'fallback-s2',
        title: 'Consultoria de Marketing Digital para Palestrantes',
        description: 'Posicionamento de marca e estratégias de venda para profissionais que desejam escalar sua autoridade no mercado digital.',
        category: 'Consultoria',
        price: 150,
        currency: 'USD',
        images: ['https://images.unsplash.com/photo-1556761175-5973dc0f32e7'],
        featured: true,
        active: true,
        tags: ['marketing', 'palestras', 'digital'],
        delivery: 'Online',
        duration: '90 min',
        views: 890,
        inquiries: 22,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
            _id: 'f-c2',
            name: 'Maria Santos',
            businessName: 'Global Impact',
            role: 'specialist',
            profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
        }
    }
];

class ServiceService {
    private getAuthHeader() {
        const token = Cookies.get('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    async createService(data: CreateServiceData): Promise<ServiceModel> {
        const response = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: this.getAuthHeader(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar serviço');
        }

        return response.json();
    }

    async getMyServices(): Promise<ServiceModel[]> {
        const response = await fetch(`${API_URL}/services/my/services`, {
            headers: this.getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar serviços');
        }

        return response.json();
    }

    async getServices(filters?: {
        category?: string;
        creator?: string;
        search?: string;
        featured?: boolean;
    }): Promise<ServiceModel[]> {
        try {
            const params = new URLSearchParams();

            if (filters?.category) params.append('category', filters.category);
            if (filters?.creator) params.append('creator', filters.creator);
            if (filters?.search) params.append('search', filters.search);
            if (filters?.featured) params.append('featured', 'true');

            const response = await fetch(`${API_URL}/services?${params.toString()}`);

            if (!response.ok) {
                return defaultFallbackServices;
            }

            const data = await response.json();
            return data.length > 0 ? data : defaultFallbackServices;
        } catch {
            return defaultFallbackServices;
        }
    }

    async getServiceById(id: string): Promise<ServiceModel> {
        try {
            const response = await fetch(`${API_URL}/services/${id}`);

            if (!response.ok) {
                const fallback = defaultFallbackServices.find(s => s._id === id);
                if (fallback) return fallback;
                throw new Error('Erro ao buscar serviço');
            }

            return response.json();
        } catch (error) {
            const fallback = defaultFallbackServices.find(s => s._id === id);
            if (fallback) return fallback;
            throw error;
        }
    }

    async updateService(id: string, data: Partial<CreateServiceData>): Promise<ServiceModel> {
        const response = await fetch(`${API_URL}/services/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeader(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar serviço');
        }

        return response.json();
    }

    async deleteService(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/services/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeader()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao deletar serviço');
        }
    }

    async toggleServiceStatus(id: string): Promise<ServiceModel> {
        const response = await fetch(`${API_URL}/services/${id}/toggle-status`, {
            method: 'PATCH',
            headers: this.getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Erro ao alterar status do serviço');
        }

        return response.json();
    }

    async incrementInquiry(id: string): Promise<void> {
        await fetch(`${API_URL}/services/${id}/inquiry`, {
            method: 'POST'
        });
    }
}

export const serviceService = new ServiceService();
