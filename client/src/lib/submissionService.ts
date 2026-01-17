import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SubmissionModel {
    _id: string;
    form: {
        _id: string;
        title: string;
        coverImage?: string;
        eventDate?: string;
        eventTime?: string;
        location?: string;
        onlineLink?: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    paymentStatus: 'unpaid' | 'paid' | 'pending';
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
    }
};
