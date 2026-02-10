"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, ChevronRight, Zap, X, Megaphone } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';
import { FormModel } from '@/lib/formService';

interface SponsoredAdCardProps {
    events: FormModel[];
}

export default function SponsoredAdCard({ events }: SponsoredAdCardProps) {
    const { t } = useTranslate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isVisible, setIsVisible] = useState(false);
    const isClosed = false; // Placeholder if needed in future, but avoiding unused state

    // Show ad after a short delay on the home page
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    const nextAd = useCallback(() => {
        if (events.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % events.length);
            setTimeLeft(30);
        } else {
            setIsVisible(false); // Hide if it was the only one and time is up? 
            // Or just cycle it back? For now, let's keep it visible but reset
            setTimeLeft(30);
        }
    }, [events.length]);

    useEffect(() => {
        if (!isVisible || isClosed) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    nextAd();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isVisible, isClosed, events.length, currentIndex, nextAd]);

    if (!events || events.length === 0 || isClosed) return null;

    const currentEvent = events[currentIndex];

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Darkened Background Overlay for Focus */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsVisible(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 9998
                        }}
                    />

                    {/* Floating Creative Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100, rotateX: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100, rotateX: -20 }}
                        transition={{
                            type: 'spring',
                            damping: 20,
                            stiffness: 100,
                            duration: 0.8
                        }}
                        style={{
                            position: 'fixed',
                            bottom: '40px',
                            right: '40px',
                            width: 'min(500px, 90vw)',
                            zIndex: 9999,
                            perspective: '1000px'
                        }}
                    >
                        <div style={{
                            background: '#fff',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            boxShadow: '0 50px 100px rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.1)',
                            border: '1px solid rgba(255,215,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                        }}>
                            {/* Close Button */}
                            <button
                                onClick={() => setIsVisible(false)}
                                style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    zIndex: 10,
                                    background: 'rgba(0,0,0,0.5)',
                                    color: '#fff',
                                    border: 'none',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                <X size={18} />
                            </button>

                            {/* Multimedia Section */}
                            <div style={{ position: 'relative', height: '240px', width: '100%' }}>
                                <Image
                                    src={currentEvent.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000'}
                                    alt={currentEvent.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    left: '15px',
                                    background: '#000',
                                    color: '#FFD700',
                                    padding: '6px 14px',
                                    borderRadius: '100px',
                                    fontSize: '0.7rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                }}>
                                    <Zap size={12} fill="#FFD700" className="animate-pulse" /> {t('common.sponsored')}
                                </div>

                                {/* Countdown Circle Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '15px',
                                    right: '15px',
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(0,0,0,0.6)',
                                    backdropFilter: 'blur(5px)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFD700',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    border: '2px solid rgba(255,215,0,0.3)'
                                }}>
                                    {timeLeft}s
                                </div>
                            </div>

                            {/* Info Section */}
                            <div style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B8860B', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>
                                    {currentEvent.category || 'EVENTO PREMIUM'}
                                </div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 900,
                                    fontFamily: 'var(--font-playfair)',
                                    color: '#111',
                                    lineHeight: 1.2,
                                    marginBottom: '1rem'
                                }}>
                                    {currentEvent.title}
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.8rem' }}>
                                        <Calendar size={14} className="gold-text" />
                                        {currentEvent.eventDate ? new Date(currentEvent.eventDate).toLocaleDateString() : 'Em breve'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.8rem' }}>
                                        <MapPin size={14} className="gold-text" />
                                        {currentEvent.location || 'Online'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Link
                                        href={`/f/${currentEvent.slug}`}
                                        style={{
                                            flex: 2,
                                            padding: '1rem',
                                            background: 'var(--gold-gradient)',
                                            color: '#000',
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            fontWeight: 800,
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 8px 20px rgba(212,175,55,0.2)'
                                        }}
                                    >
                                        Garantir Vaga <ChevronRight size={16} />
                                    </Link>
                                    <button
                                        onClick={nextAd}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: '#f8f8f8',
                                            color: '#111',
                                            borderRadius: '16px',
                                            border: '1px solid #eee',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Skip
                                    </button>
                                </div>

                                {/* Creative CTA for other advertisers */}
                                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                    <Link
                                        href="/anunciar"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: '#B8860B',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '50px',
                                            background: 'rgba(212, 175, 55, 0.05)',
                                            border: '1px dashed rgba(212, 175, 55, 0.4)',
                                            transition: '0.3s'
                                        }}
                                        className="hover:bg-[rgba(212,175,55,0.1)]"
                                    >
                                        <Megaphone size={14} /> {t('common.promoteCTA')}
                                    </Link>
                                </div>

                                {/* Progress Indicator */}
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '4px' }}>
                                    {events.map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                height: '3px',
                                                background: i === currentIndex ? 'var(--gold-gradient)' : '#eee',
                                                borderRadius: '10px',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {i === currentIndex && (
                                                <motion.div
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 30, ease: 'linear' }}
                                                    style={{ height: '100%', background: '#fff', opacity: 0.5 }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
