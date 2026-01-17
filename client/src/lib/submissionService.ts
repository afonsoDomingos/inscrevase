import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SubmissionModel {
    _id: string;
    form: {
        _id: string;
        title: string;
        slug?: string;
        coverImage?: string;
        eventDate?: string;
        eventTime?: string;
        location?: string;
        onlineLink?: string;
        creator?: {
            _id: string;
            name: string;
            businessName?: string;
        };
    };
    data: Record<string, unknown>;
    paymentProof?: string;
    status: 'pending' | 'approved' | 'rejected';
    paymentStatus: 'unpaid' | 'paid' | 'pending';
    aiAnalysis?: {
        isValid: boolean;
        transactionId?: string;
        amount?: number;
        currency?: string;
        warning?: string;
        confidence?: number;
    };
    submittedAt: string;
}

export const submissionService = {
    async getParticipantSubmissions(): Promise<SubmissionModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/submissions/my-submissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar seus ingressos');
        return response.json();
    },

    async getMySubmissions(): Promise<SubmissionModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/submissions/my-submissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar submissões');
        return response.json();
    },

    async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/submissions/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Falha ao atualizar status');
    },

    async analyzeReceipt(submissionId: string): Promise<{ success: boolean; analysis: SubmissionModel['aiAnalysis'] }> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/submissions/${submissionId}/analyze-receipt`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao analisar recibo');
        return response.json();
    },

    async deleteSubmission(id: string): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/submissions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao excluir submissão');
    }
};
