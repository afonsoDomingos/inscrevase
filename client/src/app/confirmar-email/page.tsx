'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';

function ConfirmEmailContent() {
    const { t } = useTranslate();
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                if (response.ok) {
                    setStatus('success');
                    // Optional: update local user state if needed
                } else {
                    setStatus('error');
                }
            } catch {
                setStatus('error');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    maxWidth: '450px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '40px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {status === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <Loader2 className="animate-spin" size={48} color="#D4AF37" />
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{t('auth.verifying')}</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '20px', borderRadius: '50%' }}>
                            <CheckCircle size={64} color="#22c55e" />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>{t('auth.verifyEmailSuccess')}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                            A sua conta foi ativada. Agora pode criar eventos e gerir os seus participantes com total liberdade.
                        </p>
                        <Link href="/login" style={{
                            marginTop: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            padding: '12px 30px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            textDecoration: 'none'
                        }}>
                            {t('auth.loginNow')} <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '50%' }}>
                            <XCircle size={64} color="#ef4444" />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{t('auth.verifyEmailError')}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                            O link pode ter expirado ou o token é inválido. Tente solicitar um novo link através do seu painel.
                        </p>
                        <Link href="/login" style={{
                            marginTop: '20px',
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'underline',
                            fontSize: '0.9rem'
                        }}>
                            {t('common.backToHome')}
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function ConfirmEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConfirmEmailContent />
        </Suspense>
    );
}
