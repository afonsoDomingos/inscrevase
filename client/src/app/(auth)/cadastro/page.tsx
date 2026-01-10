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
        <motion.div
            initial={{ opacity: 0, x: 40, rotateY: 8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -40, rotateY: -8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="luxury-card"
            style={{ maxWidth: '560px', width: '100%', margin: '0 auto', padding: '1.8rem', perspective: '1000px' }}
        >
            {/* Navigation Tabs */}
            <div style={{ display: 'flex', marginBottom: '1.2rem', background: '#f8f9fa', borderRadius: '12px', padding: '5px' }}>
                <Link href="/entrar" style={{
                    flex: 1, padding: '10px', borderRadius: '10px', color: '#666', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', textDecoration: 'none'
                }}>
                    <LogIn size={16} /> {t('auth.signIn')}
                </Link>
                <div style={{
                    flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--gold-gradient)', color: '#000',
                    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem'
                }}>
                    <UserPlus size={16} /> {t('auth.signUp')}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Image src="/logo.png" alt="Logo" width={40} height={40} style={{ margin: '0 auto 0.8rem' }} />
                </motion.div>
                <h1 style={{ fontSize: '1.4rem', margin: 0 }}>{t('auth.registerTitle')}</h1>
            </div>

            {error && (
                <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.2rem', textAlign: 'center', fontSize: '0.85rem', border: '1px solid #fed7d7' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}>{t('auth.fullName')}</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-luxury"
                                style={{ paddingLeft: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem' }}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}>{t('auth.businessName')}</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                className="input-luxury"
                                style={{ paddingLeft: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem' }}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}>{t('auth.country')}</label>
                        <div style={{ position: 'relative' }}>
                            <Globe size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1 }} />
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="input-luxury"
                                style={{ paddingLeft: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem', width: '100%', appearance: 'none' }}
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
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem' }}>{t('auth.email')}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-luxury"
                                style={{ paddingLeft: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem' }}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>{t('auth.password')}</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input-luxury"
                            style={{ paddingLeft: '2.5rem', paddingRight: '2.8rem', paddingBlock: '0.7rem', fontSize: '0.95rem' }}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>{t('auth.createAccount')} <ArrowRight size={18} /></>}
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '0.8rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    <span style={{ padding: '0 12px', color: '#888', fontSize: '0.7rem' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`}
                        style={{ flex: 1, padding: '0.6rem', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={14} height={14} /> Google
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`}
                        style={{ flex: 1, padding: '0.6rem', background: '#0077b5', border: 'none', borderRadius: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                        <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                    </button>
                </div>
            </form>

            <p style={{ marginTop: '1rem', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
                {t('auth.alreadyHaveAccount')} <Link href="/entrar" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{t('auth.loginNow')}</Link>
            </p>
        </motion.div>
    );
}
