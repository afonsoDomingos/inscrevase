"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Copy,
    Share2,
    Trophy,
    Users,
    Star,
    Gift,
    Loader2,
    Mail,
    Linkedin,
    Facebook
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';
import { referralService, ReferralStats, ReferralHistory } from '@/lib/referralService';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
    const { t } = useTranslate();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [history, setHistory] = useState<ReferralHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadReferralData();
        }
    }, [isOpen]);

    const loadReferralData = async () => {
        setLoading(true);
        try {
            const [statsData, historyData] = await Promise.all([
                referralService.getStats(),
                referralService.getHistory()
            ]);
            setStats(statsData);
            setHistory(historyData);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados de convite");
        } finally {
            setLoading(false);
        }
    };

    const copyInviteLink = () => {
        if (!stats) return;
        const link = `${origin}/entrar?ref=${stats.referralCode}`;
        navigator.clipboard.writeText(link);
        toast.success(t('referral.linkCopied'));
    };

    const shareOnWhatsApp = () => {
        if (!stats) return;
        const link = `${origin}/entrar?ref=${stats.referralCode}`;
        const message = encodeURIComponent(`${t('referral.shareMessage')}${link}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    const shareByEmail = () => {
        if (!stats) return;
        const link = `${origin}/entrar?ref=${stats.referralCode}`;
        const subject = encodeURIComponent(t('referral.emailSubject'));
        const body = encodeURIComponent(`${t('referral.shareMessage')}${link}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const shareOnLinkedIn = () => {
        if (!stats) return;
        const link = encodeURIComponent(`${origin}/entrar?ref=${stats.referralCode}`);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${link}`, '_blank');
    };

    const shareOnFacebook = () => {
        if (!stats) return;
        const link = encodeURIComponent(`${origin}/entrar?ref=${stats.referralCode}`);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, '_blank');
    };

    const getProgress = () => {
        if (!stats) return 0;
        // Next goal example: 50, 100, 250 points
        if (stats.points < 50) return (stats.points / 50) * 100;
        if (stats.points < 150) return ((stats.points - 50) / 100) * 100;
        return 100;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{
                        width: '100%',
                        maxWidth: '750px',
                        background: 'var(--background)',
                        borderRadius: '24px',
                        position: 'relative',
                        zIndex: 1,
                        overflow: 'hidden',
                        border: '1px solid rgba(255,215,0,0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        maxHeight: '95vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header - More Compact */}
                    <div style={{
                        height: '100px',
                        background: '#000',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.4
                            }}
                        >
                            <source src="/INSCREVA-SE NA INSCREVA-SE.mp4" type="video/mp4" />
                        </video>

                        <div style={{ position: 'relative', zIndex: 2, padding: '1rem 1.5rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-playfair)', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                {t('referral.title')}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.2rem 0 0 0', maxWidth: '400px', fontSize: '0.8rem', lineHeight: 1.3, fontWeight: 600 }}>
                                {t('referral.subtitle')}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }} className="no-scrollbar">
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 className="animate-spin" size={32} color="#FFD700" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {/* Top Grid: Invite Link + Quick Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem' }}>
                                    {/* Invite Section */}
                                    <div style={{
                                        background: 'rgba(255,215,0,0.03)',
                                        border: '1px solid rgba(255,215,0,0.15)',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            {t('referral.copyLink')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            <div style={{
                                                flex: 1,
                                                background: '#fff',
                                                color: '#333',
                                                padding: '0.6rem 0.8rem',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                border: '1px solid #eee',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {origin}/entrar?ref={stats?.referralCode}
                                            </div>
                                            <button
                                                onClick={copyInviteLink}
                                                style={{ background: '#111', color: '#FFD700', border: 'none', padding: '0 0.8rem', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                            <button onClick={shareOnWhatsApp} style={{ background: '#25D366', color: '#fff', border: 'none', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="WhatsApp"><Share2 size={16} /></button>
                                            <button onClick={shareByEmail} style={{ background: '#444', color: '#fff', border: 'none', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="E-mail"><Mail size={16} /></button>
                                            <button onClick={shareOnLinkedIn} style={{ background: '#0077b5', color: '#fff', border: 'none', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="LinkedIn"><Linkedin size={16} /></button>
                                            <button onClick={shareOnFacebook} style={{ background: '#1877f2', color: '#fff', border: 'none', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Facebook"><Facebook size={16} /></button>
                                        </div>
                                    </div>

                                    {/* Mini Stats Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                        <div style={{ background: 'var(--paper)', padding: '0.75rem', borderRadius: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ color: '#FFD700' }}><Trophy size={18} /></div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>{stats?.points || 0}</div>
                                                <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 700 }}>PONTOS</div>
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--paper)', padding: '0.75rem', borderRadius: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ color: '#FFD700' }}><Users size={18} /></div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>{stats?.totalInvites || 0}</div>
                                                <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 700 }}>CONVITES</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress & Goals Combined */}
                                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Próximo Objetivo: <span style={{ color: '#666', fontWeight: 600 }}>Plano Pro</span></div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#FFD700' }}>{Math.round(getProgress())}%</div>
                                    </div>
                                    <div style={{ height: '8px', width: '100%', background: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getProgress()}%` }}
                                            style={{ height: '100%', background: 'var(--gold-gradient)', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>
                                        Faltam {stats ? (stats.points < 50 ? 50 - stats.points : (stats.points < 150 ? 150 - stats.points : 0)) : 0} pontos para desbloquear.
                                    </div>
                                </div>

                                {/* Missions & Rewards Side-by-Side (Compact) */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {/* Rewards Mini */}
                                    <div style={{ background: '#111', color: '#fff', borderRadius: '20px', padding: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Gift size={16} color="#FFD700" /> Recompensas
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {[
                                                { points: 50, label: 'Plano Pro' },
                                                { points: 150, label: 'Enterprise' },
                                                { points: 500, label: 'Exclusivo' }
                                            ].map((reward, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: stats && stats.points >= reward.points ? 1 : 0.5 }}>
                                                    <span style={{ fontWeight: 600 }}>{reward.label}</span>
                                                    <span style={{ color: '#FFD700', fontWeight: 800 }}>{reward.points} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Social Mini Missions */}
                                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '20px', padding: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Star size={16} color="#FF6B9D" /> Ganhe Pontos
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                            {[
                                                { name: 'Instagram', url: 'https://instagram.com/inscrevase', color: '#E1306C' },
                                                { name: 'LinkedIn', url: 'https://www.linkedin.com/company/inscreva-se', color: '#0077B5' },
                                                { name: 'YouTube', url: 'https://www.youtube.com/@Inscreva-se-events', color: '#FF0000' },
                                                { name: 'TikTok', url: 'https://www.tiktok.com/@inscreva_se_events', color: '#000' }
                                            ].map((social, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={async () => {
                                                        window.open(social.url, '_blank');
                                                        try {
                                                            await referralService.awardSocialPoints(social.name);
                                                            toast.success(`+5 pontos! 🎯`);
                                                            loadReferralData();
                                                        } catch { }
                                                    }}
                                                    style={{ background: '#f8f9fa', border: '1px solid #eee', color: social.color, padding: '0.4rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    {social.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Compact History */}
                                {history.length > 0 && (
                                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>Atividade Recente</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {history.filter(item => item.referredUser != null).slice(0, 2).map((item) => (
                                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', background: '#f8f9fa', borderRadius: '10px', fontSize: '0.8rem' }}>
                                                    <span style={{ fontWeight: 600 }}>{item.referredUser?.name}</span>
                                                    <span style={{ fontWeight: 800, color: '#16a34a' }}>+{item.pointsEarned} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </AnimatePresence>
    );
}
