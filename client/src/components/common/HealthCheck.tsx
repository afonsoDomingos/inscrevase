"use client";

import { useEffect } from "react";

/**
 * Esse componente garante que o servidor do Render permaneça ativo (não hiberne)
 * ao enviar um pequeno "ping" de 30 em 30 segundos enquanto houver um usuário no site.
 */
export default function HealthCheck() {
    useEffect(() => {
        // Apenas rodar se estivermos no ambiente de produção
        if (typeof window === "undefined") return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        // Tenta detectar se é uma URL do Render ou produção
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

        const ping = async () => {
            try {
                // Usamos o endpoint '/' da API que já retorna "Inscreva-se API is running..."
                await fetch(`${API_URL}/`, { mode: 'no-cors', cache: 'no-store' });

                if (!isLocal) {
                    console.log("Health ping sent to keep server awake.");
                }
            } catch (err) {
                // Ignoramos erros de rede, o importante é a tentativa de conexão chegar ao servidor
            }
        };

        // Ping imediato ao carregar
        ping();

        // Intervalo de 30 segundos (o Render entra em sleep após ~15min de inatividade no plano free)
        const interval = setInterval(ping, 30000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
