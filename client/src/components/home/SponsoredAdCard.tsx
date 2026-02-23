"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, ChevronRight, Zap, X } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

export interface SponsoredItem {
    _id: string;
    title: string;
    description: string;
    mediaUrl?: string | null;
    mediaType: 'image' | 'video';
    targetUrl: string;
    metadata: {
        date?: string | null;
        location?: string | null;
        category?: string;
    };
}

interface SponsoredAdCardProps {
    events: SponsoredItem[];
}

export default function SponsoredAdCard({ events }: SponsoredAdCardProps) {
    const { t } = useTranslate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isVisible, setIsVisible] = useState(false);
    const isClosed = false;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const nextAd = useCallback(() => {
        if (events.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % events.length);
            setTimeLeft(10);
        } else {
            setIsVisible(false); // Hide if it was the only one and time is up
        }
    }, [events.length]);

    useEffect(() => {
        if (!isVisible || isClosed) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    nextAd();
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isVisible, isClosed, events.length, currentIndex, nextAd]);

    // Impression tracking for AdRequest items
    useEffect(() => {
        const currentItem = events[currentIndex];
        if (isVisible && currentItem?._id && !currentItem.targetUrl.startsWith('/f/')) {
            // It's a new AdRequest system ad (not an internal form)
            const trackImpression = async () => {
                try {
                    const { adService } = await import('@/lib/adService');
                    await adService.trackAdImpression(currentItem._id);
                } catch (error: unknown) {
                    console.error("Error tracking impression", error);
                }
            };
            trackImpression();
        }
    }, [currentIndex, isVisible, events]);

    if (!events || events.length === 0 || isClosed) return null;

    const currentItem = events[currentIndex];

    const handleClickLink = async () => {
        if (currentItem._id && !currentItem.targetUrl.startsWith('/f/')) {
            try {
                const { adService } = await import('@/lib/adService');
                await adService.trackAdClick(currentItem._id);
            } catch (error: unknown) {
                console.error("Error tracking click", error);
            }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Floating Creative Card - Small & Top Right */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 120
                        }}
                        style={{
                            position: 'fixed',
                            top: isMobile ? '80px' : '100px', // Below navbar
                            right: '20px',
                            bottom: 'auto',
                            width: '260px', // Very small fixed width as requested
                            zIndex: 9999,
                        }}
                    >
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                        }}>
                            {/* Close Button */}
                            <button
                                onClick={() => setIsVisible(false)}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    zIndex: 10,
                                    background: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    border: 'none',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(4px)'
                                }}
                            >
                                <X size={14} />
                            </button>

                            {/* Countdown Timer (Small) */}
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '40px',
                                zIndex: 10,
                                background: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                backdropFilter: 'blur(4px)'
                            }}>
                                {timeLeft}s
                            </div>

                            {/* Multimedia Section */}
                            <div style={{ position: 'relative', height: '140px', width: '100%', background: '#f0f0f0' }}>
                                {currentItem.mediaType === 'video' ? (
                                    <video
                                        src={currentItem.mediaUrl || ""}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <Image
                                            src={currentItem.mediaUrl || '/logo.png'}
                                            alt={currentItem.title}
                                            fill
                                            style={{
                                                objectFit: currentItem.mediaUrl ? 'cover' : 'contain',
                                                padding: currentItem.mediaUrl ? 0 : '2rem',
                                                opacity: currentItem.mediaUrl ? 1 : 0.15,
                                                filter: currentItem.mediaUrl ? 'none' : 'grayscale(1)',
                                            }}
                                        />
                                        {!currentItem.mediaUrl && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff',
                                                zIndex: -1
                                            }} />
                                        )}
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    left: '8px',
                                    background: '#000',
                                    color: '#FFD700',
                                    padding: '4px 8px',
                                    borderRadius: '100px',
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                }}>
                                    <Zap size={10} fill="#FFD700" className="animate-pulse" /> {t('common.sponsored')}
                                </div>
                            </div>

                            {/* Info Section */}
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    color: '#111',
                                    marginBottom: '0.5rem',
                                    lineHeight: 1.3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {currentItem.title}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1rem' }}>
                                    {currentItem.metadata?.date && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.75rem' }}>
                                            <Calendar size={12} className="gold-text" />
                                            {new Date(currentItem.metadata.date).toLocaleDateString()}
                                        </div>
                                    )}
                                    {currentItem.metadata?.location && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.75rem' }}>
                                            <MapPin size={12} className="gold-text" />
                                            {currentItem.metadata.location}
                                        </div>
                                    )}
                                    {currentItem.metadata?.category && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3182ce', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                            <Zap size={10} /> {currentItem.metadata.category}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link
                                        href={currentItem.targetUrl}
                                        onClick={handleClickLink}
                                        target={currentItem.targetUrl.startsWith('http') ? '_blank' : '_self'}
                                        style={{
                                            flex: 1,
                                            padding: '8px 0',
                                            background: 'var(--gold-gradient)',
                                            color: '#000',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        Ver <ChevronRight size={14} style={{ marginLeft: '2px' }} />
                                    </Link>
                                    <button
                                        onClick={nextAd}
                                        style={{
                                            padding: '0 12px',
                                            background: '#f1f1f1',
                                            color: '#666',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Próximo
                                    </button>
                                </div>

                                <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                                    <Link
                                        href="/anunciar"
                                        style={{ fontSize: '0.65rem', color: '#999', textDecoration: 'none' }}
                                    >
                                        Anunciar aqui
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
