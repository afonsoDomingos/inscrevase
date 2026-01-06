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
    }
};
