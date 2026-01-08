"use client";

import { useEffect, useState } from 'react';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Calendar, ChevronRight, Loader2, Star, Globe, Users } from 'lucide-react';
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fdfdfd' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{
                padding: '100px 20px 60px',
                background: '#1a1a1a',
                color: '#fff',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}
                >
                    <span style={{
                        color: '#FFD700',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '1rem'
                    }}>
                        {t('mentors.specialist')}
                    </span>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontFamily: 'var(--font-playfair)',
                        fontWeight: 800,
                        marginBottom: '1.5rem',
                        lineHeight: 1.1
                    }}>
                        {t('mentors.title')}
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '3rem' }}>
                        {t('mentors.subtitle')}
                    </p>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                        <Search style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={20} />
                        <input
                            type="text"
                            placeholder={t('mentors.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                                borderRadius: '50px',
                                border: '1px solid #333',
                                background: '#252525',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => (e.target as any).style.borderColor = '#FFD700'}
                            onBlur={(e) => (e.target as any).style.borderColor = '#333'}
                        />
                    </div>
                </motion.div>
            </section>

            {/* List Section */}
            <main style={{ flex: 1, padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader2 className="animate-spin" size={40} color="#FFD700" />
                    </div>
                ) : (
                    <>
                        {filteredMentors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 0', color: '#666' }}>
                                <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <p>{t('mentors.noMentors')}</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '2.5rem'
                            }}>
                                <AnimatePresence>
                                    {filteredMentors.map((mentor, index) => (
                                        <motion.div
                                            key={mentor._id || mentor.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            style={{
                                                background: '#fff',
                                                borderRadius: '24px',
                                                overflow: 'hidden',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                                border: '1px solid #f0f0f0',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%',
                                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                            }}
                                            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                        >
                                            {/* Mentor Header (Image & Name) */}
                                            <div style={{ position: 'relative', height: '240px', background: '#f5f5f5' }}>
                                                {mentor.profilePhoto ? (
                                                    <Image
                                                        src={mentor.profilePhoto}
                                                        alt={mentor.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-gradient)', color: '#000' }}>
                                                        <span style={{ fontSize: '3rem', fontWeight: 800 }}>{mentor.name.charAt(0)}</span>
                                                    </div>
                                                )}

                                                {mentor.plan === 'premium' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '1.5rem',
                                                        right: '1.5rem',
                                                        background: 'rgba(0,0,0,0.8)',
                                                        color: '#FFD700',
                                                        padding: '0.4rem 1rem',
                                                        borderRadius: '50px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        backdropFilter: 'blur(5px)',
                                                        border: '1px solid rgba(255,215,0,0.3)'
                                                    }}>
                                                        <Star size={12} fill="#FFD700" /> PREMIUM
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details Body */}
                                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.3rem' }}>{mentor.name}</h3>
                                                    {mentor.businessName && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            <Briefcase size={16} /> {mentor.businessName}
                                                        </div>
                                                    )}
                                                </div>

                                                <p style={{
                                                    color: '#666',
                                                    fontSize: '0.95rem',
                                                    lineHeight: 1.6,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    marginBottom: '2rem'
                                                }}>
                                                    {mentor.bio || "Este mentor é um especialista de renome na nossa plataforma."}
                                                </p>

                                                {/* Meta Info */}
                                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto', paddingBottom: '2rem', borderBottom: '1px solid #f0f0f0' }}>
                                                    {mentor.country && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#888' }}>
                                                            <Globe size={14} /> {mentor.country}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#888' }}>
                                                        <Calendar size={14} /> {new Date(mentor.createdAt || Date.now()).getFullYear()}
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <div style={{ paddingTop: '1.5rem' }}>
                                                    <Link
                                                        href={`/mentores/${mentor.id || mentor._id}`}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px',
                                                            width: '100%',
                                                            padding: '1rem',
                                                            background: '#1a1a1a',
                                                            color: '#fff',
                                                            borderRadius: '12px',
                                                            fontWeight: 700,
                                                            textDecoration: 'none',
                                                            transition: 'background 0.3s'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget as any).style.background = '#000'}
                                                        onMouseOut={(e) => (e.currentTarget as any).style.background = '#1a1a1a'}
                                                    >
                                                        {t('mentors.viewProfile')} <ChevronRight size={18} />
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
        </div>
    );
}
