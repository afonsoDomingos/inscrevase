/* eslint-disable */
"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Star, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '@/lib/authService';

// Plan config for display
const PLAN_CONFIG: Record<string, {
    name: string;
    color: string;
    gradient: string;
    icon: React.ReactNode;
    perks: string[];
    emoji: string;
}> = {
    pro: {
        name: 'Pro',
        color: '#FFD700',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        icon: <Zap size={48} />,
        emoji: '⚡',
        perks: [
            'Taxa reduzida de 10% por inscição',
            'Destaque Premium no Showcase',
            'Analytics e Relatórios Avançados',
            'Suporte Prioritário',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        color: '#fff',
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
        icon: <Crown size={48} />,
        emoji: '👑',
        perks: [
            'Taxa 0% — Isenção Total',
            'Personalização White-label',
            'Suporte VIP e Gestor Dedicado',
            'Acesso a todos os recursos premium',
        ],
    },
};

// Confetti particle
function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 6;
    const rotation = Math.random() * 360;
    const shape = Math.random() > 0.5 ? '50%' : '0%';

    return (
        <motion.div
            initial={{ y: -20, x, opacity: 1, rotate: 0 }}
            animate={{
                y: window.innerHeight + 100,
                x: x + (Math.random() - 0.5) * 200,
                opacity: [1, 1, 0],
                rotate: rotation + 720,
            }}
            transition={{
                duration: Math.random() * 3 + 2,
                delay,
                ease: 'linear',
            }}
            style={{
                position: 'fixed',
                top: 0,
                width: size,
                height: size,
                background: color,
                borderRadius: shape,
                zIndex: 99999,
                pointerEvents: 'none',
            }}
        />
    );
}

function SuccessPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'pro';
    const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.pro;

    const [countdown, setCountdown] = useState(8);
    const [isPolling, setIsPolling] = useState(true);
    const [userReady, setUserReady] = useState(false);
    const [confetti, setConfetti] = useState<{ id: number; delay: number; x: number }[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Generate confetti
    useEffect(() => {
        const particles = Array.from({ length: 80 }, (_, i) => ({
            id: i,
            delay: Math.random() * 2,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        }));
        setConfetti(particles);
    }, []);

    // Poll backend until user plan is updated
    useEffect(() => {
        let attempts = 0;
        const poll = async () => {
            attempts++;
            try {
                // Sync subscription
                if (attempts % 3 === 0) {
                    const token = authService.getToken();
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/subscription/sync`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                    }).catch(() => { });
                }

                const profile = await authService.getProfile();
                if (profile.plan !== 'free' && profile.plan !== null) {
                    setUserReady(true);
                    setIsPolling(false);
                    if (pollingRef.current) clearInterval(pollingRef.current);
                }
            } catch (e) {
                console.error('Polling error', e);
            }

            if (attempts >= 20) {
                // Give up polling after 40s
                setUserReady(true);
                setIsPolling(false);
                if (pollingRef.current) clearInterval(pollingRef.current);
            }
        };

        pollingRef.current = setInterval(poll, 2000);
        poll(); // Immediate first call

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // Countdown to dashboard
    useEffect(() => {
        if (!userReady) return;

        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    // Redirect with celebration flag
                    router.push('/dashboard/mentor?celebration=true&plan=' + plan);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [userReady, router, plan]);

    const goNow = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        router.push('/dashboard/mentor?celebration=true&plan=' + plan);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Confetti */}
            {confetti.map(p => (
                <ConfettiParticle key={p.id} delay={p.delay} x={p.x} />
            ))}

            {/* Ambient glow */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at 50% 30%, ${planConfig.color}22 0%, transparent 60%)`,
                pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, type: 'spring', damping: 20 }}
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                {/* Plan Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 12 }}
                    style={{
                        width: '140px',
                        height: '140px',
                        background: planConfig.gradient,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        color: plan === 'enterprise' ? '#FFD700' : '#000',
                        boxShadow: `0 0 80px ${planConfig.color}66`,
                    }}
                >
                    <motion.div
                        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        {planConfig.icon}
                    </motion.div>
                </motion.div>

                {/* Emoji burst */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ fontSize: '2rem', marginBottom: '1rem' }}
                >
                    {planConfig.emoji} {planConfig.emoji} {planConfig.emoji}
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 900,
                        color: '#fff',
                        marginBottom: '0.5rem',
                        lineHeight: 1.2,
                    }}
                >
                    Bem-vindo ao{' '}
                    <span style={{
                        background: planConfig.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Plano {planConfig.name}!
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}
                >
                    A tua assinatura foi activada com sucesso. Agora tens acesso a todos os recursos premium da plataforma.
                </motion.p>

                {/* Perks list */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${planConfig.color}33`,
                        borderRadius: '20px',
                        padding: '1.5rem',
                        marginBottom: '2.5rem',
                        textAlign: 'left',
                    }}
                >
                    <p style={{ color: planConfig.color, fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} /> O que acabaste de desbloquear:
                    </p>
                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                        {planConfig.perks.map((perk, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.1 + i * 0.1 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                            >
                                <CheckCircle size={18} color={planConfig.color} style={{ flexShrink: 0 }} />
                                <span style={{ color: '#ddd', fontSize: '0.95rem' }}>{perk}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Countdown / CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    {isPolling ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: `3px solid ${planConfig.color}`,
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>A verificar a tua assinatura...</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={goNow}
                                style={{
                                    background: planConfig.gradient,
                                    color: plan === 'enterprise' ? '#fff' : '#000',
                                    border: 'none',
                                    padding: '1rem 2.5rem',
                                    borderRadius: '50px',
                                    fontSize: '1rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: `0 20px 40px ${planConfig.color}44`,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                                    (e.currentTarget as HTMLElement).style.boxShadow = `0 25px 50px ${planConfig.color}66`;
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                    (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px ${planConfig.color}44`;
                                }}
                            >
                                Ir para o Dashboard <ArrowRight size={20} />
                            </button>
                            <p style={{ color: '#555', fontSize: '0.85rem' }}>
                                Redirecionamento automático em{' '}
                                <motion.span
                                    key={countdown}
                                    initial={{ scale: 1.5, color: planConfig.color }}
                                    animate={{ scale: 1, color: '#888' }}
                                    style={{ fontWeight: 800, display: 'inline-block' }}
                                >
                                    {countdown}s
                                </motion.span>
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Stars decoration */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: Math.cos(i * 60 * Math.PI / 180) * 200,
                            y: Math.sin(i * 60 * Math.PI / 180) * 200,
                        }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            color: planConfig.color,
                            pointerEvents: 'none',
                        }}
                    >
                        <Star size={16} fill={planConfig.color} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#FFD700', fontSize: '1.5rem' }}>A carregar...</div>
            </div>
        }>
            <SuccessPageInner />
        </Suspense>
    );
}
