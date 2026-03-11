"use client";

import { authService } from '@/lib/authService';

export const getSocketUrl = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const backendOrigin = 'https://inscrevase.onrender.com';

    // Pegar URL configurada
    let url = process.env.NEXT_PUBLIC_Socket_URL || process.env.NEXT_PUBLIC_API_URL || '';

    // Detectar se estamos rodando no domínio de produção (.com)
    // O domínio principal geralmente não aceita WebSockets diretamente sem proxy configurado
    const isMainDomain = typeof window !== 'undefined' &&
        (window.location.hostname.includes('inscreva-se.com') || window.location.hostname.includes('inscrevase.com'));

    if (isProduction || isMainDomain) {
        if (!url || url.includes('inscreva-se.com') || url.includes('inscrevase.com') || url.startsWith('/')) {
            url = backendOrigin;
        }
    }

    if (!url) {
        url = 'http://localhost:5000';
    }

    // Garantir que é um URL absoluto e remover path /api
    const cleanUrl = url.replace(/\/api\/?$/, '');
    if (typeof window !== 'undefined') {
        console.log(`📡 [SocketConfig] Host: ${window.location.hostname} | URL Socket: ${cleanUrl}`);
    }
    return cleanUrl;
};

export const socketConfig = {
    transports: ['polling', 'websocket'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true // Garante uma nova tentativa se a anterior falhou
};

export const getSocketOptions = () => {
    const token = authService.getToken();
    return {
        ...socketConfig,
        auth: { token }
    };
};
