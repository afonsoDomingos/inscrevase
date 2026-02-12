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
    }
};
