import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface UserData {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: 'admin' | 'mentor' | 'SuperAdmin';
    businessName?: string;
    status?: 'active' | 'blocked';
    plan?: 'free' | 'premium';
    createdAt?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    businessName: string;
}

export interface AuthResponse {
    token: string;
    user: UserData;
}

export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao entrar');

        // Store token in cookie (expires in 1 day)
        Cookies.set('token', data.token, { expires: 1 });
        localStorage.setItem('user', JSON.stringify(data.user));

        return data as AuthResponse;
    },

    async register(userData: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao registrar');

        Cookies.set('token', data.token, { expires: 1 });
        localStorage.setItem('user', JSON.stringify(data.user));

        return data as AuthResponse;
    },

    logout() {
        Cookies.remove('token');
        localStorage.removeItem('user');
        window.location.href = '/entrar';
    },

    getCurrentUser(): UserData | null {
        try {
            const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },

    getToken() {
        return Cookies.get('token');
    }
};
