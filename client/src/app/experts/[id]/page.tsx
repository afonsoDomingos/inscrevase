"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import {
    Instagram, Linkedin, Facebook, Globe, MessageCircle,
    Award, Verified, Briefcase, ExternalLink, Users, UserPlus, UserMinus,
    MapPin, Calendar, ChevronLeft, Loader2, Eye, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { authService } from '@/lib/authService';
import { formService, FormModel } from '@/lib/formService';
import { serviceService, ServiceModel } from '@/lib/serviceService';
import { ShoppingBag } from 'lucide-react';

export default function ExpertProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslate();
    const [mentor, setMentor] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingLoading, setFollowingLoading] = useState(false);
    const [mentorEvents, setMentorEvents] = useState<FormModel[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [mentorServices, setMentorServices] = useState<ServiceModel[]>([]);
    const currentUser = useMemo(() => authService.getCurrentUser(), []);
    const visitRecorded = useRef(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const isMobile = windowWidth < 992;
    const isSmallMobile = windowWidth < 480;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchMentor = async () => {
            try {
                if (!id) return;
                const data = await userService.getPublicMentorById(id as string);
                setMentor(data);
                setFollowersCount(data.followers?.length || 0);

                if (currentUser) {
                    const userId = currentUser.id || currentUser._id;
                    setIsFollowing(data.followers?.includes(userId as string) || false);
                }

                // Fetch Mentor Events
                const events = await formService.getFormsByMentor(id as string);
                setMentorEvents(events);

                // Fetch Mentor Services
                const services = await serviceService.getServices({ creator: id as string });
                setMentorServices(services);
            } catch (error) {
                console.error("Error fetching mentor info:", error);
            } finally {
                setLoading(false);
                setEventsLoading(false);
            }
        };
        fetchMentor();
    }, [id, currentUser]);

    useEffect(() => {
        if (!id || visitRecorded.current) return;

        userService.recordVisit(id as string);
        visitRecorded.current = true;
    }, [id]);

    const handleFollowToggle = async () => {
        if (!currentUser) {
            router.push('/entrar');
            return;
        }

        try {
            setFollowingLoading(true);
            const mentorId = mentor?.id || mentor?._id;
            if (!mentorId) return;

            const result = await userService.toggleFollow(mentorId);
            setIsFollowing(result.isFollowing);
            setFollowersCount(result.followersCount);
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setFollowingLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        );
    }

    if (!mentor) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: '#fdfdfd' }}>
                <Users size={64} style={{ opacity: 0.1 }} />
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem' }}>{t('mentors.noMentors')}</h2>
                <button
                    onClick={() => router.push('/experts')}
                    style={{
                        background: '#000', color: '#FFD700', padding: '1rem 2.5rem',
                        borderRadius: '50px', border: 'none', fontWeight: 700, cursor: 'pointer'
                    }}
                >
                    {t('mentors.backToList')}
                </button>
            </div>
        );
    }

    const socialPlatforms = [
        { key: 'instagram', icon: <Instagram size={22} />, color: '#E4405F', label: 'Instagram' },
        { key: 'linkedin', icon: <Linkedin size={22} />, color: '#0077B5', label: 'LinkedIn' },
        { key: 'facebook', icon: <Facebook size={22} />, color: '#1877F2', label: 'Facebook' },
        { key: 'website', icon: <Globe size={22} />, color: '#FFD700', label: t('dashboard.settings.websitePlaceholder') }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8f8f8' }}>
            <Navbar />

            {/* Premium Cinematic Header */}
            <div style={{
                padding: isMobile ? '80px 0 30px' : '120px 0 40px',
                background: '#0a0a0a',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid #FFD700',
                boxShadow: '0 5px 20px rgba(255,215,0,0.1)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.08) 0%, transparent 80%)',
                    zIndex: 1
                }} />

                {/* Abstract Background Decoration */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(#FFD700 0.5px, transparent 0.5px)',
                    backgroundSize: '30px 30px',
                    zIndex: 0
                }} />

                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.push('/experts')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.05)', color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '50px',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                            backdropFilter: 'blur(10px)', transition: 'all 0.3s',
                            marginBottom: '2rem'
                        }}
                        onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <ChevronLeft size={18} /> {t('mentors.backToList')}
                    </motion.button>

                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'center' : 'flex-end',
                        gap: isMobile ? '1.5rem' : '3rem',
                        textAlign: isMobile ? 'center' : 'left'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                width: isSmallMobile ? '140px' : '160px',
                                height: isSmallMobile ? '140px' : '160px',
                                borderRadius: '50%',
                                padding: '4px', background: 'var(--gold-gradient)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                flexShrink: 0,
                                position: 'relative',
                                top: isMobile ? '60px' : '70px',
                                zIndex: 10,
                                cursor: 'zoom-in'
                            }}
                            onClick={() => mentor.profilePhoto && setSelectedImage(mentor.profilePhoto)}
                        >
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                overflow: 'hidden', border: '4px solid #fff',
                                background: '#111', position: 'relative'
                            }}>
                                {mentor.profilePhoto ? (
                                    <Image src={mentor.profilePhoto} alt={mentor.name} fill style={{ objectFit: 'cover' }} priority />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222', color: '#FFD700', fontSize: '6rem', fontWeight: 900 }}>
                                        {mentor.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ paddingBottom: '2rem' }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isMobile ? 'center' : 'flex-start',
                                flexWrap: 'wrap',
                                gap: '10px',
                                marginBottom: '1.2rem'
                            }}>
                                {mentor.badges && mentor.badges.length > 0 ? (
                                    mentor.badges.map((badge, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                background: badge.name === 'Elite' ? 'var(--gold-gradient)' : (badge.color || '#4299e1'),
                                                color: '#000',
                                                padding: '4px 14px',
                                                borderRadius: '100px',
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                boxShadow: badge.name === 'Elite' ? '0 4px 12px rgba(255,215,0,0.3)' : 'none'
                                            }}
                                        >
                                            {badge.name}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ background: '#FFD700', color: '#000', padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {t(`common.badges.${mentor.role || 'mentor'}`)} {t('common.badges.verified')}
                                    </div>
                                )}
                                <Verified size={20} className="gold-text" />
                            </div>
                            <h1 style={{
                                fontSize: isMobile ? '1.8rem' : '2.4rem',
                                fontWeight: 900,
                                color: '#fff',
                                fontFamily: 'var(--font-playfair)',
                                lineHeight: 1.2,
                                textShadow: '0 0 15px rgba(255,215,0,0.2)',
                                maxWidth: '100%',
                                wordBreak: 'break-word'
                            }}>
                                {mentor.name}
                            </h1>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.2rem' }}>
                                {mentor.businessName && (
                                    <p style={{
                                        color: 'rgba(255,255,255,0.7)',
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: isMobile ? 'center' : 'flex-start',
                                        gap: '8px',
                                        margin: 0
                                    }}>
                                        <Briefcase size={18} className="gold-text" /> {mentor.businessName}
                                    </p>
                                )}

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isMobile ? 'center' : 'flex-start',
                                    gap: isSmallMobile ? '0.8rem' : '1.5rem',
                                    padding: isSmallMobile ? '0.6rem 0.8rem' : '0.8rem 1.2rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(5px)',
                                    width: isSmallMobile ? '100%' : 'fit-content'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: isSmallMobile ? '0.8rem' : '1.5rem' }}>
                                        <Users size={18} className="gold-text" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: isSmallMobile ? '0.9rem' : '1.1rem', fontWeight: 900, color: '#FFD700', lineHeight: 1 }}>{followersCount}</span>
                                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Seguidores</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Eye size={18} className="gold-text" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: isSmallMobile ? '0.9rem' : '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{mentor.profileVisits || 0}</span>
                                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Visitas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFollowToggle}
                                disabled={followingLoading}
                                style={{
                                    marginTop: '1.5rem',
                                    padding: '0.8rem 2.2rem',
                                    borderRadius: '100px',
                                    background: isFollowing ? 'transparent' : 'var(--gold-gradient)',
                                    color: isFollowing ? '#fff' : '#000',
                                    border: isFollowing ? '1px solid #FFD700' : 'none',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: isFollowing ? 'none' : '0 10px 25px rgba(255,215,0,0.25)',
                                    transition: 'all 0.3s',
                                    width: isSmallMobile ? '100%' : 'fit-content'
                                }}
                            >
                                {followingLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : isFollowing ? (
                                    <><UserMinus size={18} /> Seguindo</>
                                ) : (
                                    <><UserPlus size={18} /> {t('mentors.followRole', { role: t(`common.badges.${mentor.role || 'mentor'}`) })}</>
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Profile Strategic Layout */}
            <main style={{ maxWidth: '1200px', margin: isMobile ? '80px auto 40px' : '100px auto 80px', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: isMobile ? '2rem' : '3rem' }}>

                    {/* Left Sidebar - Key Info & Socials */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="luxury-card"
                            style={{ background: '#fff', padding: '2.5rem', borderRadius: '32px' }}
                        >
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                {t('events.basicInfo')}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {mentor.country && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8860B' }}>
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Localização</span>
                                            <span style={{ fontWeight: 600, color: '#333' }}>{mentor.country}</span>
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8860B' }}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>{t('mentors.joinedIn')}</span>
                                        <span style={{ fontWeight: 600, color: '#333' }}>{new Date(mentor.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#999' }}>
                                    Social Connect
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {socialPlatforms.map(platform => (
                                        mentor.socialLinks?.[platform.key as keyof typeof mentor.socialLinks] && (
                                            <a
                                                key={platform.key}
                                                href={mentor.socialLinks[platform.key as keyof typeof mentor.socialLinks]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '1rem', borderRadius: '16px',
                                                    background: '#fcfcfc', color: '#333',
                                                    border: '1px solid #f0f0f0',
                                                    textDecoration: 'none',
                                                    fontWeight: 600,
                                                    transition: 'all 0.3s'
                                                }}
                                                onMouseOver={(e) => {
                                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = platform.color;
                                                    (e.currentTarget as HTMLAnchorElement).style.background = '#fff';
                                                }}
                                                onMouseOut={(e) => {
                                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#f0f0f0';
                                                    (e.currentTarget as HTMLAnchorElement).style.background = '#fcfcfc';
                                                }}
                                            >
                                                <span style={{ color: platform.color }}>{platform.icon}</span>
                                                {platform.label}
                                                <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                                            </a>
                                        )
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{
                                width: '100%', padding: '1.5rem',
                                background: '#000', color: '#FFD700', borderRadius: '20px',
                                fontWeight: 800, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                fontSize: '1.1rem',
                                transition: 'transform 0.3s'
                            }}
                            onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
                        >
                            <MessageCircle size={24} /> {t('mentors.contact')}
                        </motion.button>
                    </aside>

                    {/* Right Column - In-depth Details */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="luxury-card"
                            style={{ background: '#fff', padding: '3rem', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03 }}>
                                <Award size={300} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                                <div style={{ width: '3px', height: '24px', background: 'var(--gold-gradient)' }} />
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: '#111' }}>{t('mentors.bio')}</h2>
                            </div>

                            <p style={{ fontSize: '1.25rem', lineHeight: 2, color: '#444', whiteSpace: 'pre-line', position: 'relative', zIndex: 1 }}>
                                {mentor.bio || t('mentors.defaultBio', { role: t(`common.badges.${mentor.role || 'mentor'}`) })}
                            </p>

                            <div style={{
                                marginTop: '4rem',
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                                gap: '1.5rem'
                            }}>
                                {[
                                    { label: 'Autoridade', value: 'Elite' },
                                    { label: 'Status', value: 'Verificado' },
                                    { label: 'Network', value: 'Premium' }
                                ].map((stat, i) => (
                                    <div key={i} style={{ background: '#fcfcfc', border: '1px solid #f0f0f0', padding: isMobile ? '1.5rem' : '2rem', borderRadius: '24px', textAlign: 'center' }}>
                                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#999', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>{stat.label}</span>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111', fontFamily: 'var(--font-playfair)' }}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Services & Products List */}
                        {mentorServices.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                                    <div style={{ width: '3px', height: '24px', background: 'var(--gold-gradient)' }} />
                                    <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: '#111' }}>{t('mentors.services')}</h2>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                                    {mentorServices.slice(0, 6).map((service) => (
                                        <motion.div
                                            key={service._id}
                                            whileHover={{ y: -5 }}
                                            className="luxury-card"
                                            style={{
                                                background: '#fff',
                                                borderRadius: '24px',
                                                padding: '2rem',
                                                border: '1px solid #f0f0f0',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onClick={async () => {
                                                try {
                                                    await serviceService.incrementInquiry(service._id);
                                                    const text = encodeURIComponent(t('mentors.serviceWhatsAppMessage', { name: mentor.name, title: service.title }));
                                                    window.open(`https://wa.me/${mentor.whatsapp || ''}?text=${text}`, '_blank');
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                        >
                                            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.1 }}>
                                                <ShoppingBag size={40} />
                                            </div>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    background: 'rgba(255,215,0,0.1)',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    color: '#B8860B',
                                                    textTransform: 'uppercase',
                                                    marginBottom: '1rem'
                                                }}>
                                                    {t(`dashboard.servicesManagement.categories.${service.category}`)}
                                                </span>
                                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', marginBottom: '0.8rem', lineHeight: 1.3 }}>
                                                    {service.title}
                                                </h3>
                                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {service.description}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                                <div>
                                                    {service.price && service.price > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>{t('mentors.investment')}</span>
                                                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111' }}>
                                                                {service.currency} {service.price.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontWeight: 800, color: '#10b981' }}>{t('mentors.onQuery')}</span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '12px',
                                                    background: 'var(--gold-gradient)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 12px rgba(255,215,0,0.3)'
                                                }}>
                                                    <MessageCircle size={20} color="#000" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Active Events List */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                                <div style={{ width: '3px', height: '24px', background: 'var(--gold-gradient)' }} />
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: '#111' }}>{t('mentors.eventsAndMasterclasses')}</h2>
                            </div>

                            {eventsLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                    <Loader2 className="animate-spin" size={32} color="#FFD700" />
                                </div>
                            ) : mentorEvents.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                    {mentorEvents.map((event) => (
                                        <motion.div
                                            key={event._id}
                                            whileHover={{ y: -5 }}
                                            className="luxury-card"
                                            style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer' }}
                                            onClick={() => router.push(`/f/${event.slug}`)}
                                        >
                                            <div
                                                style={{ height: '160px', position: 'relative', background: '#0a0a0a', cursor: 'pointer' }}
                                            >
                                                {event.coverImage ? (
                                                    <Image
                                                        src={event.coverImage}
                                                        alt={event.title}
                                                        fill
                                                        style={{ objectFit: 'cover', opacity: 0.8 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedImage(event.coverImage!);
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-gradient)', opacity: 0.2 }}>
                                                        <Calendar size={48} color="#000" />
                                                    </div>
                                                )}
                                                <div style={{ position: 'absolute', bottom: '15px', right: '15px' }}>
                                                    <span style={{
                                                        background: 'rgba(0,0,0,0.8)',
                                                        color: '#FFD700',
                                                        padding: '4px 12px',
                                                        borderRadius: '100px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        backdropFilter: 'blur(5px)',
                                                        border: '1px solid rgba(255,215,0,0.3)'
                                                    }}>
                                                        {t('mentors.openRegistrations')}
                                                    </span>
                                                </div>

                                                <div style={{ position: 'absolute', bottom: '15px', left: '15px' }}>
                                                    <span style={{
                                                        background: 'rgba(0,0,0,0.4)',
                                                        color: '#fff',
                                                        padding: '4px 8px',
                                                        borderRadius: '100px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                        backdropFilter: 'blur(5px)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <Eye size={12} /> {event.visits || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.5rem' }}>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: '#111', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {event.title}
                                                </h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.85rem' }}>
                                                    <Calendar size={14} className="gold-text" />
                                                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString(t('common.locale') === 'en-US' ? 'en-US' : 'pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }) : t('mentors.dateToBeDefined')}
                                                </div>
                                                <button style={{
                                                    width: '100%', marginTop: '1.5rem', padding: '0.8rem',
                                                    borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc',
                                                    color: '#000', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                                    transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                }}>
                                                    {t('mentors.viewDetails')} <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ background: '#fff', padding: '4rem', borderRadius: '32px', textAlign: 'center', border: '2px dashed #eee' }}>
                                    <Calendar size={48} color="#eee" style={{ marginBottom: '1rem' }} />
                                    <p style={{ color: '#999', fontWeight: 600 }}>{t('mentors.noActiveEvents')}</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Call to Action for Mentors */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                background: '#000', borderRadius: '40px', padding: isMobile ? '2.5rem 1.5rem' : '4rem',
                                textAlign: 'center', color: '#fff', border: '1px solid rgba(255,215,0,0.2)',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
                            }}
                        >
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', marginBottom: '1.5rem' }}>
                                {t('mentors.learnWith', { name: mentor.name.split(' ')[0] }).split(mentor.name.split(' ')[0]).map((part, i, arr) => (
                                    <span key={i}>
                                        {part}
                                        {i < arr.length - 1 && <span className="gold-text">{mentor.name.split(' ')[0]}</span>}
                                    </span>
                                ))}
                            </h3>
                            <p style={{ opacity: 0.6, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                                {t('mentors.learnWithDesc')}
                            </p>
                            <button style={{ background: 'var(--gold-gradient)', color: '#000', padding: '1.2rem 3rem', borderRadius: '100px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                                {t('nav.events')}
                            </button>
                        </motion.div>
                    </section>

                </div>
            </main>

            {/* Elite Footer */}
            <div style={{ padding: isMobile ? '40px 20px' : '60px', background: '#050505', color: '#fff', textAlign: 'center', borderTop: '1px solid rgba(255,215,0,0.1)' }}>
                <p style={{ opacity: 0.3, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    {t('mentors.footer')}
                </p>
            </div>
            {/* Image Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.95)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={() => setSelectedImage(null)}
                            style={{
                                position: 'absolute',
                                top: '30px',
                                right: '30px',
                                background: 'white',
                                color: 'black',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 1
                            }}
                        >
                            <X size={24} />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'relative',
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                width: 'auto',
                                height: 'auto',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}
                        >
                            <Image
                                src={selectedImage}
                                alt="Imagem ampliada"
                                width={1200}
                                height={800}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '85vh',
                                    display: 'block',
                                    objectFit: 'contain'
                                }}
                                unoptimized
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
