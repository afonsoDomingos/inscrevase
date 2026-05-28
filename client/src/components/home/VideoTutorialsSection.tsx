'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, ExternalLink } from 'lucide-react';
import { lessonService, Lesson } from '@/lib/lessonService';
import { useTranslate } from '@/lib/useTranslate';

// Utility to extract YT ID
const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function VideoTutorialsSection() {
    const { t } = useTranslate();
    const [tutorials, setTutorials] = useState<Lesson[]>([]);
    const [playingId, setPlayingId] = useState<string | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        const el = document.getElementById('tutorials-scroll-container');
        if (el) {
            const scrollAmount = 340;
            el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        lessonService.getPlatformTutorials().then(setTutorials).catch(() => { });
    }, []);

    if (tutorials.length === 0) return null;

    return (
        <section style={{
            padding: '100px 0',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ textAlign: 'center', marginBottom: '60px' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                        fontWeight: 800,
                        color: '#111',
                        marginBottom: '1rem',
                        letterSpacing: '-0.5px',
                        fontFamily: 'var(--font-playfair)',
                    }}>
                        {t('home.tutorials.title') || 'Tutoriais em Vídeo'}
                    </h2>
                    <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto' }}>
                        {t('home.tutorials.subtitle') || 'Assista e aprenda passo a passo como usar a Inscreva-se'}
                    </p>
                </motion.div>

                {/* Video Cards Grid with Carousel feel */}
                <div style={{ position: 'relative', width: '100%', marginBottom: '50px' }}>
                    {/* Navigation Buttons */}
                    {tutorials.length > 3 && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => scroll('left')}
                                style={{
                                    position: 'absolute',
                                    left: '-20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 10,
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#000'
                                }}
                            >
                                <Play size={20} style={{ transform: 'rotate(180deg)', marginRight: '2px' }} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => scroll('right')}
                                style={{
                                    position: 'absolute',
                                    right: '-20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 10,
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#000'
                                }}
                            >
                                <Play size={20} style={{ marginLeft: '2px' }} />
                            </motion.button>
                        </>
                    )}

                    <div
                        id="tutorials-scroll-container"
                        style={{
                            display: 'flex',
                            gap: '28px',
                            overflowX: 'auto',
                            padding: '10px 5px 30px',
                            scrollBehavior: 'smooth',
                            scrollbarWidth: 'none',
                        }}
                    >
                        <style jsx>{`
                            #tutorials-scroll-container::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>

                        {tutorials.map((tutorial, i) => {
                            const ytId = getYouTubeId(tutorial.videoUrl);
                            const isPlaying = playingId === tutorial._id;
                            const thumbnail = tutorial.thumbnailUrl ||
                                (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

                            return (
                                <motion.div
                                    key={tutorial._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    style={{
                                        minWidth: '320px',
                                        width: '320px',
                                        background: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #eee',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                    }}
                                    whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
                                >
                                    {/* Thumbnail / Embed Area */}
                                    <div
                                        style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#111', cursor: 'pointer' }}
                                        onClick={() => setPlayingId(isPlaying ? null : tutorial._id)}
                                    >
                                        {isPlaying && ytId ? (
                                            <iframe
                                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                                                title={tutorial.title}
                                                allow="autoplay; encrypted-media"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <>
                                                {thumbnail ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img
                                                        src={thumbnail}
                                                        alt={tutorial.title}
                                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ position: 'absolute', inset: 0, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Play size={40} color="#FFD700" opacity={0.5} />
                                                    </div>
                                                )}
                                                {/* Dark overlay */}
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', transition: 'background 0.2s' }} />
                                                {/* Play button */}
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <motion.div
                                                        whileHover={{ scale: 1.15 }}
                                                        style={{
                                                            width: '56px',
                                                            height: '56px',
                                                            borderRadius: '50%',
                                                            background: 'rgba(255,255,255,0.95)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                                        }}
                                                    >
                                                        <Play size={22} fill="#FF0000" color="#FF0000" style={{ marginLeft: '3px' }} />
                                                    </motion.div>
                                                </div>
                                                {/* YouTube watermark badge */}
                                                {ytId && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '10px',
                                                        right: '10px',
                                                        background: 'rgba(0,0,0,0.7)',
                                                        color: '#fff',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        padding: '3px 8px',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                    }}>
                                                        <svg width="12" height="9" viewBox="0 0 24 18" fill="none">
                                                            <path d="M23.5 2.8A3 3 0 0 0 21.4.7C19.5 0 12 0 12 0S4.5 0 2.6.7A3 3 0 0 0 .5 2.8C0 4.8 0 9 0 9s0 4.2.5 6.2A3 3 0 0 0 2.6 17.3C4.5 18 12 18 12 18s7.5 0 9.4-.7a3 3 0 0 0 2.1-2.1C24 13.2 24 9 24 9s0-4.2-.5-6.2z" fill="#FF0000" />
                                                            <path d="M9.6 12.8L15.8 9 9.6 5.2v7.6z" fill="#fff" />
                                                        </svg>
                                                        Ver no YouTube
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <p style={{
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            color: '#111',
                                            margin: 0,
                                            lineHeight: 1.4,
                                            flex: 1,
                                            paddingRight: '12px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {tutorial.title}
                                        </p>
                                        <span style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                            <Eye size={13} /> {tutorial.views}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ textAlign: 'center' }}
                >
                    <motion.a
                        href="https://www.youtube.com/@inscrevase"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 36px',
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, #FFD700, #D4AF37)',
                            color: '#000',
                            fontWeight: 800,
                            fontSize: '1rem',
                            textDecoration: 'none',
                            boxShadow: '0 8px 30px rgba(212,175,55,0.35)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <ExternalLink size={18} />
                        {t('home.tutorials.cta') || 'Ver mais vídeos no YouTube'}
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}
