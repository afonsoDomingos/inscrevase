"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.login(email, password);
            toast.success(t('auth.loginSuccess'));
            if (data.user.role === 'SuperAdmin' || data.user.role === 'admin') {
                router.push('/dashboard/admin');
            } else if (data.user.role === 'participant') {
                router.push('/dashboard/participant');
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

    const inputVariants = {
        initial: { scale: 1, boxShadow: "0px 0px 0px rgba(212, 175, 55, 0)" },
        focused: { scale: 1.02, boxShadow: "0px 0px 20px rgba(212, 175, 55, 0.15)" }
    };

    const iconVariants = {
        initial: { x: 0, color: "#888", scale: 1 },
        focused: { x: 5, color: "var(--primary)", scale: 1.2 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -40, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: 40, rotateY: 8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{
                maxWidth: '420px',
                width: '100%',
                margin: '0 auto',
                padding: '1.8rem',
                perspective: '1000px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(16px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                minHeight: '540px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
        >
            {/* Navigation Tabs */}
            <div style={{ display: 'flex', marginBottom: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                    flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--gold-gradient)', color: '#000',
                    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem'
                }}>
                    <LogIn size={14} /> {t('auth.signIn')}
                </div>
                <Link href="/cadastro" style={{
                    flex: 1, padding: '8px', borderRadius: '8px', color: '#888', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s'
                }}>
                    <UserPlus size={14} /> {t('auth.signUp')}
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Image src="/logo.png" alt="Logo" width={36} height={36} style={{ margin: '0 auto 0.6rem' }} />
                </motion.div>
                <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#fff', fontWeight: 700, letterSpacing: '-0.5px' }}>{t('auth.loginTitle')}</h1>
                <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.2rem' }}>Bem-vindo de volta.</p>
            </div>

            {error && (
                <div style={{ background: 'rgba(229, 62, 62, 0.15)', color: '#fc8181', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.8rem', textAlign: 'center', fontSize: '0.75rem', border: '1px solid rgba(229, 62, 62, 0.2)' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="input-group" style={{ marginBottom: '0.8rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.75rem', color: '#ccc' }}>{t('auth.email')}</label>
                    <div style={{ position: 'relative' }}>
                        <motion.div
                            variants={inputVariants}
                            animate={focusedField === 'email' ? 'focused' : 'initial'}
                            style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}
                        >
                            <motion.div
                                variants={iconVariants}
                                animate={focusedField === 'email' ? 'focused' : 'initial'}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ position: 'absolute', left: '0.8rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}
                            >
                                <Mail size={14} />
                            </motion.div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                className="input-luxury"
                                style={{
                                    paddingLeft: '2.5rem',
                                    paddingBlock: '0.6rem',
                                    fontSize: '0.85rem',
                                    background: 'transparent',
                                    border: focusedField === 'email' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    width: '100%',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease'
                                }}
                                required
                                disabled={loading}
                            />
                            {/* Liquid Border Animation */}
                            <AnimatePresence>
                                {focusedField === 'email' && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        exit={{ scaleX: 0 }}
                                        transition={{ duration: 0.4, ease: "circOut" }}
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'var(--gold-gradient)',
                                            transformOrigin: 'left'
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Password Field */}
                <div className="input-group" style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.75rem', color: '#ccc' }}>{t('auth.password')}</label>
                    <div style={{ position: 'relative' }}>
                        <motion.div
                            variants={inputVariants}
                            animate={focusedField === 'password' ? 'focused' : 'initial'}
                            style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}
                        >
                            <motion.div
                                variants={iconVariants}
                                animate={focusedField === 'password' ? 'focused' : 'initial'}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ position: 'absolute', left: '0.8rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}
                            >
                                <Lock size={14} />
                            </motion.div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className="input-luxury"
                                style={{
                                    paddingLeft: '2.5rem',
                                    paddingRight: '2.5rem',
                                    paddingBlock: '0.6rem',
                                    fontSize: '0.85rem',
                                    background: 'transparent',
                                    border: focusedField === 'password' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    width: '100%',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease'
                                }}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.8rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#888',
                                    zIndex: 3
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {/* Liquid Border Animation */}
                            <AnimatePresence>
                                {focusedField === 'password' && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        exit={{ scaleX: 0 }}
                                        transition={{ duration: 0.4, ease: "circOut" }}
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'var(--gold-gradient)',
                                            transformOrigin: 'left'
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01, boxShadow: "0px 10px 30px rgba(255, 215, 0, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        borderRadius: '10px',
                        background: 'var(--gold-gradient)',
                        color: '#000',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>{t('auth.loginButton')} <ArrowRight size={18} /></>}
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ padding: '0 10px', color: '#666', fontSize: '0.75rem' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <motion.button
                        whileHover={{ y: -2, background: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`}
                        style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg> Google
                    </motion.button>
                    <motion.button
                        whileHover={{ y: -2, background: 'rgba(0,119,181,0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`}
                        style={{ flex: 1, padding: '0.6rem', background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}
                    >
                        <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                    </motion.button>
                </div>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
                {t('auth.noAccountYet')} <Link href="/cadastro" style={{ color: '#FFD700', fontWeight: 600, textDecoration: 'none' }}>{t('auth.registerNow')}</Link>
            </p>
        </motion.div>
    );
}
