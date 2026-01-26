"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';

interface AdBannerProps {
    slot?: string; // For Google Adsense
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
    customAd?: {
        image: string;
        link: string;
        title: string;
    };
    className?: string;
}

export default function AdBanner({ slot, format = 'auto', customAd, className = "" }: AdBannerProps) {

    useEffect(() => {
        // Only try to load Google Ads if there's a slot and NO custom ad
        if (!customAd && slot && typeof window !== 'undefined') {
            try {
                // @ts-expect-error - adsbygoogle might not be defined on window yet
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error("AdSense Error:", err);
            }
        }
    }, [slot, customAd]);

    // 1. If we have a Custom Internal Ad (Direct Sale)
    if (customAd) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`premium-ad-container ${className}`}
                style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,215,0,0.2)',
                    margin: '2rem 0'
                }}
            >
                <a href={customAd.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                    <div style={{ position: 'relative', width: '100%', height: '120px' }}>
                        <Image
                            src={customAd.image}
                            alt={customAd.title}
                            fill
                            style={{ objectFit: 'cover', opacity: 0.8 }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '1rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{customAd.title}</span>
                                <span style={{
                                    background: '#FFD700',
                                    color: '#000',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    Patrocinado <ExternalLink size={12} />
                                </span>
                            </div>
                        </div>
                    </div>
                </a>
            </motion.div>
        );
    }

    // 2. If it's Google AdSense
    if (slot) {
        return (
            <div className={`google-ad-container ${className}`} style={{ margin: '2rem 0', minHeight: '90px', width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: '#999', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Publicidade</div>
                <ins className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive="true"></ins>
            </div>
        );
    }

    // 3. Fallback/Placeholder for Admin to see where ads will be
    return (
        <div style={{
            height: '100px',
            background: 'rgba(255,215,0,0.03)',
            border: '2px dashed rgba(255,215,0,0.1)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,215,0,0.3)',
            fontSize: '0.8rem',
            margin: '2rem 0'
        }}>
            <Info size={16} style={{ marginRight: '8px' }} /> Espaço reservado para Publicidade
        </div>
    );
}
