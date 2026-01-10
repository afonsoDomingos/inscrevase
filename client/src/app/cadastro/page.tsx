"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
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
        <main className="bg-auth">
            <Navbar />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="luxury-card"
                style={{ maxWidth: '600px', width: '100%', marginTop: '30px', marginBottom: '30px', padding: '1.5rem' }}
            >
                {/* Navigation Tabs */}
                <div style={{ display: 'flex', marginBottom: '1rem', background: '#f8f9fa', borderRadius: '12px', padding: '5px' }}>
                    <Link
                        href="/entrar"
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
                        <LogIn size={16} /> {t('auth.signIn')}
                    </Link>
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
                        <UserPlus size={16} /> {t('auth.signUp')}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <motion.img
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        src="/logo.png"
                        alt="Logo"
                        style={{ height: '45px', marginBottom: '0.8rem' }}
                        className="float-anim"
                    />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{t('auth.registerTitle')}</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>{t('auth.registerSubtitle')}</p>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
                        <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="input-group"
                        >
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>{t('auth.fullName')}</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                                    placeholder={t('auth.namePlaceholder')}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="input-group"
                        >
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>{t('auth.businessName')}</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                                    placeholder={t('auth.businessPlaceholder')}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </motion.div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem', marginTop: '0.8rem' }}>
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="input-group"
                        >
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>{t('auth.country')}</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1 }} />
                                <select
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2.5rem', fontSize: '0.9rem', width: '100%', cursor: 'pointer' }}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">{t('auth.selectCountry')}</option>
                                    <optgroup label="CPLP (Língua Portuguesa)">
                                        <option value="Angola">Angola</option>
                                        <option value="Brasil">Brasil</option>
                                        <option value="Cabo Verde">Cabo Verde</option>
                                        <option value="Guiné-Bissau">Guiné-Bissau</option>
                                        <option value="Moçambique">Moçambique</option>
                                        <option value="Portugal">Portugal</option>
                                        <option value="São Tomé e Príncipe">São Tomé e Príncipe</option>
                                        <option value="Timor-Leste">Timor-Leste</option>
                                    </optgroup>
                                    <optgroup label="Outros (Língua Inglesa/Mundo)">
                                        <option value="África do Sul">África do Sul</option>
                                        <option value="Alemanha">Alemanha</option>
                                        <option value="Austrália">Austrália</option>
                                        <option value="Canadá">Canadá</option>
                                        <option value="China">China</option>
                                        <option value="Emirados Árabes Unidos">Emirados Árabes Unidos</option>
                                        <option value="Espanha">Espanha</option>
                                        <option value="Estados Unidos">Estados Unidos</option>
                                        <option value="França">França</option>
                                        <option value="Gana">Gana</option>
                                        <option value="Índia">Índia</option>
                                        <option value="Irlanda">Irlanda</option>
                                        <option value="Itália">Itália</option>
                                        <option value="Japão">Japão</option>
                                        <option value="Nigéria">Nigéria</option>
                                        <option value="Nova Zelândia">Nova Zelândia</option>
                                        <option value="Quênia">Quênia</option>
                                        <option value="Reino Unido">Reino Unido</option>
                                        <option value="Suíça">Suíça</option>
                                        <option value="Zâmbia">Zâmbia</option>
                                        <option value="Zimbábue">Zimbábue</option>
                                    </optgroup>
                                </select>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="input-group"
                        >
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>{t('auth.email')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                                    placeholder={t('auth.emailPlaceholder')}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            className="input-group"
                        >
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>{t('auth.password')}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-luxury"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontSize: '0.9rem' }}
                                    placeholder={t('auth.passwordPlaceholder')}
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
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </motion.div>
                    </div>

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
                            <>{t('auth.createAccount')} <ArrowRight size={18} /></>
                        )}
                    </motion.button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                        <span style={{ padding: '0 10px', color: '#888', fontSize: '0.75rem' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

                        <button
                            type="button"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#0077b5',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={20} height={20} style={{ filter: 'brightness(0) invert(1)' }} />
                            {t('auth.continueWithLinkedIn')}
                        </button>
                    </div>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                    {t('auth.alreadyHaveAccount')} <Link href="/entrar" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{t('auth.loginNow')}</Link>
                </p>
            </motion.div>
        </main>
    );
}
