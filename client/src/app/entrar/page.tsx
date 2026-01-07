"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/authService';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/context/LanguageContext';

export default function Login() {
    const { t } = useTranslate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.login(email, password);
            console.log('Login successful:', data);
            toast.success(t('auth.loginSuccess'));

            // Redirect based on role
            if (data.user.role === 'SuperAdmin' || data.user.role === 'admin') {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/mentor');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Credenciais inválidas. Tente novamente.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-auth">
            <Navbar />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="luxury-card"
                style={{ maxWidth: '700px', width: '100%', marginTop: '60px' }}
            >
                {/* Navigation Tabs */}
                <div style={{ display: 'flex', marginBottom: '2rem', background: '#f8f9fa', borderRadius: '12px', padding: '5px' }}>
                    <div
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '10px',
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            cursor: 'default'
                        }}
                    >
                        <LogIn size={16} /> {t('auth.signIn')}
                    </div>
                    <Link
                        href="/cadastro"
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '10px',
                            background: 'transparent',
                            color: '#666',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <UserPlus size={16} /> {t('auth.signUp')}
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <motion.img
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        src="/logo.png"
                        alt="Logo"
                        style={{ height: '60px', marginBottom: '1rem' }}
                        className="float-anim"
                    />
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('auth.loginTitle')}</h1>
                    <p style={{ color: '#666' }}>{t('auth.loginSubtitle')}</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#fff5f5', color: '#e53e3e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #fed7d7' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="input-group"
                    >
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>{t('auth.email')}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('auth.emailPlaceholder')}
                                className="input-luxury"
                                style={{ paddingLeft: '3rem' }}
                                required
                                disabled={loading}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="input-group"
                    >
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>{t('auth.password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('auth.passwordPlaceholder')}
                                className="input-luxury"
                                style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#888',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', padding: '1.2rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>{t('auth.loginButton')} <ArrowRight size={18} /></>
                        )}
                    </motion.button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                        <span style={{ padding: '0 10px', color: '#888', fontSize: '0.8rem' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            color: '#333',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
                        {t('auth.continueWithGoogle')}
                    </button>
                </form>

                <p style={{ marginTop: '2.5rem', textAlign: 'center', color: '#666', fontSize: '0.95rem' }}>
                    {t('auth.noAccountYet')} <Link href="/cadastro" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{t('auth.registerNow')}</Link>
                </p>
            </motion.div>
        </main>
    );
}
