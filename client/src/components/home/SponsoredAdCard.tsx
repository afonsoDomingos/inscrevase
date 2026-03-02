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
    mediaUrls?: string[];
    mediaType: 'image' | 'video';
    productPrice?: number;
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
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const isClosed = false;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const timer = setTimeout(() => setIsVisible(true), 5000);
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
        if (!isVisible || isClosed || isDetailsModalOpen) return;

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
    }, [isVisible, isClosed, events.length, currentIndex, nextAd, isDetailsModalOpen]);

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

    // Reset selected image when ad changes or modal opens
    // Must be BEFORE early returns to satisfy React Hooks rules
    useEffect(() => {
        setSelectedImageUrl(events[currentIndex]?.mediaUrl || null);
    }, [currentIndex, isDetailsModalOpen, events]);

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
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        key="sponsored-ad-card"
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
                            top: isMobile ? '80px' : '100px',
                            right: isMobile ? '15px' : '25px',
                            width: isMobile ? '180px' : '280px',
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
                            <div style={{ position: 'relative', height: isMobile ? '90px' : '140px', width: '100%', background: '#f0f0f0' }}>
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
                            <div style={{ padding: isMobile ? '0.6rem' : '1rem' }}>
                                <h3 style={{
                                    fontSize: isMobile ? '0.75rem' : '0.95rem',
                                    fontWeight: 700,
                                    color: '#111',
                                    marginBottom: isMobile ? '0.3rem' : '0.5rem',
                                    lineHeight: 1.3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {currentItem.title}
                                </h3>

                                {currentItem.productPrice && (
                                    <div style={{
                                        fontSize: isMobile ? '0.9rem' : '1.2rem',
                                        fontWeight: 900,
                                        color: '#D4AF37',
                                        marginBottom: isMobile ? '0.2rem' : '0.4rem',
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: '2px'
                                    }}>
                                        {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(currentItem.productPrice)}
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: isMobile ? '0.5rem' : '1rem' }}>
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

                                {currentItem.metadata?.category && typeof currentItem.metadata.category === 'string' && currentItem.metadata.category.toLowerCase().trim() === 'product' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setIsDetailsModalOpen(true)}
                                                style={{
                                                    flex: 1,
                                                    padding: isMobile ? '4px 0' : '8px 0',
                                                    background: '#f8fafc',
                                                    color: '#0f172a',
                                                    borderRadius: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 700,
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Saber mais
                                            </button>
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
                                        <Link
                                            href={currentItem.targetUrl}
                                            onClick={handleClickLink}
                                            target={currentItem.targetUrl.startsWith('http') ? '_blank' : '_self'}
                                            style={{
                                                width: '100%',
                                                padding: isMobile ? '6px 0' : '8px 0',
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
                                            Contactar <ChevronRight size={14} style={{ marginLeft: '2px' }} />
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Link
                                            href={currentItem.targetUrl}
                                            onClick={handleClickLink}
                                            target={currentItem.targetUrl.startsWith('http') ? '_blank' : '_self'}
                                            style={{
                                                flex: 1,
                                                padding: isMobile ? '6px 0' : '8px 0',
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
                                )}

                                <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Link
                                            href="/anunciar"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.7rem',
                                                fontWeight: 900,
                                                color: '#000',
                                                background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                                                textDecoration: 'none',
                                                padding: isMobile ? '6px 12px' : '8px 16px',
                                                borderRadius: '50px',
                                                letterSpacing: '0.5px',
                                                boxShadow: '0 8px 20px rgba(184, 134, 11, 0.3)',
                                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                textTransform: 'uppercase',
                                                border: '1px solid rgba(255, 255, 255, 0.2)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 12px 25px rgba(184, 134, 11, 0.5)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.3)';
                                            }}
                                        >
                                            <Zap size={12} fill="#000" /> Aumenta as tuas vendas!
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDetailsModalOpen && (
                    <motion.div
                        key="ad-details-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 10000,
                            background: 'rgba(0,0,0,0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        <motion.div
                            key="ad-details-content"
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            style={{
                                width: '100%',
                                maxWidth: '700px',
                                maxHeight: '90vh',
                                background: '#fff',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    zIndex: 10,
                                    background: 'rgba(255,255,255,0.9)',
                                    color: '#000',
                                    border: 'none',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {/* Gallery / Main Media */}
                                <div style={{ position: 'relative', width: '100%', height: '350px', background: 'radial-gradient(at 0% 0%, rgba(45, 212, 191, 0.15) 0%, transparent 50%), #042f2e', overflow: 'hidden' }}>
                                    {currentItem.mediaType === 'video' ? (
                                        <video
                                            src={currentItem.mediaUrl || ""}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            controls
                                            autoPlay
                                        />
                                    ) : (
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={selectedImageUrl}
                                                initial={{ opacity: 0, scale: 1.04 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.97 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                style={{ position: 'absolute', inset: 0 }}
                                            >
                                                <Image
                                                    src={selectedImageUrl || currentItem.mediaUrl || '/logo.png'}
                                                    alt={currentItem.title}
                                                    fill
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </div>

                                {/* Thumbnails — clickable to change main image */}
                                {currentItem.mediaUrls && currentItem.mediaUrls.length > 1 && (
                                    <div style={{ display: 'flex', gap: '8px', padding: '1rem', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', scrollbarWidth: 'none' }}>
                                        {currentItem.mediaUrls.map((url, idx) => {
                                            const isSelected = (selectedImageUrl ?? currentItem.mediaUrl) === url;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedImageUrl(url)}
                                                    style={{
                                                        position: 'relative',
                                                        minWidth: '80px',
                                                        width: '80px',
                                                        height: '80px',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        border: isSelected ? '2.5px solid #D4AF37' : '2.5px solid transparent',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                        flexShrink: 0,
                                                        boxShadow: isSelected ? '0 0 0 2px rgba(212,175,55,0.3)' : 'none',
                                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                                        transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                                                        background: '#f0f0f0'
                                                    }}
                                                >
                                                    <Image src={url} alt={`Foto ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                                                    {isSelected && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: 'rgba(212,175,55,0.15)',
                                                            pointerEvents: 'none'
                                                        }} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                                            {currentItem.title}
                                        </h1>
                                        {currentItem.productPrice && (
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', whiteSpace: 'nowrap' }}>
                                                {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(currentItem.productPrice)}
                                            </div>
                                        )}
                                    </div>

                                    <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '2rem' }}>
                                        {currentItem.description}
                                    </p>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        background: 'transparent',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        color: '#64748b',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Voltar
                                </button>
                                <Link
                                    href={currentItem.targetUrl}
                                    onClick={handleClickLink}
                                    target={currentItem.targetUrl.startsWith('http') ? '_blank' : '_self'}
                                    style={{
                                        padding: '0.8rem 2rem',
                                        background: 'var(--gold-gradient)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 800,
                                        color: '#000',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                                    }}
                                >
                                    Contactar <ChevronRight size={18} />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
