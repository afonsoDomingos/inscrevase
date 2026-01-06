import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SubmissionModel {
    _id: string;
    form: {
        _id: string;
        title: string;
        slug: string;
    };
    data: Record<string, any>;
    paymentProof?: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
}

export const submissionService = {
    async getMySubmissions(): Promise<SubmissionModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/submissions/my-submissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar inscrições');
        return response.json();
    },

    async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<SubmissionModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/submissions/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Falha ao atualizar status');
        return response.json();
    }
};
