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
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* Header / Profile */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '400px' }}
            >
                {link.bioSettings?.avatarUrl ? (
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1.5rem', border: `3px solid ${link.brandingColor || '#FFD700'}` }}>
                        <Image src={link.bioSettings.avatarUrl} alt={link.title} width={100} height={100} objectFit="cover" />
                    </div>
                ) : (
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '24px', background: 'var(--gold-gradient)',
                        margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 900, color: '#000'
                    }}>
                        {link.title.charAt(0)}
                    </div>
                )}

                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{link.title}</h1>
                {link.bioSettings?.bioText && (
                    <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.6 }}>{link.bioSettings.bioText}</p>
                )}
            </motion.div>

            {/* Social Links */}
            {link.bioSettings?.socialLinks && Object.values(link.bioSettings.socialLinks).some(v => v) && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Object.entries(link.bioSettings.socialLinks).map(([key, url]) => url ? (
                        <motion.a
                            key={key}
                            href={url}
                            target="_blank"
                            whileHover={{ scale: 1.1, color: link.brandingColor || '#FFD700' }}
                            style={{ color: textColor, opacity: 0.8 }}
                        >
                            {getSocialIcon(key)}
                        </motion.a>
                    ) : null)}
                </div>
            )}

            {/* Main Links */}
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {link.links?.map((item, idx) => (
                    <motion.a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, background: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.08)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.2rem 1.5rem',
                            borderRadius: '18px',
                            background: cardBg,
                            border: cardBorder,
                            textDecoration: 'none',
                            color: textColor,
                            fontWeight: 700,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color || link.brandingColor || '#FFD700' }} />
                            {item.title}
                        </div>
                        <ArrowRight size={18} opacity={0.5} />
                    </motion.a>
                ))}
            </div>

            {/* Footer Branding */}
            <div style={{ marginTop: 'auto', paddingTop: '4rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.4, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Powered by <span style={{ color: link.brandingColor || '#FFD700' }}>Inscreva-se</span>
                </div>
            </div>
        </div>
    );
}
