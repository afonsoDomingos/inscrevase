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
    // Try WebSocket first (single upgrade request), fall back to polling
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 8,          // Stop after 8 tries (~4 minutes with backoff)
    reconnectionDelay: 3000,          // Wait 3s before first retry
    reconnectionDelayMax: 30000,      // Max 30s between retries (exponential backoff)
    randomizationFactor: 0.5,         // Add jitter to spread reconnection load
    timeout: 25000,
    forceNew: false                   // Reuse connection instead of creating new one
};

export const getSocketOptions = () => {
    const token = authService.getToken();
    return {
        ...socketConfig,
        auth: { token }
    };
};
