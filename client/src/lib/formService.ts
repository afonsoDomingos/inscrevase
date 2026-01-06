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
    };
    fields: {
        id: string;
        label: string;
        type: 'text' | 'email' | 'number' | 'tel' | 'file' | 'select';
        required: boolean;
        options?: string[];
    }[];
    coverImage?: string;
    logo?: string;
    whatsappConfig?: {
        phoneNumber: string;
        message: string;
    };
    theme?: {
        primaryColor: string;
        backgroundColor: string;
        fontFamily: string;
        style: 'luxury' | 'minimalist';
    };
    createdAt: string;
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

    async submitForm(data: { formId: string; data: Record<string, string>; paymentProof?: string }): Promise<Record<string, unknown>> {
        const response = await fetch(`${API_URL}/submissions/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao enviar inscrição');
        return result;
    },

    async uploadFile(file: File, folder: string = 'submissions'): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error('Erro no upload do arquivo');
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
    }
};
