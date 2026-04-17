import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Message {
    _id: string;
    sender: 'user' | 'admin' | 'mentor';
    content: string;
    attachment?: string | null;
    createdAt: string;
}

export interface Ticket {
    _id: string;
    subject: string;
    status: 'open' | 'answered' | 'closed';
    messages: Message[];
    createdAt: string;
    user?: {
        _id: string;
        name: string;
        email: string;
    };
    mentor?: {
        _id: string;
        name: string;
        businessName: string;
    };
}

const getHeaders = () => {
    const token = Cookies.get('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const handleResponse = async (response: Response, errorMsg: string) => {
    if (!response.ok) {
        if (response.status === 401) {
            const err = new Error('Unauthorized');
            (err as any).status = 401;
            throw err;
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

export const supportService = {
    createTicket: async (subject: string, message: string, attachment?: string, mentorId?: string) => {
        const response = await fetch(`${API_URL}/support`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ subject, message, attachment, mentorId })
        });
        return handleResponse(response, 'Erro ao criar ticket');
    },

    getMyTickets: async (): Promise<Ticket[]> => {
        const response = await fetch(`${API_URL}/support/my`, {
            headers: getHeaders()
        });
        return handleResponse(response, 'Erro ao buscar tickets');
    },

    getAllTickets: async (): Promise<Ticket[]> => {
        const response = await fetch(`${API_URL}/support/all`, {
            headers: getHeaders()
        });
        return handleResponse(response, 'Erro ao buscar tickets');
    },

    addMessage: async (id: string, content: string, attachment?: string) => {
        const response = await fetch(`${API_URL}/support/${id}/message`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ content, attachment })
        });
        return handleResponse(response, 'Erro ao enviar mensagem');
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        const response = await fetch(`${API_URL}/support/unread-count`, {
            headers: getHeaders()
        });
        return handleResponse(response, 'Erro ao buscar notificações');
    },

    markAsRead: async (id: string) => {
        const response = await fetch(`${API_URL}/support/${id}/mark-read`, {
            method: 'PUT',
            headers: getHeaders()
        });
        return handleResponse(response, 'Erro ao marcar como lido');
    }
}
