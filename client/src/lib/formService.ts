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
        isVerified?: boolean;
        role?: 'admin' | 'mentor' | 'SuperAdmin' | 'participant' | 'company' | 'specialist';
    };
    fields: {
        id: string;
        label: string;
        type: 'text' | 'email' | 'number' | 'tel' | 'phone' | 'file' | 'select' | 'checkbox' | 'date' | 'textarea' | 'url' | 'radio';
        required: boolean;
        options?: string[];
    }[];
    eventDate?: string | null;
    eventTime?: string | null;
    eventType?: string | null;
    category?: string | null;
    capacity?: number | null;
    extraCapacity?: number | null; // For dynamically adding slots
    location?: string | null;
    onlineLink?: string | null;
    waitingVideo?: string | null;
    showVideoOnStart?: boolean | null;
    coverImage?: string | null;
    coverImageMode?: 'full' | 'banner' | null;
    videoUrl?: string | null;
    videoOrientation?: 'vertical' | 'horizontal';
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
        formPosition?: 'left' | 'right';
    };

    paymentConfig?: {
        enabled: boolean;
        price?: number;
        originalPrice?: number;
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
        manualMethods?: {
            label: string;
            value: string;
            icon?: string;
        }[];
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
    associatedLessons?: string[];
    partners?: string[] | { _id: string; name: string; businessName?: string; profilePhoto?: string }[];
    partnersPublic?: string[];
    isSponsored?: boolean;
    totalStudents?: number;
    totalEvents?: number;
    averageRating?: number;
    totalRatings?: number;
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
            // 1. Get/Create Visitor ID
            let visitorId = typeof window !== 'undefined' ? localStorage.getItem('visitor_id') : null;
            if (!visitorId && typeof window !== 'undefined') {
                visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                localStorage.setItem('visitor_id', visitorId);
            }

            if (typeof window === 'undefined') return;

            // 2. Parse UTMs
            const params = new URLSearchParams(window.location.search);

            // 3. Simple Device/OS Detection
            const userAgent = navigator.userAgent;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

            await fetch(`${API_URL}/forms/${slug}/visit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId,
                    referrer: document.referrer,
                    browser: userAgent,
                    os: navigator.platform,
                    deviceType: isMobile ? 'mobile' : 'desktop',
                    utmSource: params.get('utm_source'),
                    utmMedium: params.get('utm_medium'),
                    utmCampaign: params.get('utm_campaign'),
                    utmContent: params.get('utm_content'),
                    utmTerm: params.get('utm_term')
                })
            });
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
    },
    async togglePartnerVisibility(id: string): Promise<{ success: boolean; isPublic: boolean }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/forms/${id}/toggle-visibility`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao atualizar visibilidade');
        return response.json();
    },
    async toggleSponsorship(id: string): Promise<{ success: boolean; isSponsored: boolean }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/forms/${id}/toggle-sponsor`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao promover evento');
        return response.json();
    }
};
