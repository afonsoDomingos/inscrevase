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
    Loader2
} from 'lucide-react';
import Image from 'next/image';

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

    const theme = link.bioSettings?.theme || 'dark';
    const bgColor = theme === 'dark' ? '#0f172a' : theme === 'light' ? '#f8fafc' : '#000';
    const textColor = theme === 'light' ? '#0f172a' : '#fff';
    const cardBg = theme === 'light' ? '#fff' : 'rgba(255,255,255,0.05)';
    const cardBorder = theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)';

    const getSocialIcon = (key: string) => {
        switch (key) {
            case 'instagram': return <Instagram size={20} />;
            case 'youtube': return <Youtube size={20} />;
            case 'linkedin': return <Linkedin size={20} />;
            case 'twitter': return <Twitter size={20} />;
            case 'whatsapp': return <MessageCircle size={20} />;
            case 'telegram': return <Send size={20} />;
            default: return <Globe size={20} />;
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: bgColor,
            color: textColor,
            padding: '4rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Dynamic Background Elements */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: theme === 'dark'
                    ? `radial-gradient(circle at 20% 20%, ${link.brandingColor}15 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${link.brandingColor}10 0%, transparent 40%)`
                    : `radial-gradient(circle at 20% 20%, ${link.brandingColor}05 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${link.brandingColor}05 0%, transparent 40%)`,
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Header / Profile */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '450px', position: 'relative', zIndex: 1 }}
            >
                {link.bioSettings?.avatarUrl ? (
                    <motion.div
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                        style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1.5rem', border: `4px solid ${link.brandingColor || '#FFD700'}`, boxShadow: `0 10px 30px ${link.brandingColor}40` }}
                    >
                        <Image src={link.bioSettings.avatarUrl} alt={link.title} width={110} height={110} objectFit="cover" />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                        style={{
                            width: '90px', height: '90px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${link.brandingColor || '#FFD700'}, #000)`,
                            margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', fontWeight: 900, color: '#fff',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            boxShadow: `0 10px 40px ${link.brandingColor}30`
                        }}
                    >
                        {link.title.charAt(0).toUpperCase()}
                    </motion.div>
                )}

                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>{link.title}</h1>
                {link.bioSettings?.bioText && (
                    <p style={{ opacity: 0.8, fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>{link.bioSettings.bioText}</p>
                )}
            </motion.div>

            {/* Social Links */}
            {link.bioSettings?.socialLinks && Object.values(link.bioSettings.socialLinks).some(v => v) && (
                <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '3.5rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                    {Object.entries(link.bioSettings.socialLinks).map(([key, url]) => url ? (
                        <motion.a
                            key={key}
                            href={url}
                            target="_blank"
                            whileHover={{ scale: 1.2, color: link.brandingColor || '#FFD700', y: -2 }}
                            style={{ color: textColor, opacity: 0.6, transition: 'color 0.2s' }}
                        >
                            {getSocialIcon(key)}
                        </motion.a>
                    ) : null)}
                </div>
            )}

            {/* Main Links */}
            <div style={{ width: '100%', maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative', zIndex: 1, padding: '0 1rem' }}>
                {link.links?.map((item, idx) => (
                    <motion.a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, background: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.3rem 1.8rem',
                            borderRadius: '24px',
                            background: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.03)',
                            border: theme === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(12px)',
                            textDecoration: 'none',
                            color: textColor,
                            fontWeight: 700,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: theme === 'light' ? '0 10px 30px rgba(0,0,0,0.03)' : '0 10px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color || link.brandingColor || '#FFD700', boxShadow: `0 0 15px ${item.color || link.brandingColor || '#FFD700'}80` }} />
                            <span style={{ fontSize: '1.05rem' }}>{item.title}</span>
                        </div>
                        <ArrowRight size={20} style={{ opacity: 0.3 }} />
                    </motion.a>
                ))}
            </div>

            {/* Footer Branding */}
            <div style={{ marginTop: 'auto', paddingTop: '6rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}
                >
                    Powered by <span style={{ color: link.brandingColor || '#FFD700', textShadow: `0 0 10px ${link.brandingColor}40` }}>Inscreva-se</span>
                </motion.div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                body {
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                }
            `}</style>
        </div>
    );
}
