import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authService = {
    async login(email: any, password: any) {
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

        return data;
    },

    async register(userData: any) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao registrar');

        Cookies.set('token', data.token, { expires: 1 });
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    },

    logout() {
        Cookies.remove('token');
        localStorage.removeItem('user');
        window.location.href = '/entrar';
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return Cookies.get('token');
    }
};
