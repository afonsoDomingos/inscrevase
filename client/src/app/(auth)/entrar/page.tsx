"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Key, ArrowRight, Loader2, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { authService } from '@/lib/authService';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslate } from '@/context/LanguageContext';
import { Suspense } from 'react';

const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012",
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    "https://images.unsplash.com/photo-1511578334221-d3033bc853b1?q=80&w=2070",
    "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070",
    "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=2070"
];

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const { t } = useTranslate();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [shuffledImages, setShuffledImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Simple shuffle to "mix" images
        const shuffled = [...BACKGROUND_IMAGES].sort(() => Math.random() - 0.5);
        setShuffledImages(shuffled);
    }, []);

    useEffect(() => {
        if (shuffledImages.length === 0) return;
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [shuffledImages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.login(email, password);
            toast.success(t('auth.loginSuccess'));

            // Smart Redirect
            const redirectTo = searchParams.get('redirect');
            if (redirectTo) {
                router.push(redirectTo);
                return;
            }

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

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            background: '#0a0a0a',
            position: 'relative',
            overflow: 'hidden' // Prevent any unwanted scroll
        }}>
            {/* Left Side: Visual/Image Slideshow */}
            <div className="login-visual-side" style={{
                flex: 1.2,
                position: 'relative',
                display: 'block', // Controlled by CSS below for responsiveness
                overflow: 'hidden'
            }}>
                <AnimatePresence mode="wait">
                    {shuffledImages.length > 0 && (
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            style={{ position: 'absolute', inset: 0 }}
                        >
                            <Image
                                src={shuffledImages[currentImageIndex]}
                                alt="Event background"
                                fill
                                style={{ objectFit: 'cover', filter: 'brightness(0.5)' }}
                                priority
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '4rem',
                    color: '#fff',
                    zIndex: 2
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff 0%, #D4AF37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Nova Era dos Eventos
                        </h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '500px', lineHeight: 1.6 }}>
                            Acesse sua conta e gerencie suas jornadas, conexões e experiências premium em um só lugar.
                        </p>
                    </motion.div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>10k+</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase' }}>Eventos Criados</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>500k+</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase' }}>Participantes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="login-form-side" style={{
                flex: 1,
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem 1.5rem',
                position: 'relative',
                width: '100%'
            }}>


                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="login-form-container"
                    style={{ 
                        width: '100%', 
                        maxWidth: '520px', 
                        padding: '3.5rem 3rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        marginTop: '1.5rem' 
                    }}
                >
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ flex: 1, padding: '6px', borderRadius: '7px', background: 'var(--gold-gradient)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                <LogIn size={13} /> {t('auth.signIn')}
                            </div>
                            <Link
                                href={`/cadastro${searchParams.toString() ? '?' + searchParams.toString() : ''}`}
                                style={{ flex: 1, padding: '6px', borderRadius: '7px', color: '#888', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', textDecoration: 'none' }}
                            >
                                <UserPlus size={13} /> {t('auth.signUp')}
                            </Link>
                        </div>

                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.4rem', color: '#fff', letterSpacing: '-1px', fontFamily: 'var(--font-playfair)' }}>
                            {t('auth.loginTitle')}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
                            {t('auth.loginSubtitle') || 'Entre para continuar sua jornada premium.'}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#fc8181', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(229, 62, 62, 0.2)' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {t('auth.email')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#D4AF37' : '#444', transition: '0.3s' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="seu@email.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 0.8rem 0.8rem 2.5rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: focusedField === 'email' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                <label style={{ fontWeight: 600, fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {t('auth.password')}
                                </label>
                                <Link href="/esqueci-senha" style={{ color: '#D4AF37', fontSize: '0.7rem', textDecoration: 'none' }}>
                                    {t('auth.forgotPassword') || 'Esqueceu?'}
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Key size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#D4AF37' : '#444', transition: '0.3s' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 2.5rem 0.8rem 2.5rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: focusedField === 'password' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#444' }}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                                color: '#000',
                                fontWeight: 800,
                                borderRadius: '14px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.05rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 10px 25px rgba(212, 175, 55, 0.2)',
                                transition: 'all 0.3s ease',
                                marginTop: '1rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <>{t('auth.loginButton')} <ArrowRight size={20} /></>}
                        </motion.button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <span style={{ fontSize: '0.8rem', color: '#444', fontWeight: 600 }}>OU</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    const ref = searchParams.get('ref') || searchParams.get('referral');
                                    const refParam = ref ? `?referralCode=${ref}` : '';
                                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google${refParam}`;
                                }}
                                style={{ 
                                    flex: 1, 
                                    padding: '1rem', 
                                    background: '#fff', 
                                    border: 'none', 
                                    borderRadius: '14px', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '12px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: 700,
                                    color: '#000',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg> Google
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const ref = searchParams.get('ref') || searchParams.get('referral');
                                    const refParam = ref ? `?referralCode=${ref}` : '';
                                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin${refParam}`;
                                }}
                                style={{ 
                                    flex: 1, 
                                    padding: '1rem', 
                                    background: '#0077b5', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '14px', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '12px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: 700,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={20} height={20} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                            </button>
                        </div>
                    </form>

                </motion.div>

                {/* Footer Brand */}
                <div style={{ position: 'absolute', bottom: '1rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Inscreva-se &copy; 2026
                </div>
            </div>

            <style>{`
                @media (max-width: 1023px) {
                    .login-visual-side {
                        display: none !important;
                    }
                    .login-form-side {
                        padding: 1rem 0 !important;
                    }
                    .login-form-container {
                        max-width: 100% !important;
                        margin-top: 0.5rem !important;
                        padding: 1.5rem 0.5rem !important;
                        border-radius: 0 !important;
                        border: none !important;
                        background: transparent !important;
                    }
                }
                @media (max-height: 700px) {
                    .login-form-container h1 { font-size: 1.2rem !important; }
                    .login-form-container p { display: none; }
                    .input-group { gap: 0.4rem !important; }
                }
                input::placeholder {
                    color: #444;
                }
            `}</style>
        </div>
    );
}
