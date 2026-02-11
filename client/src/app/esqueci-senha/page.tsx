'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/lib/authService';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';

export default function ForgotPasswordPage() {
    const { t } = useTranslate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Por favor, insira seu e-mail');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSubmitted(true);
            toast.success('E-mail enviado com sucesso!');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao processar solicitação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />

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
                    backdropFilter: 'blur(10px)',
                    zIndex: 1,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}
            >
                {!submitted ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'var(--gold-gradient)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px auto',
                                boxShadow: '0 8px 16px rgba(212, 175, 55, 0.2)'
                            }}>
                                <Mail size={32} color="#000" />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>
                                {t('auth.forgotPasswordText') || 'Esqueceu sua senha?'}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px', fontSize: '0.95rem' }}>
                                Não se preocupe! Insira seu e-mail e enviaremos um link para você redefinir sua senha.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {t('auth.email')}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('auth.emailPlaceholder')}
                                        required
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            padding: '14px 14px 14px 45px',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                    <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    background: 'var(--gold-gradient)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        {t('auth.sendRequest') || 'Enviar Link de Recuperação'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '25px' }}>
                            <Link href="/entrar" style={{
                                color: 'rgba(255,255,255,0.6)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                transition: 'color 0.3s'
                            }}>
                                <ChevronLeft size={16} /> Voltar para o Login
                            </Link>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <CheckCircle size={40} color="#22c55e" />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>
                            E-mail Enviado!
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '15px', lineHeight: 1.6 }}>
                            Enviamos um link de redefinição para <strong>{email}</strong>. Por favor, verifique sua caixa de entrada e spam.
                        </p>
                        <Link href="/entrar" style={{
                            marginTop: '30px',
                            display: 'inline-block',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '12px 30px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            transition: 'all 0.3s'
                        }}>
                            Voltar para o Login
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
