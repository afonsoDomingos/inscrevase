import Cookies from 'js-cookie';
import { UserData } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const userService = {
    async getAllUsers(): Promise<UserData[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar usuários');
        return response.json();
    },

    async updateUser(id: string, data: Partial<UserData>): Promise<UserData> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Falha ao atualizar usuário');
        return response.json();
    },

    async deleteUser(id: string): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao excluir usuário');
    }
};
