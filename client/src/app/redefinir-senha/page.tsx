'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, XCircle } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/lib/authService';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';

function ResetPasswordContent() {
    const { t } = useTranslate();
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Token de recuperação ausente ou inválido.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            toast.success('Senha redefinida com sucesso!');
            setTimeout(() => {
                router.push('/entrar');
            }, 3000);
        } catch (error: any) {
            setError(error.message || 'Erro ao redefinir senha');
            toast.error(error.message || 'Erro ao redefinir senha');
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
                {success ? (
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
                            Senha Redefinida!
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '15px', lineHeight: 1.6 }}>
                            Sua senha foi atualizada com sucesso. Você será redirecionado para a página de login em instantes...
                        </p>
                        <Link href="/entrar" style={{
                            marginTop: '30px',
                            display: 'inline-block',
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            textDecoration: 'none',
                            padding: '12px 30px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            transition: 'all 0.3s'
                        }}>
                            Login Agora
                        </Link>
                    </motion.div>
                ) : error ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <XCircle size={40} color="#ef4444" />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>Algo deu errado</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '15px', lineHeight: 1.6 }}>
                            {error}
                        </p>
                        <Link href="/esqueci-senha" style={{
                            marginTop: '25px',
                            display: 'inline-block',
                            color: '#D4AF37',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}>
                            Solicitar novo link
                        </Link>
                    </div>
                ) : (
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
                                margin: '0 auto 20px auto'
                            }}>
                                <Lock size={32} color="#000" />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>
                                Definir Nova Senha
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px', fontSize: '0.95rem' }}>
                                Escolha uma senha forte para proteger sua conta.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Nova Senha
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 6 caracteres"
                                        required
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            padding: '14px 45px 14px 45px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Confirmar Nova Senha
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a senha"
                                        required
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            padding: '14px 45px 14px 45px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
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
                                    gap: '10px'
                                }}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Atualizar Senha
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
