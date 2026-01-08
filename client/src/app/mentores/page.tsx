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
                padding: '80px 20px 60px',
                background: '#0a0a0a',
                color: '#fff',
                textAlign: 'center',
                position: 'relative',
                borderBottom: '2px solid #FFD700',
                boxShadow: '0 10px 30px rgba(255,215,0,0.1)'
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
                        background: 'rgba(255,215,0,0.15)',
                        padding: '4px 14px',
                        borderRadius: '50px',
                        border: '1px solid #FFD700',
                        marginBottom: '1rem',
                        boxShadow: '0 0 15px rgba(255,215,0,0.2)'
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
                        fontSize: '2.8rem',
                        fontFamily: 'var(--font-playfair)',
                        fontWeight: 900,
                        marginBottom: '0.8rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.5px',
                        color: '#fff',
                        textShadow: '0 0 20px rgba(255,215,0,0.1)'
                    }}>
                        {t('mentors.title')}
                    </h1>

                    <p style={{
                        fontSize: '1rem',
                        color: '#aaa',
                        marginBottom: '2rem',
                        maxWidth: '550px',
                        margin: '0 auto 2rem',
                        lineHeight: 1.5,
                        opacity: 0.8
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
                                padding: '0.8rem 1.2rem 0.8rem 3rem',
                                borderRadius: '100px',
                                border: 'none',
                                background: 'transparent',
                                color: '#fff',
                                fontSize: '1rem',
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
                            padding: '0 1.5rem',
                            color: '#000',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
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
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05, duration: 0.4 }}
                                            style={{
                                                background: '#fff',
                                                borderRadius: '24px',
                                                padding: '2rem 1.5rem',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                                                border: '1px solid #f0f0f0',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                position: 'relative',
                                                transition: 'all 0.3s ease'
                                            }}
                                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                                        >
                                            {/* Circular Profile Wrapper */}
                                            <div style={{
                                                position: 'relative',
                                                width: '100px',
                                                height: '100px',
                                                marginBottom: '1.2rem',
                                                padding: '4px',
                                                background: 'var(--gold-gradient)',
                                                borderRadius: '50%',
                                                boxShadow: '0 8px 20px rgba(255,215,0,0.15)'
                                            }}>
                                                <div style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    background: '#fff',
                                                    border: '2px solid #fff'
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
                                                            justifyContent: 'center', background: '#f5f5f5',
                                                            color: '#000', fontSize: '2.5rem', fontWeight: 900
                                                        }}>
                                                            {mentor.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Elite Badge - Small & Elegant */}
                                                {mentor.plan === 'premium' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '5px',
                                                        right: '5px',
                                                        background: '#0a0a0a',
                                                        color: '#FFD700',
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '2px solid #fff',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                                        zIndex: 2
                                                    }}>
                                                        <Star size={12} fill="#FFD700" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Showcase Body */}
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 800,
                                                color: '#111',
                                                marginBottom: '0.2rem',
                                                fontFamily: 'var(--font-playfair)'
                                            }}>
                                                {mentor.name}
                                            </h3>

                                            {mentor.businessName && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    color: '#FFD700',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    marginBottom: '1rem'
                                                }}>
                                                    {mentor.businessName}
                                                </div>
                                            )}

                                            <p style={{
                                                color: '#777',
                                                fontSize: '0.85rem',
                                                lineHeight: 1.5,
                                                marginBottom: '1.5rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                minHeight: '4.5em'
                                            }}>
                                                {mentor.bio || "Autoridade e excelência em cada mentoria realizada pela nossa rede de especialistas."}
                                            </p>

                                            {/* Action Button - Subtle & Integrated */}
                                            <div style={{ marginTop: 'auto', width: '100%' }}>
                                                <Link
                                                    href={`/mentores/${mentor.id || mentor._id}`}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        padding: '0.8rem 1.5rem',
                                                        background: '#fcfcfc',
                                                        color: '#1a1a1a',
                                                        borderRadius: '100px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 700,
                                                        textDecoration: 'none',
                                                        border: '1px solid #eee',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        (e.currentTarget as HTMLAnchorElement).style.background = '#0a0a0a';
                                                        (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#0a0a0a';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        (e.currentTarget as HTMLAnchorElement).style.background = '#fcfcfc';
                                                        (e.currentTarget as HTMLAnchorElement).style.color = '#1a1a1a';
                                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#eee';
                                                    }}
                                                >
                                                    {t('common.viewProfile')} <ChevronRight size={16} />
                                                </Link>
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
