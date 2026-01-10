"use client";

import { useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Briefcase, ArrowRight, Loader2, Globe, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/authService';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/context/LanguageContext';

export default function Register() {
    const { t } = useTranslate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        businessName: '',
        country: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.register(formData);
            toast.success(t('auth.registerSuccess'));
            router.push('/dashboard/mentor');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
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
                style={{ maxWidth: '480px', width: '100%', margin: '0 auto', padding: '1.2rem' }}
            >
                {/* Navigation Tabs */}
                <div style={{ display: 'flex', marginBottom: '0.8rem', background: '#f8f9fa', borderRadius: '12px', padding: '4px' }}>
                    <Link href="/entrar" style={{
                        flex: 1, padding: '8px', borderRadius: '10px', color: '#666', fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', textDecoration: 'none'
                    }}>
                        <LogIn size={14} /> {t('auth.signIn')}
                    </Link>
                    <div style={{
                        flex: 1, padding: '8px', borderRadius: '10px', background: 'var(--gold-gradient)', color: '#000',
                        fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem'
                    }}>
                        <UserPlus size={14} /> {t('auth.signUp')}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
                    <Image src="/logo.png" alt="Logo" width={32} height={32} style={{ margin: '0 auto 0.4rem' }} className="float-anim" />
                    <h1 style={{ fontSize: '1.2rem', margin: 0 }}>{t('auth.registerTitle')}</h1>
                </div>

                {error && (
                    <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.8rem', textAlign: 'center', fontSize: '0.8rem', border: '1px solid #fed7d7' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.75rem' }}>{t('auth.fullName')}</label>
                            <div style={{ position: 'relative' }}>
                                <User size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2rem', paddingBlock: '0.5rem', fontSize: '0.85rem' }}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.75rem' }}>{t('auth.businessName')}</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2rem', paddingBlock: '0.5rem', fontSize: '0.85rem' }}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.75rem' }}>{t('auth.country')}</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1 }} />
                                <select
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2rem', paddingBlock: '0.5rem', fontSize: '0.85rem', width: '100%' }}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">País</option>
                                    <option value="Angola">Angola</option>
                                    <option value="Brasil">Brasil</option>
                                    <option value="Moçambique">Moçambique</option>
                                    <option value="Portugal">Portugal</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.75rem' }}>{t('auth.email')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2rem', paddingBlock: '0.5rem', fontSize: '0.85rem' }}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.75rem' }}>{t('auth.password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-luxury"
                                style={{ paddingLeft: '2rem', paddingRight: '2.5rem', paddingBlock: '0.5rem', fontSize: '0.85rem' }}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', padding: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <>{t('auth.createAccount')} <ArrowRight size={14} /></>}
                    </motion.button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '0.6rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                        <span style={{ padding: '0 8px', color: '#888', fontSize: '0.65rem' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                            type="button"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`}
                            style={{ flex: 1, padding: '0.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={12} height={12} /> Google
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`}
                            style={{ flex: 1, padding: '0.5rem', background: '#0077b5', border: 'none', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={12} height={12} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                        </button>
                    </div>
                </form>

                <p style={{ marginTop: '0.6rem', textAlign: 'center', color: '#666', fontSize: '0.75rem' }}>
                    {t('auth.alreadyHaveAccount')} <Link href="/entrar" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{t('auth.loginNow')}</Link>
                </p>
            </motion.div>
        </main>
    );
}
