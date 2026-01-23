import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface FormModel {
    _id: string;
    title: string;
    slug: string;
    description: string;
    active: boolean;
    creator: {
        _id: string;
        name: string;
        email: string;
        businessName?: string;
        profilePhoto?: string;
        bio?: string;
        socialLinks?: {
            instagram?: string;
            linkedin?: string;
            facebook?: string;
            website?: string;
        };
        facebookPixelId?: string;
    };
    fields: {
        id: string;
        label: string;
        type: 'text' | 'email' | 'number' | 'tel' | 'phone' | 'file' | 'select' | 'checkbox' | 'date' | 'textarea' | 'url';
        required: boolean;
        options?: string[];
    }[];
    eventDate?: string;
    eventTime?: string;
    eventType?: string;
    category?: string;
    capacity?: number;
    location?: string;
    onlineLink?: string;
    waitingVideo?: string;
    showVideoOnStart?: boolean;
    coverImage?: string;
    coverImageMode?: 'full' | 'banner';
    videoUrl?: string;
    logo?: string;
    whatsappConfig?: {
        phoneNumber: string;
        message: string;
        communityUrl?: string;
    };
    theme?: {
        primaryColor: string;
        backgroundColor: string;
        backgroundImage?: string;
        titleColor?: string;
        inputColor?: string;
        inputBackgroundColor?: string;
        inputPlaceholderColor?: string;
        fontFamily: string;
        style: 'luxury' | 'minimalist';
    };

    paymentConfig?: {
        enabled: boolean;
        price?: number;
        currency?: string;
        mpesaNumber?: string;
        emolaNumber?: string;
        bankAccount?: string;
        accountHolder?: string;
        instructions?: string;
        stripeEnabled?: boolean;
        stripePriceId?: string;
        stripeProductId?: string;
        requireProof: boolean;
    };
    certificateConfig?: {
        enabled: boolean;
        template: string;
        primaryColor: string;
        title: string;
        subtitle: string;
        description: string;
        signerName?: string;
        signerRole: string;
        requireCheckIn: boolean;
    };
    welcomeMessage?: string;
    welcomeVideo?: string;
    hubBackgroundImage?: string;
    hubButtonColor?: string;
    showHubButton?: boolean;
    customFields?: {
        label: string;
        value: string;
        icon?: string;
        order: number;
    }[];
    agenda?: {
        time: string;
        activity: string;
        description?: string;
        duration?: string;
        order: number;
    }[];
    materials?: {
        name: string;
        url: string;
        type: 'pdf' | 'video' | 'link' | 'zip' | 'other';
        size?: string;
        availableAfterEvent: boolean;
        order: number;
    }[];
    createdAt: string;
    updatedAt: string;
    submissionCount?: number;
    visits?: number;
}

export const formService = {
    async getAllFormsAdmin(): Promise<FormModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/forms/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar formulários');
        return response.json();
    },

    async getFormBySlug(slug: string): Promise<FormModel> {
        const response = await fetch(`${API_URL}/forms/${slug}`);
        if (!response.ok) throw new Error('Formulário não encontrado');
        return response.json();
    },

    async submitForm(data: { formId: string; data: Record<string, string>; paymentProof?: string }): Promise<{ message: string; submission: { _id: string } }> {
        const token = Cookies.get('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/submissions/submit`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao enviar inscrição');
        return result;
    },

    async uploadFile(file: File, folder: string = 'submissions'): Promise<string> {
        const formData = new FormData();
        formData.append('folder', folder);
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json().catch(() => ({ message: 'Resposta inválida do servidor' }));

        if (!response.ok) {
            console.error('Upload Error:', { status: response.status, result });
            throw new Error(result.message || `Erro no servidor (Status: ${response.status})`);
        }

        return result.url;
    },

    async createForm(data: Partial<FormModel>): Promise<FormModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/forms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Falha ao criar formulário');
        return result;
    },

    async deleteForm(id: string): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/forms/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao excluir formulário');
    },

    async toggleFormStatus(id: string, active: boolean): Promise<FormModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/forms/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ active })
        });
        if (!response.ok) throw new Error('Falha ao atualizar status do formulário');
        return response.json();
    },

    async getMyForms(): Promise<FormModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/forms/my-forms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar seus formulários');
        return response.json();
    },

    async updateForm(id: string, data: Partial<FormModel>): Promise<FormModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/forms/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Falha ao atualizar formulário');
        return result;
    },

    async getFormsByMentor(mentorId: string): Promise<FormModel[]> {
        const response = await fetch(`${API_URL}/forms/mentor/${mentorId}`);
        if (!response.ok) throw new Error('Falha ao buscar eventos do mentor');
        return response.json();
    },

    async recordVisit(slug: string): Promise<void> {
        try {
            await fetch(`${API_URL}/forms/${slug}/visit`, { method: 'POST' });
        } catch (err) {
            console.error("Error recording form visit:", err);
        }
    },

    async getExploreEvents(category?: string, search?: string): Promise<FormModel[]> {
        const params = new URLSearchParams();
        if (category && category !== 'Todos') params.append('category', category);
        if (search) params.append('search', search);

        const response = await fetch(`${API_URL}/forms/explore?${params}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        return response.json();
    },
    async getPublicForms(): Promise<FormModel[]> {
        return this.getExploreEvents();
    }
};
