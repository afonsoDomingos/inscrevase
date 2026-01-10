import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface NotificationModel {
    _id: string;
    recipient: string;
    sender: {
        _id: string;
        name: string;
        profilePhoto?: string;
    };
    title: string;
    content: string;
    type: 'welcome' | 'announcement' | 'personal' | 'alert';
    read: boolean;
    actionUrl?: string;
    createdAt: string;
}

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Cookies.get('token')}`
});

export const notificationService = {
    getMyNotifications: async (): Promise<NotificationModel[]> => {
        const response = await fetch(`${API_URL}/notifications/my`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Erro ao buscar notificações');
        return response.json();
    },
    getUnreadCount: async (): Promise<{ count: number }> => {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Erro ao contagem de não lidas');
        return response.json();
    },
    markAsRead: async (id: string): Promise<NotificationModel> => {
        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Erro ao marcar como lida');
        return response.json();
    },
    sendNotification: async (data: {
        recipientId: string;
        title: string;
        content: string;
        type?: string;
        actionUrl?: string;
    }): Promise<any> => {
        const response = await fetch(`${API_URL}/notifications/send`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao enviar notificação');
        }
        return response.json();
    }
};
