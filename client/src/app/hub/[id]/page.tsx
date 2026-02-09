"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    MessageCircle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Share2,
    ShieldCheck,
    Instagram,
    Linkedin,
    Loader2,
    Navigation,
    Info,
    Award,
    Calendar,
    Download,
    FileText,
    Link as LinkIcon,
    Play,
    BookOpen,
    X,
    LayoutDashboard,
    UserCircle,
    Home,
    Star
} from 'lucide-react';
import { authService, UserData } from '@/lib/authService';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { generateCertificate } from '@/lib/certificateGenerator';
import { useTranslate } from '@/context/LanguageContext';
import MetaPixel from '@/components/MetaPixel';
import AdBanner from '@/components/common/AdBanner';
import PremiumBadge from '@/components/common/PremiumBadge';
import CommunityChat from '@/components/hub/CommunityChat';

const getEmbedUrl = (url?: string) => {
    if (!url) return undefined;
    try {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
        }
        if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            return `https://player.vimeo.com/video/${videoId}`;
        }
    } catch {
        return undefined;
    }
    return undefined;
};

interface SubmissionData {
    _id: string;
    status: 'pending' | 'approved' | 'rejected';
    paymentStatus: 'unpaid' | 'paid' | 'pending';
    certificateStatus?: 'none' | 'requested' | 'approved';
    data: Record<string, string | number | boolean>;
    submittedAt: string;
    form: {
        _id: string;
        title: string;
        description: string;
        coverImage: string;
        logo: string;
        eventDate: string;
        eventTime?: string;
        eventType?: string;
        location?: string;
        onlineLink?: string;
        waitingVideo?: string;
        showVideoOnStart?: boolean;
        whatsappConfig?: {
            communityUrl: string;
        };
        welcomeMessage?: string;
        welcomeVideo?: string;
        hubBackgroundImage?: string;
        hubButtonColor?: string;
        showHubButton?: boolean;
        customFields?: Array<{
            label: string;
            value: string;
            icon?: string;
            order: number;
        }>;
        certificateConfig?: {
            enabled: boolean;
            template: string;
            primaryColor: string;
            title: string;
            subtitle: string;
            description: string;
            signerName?: string;
            signerRole: string;
            requireCheckIn: boolean;
        };
        agenda?: Array<{
            time: string;
            activity: string;
            description?: string;
            duration?: string;
            order: number;
        }>;
        materials?: Array<{
            name: string;
            url: string;
            type: 'pdf' | 'video' | 'link' | 'zip' | 'other';
            size?: string;
            availableAfterEvent: boolean;
            order: number;
        }>;
        creator: {
            _id: string;
            name: string;
            profilePhoto: string;
            bio: string;
            role?: 'admin' | 'mentor' | 'SuperAdmin' | 'participant' | 'company' | 'specialist';
            socialLinks?: {
                instagram?: string;
                linkedin?: string;
                website?: string;
            };
            isVerified?: boolean;
            facebookPixelId?: string;
        };
        theme: {
            primaryColor: string;
            backgroundColor: string;
        };
    };
}

interface HubLesson {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    order: number;
    progress?: {
        completed: boolean;
        watchTime: number;
        lastWatchedAt?: string;
    };
}

function HubContent() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslate();
    const [submission, setSubmission] = useState<SubmissionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [lessons, setLessons] = useState<HubLesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<HubLesson | null>(null);
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

    useEffect(() => {
        setCurrentUser(authService.getCurrentUser());
    }, []);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const url = process.env.NEXT_PUBLIC_API_URL
                    ? `${process.env.NEXT_PUBLIC_API_URL}/submissions/${id}`
                    : `http://localhost:5000/api/submissions/${id}`;
                const response = await fetch(url);
                const data = await response.json();
                if (response.ok) {
                    setSubmission(data);
                    if (data.form.showVideoOnStart) {
                        setIsPlayerExpanded(true);
                    }
                    document.title = `${data.form.title} - Hub`;

                    // Se a inscrição estiver aprovada, buscar as aulas
                    if (data.status === 'approved' || data.paymentStatus === 'paid') {
                        fetchLessons();
                    }
                } else {
                    toast.error(t('dashboard.submissionNotFound'));
                }
            } catch (err) {
                console.error(err);
                toast.error(t('dashboard.cancelError'));
            } finally {
                setLoading(false);
            }
        };

        const fetchLessons = async () => {
            try {
                // Get token if logged in to fetch personal progress
                const token = typeof window !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;

                const url = process.env.NEXT_PUBLIC_API_URL
                    ? `${process.env.NEXT_PUBLIC_API_URL}/lessons/hub/${id}`
                    : `http://localhost:5000/api/lessons/hub/${id}`;

                const response = await fetch(url, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                const data = await response.json();
                if (response.ok) {
                    // Sort by order
                    const sorted = data.sort((a: HubLesson, b: HubLesson) => (a.order || 0) - (b.order || 0));
                    setLessons(sorted);
                }
            } catch (err) {
                console.error('Error fetching hub lessons:', err);
            }
        };

        fetchSubmission();
        if (id) fetchLessons();
    }, [id, t]);

    const markLessonComplete = async (lessonId: string) => {
        try {
            const token = typeof window !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
            if (!token) return;

            const url = process.env.NEXT_PUBLIC_API_URL
                ? `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/progress`
                : `http://localhost:5000/api/lessons/${lessonId}/progress`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed: true })
            });

            if (response.ok) {
                // Refresh lessons to update progress status
                setLessons(prev => prev.map(l => l._id === lessonId ? { ...l, progress: { ...l.progress, completed: true, watchTime: l.duration } } : l));
                toast.success('Aula concluída!');
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleRequestCertificate = async () => {
        try {
            const token = typeof window !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
            if (!token) {
                toast.error(t('hub.loginToRequestCertificate') || 'Você precisa estar logado para solicitar o certificado');
                return;
            }

            const url = process.env.NEXT_PUBLIC_API_URL
                ? `${process.env.NEXT_PUBLIC_API_URL}/submissions/${id}/request-certificate`
                : `http://localhost:5000/api/submissions/${id}/request-certificate`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await response.json();
                setSubmission(prev => prev ? { ...prev, certificateStatus: 'requested' } : null);
                toast.success(t('hub.certificateRequestedSuccess') || 'Solicitação enviada ao mentor!');
            } else {
                const err = await response.json();
                toast.error(err.message || 'Erro ao solicitar certificado');
            }
        } catch (error) {
            console.error('Error requesting certificate:', error);
            toast.error('Erro de conexão');
        }
    };

    const isLessonLocked = (lesson: HubLesson, index: number) => {
        if (index === 0) return false;
        const previousLesson = lessons[index - 1];
        return !previousLesson.progress?.completed;
    };

    const stats = {
        total: lessons.length,
        completed: lessons.filter(l => l.progress?.completed).length,
        percentage: lessons.length > 0 ? Math.round((lessons.filter(l => l.progress?.completed).length / lessons.length) * 100) : 0
    };

    // Countdown Timer
    useEffect(() => {
        if (!submission?.form?.eventDate) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const eventTime = new Date(submission.form.eventDate).getTime();
            const distance = eventTime - now;

            if (distance < 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setCountdown({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [submission]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
            <Loader2 className="animate-spin" size={40} color="#171A20" />
        </div>
    );

    if (!submission) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#171A20' }}>
            <h1>{t('dashboard.submissionNotFound')}</h1>
            <button onClick={() => router.push('/')} style={{ marginTop: '1rem', color: '#171A20', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>{t('common.backToHome')}</button>
        </div>
    );

    const { form } = submission;
    const primaryColor = form.theme?.primaryColor || '#E82127'; // Tesla Red if not defined
    const isApproved = submission.status === 'approved' || submission.paymentStatus === 'paid';
    const isCreatorOrAdmin = currentUser?.id === form.creator?._id || currentUser?._id === form.creator?._id || currentUser?.role === 'admin';

    return (
        <main style={{ minHeight: '100vh', background: `linear-gradient(to bottom, rgba(10,10,10,0.85), rgba(5,5,5,0.95)), url('${form.hubBackgroundImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'}')`, backgroundSize: 'cover', backgroundAttachment: 'fixed', color: '#fff', fontFamily: 'var(--font-inter), sans-serif', padding: '0', overflowX: 'hidden' }}>
            {form.creator.facebookPixelId && <MetaPixel pixelId={form.creator.facebookPixelId} />}
            {/* Top Navigation Bar - Glass White */}
            <nav style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', zIndex: 100, padding: '15px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#171A20', transition: '0.2s' }}>
                            <ArrowLeft size={18} /> {t('common.back')}
                        </button>
                        <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }} />
                        <Link href="/" style={{ textDecoration: 'none', color: '#171A20', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Home size={18} /> {t('common.backToHome') || 'Visitar Plataforma'}
                        </Link>
                    </div>
                    <div style={{ fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#171A20' }}>
                        {t('hub.passport')} <span style={{ fontWeight: 500, color: '#666' }}>ID: {id?.toString().slice(-6).toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {currentUser ? (
                            <button
                                onClick={() => router.push(currentUser.role === 'mentor' ? '/dashboard/mentor' : currentUser.role === 'participant' ? '/dashboard/participant' : '/dashboard/admin')}
                                style={{
                                    background: '#171A20',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '100px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: '0.2s'
                                }}
                            >
                                <LayoutDashboard size={16} /> {t('common.dashboard') || 'Dashboard'}
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push(`/cadastro?redirect=/hub/${id}&role=participant`)}
                                style={{
                                    background: primaryColor,
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '100px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: '0.2s',
                                    boxShadow: `0 4px 12px ${primaryColor}40`
                                }}
                            >
                                <UserCircle size={16} /> {t('common.createAccount') || 'Criar Conta'}
                            </button>
                        )}
                        <button style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#171A20' }}>
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Container - Aumentado para 1100px */}
            <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 100px' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '50px', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '100px', background: isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: isApproved ? '#34d399' : '#fbbf24', fontSize: '0.8rem', fontWeight: 800, marginBottom: '24px', border: isApproved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)', backdropFilter: 'blur(10px)' }}
                    >
                        {isApproved ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        {isApproved ? t('events.confirmedStatus') : t('events.processingStatus')}
                    </motion.div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-2px', marginBottom: '15px', color: '#fff', lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{form.title}</h1>
                    <p style={{ color: '#d4d4d8', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{t('hub.exclusiveAccess')}</p>
                </div>

                {/* Live Stream Hero - Prioridade: Live -> Espera -> Default Aquecimento */}
                {getEmbedUrl(form.onlineLink || form.waitingVideo || 'https://youtu.be/vUmrbMoOE10') && (
                    <div style={{ maxWidth: '900px', margin: '0 auto 60px' }}>
                        <AnimatePresence mode="wait">
                            {isPlayerExpanded ? (
                                <motion.div
                                    key="expanded"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        aspectRatio: '16/9',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: '#000',
                                        position: 'relative'
                                    }}
                                >
                                    <button
                                        onClick={() => setIsPlayerExpanded(false)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0,0,0,0.7)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            cursor: 'pointer',
                                            zIndex: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                    <iframe
                                        src={getEmbedUrl(form.onlineLink || form.waitingVideo || 'https://youtu.be/vUmrbMoOE10')}
                                        style={{ width: '100%', height: '100%' }}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={t('hub.liveBroadcast')}
                                    />
                                </motion.div>
                            ) : (
                                (form.showHubButton !== false) && (
                                    <motion.button
                                        key="collapsed"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        onClick={() => setIsPlayerExpanded(true)}
                                        whileHover={{ scale: 1.02, boxShadow: `0 15px 40px ${form.hubButtonColor || '#FFD700'}60` }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            width: '100%',
                                            padding: '20px',
                                            borderRadius: '20px',
                                            background: form.hubButtonColor || 'linear-gradient(90deg, #FFD700 0%, #FFC107 100%)',
                                            border: 'none',
                                            color: '#000',
                                            fontSize: '1.2rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '15px',
                                            boxShadow: `0 10px 30px ${form.hubButtonColor || '#FFD700'}40`,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff0000', boxShadow: '0 0 10px #ff0000' }} className="animate-pulse" />
                                        {t('hub.watchBroadcast')}
                                    </motion.button>
                                )
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Top Hub Ad Slot */}
                <div style={{ maxWidth: '900px', margin: '0 auto 40px' }}>
                    <AdBanner slot="5589508956" format="horizontal" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '25px', alignItems: 'start' }} className="hub-grid">

                    {/* Left Column: Details */}
                    <div style={{ display: 'grid', gap: '35px' }}>

                        {/* Event Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ background: '#fff', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', position: 'relative' }}
                        >
                            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                                <Image
                                    src={form.coverImage || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}
                                    alt={form.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    unoptimized={!form.coverImage}
                                />
                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '30px', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)', color: '#fff' }}>
                                    <div style={{ display: 'flex', gap: '40px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{t('submissions.date')}</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{form.eventDate ? new Date(form.eventDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' }) : t('common.toBeDefined')}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{t('events.eventTimeLabel') || 'Horário'}</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                {form.eventTime || (form.eventDate ? new Date(form.eventDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : t('common.toBeDefined'))}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{t('events.eventModeLabel') || 'Modelo'}</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                {form.eventType ? t(`events.${form.eventType}`) : (form.location ? t('events.modePresencial') : t('events.modeOnline'))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Location & Links */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            {form.location ? (
                                <div style={{ background: '#fff', padding: '35px', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ background: '#f8f8f8', width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Navigation size={24} color="#333" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '6px' }}>{t('mentors.location')}</div>
                                        <div style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>{form.location}</div>
                                    </div>
                                    <button style={{ marginTop: 'auto', background: '#f4f4f4', border: 'none', padding: '14px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>{t('hub.exploreRoute')}</button>
                                </div>
                            ) : <div />}

                            {form.onlineLink ? (
                                <div style={{ background: '#fff', padding: '35px', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ background: '#f8f8f8', width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Video size={24} color="#333" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '6px' }}>{t('events.onlineLink')}</div>
                                        <div style={{ fontSize: '0.95rem', color: '#666' }}>{t('hub.linkAvailableInCabin')}</div>
                                    </div>
                                    <a href={form.onlineLink} target="_blank" style={{ marginTop: 'auto', background: '#111', color: '#fff', border: 'none', padding: '14px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', transition: '0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                        {form.onlineLink.includes('meet.google') || form.onlineLink.includes('zoom.us') || form.onlineLink.includes('teams') ? t('events.joinRoom') : t('events.accessLink')}
                                    </a>
                                </div>
                            ) : <div />}
                        </div>

                        {/* Mentor Section */}
                        <div style={{ background: '#0a0a0a', padding: '45px', borderRadius: '32px', color: '#fff', display: 'flex', gap: '35px', alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                            <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
                                <Image
                                    src={form.creator.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.creator.name) + '&size=200&background=171A20&color=FFD700&bold=true'}
                                    alt={form.creator.name}
                                    fill
                                    style={{ borderRadius: '28px', objectFit: 'cover' }}
                                    unoptimized={!form.creator.profilePhoto}
                                />
                                <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: primaryColor, padding: '6px', borderRadius: '50%', border: '4px solid #0a0a0a' }}>
                                    <ShieldCheck size={16} color="#fff" />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1.5px' }}>{t('hub.responsibleRole', { role: t(`common.badges.${(form.creator as any).role || 'mentor'}`) })}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {form.creator.name}
                                    {form.creator.isVerified && <PremiumBadge type="verified" size="md" showLabel={false} />}
                                </div>
                                <p style={{ fontSize: '1rem', opacity: 0.7, lineHeight: 1.6, maxWidth: '500px' }}>{form.creator.bio || t('hub.mentorDefaultBio')}</p>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                    {form.creator.socialLinks?.instagram && <a href={form.creator.socialLinks.instagram} style={{ color: '#fff', opacity: 0.8, transition: '0.2s' }}><Instagram size={20} /></a>}
                                    {form.creator.socialLinks?.linkedin && <a href={form.creator.socialLinks.linkedin} style={{ color: '#fff', opacity: 0.8, transition: '0.2s' }}><Linkedin size={20} /></a>}
                                </div>
                            </div>
                        </div>

                        {/* NOVAS SEÇÕES DE PERSONALIZAÇÃO */}

                        {form.welcomeMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '48px',
                                    padding: '60px',
                                    color: '#fff',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 40px 80px rgba(0,0,0,0.3)'
                                }}
                            >
                                {/* Decorative Glow */}
                                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: `${primaryColor}20`, filter: 'blur(80px)', borderRadius: '50%' }} />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h2 style={{
                                        margin: '0 0 30px 0',
                                        fontSize: '2.5rem',
                                        fontWeight: 800,
                                        fontFamily: 'var(--font-playfair), serif',
                                        background: `linear-gradient(to right, #fff, ${primaryColor}80)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {t('hub.welcome') || 'Boas-vindas'}
                                    </h2>

                                    <p style={{
                                        fontSize: '1.25rem',
                                        lineHeight: '1.8',
                                        whiteSpace: 'pre-wrap',
                                        opacity: 0.9,
                                        fontWeight: 500,
                                        color: '#f4f4f5'
                                    }}>
                                        {form.welcomeMessage}
                                    </p>

                                    <div style={{
                                        marginTop: '45px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px 24px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '24px',
                                        width: 'fit-content',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                                            <Image
                                                src={form.creator.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.creator.name)}
                                                alt={form.creator.name}
                                                fill
                                                style={{ borderRadius: '16px', objectFit: 'cover', border: `2px solid ${primaryColor}40` }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{form.creator.name}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('hub.eventRole', { role: t(`common.badges.${(form.creator as any).role || 'mentor'}`) })}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. Vídeo de Boas-Vindas */}
                        {form.welcomeVideo && (
                            <div style={{ borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', backgroundColor: '#000' }}>
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                    <iframe
                                        src={form.welcomeVideo.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title="Welcome Video"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 3. Campos Customizados */}
                        {form.customFields && form.customFields.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                                {form.customFields.map((field, idx) => (
                                    <div key={idx} style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                                            {field.label}
                                        </div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111', wordBreak: 'break-word', lineHeight: 1.4 }}>
                                            {field.value.startsWith('http') ? (
                                                <a href={field.value} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {field.value.length > 25 ? t('hub.accessExternalLink') : field.value} <LinkIcon size={16} />
                                                </a>
                                            ) : field.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 4. Aulas do Evento (HUB Lessons) */}
                        {lessons.length > 0 && (
                            <div style={{ background: '#fff', padding: '45px', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                {/* Progress Stats */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #0a0a0a 0%, #171A20 100%)',
                                    borderRadius: '24px',
                                    padding: '30px',
                                    marginBottom: '40px',
                                    color: '#fff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '20px',
                                    flexWrap: 'wrap'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Seu Progresso</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.completed} <span style={{ fontSize: '1rem', opacity: 0.5 }}>/ {stats.total} aulas</span></div>
                                    </div>
                                    <div style={{ flex: 1, maxWidth: '300px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                            <span>Concluído</span>
                                            <span style={{ fontWeight: 800, color: primaryColor }}>{stats.percentage}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats.percentage}%` }}
                                                style={{ height: '100%', background: primaryColor, borderRadius: '10px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
                                    <div style={{ padding: '10px', background: `${primaryColor}15`, borderRadius: '12px' }}>
                                        <Video size={26} color={primaryColor} />
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 700, color: '#111' }}>{t('dashboard.lessons') || 'Aulas do Evento'}</h2>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '20px',
                                    overflowX: 'auto',
                                    paddingBottom: '20px',
                                    scrollBehavior: 'smooth',
                                    WebkitOverflowScrolling: 'touch'
                                }}>

                                    {lessons.map((lesson, idx) => {
                                        const locked = isLessonLocked(lesson, idx);
                                        const completed = lesson.progress?.completed;

                                        return (
                                            <motion.div
                                                key={lesson._id}
                                                whileHover={!locked ? { y: -5 } : {}}
                                                onClick={() => {
                                                    if (!locked) {
                                                        setSelectedLesson(lesson);
                                                    } else {
                                                        toast.error(t('hub.lessonLockedError') || 'Complete a aula anterior para desbloquear esta!');
                                                    }
                                                }}
                                                style={{
                                                    minWidth: '300px',
                                                    maxWidth: '300px',
                                                    background: '#fbfbfb',
                                                    borderRadius: '24px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #f0f0f0',
                                                    cursor: locked ? 'not-allowed' : 'pointer',
                                                    opacity: locked ? 0.6 : 1,
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                                                    {lesson.thumbnailUrl ? (
                                                        <Image src={lesson.thumbnailUrl} alt={lesson.title} fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {locked ? <Loader2 size={32} color="#666" /> : <Play size={32} color={primaryColor} />}
                                                        </div>
                                                    )}

                                                    {/* Overlays */}
                                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />

                                                    {locked && (
                                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <div style={{ color: '#fff', fontSize: '2rem' }}>🔒</div>
                                                        </div>
                                                    )}

                                                    {completed && (
                                                        <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#10b981', color: '#fff', padding: '6px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                                                            <CheckCircle2 size={12} /> {t('hub.completedStatus') || 'Finalizada'}
                                                        </div>
                                                    )}

                                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', color: '#fff' }}>
                                                        {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                                                    </div>
                                                </div>
                                                <div style={{ padding: '20px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Aula {idx + 1}</div>
                                                        {!locked && !completed && (
                                                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{t('hub.pendingStatus') || 'Não iniciada'}</div>
                                                        )}
                                                    </div>
                                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: '#111', lineHeight: 1.3 }}>{lesson.title}</h3>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{lesson.description}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Modal do Player de Aula na HUB */}
                        <AnimatePresence>
                            {selectedLesson && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                                    onClick={() => setSelectedLesson(null)}
                                >
                                    <div style={{ width: '100%', maxWidth: '1000px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                                        <button onClick={() => setSelectedLesson(null)} style={{ position: 'absolute', top: '-50px', right: '0', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                            <X size={32} />
                                        </button>
                                        <div style={{ background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,1)' }}>
                                            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                <iframe
                                                    src={selectedLesson.videoUrl.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                            <div style={{ padding: '30px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h2 style={{ margin: '0 0 10px 0', color: '#000' }}>{selectedLesson.title}</h2>
                                                    <p style={{ margin: 0, color: '#666', lineHeight: 1.5 }}>{selectedLesson.description}</p>
                                                </div>
                                                {!selectedLesson.progress?.completed && (
                                                    <button
                                                        onClick={() => markLessonComplete(selectedLesson._id)}
                                                        style={{
                                                            background: '#10b981',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '12px 24px',
                                                            borderRadius: '12px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            transition: '0.2s',
                                                            boxShadow: '0 10px 20px rgba(16,185,129,0.2)'
                                                        }}
                                                    >
                                                        <CheckCircle2 size={18} /> {t('hub.markAsComplete') || 'Concluir Aula'}
                                                    </button>
                                                )}
                                                {selectedLesson.progress?.completed && (
                                                    <div style={{ color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CheckCircle2 size={24} /> {t('hub.lessonCompleted') || 'Aula Concluída!'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 5. Agenda */}
                        {form.agenda && form.agenda.length > 0 && (
                            <div style={{ background: '#fff', padding: '45px', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
                                    <div style={{ padding: '10px', background: `${primaryColor}15`, borderRadius: '12px' }}>
                                        <Calendar size={26} color={primaryColor} />
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 700, color: '#111' }}>{t('events.agenda')}</h2>
                                </div>
                                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                                    <div style={{ position: 'absolute', left: '0', top: '15px', bottom: '15px', width: '2px', background: '#f0f0f0' }}></div>
                                    {form.agenda.sort((a, b) => a.order - b.order).map((item, idx) => (
                                        <div key={idx} style={{ position: 'relative', paddingLeft: '35px', marginBottom: idx === (form.agenda!.length - 1) ? 0 : '40px' }}>
                                            <div style={{ position: 'absolute', left: '-6px', top: '6px', width: '14px', height: '14px', borderRadius: '50%', background: primaryColor, border: '3px solid #fff', boxShadow: '0 0 0 2px #f0f0f0' }}></div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginBottom: '6px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111' }}>{item.time}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, background: '#f4f4f4', padding: '2px 8px', borderRadius: '6px' }}>{item.duration}</div>
                                            </div>
                                            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: '#333' }}>{item.activity}</div>
                                            {item.description && <div style={{ color: '#666', fontSize: '1rem', lineHeight: '1.6' }}>{item.description}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. Materiais */}
                        {form.materials && form.materials.length > 0 && (
                            <div style={{ background: '#fff', padding: '45px', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
                                    <div style={{ padding: '10px', background: `${primaryColor}15`, borderRadius: '12px' }}>
                                        <BookOpen size={26} color={primaryColor} />
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 700, color: '#111' }}>{t('events.materials')}</h2>
                                </div>
                                <div style={{ display: 'grid', gap: '18px' }}>
                                    {form.materials.sort((a, b) => a.order - b.order).map((material, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: '#fbfbfb', borderRadius: '20px', border: '1px solid #f0f0f0', transition: '0.2s', cursor: 'pointer' /* hover effect handles by CSS globally usually */ }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
                                                    {material.type === 'pdf' && <FileText size={22} color="#e53e3e" />}
                                                    {material.type === 'video' && <Play size={22} color="#3182ce" />}
                                                    {material.type === 'link' && <LinkIcon size={22} color="#38a169" />}
                                                    {material.type === 'zip' && <Download size={22} color="#d69e2e" />}
                                                    {material.type === 'other' && <FileText size={22} color="#718096" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px', color: '#222' }}>{material.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>{material.type.toUpperCase()} • {material.size || 'Download'}</div>
                                                </div>
                                            </div>
                                            {!material.availableAfterEvent || new Date() > new Date(form.eventDate!) ? (
                                                <a href={material.url} target="_blank" style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                                                    <Download size={20} />
                                                </a>
                                            ) : (
                                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f0f0f0', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('hub.availableAfterEvent')}>
                                                    <div style={{ fontSize: '1.2rem' }}>🔒</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Ticket / QR */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ background: '#fff', borderRadius: '32px', padding: '25px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}
                        >
                            {/* Countdown Timer - Minimalista Premium */}
                            <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px dashed #eee' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px' }}>
                                    {t('hub.remainingTime')}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    {/* Column based layout for cards */}
                                    {[
                                        { val: countdown.days, label: t('hub.days') },
                                        { val: countdown.hours, label: t('hub.hours') },
                                        { val: countdown.minutes, label: t('hub.minutes') },
                                        { val: countdown.seconds, label: t('hub.seconds') }
                                    ].map((item, i) => (
                                        <div key={i} style={{ background: '#0a0a0a', borderRadius: '12px', padding: '12px 2px', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', minWidth: 0, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1, fontFamily: 'monospace' }}>{String(item.val).padStart(2, '0')}</div>
                                            <div style={{ fontSize: '0.55rem', opacity: 0.6, marginTop: '5px', textTransform: 'uppercase', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ borderTop: '1px dashed #eee', paddingTop: '25px', marginBottom: '25px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '5px' }}>{t('hub.digitalTicket')}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>ID: #{submission._id.slice(-8).toUpperCase()}</div>
                            </div>

                            <div style={{ display: 'grid', gap: '15px' }}>
                                {form.whatsappConfig?.communityUrl && (
                                    <a
                                        href={form.whatsappConfig.communityUrl}
                                        target="_blank"
                                        style={{
                                            background: '#111',
                                            color: '#fff',
                                            padding: '16px',
                                            borderRadius: '100px',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            fontSize: '0.9rem',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <MessageCircle size={20} /> {t('hub.joinGroup')}
                                    </a>
                                )}
                                <button style={{ background: '#f8f8f8', color: '#aaa', padding: '16px', borderRadius: '100px', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    🔒 {t('hub.addToWallet')}
                                </button>
                                {isApproved && form.certificateConfig?.enabled !== false && (
                                    (stats.total > 0 && stats.completed === stats.total) || (form.eventDate && new Date() >= new Date(form.eventDate)) ? (
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {(stats.total > 0 && stats.completed === stats.total) && submission.certificateStatus !== 'approved' && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                                        padding: '15px',
                                                        borderRadius: '16px',
                                                        color: '#10b981',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        lineHeight: 1.4
                                                    }}
                                                >
                                                    🎉 Parabéns! Você concluiu todas as aulas. {submission.certificateStatus === 'requested' ? 'Sua solicitação está em análise.' : 'Solicite seu certificado abaixo.'}
                                                </motion.div>
                                            )}

                                            {submission.certificateStatus === 'approved' ? (
                                                <button
                                                    onClick={() => {
                                                        const dataMap = (submission as SubmissionData).data || {};
                                                        const nameKey = Object.keys(dataMap).find(k =>
                                                            k.toLowerCase().includes('nome') ||
                                                            k.toLowerCase().includes('name')
                                                        );
                                                        const participantName = nameKey ? dataMap[nameKey] : t('hub.defaultParticipantName');

                                                        generateCertificate({
                                                            participantName: String(participantName),
                                                            eventTitle: form.title,
                                                            date: form.eventDate ? new Date(form.eventDate).toLocaleDateString() : t('common.toBeDefined'),
                                                            mentorName: form.creator.name,
                                                            id: submission._id,
                                                            config: form.certificateConfig
                                                        });
                                                        toast.success(t('hub.certificateSuccessToast'));
                                                    }}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #CFB53B 0%, #C5A028 100%)', // Vegas Gold
                                                        color: '#fff',
                                                        padding: '16px',
                                                        borderRadius: '100px',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        fontWeight: 800,
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        boxShadow: '0 10px 30px rgba(207,181,59,0.3)',
                                                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(207,181,59,0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(207,181,59,0.3)';
                                                    }}
                                                >
                                                    <Award size={20} /> {t('hub.downloadCertificate')}
                                                </button>
                                            ) : submission.certificateStatus === 'requested' ? (
                                                <div style={{
                                                    background: '#f8f8f8',
                                                    color: '#666',
                                                    padding: '16px',
                                                    borderRadius: '100px',
                                                    border: '1px solid #e0e0e0',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    width: '100%'
                                                }}>
                                                    <Clock size={18} /> {t('hub.status.waitingApproval', { role: t(`common.badges.${(form.creator as any).role || 'mentor'}`) })}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handleRequestCertificate}
                                                    style={{
                                                        background: '#111',
                                                        color: '#fff',
                                                        padding: '16px',
                                                        borderRadius: '100px',
                                                        border: 'none',
                                                        fontWeight: 800,
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <Award size={20} /> Solicitar Certificado
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            disabled
                                            style={{
                                                background: '#f8f8f8',
                                                color: '#aaa',
                                                padding: '16px',
                                                borderRadius: '100px',
                                                border: '2px dashed #e0e0e0',
                                                fontWeight: 800,
                                                fontSize: '0.9rem',
                                                cursor: 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                width: '100%'
                                            }}
                                            title={t('hub.certificateAvailableAfter')}
                                        >
                                            🔒 {t('hub.certificateComingSoon')}
                                        </button>
                                    )
                                )}
                            </div>

                            <p style={{ marginTop: '20px', fontSize: '0.75rem', color: '#888', lineHeight: 1.4 }}>{t('hub.entryInstruction')}</p>
                        </motion.div>

                        {/* Order Info Mini Card */}
                        <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 600 }}>
                                <Info size={14} /> {t('hub.enrollmentDetails')}
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#5C5E62', display: 'grid', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{t('hub.financialStatus')}</span>
                                    <span style={{ fontWeight: 700, color: isApproved ? '#10b981' : '#f59e0b' }}>{submission.paymentStatus.toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{t('hub.requestedOn')}</span>
                                    <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Event Rating Section */}
                        {isApproved && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                style={{
                                    marginTop: '60px',
                                    background: '#fff',
                                    padding: '50px',
                                    borderRadius: '32px',
                                    border: '1px solid rgba(0,0,0,0.04)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                    textAlign: 'center'
                                }}
                            >
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px', color: '#111' }}>
                                    {t('feedback.eventRating.title')}
                                </h2>
                                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px' }}>
                                    {t('feedback.eventRating.subtitle')}
                                </p>

                                {!isRatingSubmitted ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <motion.button
                                                    key={star}
                                                    whileHover={{ scale: 1.2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setUserRating(star)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                                                >
                                                    <Star
                                                        size={48}
                                                        fill={(hoverRating || userRating) >= star ? (form.theme?.primaryColor || '#CFB53B') : 'none'}
                                                        color={(hoverRating || userRating) >= star ? (form.theme?.primaryColor || '#CFB53B') : '#ddd'}
                                                        style={{ transition: 'all 0.2s ease' }}
                                                    />
                                                </motion.button>
                                            ))}
                                        </div>

                                        {userRating > 0 && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={async () => {
                                                    try {
                                                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/contact`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                name: submission?.data?.name || 'Participante',
                                                                email: submission?.data?.email || 'N/A',
                                                                subject: `[RATING] ${form.title}`,
                                                                message: `O participante avaliou o evento com ${userRating}/5 estrelas.`
                                                            })
                                                        });
                                                        setIsRatingSubmitted(true);
                                                        toast.success(t('feedback.eventRating.success'));
                                                    } catch (error) {
                                                        console.error('Error submitting rating:', error);
                                                        toast.error('Erro ao enviar avaliação. Tente novamente.');
                                                    }
                                                }}
                                                style={{
                                                    background: '#111',
                                                    color: '#fff',
                                                    padding: '16px 40px',
                                                    borderRadius: '100px',
                                                    border: 'none',
                                                    fontWeight: 800,
                                                    fontSize: '1rem',
                                                    cursor: 'pointer',
                                                    marginTop: '10px',
                                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {t('feedback.eventRating.button')}
                                            </motion.button>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ color: '#10b981', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <CheckCircle2 size={24} /> {t('feedback.eventRating.success')}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <AdBanner slot="5589508956" format="fluid" />
                </div>

                {/* Footer Section */}
                <footer style={{ marginTop: '100px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '20px' }}>{t('hub.footerCopyright')}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
                        <Link href="/suporte" style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>{t('hub.support')}</Link>
                        <Link href="/privacidade" style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>{t('hub.privacy')}</Link>
                        <Link href="/privacidade#termos" style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>{t('hub.terms')}</Link>
                    </div>
                </footer>

            </div>

            <CommunityChat
                formId={String(submission.form._id)}
                isApproved={isApproved || isCreatorOrAdmin}
                primaryColor={primaryColor}
                eventTitle={form.title}
                creatorId={form.creator?._id}
            />

            <style jsx>{`
                @media (max-width: 1024px) {
                    .hub-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .hub-grid > div:last-child {
                        position: relative !important;
                        top: 0 !important;
                    }
                }
                @media (max-width: 640px) {
                    nav div {
                        justify-content: center !important;
                    }
                    nav button {
                        display: none !important;
                    }
                }
            `}</style>
        </main>
    );
}

export default function ParticipantHub() {
    return (
        <Suspense fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
                <Loader2 className="animate-spin" size={40} color="#171A20" />
            </div>
        }>
            <HubContent />
        </Suspense>
    );
}
