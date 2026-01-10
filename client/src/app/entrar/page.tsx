"use client";

import { useState } from 'react';

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
        <main className="bg-auth" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{ position: 'absolute', top: '15px', left: '15px' }}>
                <Link href="/" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Voltar
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="luxury-card"
                style={{ maxWidth: '400px', width: '100%', margin: '0 auto', padding: '1.2rem' }}
            >
                {/* Navigation Tabs */}
                <div style={{ display: 'flex', marginBottom: '1rem', background: '#f8f9fa', borderRadius: '12px', padding: '4px' }}>
                    <div style={{
                        flex: 1, padding: '8px', borderRadius: '10px', background: 'var(--gold-gradient)', color: '#000',
                        fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem'
                    }}>
                        <LogIn size={14} /> {t('auth.signIn')}
                    </div>
                    <Link href="/cadastro" style={{
                        flex: 1, padding: '8px', borderRadius: '10px', color: '#666', fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', textDecoration: 'none'
                    }}>
                        <UserPlus size={14} /> {t('auth.signUp')}
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
                    <Image src="/logo.png" alt="Logo" width={32} height={32} style={{ margin: '0 auto 0.5rem' }} className="float-anim" />
                    <h1 style={{ fontSize: '1.2rem', margin: 0 }}>{t('auth.loginTitle')}</h1>
                </div>

                {error && (
                    <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '0.6rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.8rem', border: '1px solid #fed7d7' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem' }}>{t('auth.email')}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-luxury"
                                style={{ paddingLeft: '2.2rem', paddingBlock: '0.6rem', fontSize: '0.9rem' }}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem' }}>{t('auth.password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-luxury"
                                style={{ paddingLeft: '2.2rem', paddingRight: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem' }}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>{t('auth.loginButton')} <ArrowRight size={16} /></>}
                    </motion.button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '0.8rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                        <span style={{ padding: '0 10px', color: '#888', fontSize: '0.7rem' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button
                            type="button"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`}
                            style={{ flex: 1, padding: '0.6rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={14} height={14} /> Google
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`}
                            style={{ flex: 1, padding: '0.6rem', background: '#0077b5', border: 'none', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                        </button>
                    </div>
                </form>

                <p style={{ marginTop: '1rem', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
                    {t('auth.noAccountYet')} <Link href="/cadastro" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{t('auth.registerNow')}</Link>
                </p>
            </motion.div>
        </main>
    );
}
