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
    Facebook,
    Instagram,
    Youtube
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
                        maxWidth: '700px',
                        background: 'var(--background)',
                        borderRadius: '24px',
                        position: 'relative',
                        zIndex: 1,
                        overflow: 'hidden',
                        border: '1px solid rgba(255,215,0,0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Header with Background Video */}
                    <div style={{
                        height: '180px',
                        background: '#000',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        overflow: 'hidden'
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
                                opacity: 0.5
                            }}
                        >
                            <source src="/INSCREVA-SE NA INSCREVA-SE.mp4" type="video/mp4" />
                        </video>

                        <div style={{ position: 'relative', zIndex: 2, padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-playfair)', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                {t('referral.title')}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0.5rem 0 0 0', maxWidth: '450px', fontSize: '0.9rem', lineHeight: 1.4, fontWeight: 600 }}>
                                {t('referral.subtitle')}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }} className="no-scrollbar">
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                                <Loader2 className="animate-spin" size={32} color="#FFD700" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* Invite Section */}
                                <div style={{
                                    background: 'rgba(255,215,0,0.05)',
                                    border: '1px dashed #FFD700',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '1rem' }}>
                                        {t('referral.copyLink')}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <div style={{
                                            flex: 1,
                                            background: '#fff',
                                            color: '#333',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            textAlign: 'left',
                                            border: '1px solid #ddd',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {origin}/entrar?ref={stats?.referralCode}
                                        </div>
                                        <button
                                            onClick={copyInviteLink}
                                            style={{
                                                background: '#111',
                                                color: '#FFD700',
                                                border: 'none',
                                                width: '50px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Copy size={20} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                                        <button
                                            onClick={shareOnWhatsApp}
                                            style={{
                                                background: '#25D366',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <Share2 size={16} /> WhatsApp
                                        </button>
                                        <button
                                            onClick={shareByEmail}
                                            style={{
                                                background: '#444',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <Mail size={16} /> E-mail
                                        </button>
                                        <button
                                            onClick={shareOnLinkedIn}
                                            style={{
                                                background: '#0077b5',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <Linkedin size={16} /> LinkedIn
                                        </button>
                                        <button
                                            onClick={shareOnFacebook}
                                            style={{
                                                background: '#1877f2',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <Facebook size={16} /> Facebook
                                        </button>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div style={{ background: 'var(--paper)', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ color: '#FFD700', marginBottom: '0.5rem' }}><Trophy size={20} /></div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats?.points || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 700 }}>{t('referral.points')}</div>
                                    </div>
                                    <div style={{ background: 'var(--paper)', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ color: '#FFD700', marginBottom: '0.5rem' }}><Users size={20} /></div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats?.totalInvites || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 700 }}>{t('referral.totalInvites')}</div>
                                    </div>
                                    <div style={{ background: 'var(--paper)', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ color: '#FFD700', marginBottom: '0.5rem' }}><Star size={20} /></div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats?.convertedCount || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 700 }}>{t('referral.converted')}</div>
                                    </div>
                                </div>

                                {/* Goals & Progress */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{t('referral.nextGoal')}</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#666', margin: '2px 0 0 0' }}>Faltam {stats ? (stats.points < 50 ? 50 - stats.points : (stats.points < 150 ? 150 - stats.points : 0)) : 0} pontos para o Plano Pro</p>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#FFD700' }}>{Math.round(getProgress())}%</div>
                                    </div>
                                    <div style={{ height: '10px', width: '100%', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getProgress()}%` }}
                                            style={{ height: '100%', background: 'var(--gold-gradient)', borderRadius: '5px' }}
                                        />
                                    </div>
                                </div>

                                {/* Rewards List */}
                                <div style={{ background: '#111', color: '#fff', borderRadius: '20px', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Gift size={20} color="#FFD700" /> {t('referral.rewards')}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {[
                                            { points: 50, label: t('referral.benefits.pro'), icon: <Gift size={16} /> },
                                            { points: 150, label: t('referral.benefits.enterprise'), icon: <Trophy size={16} /> },
                                            { points: 500, label: t('referral.benefits.exclusive'), icon: <Star size={16} /> }
                                        ].map((reward, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.75rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '12px',
                                                opacity: stats && stats.points >= reward.points ? 1 : 0.6
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ color: stats && stats.points >= reward.points ? '#FFD700' : '#888' }}>{reward.icon}</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{reward.label}</div>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFD700' }}>{reward.points} {t('referral.points')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Social Missions Section */}
                                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '24px', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{t('referral.socialMissions')}</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0 0 0' }}>{t('referral.socialMissionsDesc')}</p>
                                        </div>
                                        <div style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800 }}>
                                            BÔNUS
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {[
                                            { name: 'Instagram', icon: <div style={{ color: '#E1306C' }}><Instagram size={20} /></div>, url: 'https://instagram.com/inscrevase' },
                                            { name: 'LinkedIn', icon: <div style={{ color: '#0077B5' }}><Linkedin size={20} /></div>, url: 'https://www.linkedin.com/company/inscreva-se' },
                                            { name: 'YouTube', icon: <div style={{ color: '#FF0000' }}><Youtube size={20} /></div>, url: 'https://www.youtube.com/@Inscreva-se-events' },
                                            {
                                                name: 'TikTok',
                                                icon: (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                                    </svg>
                                                ),
                                                url: 'https://www.tiktok.com/@inscreva_se_events'
                                            }
                                        ].map((social, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '1rem',
                                                background: '#f8f9fa',
                                                borderRadius: '16px',
                                                border: '1px solid #f0f0f0'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {social.icon}
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{social.name}</span>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        window.open(social.url, '_blank');
                                                        try {
                                                            await referralService.awardSocialPoints(social.name);
                                                            toast.success(`+5 pontos por seguir no ${social.name}! 🎯`);
                                                            // Reload stats to reflect new points
                                                            loadReferralData();
                                                        } catch (err: unknown) {
                                                            // Fail silently or show specific message if already completed
                                                            const error = err as { message?: string };
                                                            if (error.message && error.message.includes('Missão já concluída')) {
                                                                // mission already claimed, no need for toast
                                                            } else {
                                                                console.error(err);
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        background: '#111',
                                                        color: '#FFD700',
                                                        border: 'none',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {t('referral.followTask')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Motivation Quote */}
                                <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#666', fontSize: '0.85rem', padding: '1rem 2rem' }}>
                                    &quot;{t('referral.motivation.education')}&quot;
                                </div>

                                {/* History */}
                                {history.length > 0 && (
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Histórico Recente</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {history.filter(item => item.referredUser != null).map((item) => (
                                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.referredUser?.name ?? 'Utilizador removido'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                    <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9rem' }}>
                                                        +{item.pointsEarned} pts
                                                    </div>
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
