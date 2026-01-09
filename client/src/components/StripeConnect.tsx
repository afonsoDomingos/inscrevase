'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface StripeStatus {
    onboardingComplete: boolean;
    connected: boolean;
}

export default function StripeConnect() {
    const [status, setStatus] = useState<StripeStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    const checkStatus = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/connect/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            console.error('Error checking Stripe status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const handleConnect = async () => {
        try {
            setConnecting(true);
            const token = Cookies.get('token');
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

            // 1. Garantir que a conta Stripe existe (Create if not exists)
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/connect/create`, {
                method: 'POST',
                headers
            });

            // 2. Pegar o link de onboarding
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/connect/onboarding`, {
                headers
            });

            const result = await response.json();

            if (result.url) {
                window.location.href = result.url;
            } else {
                throw new Error(result.message || 'Falha ao gerar link');
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert('Erro ao conectar com Stripe. Verifique os logs.');
            setConnecting(false);
        }
    };

    if (loading) return null;

    const isConnected = status?.onboardingComplete;

    return (
        <div style={{
            background: isConnected ? '#f0fff4' : '#fffaf0',
            border: `1px solid ${isConnected ? '#c6f6d5' : '#feebc8'}`,
            padding: '1.5rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                    background: isConnected ? '#38a169' : '#ed8936',
                    color: '#fff',
                    padding: '0.8rem',
                    borderRadius: '12px'
                }}>
                    {isConnected ? <CheckCircle size={24} /> : <CreditCard size={24} />}
                </div>
                <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                        {isConnected ? 'Stripe Conectado!' : 'Conecte seu Stripe'}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        {isConnected
                            ? 'Você está pronto para receber pagamentos globais.'
                            : 'Configure sua conta para vender ingressos e assinaturas.'}
                    </p>
                </div>
            </div>

            {!isConnected && (
                <button
                    onClick={handleConnect}
                    disabled={connecting}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                        color: '#000',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}
                >
                    {connecting ? <Loader2 size={18} className="animate-spin" /> : <ExternalLink size={18} />}
                    CONFIGURAR AGORA
                </button>
            )}
        </div>
    );
}
