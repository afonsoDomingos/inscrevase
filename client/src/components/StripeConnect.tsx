'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

export default function StripeConnect() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/connect/status`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                setStatus(data);
            } catch (error) {
                console.error('Error checking Stripe status:', error);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    const handleConnect = async () => {
        try {
            setConnecting(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/connect/onboarding`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Connection error:', error);
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
                    className="btn-primary"
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: 'var(--gold-gradient)',
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
                    Configurar Agora
                </button>
            )}
        </div>
    );
}
