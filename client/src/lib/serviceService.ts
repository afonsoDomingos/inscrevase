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
}

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
        const params = new URLSearchParams();

        if (filters?.category) params.append('category', filters.category);
        if (filters?.creator) params.append('creator', filters.creator);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.featured) params.append('featured', 'true');

        const response = await fetch(`${API_URL}/services?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar serviços');
        }

        return response.json();
    }

    async getServiceById(id: string): Promise<ServiceModel> {
        const response = await fetch(`${API_URL}/services/${id}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar serviço');
        }

        return response.json();
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
