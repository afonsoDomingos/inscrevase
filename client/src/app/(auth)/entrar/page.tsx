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
            className="luxury-card"
            style={{ maxWidth: '560px', width: '100%', margin: '0 auto', padding: '2rem', perspective: '1000px' }}
        >
            {/* Navigation Tabs */}
            <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#f8f9fa', borderRadius: '12px', padding: '5px' }}>
                <div style={{
                    flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--gold-gradient)', color: '#000',
                    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem'
                }}>
                    <LogIn size={16} /> {t('auth.signIn')}
                </div>
                <Link href="/cadastro" style={{
                    flex: 1, padding: '10px', borderRadius: '10px', color: '#666', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', textDecoration: 'none'
                }}>
                    <UserPlus size={16} /> {t('auth.signUp')}
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Image src="/logo.png" alt="Logo" width={40} height={40} style={{ margin: '0 auto 0.8rem' }} />
                </motion.div>
                <h1 style={{ fontSize: '1.4rem', margin: 0 }}>{t('auth.loginTitle')}</h1>
            </div>

            {error && (
                <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.2rem', textAlign: 'center', fontSize: '0.85rem', border: '1px solid #fed7d7' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="input-group" style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#444' }}>{t('auth.email')}</label>
                    <div style={{ position: 'relative' }}>
                        <motion.div
                            variants={inputVariants}
                            animate={focusedField === 'email' ? 'focused' : 'initial'}
                            style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}
                        >
                            <motion.div
                                variants={iconVariants}
                                animate={focusedField === 'email' ? 'focused' : 'initial'}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
                            >
                                <Mail size={18} />
                            </motion.div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                className="input-luxury"
                                style={{
                                    paddingLeft: '3rem',
                                    paddingBlock: '0.8rem',
                                    fontSize: '1rem',
                                    border: focusedField === 'email' ? '1px solid var(--primary)' : '1px solid #e0e0e0',
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
                                            height: '3px',
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
                <div className="input-group" style={{ marginBottom: '1.8rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#444' }}>{t('auth.password')}</label>
                    <div style={{ position: 'relative' }}>
                        <motion.div
                            variants={inputVariants}
                            animate={focusedField === 'password' ? 'focused' : 'initial'}
                            style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}
                        >
                            <motion.div
                                variants={iconVariants}
                                animate={focusedField === 'password' ? 'focused' : 'initial'}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
                            >
                                <Lock size={18} />
                            </motion.div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className="input-luxury"
                                style={{
                                    paddingLeft: '3rem',
                                    paddingRight: '3rem',
                                    paddingBlock: '0.8rem',
                                    fontSize: '1rem',
                                    border: focusedField === 'password' ? '1px solid var(--primary)' : '1px solid #e0e0e0',
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
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#888',
                                    zIndex: 3
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                                            height: '3px',
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
                    whileHover={{ scale: 1.01, boxShadow: "0px 5px 15px rgba(212, 175, 55, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', borderRadius: '12px' }}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>{t('auth.loginButton')} <ArrowRight size={20} /></>}
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.2rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    <span style={{ padding: '0 15px', color: '#888', fontSize: '0.8rem' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`}
                        style={{ flex: 1, padding: '0.8rem', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={18} height={18} /> Google
                    </motion.button>
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`}
                        style={{ flex: 1, padding: '0.8rem', background: '#0077b5', border: 'none', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,119,181,0.2)' }}
                    >
                        <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={18} height={18} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                    </motion.button>
                </div>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                {t('auth.noAccountYet')} <Link href="/cadastro" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{t('auth.registerNow')}</Link>
            </p>
        </motion.div>
    );
}
