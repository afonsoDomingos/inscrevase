"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import { motion } from 'framer-motion';
import {
    MapPin, Calendar, ChevronLeft, Loader2,
    Instagram, Linkedin, Facebook, Globe, MessageCircle, Star
} from 'lucide-react';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';

export default function MentorProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslate();
    const [mentor, setMentor] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentor = async () => {
            try {
                if (!id) return;
                const data = await userService.getPublicMentorById(id as string);
                setMentor(data);
            } catch (error) {
                console.error("Error fetching mentor:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMentor();
    }, [id]);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        );
    }

    if (!mentor) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <h2>{t('mentors.noMentors')}</h2>
                <button onClick={() => router.push('/mentores')} className="btn-primary">
                    {t('mentors.backToList')}
                </button>
            </div>
        );
    }

    const socialPlatforms = [
        { key: 'instagram', icon: <Instagram size={20} />, color: '#E4405F' },
        { key: 'linkedin', icon: <Linkedin size={20} />, color: '#0077B5' },
        { key: 'facebook', icon: <Facebook size={20} />, color: '#1877F2' },
        { key: 'website', icon: <Globe size={20} />, color: '#FFD700' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#fdfdfd' }}>
            <Navbar />

            {/* Premium Header/Banner */}
            <div style={{ height: '300px', background: '#111', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 100%)',
                }} />
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 0', position: 'relative', zIndex: 2 }}>
                    <button
                        onClick={() => router.push('/mentores')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.1)', color: '#fff',
                            border: 'none', padding: '0.6rem 1.2rem', borderRadius: '50px',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                            backdropFilter: 'blur(10px)', transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <ChevronLeft size={18} /> {t('mentors.backToList')}
                    </button>
                </div>
            </div>

            {/* Profile Content */}
            <main style={{ maxWidth: '1200px', margin: '-100px auto 100px', padding: '0 20px', position: 'relative', zIndex: 3 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem' }}>

                    {/* Left Column (Photo & Sidebar) */}
                    <aside>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="luxury-card"
                            style={{ background: '#fff', padding: '2rem', textAlign: 'center' }}
                        >
                            <div style={{
                                width: '200px', height: '200px', borderRadius: '50%',
                                margin: '0 auto 1.5rem', overflow: 'hidden', border: '5px solid #fff',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: '#f5f5f5'
                            }}>
                                {mentor.profilePhoto ? (
                                    <Image src={mentor.profilePhoto} alt={mentor.name} width={200} height={200} style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-gradient)', fontSize: '4rem', fontWeight: 800 }}>
                                        {mentor.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-playfair)' }}>{mentor.name}</h1>
                            {mentor.businessName && (
                                <p style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>
                                    {mentor.businessName}
                                </p>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', padding: '1.5rem 0', borderTop: '1px solid #eee' }}>
                                {mentor.country && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
                                        <MapPin size={18} className="gold-text" /> {mentor.country}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem' }}>
                                    <Calendar size={18} className="gold-text" /> {t('mentors.joinedIn')} {new Date(mentor.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '1rem' }}>
                                {socialPlatforms.map(platform => (
                                    mentor.socialLinks?.[platform.key as keyof typeof mentor.socialLinks] && (
                                        <a
                                            key={platform.key}
                                            href={mentor.socialLinks[platform.key as keyof typeof mentor.socialLinks]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: '#f8f9fa', color: platform.color,
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseOver={(e) => (e.currentTarget as HTMLAnchorElement).style.background = '#eee'}
                                            onMouseOut={(e) => (e.currentTarget as HTMLAnchorElement).style.background = '#f8f9fa'}
                                        >
                                            {platform.icon}
                                        </a>
                                    )
                                ))}
                            </div>
                        </motion.div>

                        <button style={{
                            width: '100%', padding: '1.2rem', marginTop: '1.5rem',
                            background: '#000', color: '#FFD700', borderRadius: '12px',
                            fontWeight: 800, border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }}>
                            <MessageCircle size={20} /> {t('mentors.contact')}
                        </button>
                    </aside>

                    {/* Right Column (Bio & Experience) */}
                    <section>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                        >
                            <div className="luxury-card" style={{ background: '#fff', padding: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                    <Star className="gold-text" fill="#FFD700" size={24} />
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>{t('mentors.bio')}</h2>
                                </div>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                                    {mentor.bio || "Este mentor ainda não adicionou uma biografia detalhada, mas já faz parte da nossa elite de especialistas."}
                                </p>
                            </div>

                            <div className="luxury-card" style={{ background: '#000', color: '#fff', padding: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                    <Star className="gold-text" size={24} />
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>{t('mentors.specialist')} Premium</h2>
                                </div>
                                <p style={{ opacity: 0.8, fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                    Como membro premium da Inscreva-se, este mentor oferece os mais altos padrões de experiência em seus eventos e mentorias.
                                </p>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ background: '#222', padding: '1.5rem', borderRadius: '15px', flex: 1, border: '1px solid #333' }}>
                                        <span style={{ fontSize: '2rem', fontWeight: 800, display: 'block' }}>100%</span>
                                        <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Profissional</span>
                                    </div>
                                    <div style={{ background: '#222', padding: '1.5rem', borderRadius: '15px', flex: 1, border: '1px solid #333' }}>
                                        <span style={{ fontSize: '2rem', fontWeight: 800, display: 'block' }}>Elite</span>
                                        <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Verificado</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </section>

                </div>
            </main>
        </div>
    );
}
