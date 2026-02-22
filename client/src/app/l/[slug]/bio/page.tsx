'use client';

import React, { useEffect, useState } from 'react';
import { smartLinkService, SmartLinkModel } from '@/lib/smartLinkService';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    Instagram,
    Youtube,
    Linkedin,
    Twitter,
    Send,
    MessageCircle,
    Globe,
    ArrowRight,
    Loader2,
    Facebook,
    Music2,
    Twitch,
    Github,
    ShoppingBag,
    Mail,
    Phone,
    MapPin,
    Link as LinkIcon,
    Share2,
    Zap
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────
// Platform detection → official brand colours + Lucide icons
// ──────────────────────────────────────────────────────────────
interface PlatformMeta {
    icon: React.ReactNode;
    color: string;
    label: string;
}

function detectPlatform(url: string): PlatformMeta {
    const u = url.toLowerCase();
    if (u.includes('instagram.com')) return { icon: <Instagram size={22} />, color: '#E1306C', label: 'Instagram' };
    if (u.includes('youtube.com') || u.includes('youtu.be'))
        return { icon: <Youtube size={22} />, color: '#FF0000', label: 'YouTube' };
    if (u.includes('linkedin.com')) return { icon: <Linkedin size={22} />, color: '#0A66C2', label: 'LinkedIn' };
    if (u.includes('twitter.com') || u.includes('x.com'))
        return { icon: <Twitter size={22} />, color: '#1DA1F2', label: 'Twitter / X' };
    if (u.includes('facebook.com') || u.includes('fb.com'))
        return { icon: <Facebook size={22} />, color: '#1877F2', label: 'Facebook' };
    if (u.includes('tiktok.com')) return { icon: <Music2 size={22} />, color: '#010101', label: 'TikTok' };
    if (u.includes('twitch.tv')) return { icon: <Twitch size={22} />, color: '#9146FF', label: 'Twitch' };
    if (u.includes('github.com')) return { icon: <Github size={22} />, color: '#181717', label: 'GitHub' };
    if (u.includes('wa.me') || u.includes('whatsapp.com'))
        return { icon: <MessageCircle size={22} />, color: '#25D366', label: 'WhatsApp' };
    if (u.includes('t.me') || u.includes('telegram'))
        return { icon: <Send size={22} />, color: '#2CA5E0', label: 'Telegram' };
    if (u.includes('shopee') || u.includes('amazon') || u.includes('mercadolivre') || u.includes('loja'))
        return { icon: <ShoppingBag size={22} />, color: '#FF6B35', label: 'Loja' };
    if (u.startsWith('mailto:')) return { icon: <Mail size={22} />, color: '#EA4335', label: 'E-mail' };
    if (u.startsWith('tel:')) return { icon: <Phone size={22} />, color: '#34A853', label: 'Telefone' };
    if (u.includes('maps.google') || u.includes('goo.gl/maps'))
        return { icon: <MapPin size={22} />, color: '#4285F4', label: 'Localização' };
    return { icon: <LinkIcon size={22} />, color: '#64748b', label: 'Link' };
}

// Social icon map for the header row (bioSettings.socialLinks)
const SOCIAL_ICON_MAP: Record<string, React.ReactNode> = {
    instagram: <Instagram size={22} />,
    youtube: <Youtube size={22} />,
    linkedin: <Linkedin size={22} />,
    twitter: <Twitter size={22} />,
    facebook: <Facebook size={22} />,
    tiktok: <Music2 size={22} />,
    twitch: <Twitch size={22} />,
    github: <Github size={22} />,
    whatsapp: <MessageCircle size={22} />,
    telegram: <Send size={22} />,
};

// ──────────────────────────────────────────────────────────────
export default function SmartBioPage({ params }: { params: { slug: string } }) {
    const [link, setLink] = useState<SmartLinkModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await smartLinkService.getLinkBySlug(params.slug);
                setLink(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [params.slug]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <Loader2 className="animate-spin" color="#FFD700" size={40} />
        </div>
    );

    if (error || !link) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
            <p>Link não encontrado ou inativo.</p>
        </div>
    );

    const theme = link.bioSettings?.theme || 'light';

    // Theme logic refinement
    let background = '#ffffff';
    let textColor = '#0f172a';
    let cardBg = 'rgba(255,255,255,0.8)';
    let cardBorder = '1px solid rgba(0,0,0,0.05)';

    if (theme === 'dark') {
        background = '#0f172a';
        textColor = '#ffffff';
        cardBg = 'rgba(255,255,255,0.05)';
        cardBorder = '1px solid rgba(255,255,255,0.1)';
    } else if (theme === 'orange-white') {
        background = 'linear-gradient(135deg, #ffffff 0%, #fff5e6 50%, #ff8c00 100%)';
        textColor = '#000000';
    } else if (theme === 'sunset') {
        background = 'linear-gradient(135deg, #ff8c00 0%, #f72585 100%)';
        textColor = '#ffffff';
        cardBg = 'rgba(255,255,255,0.15)';
    } else if (theme === 'ocean') {
        background = 'linear-gradient(135deg, #4895ef 0%, #4cc9f0 100%)';
        textColor = '#ffffff';
        cardBg = 'rgba(255,255,255,0.15)';
    } else if (theme === 'royal') {
        background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #FFD700 100%)';
        textColor = '#ffffff';
        cardBg = 'rgba(255,255,255,0.08)';
    } else if (theme === 'black') {
        background = '#000000';
        textColor = '#ffffff';
        cardBg = 'rgba(255,255,255,0.05)';
        cardBorder = '1px solid rgba(255,255,255,0.1)';
    } else if (theme === 'aura-teal') {
        background = 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-candy') {
        background = 'radial-gradient(at 0% 0%, #fbcfe880 0%, transparent 50%), radial-gradient(at 100% 0%, #fef08a60 0%, transparent 50%), radial-gradient(at 50% 100%, #bfdbfe80 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-sunset') {
        background = 'radial-gradient(at 0% 0%, #ffedd5 0%, transparent 50%), radial-gradient(at 100% 100%, #fecdd3 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-nordic') {
        background = 'radial-gradient(at 0% 0%, #e0f2fe 0%, transparent 50%), radial-gradient(at 100% 0%, #f3e8ff 0%, transparent 50%), radial-gradient(at 50% 100%, #fefce8 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-lavender') {
        background = 'radial-gradient(at 0% 0%, #f5f3ff 0%, transparent 50%), radial-gradient(at 100% 100%, #ddd6fe 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-rose') {
        background = 'radial-gradient(at 0% 0%, #fff1f2 0%, transparent 50%), radial-gradient(at 100% 100%, #fecdd3 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-forest') {
        background = 'radial-gradient(at 0% 0%, #f0fdf4 0%, transparent 50%), radial-gradient(at 100% 100%, #dcfce7 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-sky') {
        background = 'radial-gradient(at 0% 0%, #f0f9ff 0%, transparent 50%), radial-gradient(at 100% 100%, #e0f2fe 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-sunset-deep') {
        background = 'radial-gradient(at 0% 0%, #f7258540 0%, transparent 50%), radial-gradient(at 100% 100%, #ff8c0040 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aura-night') {
        background = 'radial-gradient(at 0% 0%, #1e1b4b 0%, transparent 50%), radial-gradient(at 100% 100%, #312e81 0%, transparent 50%), #0f172a';
        textColor = '#ffffff';
        cardBg = 'rgba(255,255,255,0.05)';
        cardBorder = '1px solid rgba(255,255,255,0.1)';
    } else if (theme === 'aura-gold') {
        background = 'radial-gradient(at 0% 0%, #fef3c7 0%, transparent 50%), radial-gradient(at 100% 100%, #fde68a 0%, transparent 50%), #fff';
        textColor = '#000000';
        cardBg = 'rgba(255,255,255,0.4)';
    } else if (theme === 'aurora') {
        background = 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
        textColor = '#ffffff';
        cardBg = 'rgba(255,255,255,0.15)';
    }

    const brandColor = link.brandingColor || '#FFD700';

    return (
        <div style={{
            minHeight: '100vh',
            background: background,
            padding: '4rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>


            {/* Profile Header */}
            <div
                style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '450px', position: 'relative', zIndex: 1 }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-1.5px', color: textColor, lineHeight: 1.1 }}>{link.title}</h1>
                {link.bioSettings?.bioText && (
                    <p style={{ opacity: 0.6, fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 500, color: textColor, maxWidth: '90%', margin: '0 auto' }}>{link.bioSettings.bioText}</p>
                )}
            </div>

            {/* Social Icons Row */}
            {link.bioSettings?.socialLinks && Object.values(link.bioSettings.socialLinks).some(v => v) && (
                <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                    {Object.entries(link.bioSettings.socialLinks).map(([key, url]) => url ? (
                        <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: textColor, opacity: 0.65, display: 'flex' }}
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                        >
                            {SOCIAL_ICON_MAP[key] ?? <Globe size={22} />}
                        </a>
                    ) : null)}
                </div>
            )}

            {/* Main Links */}
            <div style={{ width: '100%', maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1, padding: '0 1rem' }}>
                {link.links?.map((item, idx) => {
                    const platform = detectPlatform(item.url || '');
                    const accentColor = item.color || platform.color;

                    return (
                        <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.2rem 1.6rem',
                                borderRadius: '16px',
                                background: cardBg,
                                border: cardBorder,
                                textDecoration: 'none',
                                color: textColor,
                                fontWeight: 700,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                {/* Platform Icon Badge */}
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: `${accentColor}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: accentColor,
                                    flexShrink: 0
                                }}>
                                    {platform.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>{item.title}</div>
                                    <div style={{ fontSize: '0.72rem', opacity: 0.5, fontWeight: 600, marginTop: '1px' }}>{platform.label}</div>
                                </div>
                            </div>
                            <ArrowRight size={18} style={{ opacity: 0.35, flexShrink: 0 }} />
                        </a>
                    );
                })}

                {/* Strategic Viral Loop CTA */}
                <motion.a
                    href="/register"
                    whileHover={{ scale: 1.02, y: -2 }}
                    style={{
                        marginTop: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '2rem 1.5rem',
                        borderRadius: '24px',
                        background: cardBg,
                        border: cardBorder,
                        textDecoration: 'none',
                        color: textColor,
                        textAlign: 'center',
                        boxShadow: theme === 'light' ? '0 10px 40px -10px rgba(0,0,0,0.1)' : 'none',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: `${brandColor}15`, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: brandColor, marginBottom: '4px'
                    }}>
                        <Zap size={28} fill={brandColor} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Cria o teu SmartLink Grátis</h3>
                        <p style={{ margin: '8px 0 0', opacity: 0.6, fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5, maxWidth: '350px' }}>
                            Centraliza os teus links, redes sociais e conteúdos numa página premium em menos de 1 minuto.
                        </p>
                    </div>
                    <div style={{
                        marginTop: '10px', background: brandColor, color: '#000',
                        padding: '10px 30px', borderRadius: '50px', fontWeight: 800,
                        fontSize: '0.9rem', boxShadow: `0 8px 20px ${brandColor}40`
                    }}>
                        Começar Grátis
                    </div>
                </motion.a>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '6rem', textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                {/* Share Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={async () => {
                        const shareData = { title: link.title, url: window.location.href };
                        try {
                            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                                await navigator.share(shareData);
                            } else {
                                throw new Error('Share not supported');
                            }
                        } catch {
                            // Fallback to clipboard for any error (abort, busy, unsupported)
                            try {
                                await navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copiado para a área de transferência!');
                            } catch (clipErr) {
                                console.error('Clipboard failed', clipErr);
                            }
                        }
                    }}
                    style={{
                        background: textColor === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        border: 'none', padding: '12px 20px', borderRadius: '50px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        color: textColor, fontSize: '0.8rem', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <Share2 size={16} /> Partilhar Perfil
                </motion.button>

                <div
                    style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: textColor, opacity: 0.45 }}
                >
                    Powered by <span style={{ color: brandColor }}>Inscreva-se</span>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif !important; }
            `}</style>
        </div>
    );
}
