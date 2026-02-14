import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface FeedbackModel {
    _id: string;
    name: string;
    email: string;
    type: 'bug' | 'suggestion' | 'praise' | 'other';
    rating: number;
    message: string;
    status: 'new' | 'read' | 'archived' | 'resolved';
    createdAt: string;
}

export const feedbackService = {
    async sendFeedback(data: { name: string; email: string; type: string; rating: number; message: string; targetUserId?: string }) {
        const token = Cookies.get('token');
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/feedback`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Falha ao enviar feedback');
        return response.json();
    },

    async getMyFeedbacks(): Promise<FeedbackModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/feedback/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar feedbacks');
        return response.json();
    },

    async updateStatus(id: string, status: string) {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/feedback/${id}/status`, {
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
