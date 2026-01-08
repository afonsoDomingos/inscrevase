"use client";

import { useEffect, useState } from 'react';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, ChevronRight, Loader2, Star, Globe, Users, Briefcase, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';

export default function MentorsShowcase() {
    const { t } = useTranslate();
    const [mentors, setMentors] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const data = await userService.getPublicMentors();
                setMentors(data);
            } catch (error) {
                console.error("Error fetching mentors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMentors();
    }, []);

    const filteredMentors = mentors.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.businessName && m.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.bio && m.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fcfcfc' }}>
            <Navbar />

            {/* Hero Section - Upgraded Aesthetics */}
            <section style={{
                padding: '140px 20px 80px',
                background: '#0a0a0a',
                color: '#fff',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid rgba(255,215,0,0.1)'
            }}>
                {/* Dynamic Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-5%',
                    width: '40%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.03) 0%, transparent 70%)',
                    zIndex: 0,
                    filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-5%',
                    width: '40%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.03) 0%, transparent 70%)',
                    zIndex: 0,
                    filter: 'blur(60px)'
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,215,0,0.1)',
                        padding: '6px 16px',
                        borderRadius: '50px',
                        border: '1px solid rgba(255,215,0,0.2)',
                        marginBottom: '1.5rem'
                    }}>
                        <Award size={14} className="gold-text" />
                        <span style={{
                            color: '#FFD700',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase'
                        }}>
                            {t('mentors.specialist')}
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: '4.5rem',
                        fontFamily: 'var(--font-playfair)',
                        fontWeight: 900,
                        marginBottom: '1.5rem',
                        lineHeight: 1.05,
                        letterSpacing: '-1px',
                        color: '#fff'
                    }}>
                        {t('mentors.title')}
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: '#999',
                        marginBottom: '3.5rem',
                        maxWidth: '650px',
                        margin: '0 auto 3.5rem',
                        lineHeight: 1.6
                    }}>
                        {t('mentors.subtitle')}
                    </p>

                    {/* Elite Search Bar */}
                    <div style={{
                        position: 'relative',
                        maxWidth: '650px',
                        margin: '0 auto',
                        background: '#151515',
                        borderRadius: '100px',
                        padding: '6px',
                        border: '1px solid #222',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                            <Search className="gold-text" size={20} style={{ opacity: 0.7 }} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('mentors.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem 1rem 3.5rem',
                                borderRadius: '100px',
                                border: 'none',
                                background: 'transparent',
                                color: '#fff',
                                fontSize: '1.1rem',
                                outline: 'none'
                            }}
                        />
                        <button style={{
                            position: 'absolute',
                            right: '6px',
                            top: '6px',
                            bottom: '6px',
                            background: 'var(--gold-gradient)',
                            border: 'none',
                            borderRadius: '100px',
                            padding: '0 2rem',
                            color: '#000',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}>
                            {t('common.search')}
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Main Showcase Grid */}
            <main style={{ flex: 1, padding: '80px 20px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
                        <Loader2 className="animate-spin" size={48} color="#FFD700" />
                    </div>
                ) : (
                    <>
                        {filteredMentors.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ textAlign: 'center', padding: '120px 0', color: '#888' }}
                            >
                                <div style={{
                                    width: '80px', height: '80px', background: '#f5f5f5',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 1.5rem'
                                }}>
                                    <Users size={32} style={{ opacity: 0.2 }} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>Nenhum mentor encontrado</h3>
                                <p>{t('mentors.noMentors')}</p>
                            </motion.div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '2rem'
                            }}>
                                <AnimatePresence>
                                    {filteredMentors.map((mentor, index) => (
                                        <motion.div
                                            key={mentor._id || mentor.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                            whileHover={{ y: -12 }}
                                            style={{
                                                background: '#fff',
                                                borderRadius: '32px',
                                                overflow: 'hidden',
                                                boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
                                                border: '1px solid #f2f2f2',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%',
                                                position: 'relative'
                                            }}
                                        >
                                            {/* Luxury Image Container */}
                                            <div style={{ position: 'relative', height: '220px', width: '100%', padding: '10px' }}>
                                                <div style={{
                                                    position: 'relative',
                                                    height: '100%',
                                                    width: '100%',
                                                    borderRadius: '20px',
                                                    overflow: 'hidden',
                                                    background: '#f8f8f8'
                                                }}>
                                                    {mentor.profilePhoto ? (
                                                        <Image
                                                            src={mentor.profilePhoto}
                                                            alt={mentor.name}
                                                            fill
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            height: '100%', display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', background: 'var(--gold-gradient)',
                                                            color: '#000', fontSize: '4rem', fontWeight: 900
                                                        }}>
                                                            {mentor.name.charAt(0)}
                                                        </div>
                                                    )}

                                                    {/* Premium Ribbon */}
                                                    {mentor.plan === 'premium' && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '1.5rem',
                                                            right: '1.5rem',
                                                            background: 'rgba(0,0,0,0.85)',
                                                            color: '#FFD700',
                                                            padding: '6px 14px',
                                                            borderRadius: '100px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 800,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            backdropFilter: 'blur(8px)',
                                                            border: '1px solid rgba(255,215,0,0.4)',
                                                            zIndex: 10
                                                        }}>
                                                            <Star size={12} fill="#FFD700" /> ELITE
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Showcase Body */}
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111', marginBottom: '0.1rem', fontFamily: 'var(--font-playfair)' }}>
                                                            {mentor.name}
                                                        </h3>
                                                        {mentor.businessName && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                <Briefcase size={14} /> {mentor.businessName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <p style={{
                                                    color: '#666',
                                                    fontSize: '0.9rem',
                                                    lineHeight: 1.6,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    marginBottom: '1.5rem'
                                                }}>
                                                    {mentor.bio || "Exclusividade e autoridade em cada mentoria."}
                                                </p>

                                                {/* Card Footer Info */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginTop: 'auto',
                                                    paddingTop: '1.5rem',
                                                    borderTop: '1px solid #f5f5f5'
                                                }}>
                                                    <div style={{ display: 'flex', gap: '1.2rem' }}>
                                                        {mentor.country && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#999', fontWeight: 500 }}>
                                                                <Globe size={14} className="gold-text" /> {mentor.country}
                                                            </div>
                                                        )}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#999', fontWeight: 500 }}>
                                                            <Calendar size={14} className="gold-text" /> {new Date(mentor.createdAt || Date.now()).getFullYear()}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        href={`/mentores/${mentor.id || mentor._id}`}
                                                        style={{
                                                            width: '44px',
                                                            height: '44px',
                                                            background: '#0a0a0a',
                                                            color: '#FFD700',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.3s',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            (e.currentTarget as HTMLAnchorElement).style.background = '#000';
                                                            (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            (e.currentTarget as HTMLAnchorElement).style.background = '#0a0a0a';
                                                            (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <ChevronRight size={20} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Premium Bottom Bar */}
            <div style={{
                padding: '40px',
                background: '#000',
                textAlign: 'center',
                color: '#fff',
                borderTop: '1px solid rgba(255,215,0,0.2)'
            }}>
                <p style={{ opacity: 0.5, fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    © 2026 Inscreva-se • Elite Network
                </p>
            </div>
        </div>
    );
}
