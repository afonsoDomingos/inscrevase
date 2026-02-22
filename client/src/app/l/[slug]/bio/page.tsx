'use client';

import React, { useEffect, useState } from 'react';
import { smartLinkService, SmartLinkModel } from '@/lib/smartLinkService';
import { motion } from 'framer-motion';
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
    Link as LinkIcon
} from 'lucide-react';
import Image from 'next/image';

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
    const bgColor = theme === 'dark' ? '#0f172a' : theme === 'light' ? '#ffffff' : '#000';
    const textColor = theme === 'light' ? '#0f172a' : '#fff';
    const brandColor = link.brandingColor || '#FFD700';

    return (
        <div style={{
            minHeight: '100vh',
            background: bgColor,
            padding: '4rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Dynamic Background Glow */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: theme === 'dark'
                    ? `radial-gradient(circle at 20% 20%, ${brandColor}15 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${brandColor}10 0%, transparent 40%)`
                    : `radial-gradient(circle at 20% 20%, ${brandColor}08 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${brandColor}06 0%, transparent 40%)`,
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '450px', position: 'relative', zIndex: 1 }}
            >
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-1px', color: textColor }}>{link.title}</h1>
                {link.bioSettings?.bioText && (
                    <p style={{ opacity: 0.75, fontSize: '1rem', lineHeight: 1.6, fontWeight: 500, color: textColor }}>{link.bioSettings.bioText}</p>
                )}
            </motion.div>

            {/* Social Icons Row */}
            {link.bioSettings?.socialLinks && Object.values(link.bioSettings.socialLinks).some(v => v) && (
                <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                    {Object.entries(link.bioSettings.socialLinks).map(([key, url]) => url ? (
                        <motion.a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.25, y: -3 }}
                            style={{ color: textColor, opacity: 0.65, transition: 'color 0.2s, opacity 0.2s', display: 'flex' }}
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                        >
                            {SOCIAL_ICON_MAP[key] ?? <Globe size={22} />}
                        </motion.a>
                    ) : null)}
                </div>
            )}

            {/* Main Links */}
            <div style={{ width: '100%', maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1, padding: '0 1rem' }}>
                {link.links?.map((item, idx) => {
                    const platform = detectPlatform(item.url || '');
                    const accentColor = item.color || platform.color;

                    return (
                        <motion.a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            whileHover={{ scale: 1.025, borderColor: accentColor }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.1rem 1.6rem',
                                borderRadius: '20px',
                                background: theme === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.04)',
                                border: theme === 'light' ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(12px)',
                                textDecoration: 'none',
                                color: textColor,
                                fontWeight: 700,
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: theme === 'light' ? '0 6px 24px rgba(0,0,0,0.05)' : '0 6px 30px rgba(0,0,0,0.2)'
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
                        </motion.a>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '6rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 0.45 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: textColor }}
                >
                    Powered by <span style={{ color: brandColor, textShadow: `0 0 10px ${brandColor}60` }}>Inscreva-se</span>
                </motion.div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif !important; }
            `}</style>
        </div>
    );
}
