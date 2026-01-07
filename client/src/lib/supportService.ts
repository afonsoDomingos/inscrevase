import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Message {
    _id: string;
    sender: 'user' | 'admin';
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
}

const getHeaders = () => {
    const token = Cookies.get('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const supportService = {
    createTicket: async (subject: string, message: string, attachment?: string) => {
        const response = await fetch(`${API_URL}/support`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ subject, message, attachment })
        });
        if (!response.ok) throw new Error('Erro ao criar ticket');
        return response.json();
    },

    getMyTickets: async (): Promise<Ticket[]> => {
        const response = await fetch(`${API_URL}/support/my`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Erro ao buscar tickets');
        return response.json();
    },

    getAllTickets: async (): Promise<Ticket[]> => {
        const response = await fetch(`${API_URL}/support/all`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Erro ao buscar tickets');
        return response.json();
    },

    addMessage: async (id: string, content: string, attachment?: string) => {
        const response = await fetch(`${API_URL}/support/${id}/message`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ content, attachment })
        });
        if (!response.ok) throw new Error('Erro ao enviar mensagem');
        return response.json();
    },

    getUnreadCount: async (): Promise<{ unreadCount: number }> => {
        const response = await fetch(`${API_URL}/support/unread-count`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Erro ao buscar notificações');
        return response.json();
    }
}
