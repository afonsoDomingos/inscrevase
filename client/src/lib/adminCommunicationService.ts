import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Cookies.get('token')}`
});

export const adminCommunicationService = {
    sendEmail: async (data: {
        recipientIds?: string[];
        subject: string;
        content: string;
        isAllMentors?: boolean;
        isAllUsers?: boolean;
        isAllParticipants?: boolean;
        eventIdForParticipants?: string;
        buttonText?: string;
        buttonUrl?: string;
    }) => {
        const response = await fetch(`${API_URL}/admin/communication/send-email`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao enviar email');
        }
        return response.json();
    },
    getLogs: async () => {
        const response = await fetch(`${API_URL}/admin/communication/logs`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Erro ao buscar histórico de emails');
        return response.json();
    },
    getRecipientCount: async (mode: 'mentors' | 'all' | 'participants', eventId?: string) => {
        const params = new URLSearchParams({ mode });
        if (eventId) params.append('eventId', eventId);
        const response = await fetch(`${API_URL}/admin/communication/recipient-count?${params}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Erro ao buscar contagem');
        return response.json() as Promise<{ count: number; label: string }>;
    }
};
