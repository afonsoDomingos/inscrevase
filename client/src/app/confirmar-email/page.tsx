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
            background: '#050505',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Mesh Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                    maxWidth: '480px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '32px',
                    padding: '50px 40px',
                    textAlign: 'center',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {status === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Loader2 className="animate-spin" size={48} color="#FFD700" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)' }}
                            />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>
                            {t('auth.verifying')}
                        </h2>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            style={{
                                background: 'var(--gold-gradient)',
                                padding: '24px',
                                borderRadius: '24px',
                                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <CheckCircle size={48} color="#000" />
                        </motion.div>

                        <div>
                            <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', marginBottom: '12px' }}>
                                {t('auth.verifyEmailSuccess')}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                                A sua conta foi ativada com sucesso. Prepare-se para elevar o seu potencial e transformar o conhecimento em resultados reais.
                            </p>
                        </div>

                        <Link href="/login" style={{
                            marginTop: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            width: '100%',
                            padding: '16px 30px',
                            borderRadius: '16px',
                            fontWeight: 800,
                            fontSize: '1rem',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                        }}>
                            {t('auth.loginNow')} <ArrowRight size={20} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            padding: '24px',
                            borderRadius: '24px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            <XCircle size={48} color="#ef4444" />
                        </div>

                        <div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', marginBottom: '12px' }}>
                                {t('auth.verifyEmailError')}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontSize: '1rem' }}>
                                Infelizmente não conseguimos validar o seu e-mail. O link pode ter expirado ou é inválido.
                            </p>
                        </div>

                        <Link href="/login" style={{
                            marginTop: '12px',
                            color: '#FFD700',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            borderBottom: '1px solid #FFD700',
                            paddingBottom: '2px'
                        }}>
                            Tentar novamente
                        </Link>

                        <Link href="/" style={{
                            color: 'rgba(255,255,255,0.4)',
                            textDecoration: 'none',
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
