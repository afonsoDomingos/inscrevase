import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface UserData {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: 'admin' | 'mentor' | 'SuperAdmin';
    businessName?: string;
    bio?: string;
    profilePhoto?: string;
    whatsapp?: string;
    country?: string;
    password?: string;
    socialLinks?: {
        instagram?: string;
        linkedin?: string;
        facebook?: string;
        website?: string;
    };
    status?: 'active' | 'blocked';
    plan?: 'free' | 'pro' | 'enterprise';
    isPublic?: boolean;
    followers?: string[];
    following?: string[];
    badges?: { name: string; color: string }[];
    profileVisits?: number;
    canCreateEvents?: boolean;
    createdAt?: string;
    authProvider?: 'google' | 'linkedin' | 'native';
    isVerified?: boolean;
    verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    businessName: string;
    country?: string;
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
    },

    async updateProfile(data: Partial<UserData>): Promise<UserData> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao atualizar perfil');

        // Update local storage
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...result.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return result.user;
    },

    async getProfile(): Promise<UserData> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();
        if (!response.ok) throw new Error('Falha ao buscar perfil');

        // Update local storage to keep it fresh
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    },

    async requestVerification(): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/auth/verification`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao solicitar verificação');

        // Refresh profile to update UI
        await this.getProfile();
    }
};
