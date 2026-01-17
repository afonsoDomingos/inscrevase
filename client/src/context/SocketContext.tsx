"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '@/lib/authService';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({ socket: null, onlineUsers: [] });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // Função robusta para buscar usuários online via HTTP (Fallback/Inicialização)
    const fetchOnlineUsersHTTP = React.useCallback(async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; // Garante /api aqui para o fetch
            // Tratar url para garantir que termine com /api se não tiver (caso a env seja só a base)
            const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

            const response = await fetch(`${baseUrl}/users/status/online`);
            if (response.ok) {
                const users = await response.json();
                console.log('📡 [SocketContext] Sincronização HTTP de usuários online:', users.length);
                setOnlineUsers(prev => {
                    // Fundir com a lista atual para evitar "piscar" na tela
                    const newSet = new Set([...prev, ...users]);
                    return Array.from(newSet);
                });
            }
        } catch (error) {
            console.error('📡 [SocketContext] Erro ao buscar usuários online via HTTP:', error);
        }
    }, []);

    // 1. Efeito de Autenticação e Polling HTTP (Garantia de funcionamento mesmo sem socket)
    useEffect(() => {
        const checkAuth = () => {
            const user = authService.getCurrentUser();
            const currentId = user ? (user.id || user._id || null) : null;
            if (currentId !== userId) {
                setUserId(currentId);
            }
        };

        checkAuth();
        fetchOnlineUsersHTTP(); // Busca imediata ao carregar

        const authInterval = setInterval(checkAuth, 1000);
        const pollingInterval = setInterval(fetchOnlineUsersHTTP, 30000); // Polling a cada 30s como backup

        window.addEventListener('storage', checkAuth);

        return () => {
            clearInterval(authInterval);
            clearInterval(pollingInterval);
            window.removeEventListener('storage', checkAuth);
        };
    }, [userId, fetchOnlineUsersHTTP]);

    // 2. Efeito do Socket (Tempo Real)
    useEffect(() => {
        const token = authService.getToken();

        if (!userId || !token) {
            if (socket) {
                console.log('🔌 [SocketContext] Desconectando (Logout ou Sem Token)...');
                socket.disconnect();
                setSocket(null);
                setOnlineUsers([]);
            }
            return;
        }

        if (socket && socket.connected) return;

        // URL Base limpa (sem /api) para o Socket.IO
        const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const socketUrl = envUrl.replace(/\/api\/?$/, '');

        console.log(`🔌 [SocketContext] Iniciando conexão Socket em: ${socketUrl}`);

        const socketInstance = io(socketUrl, {
            auth: { token }, // Autenticação JWT
            transports: ['websocket', 'polling'], // Tenta WebSocket, cai para polling se falhar (mais compatível)
            reconnection: true,
            reconnectionAttempts: 20,
            reconnectionDelay: 2000,
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('✅ [SocketContext] CONECTADO AO SERVIDOR! ID:', socketInstance.id);
            // Ao conectar, pede a lista atualizada
            fetchOnlineUsersHTTP();
        });

        socketInstance.on('connect_error', (err) => {
            console.error('❌ [SocketContext] FALHA DE CONEXÃO:', err.message);
            // Se falhar o socket, o polling HTTP (no outro useEffect) segura as pontas
        });

        socketInstance.on('online_users_list', (users: string[]) => {
            console.log('⚡ [SocketContext] Evento recebido: Lista Completa', users);
            setOnlineUsers(users);
        });

        socketInstance.on('user_status_change', ({ userId: changedId, status }: { userId: string, status: string }) => {
            console.log(`⚡ [SocketContext] Status mudou: User ${changedId} -> ${status}`);
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (status === 'online') {
                    newSet.add(changedId);
                } else {
                    newSet.delete(changedId);
                }
                return Array.from(newSet);
            });
        });

        return () => {
            console.log('🔌 [SocketContext] Limpando conexão...');
            socketInstance.disconnect();
        };
    }, [userId, fetchOnlineUsersHTTP]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
