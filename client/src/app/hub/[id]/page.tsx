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
    Sparkles,
    Calendar,
    Download,
    FileText,
    Link as LinkIcon,
    Play,
    BookOpen,
    X,
    LayoutDashboard,
    UserCircle
} from 'lucide-react';
import { authService, UserData } from '@/lib/authService';
import Image from 'next/image';
import { toast } from 'sonner';
import { generateCertificate } from '@/lib/certificateGenerator';
import { useTranslate } from '@/context/LanguageContext';
import MetaPixel from '@/components/MetaPixel';

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
            name: string;
            profilePhoto: string;
            bio: string;
            socialLinks?: {
                instagram?: string;
                linkedin?: string;
                website?: string;
            };
            facebookPixelId?: string;
        };
        theme: {
            primaryColor: string;
            backgroundColor: string;
        };
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

    useEffect(() => {
        setCurrentUser(authService.getCurrentUser());
    }, []);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setSubmission(data);
                    if (data.form.showVideoOnStart) {
                        setIsPlayerExpanded(true);
                    }
                    document.title = `${data.form.title} - Hub`;
                } else {
                    toast.error("Inscrição não encontrada");
                }
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar dados");
            } finally {
                setLoading(false);
            }
        };
        fetchSubmission();
    }, [id]);

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
            <h1>Inscrição não encontrada</h1>
            <button onClick={() => router.push('/')} style={{ marginTop: '1rem', color: '#171A20', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Voltar ao início</button>
        </div>
    );

    const { form } = submission;
    const primaryColor = form.theme?.primaryColor || '#E82127'; // Tesla Red if not defined
    const isApproved = submission.status === 'approved' || submission.paymentStatus === 'paid';

    return (
        <main style={{ minHeight: '100vh', background: `linear-gradient(to bottom, rgba(10,10,10,0.85), rgba(5,5,5,0.95)), url('${form.hubBackgroundImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'}')`, backgroundSize: 'cover', backgroundAttachment: 'fixed', color: '#fff', fontFamily: 'var(--font-inter), sans-serif', padding: '0' }}>
            {form.creator.facebookPixelId && <MetaPixel pixelId={form.creator.facebookPixelId} />}
            {/* Top Navigation Bar - Glass White */}
            <nav style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', zIndex: 100, padding: '15px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#171A20', transition: '0.2s' }}>
                        <ArrowLeft size={18} /> {t('common.back')}
                    </button>
                    <div style={{ fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#171A20' }}>
                        PASSAPORTE <span style={{ fontWeight: 500, color: '#666' }}>ID: {id?.toString().slice(-6).toUpperCase()}</span>
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
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 100px' }}>

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
                    <p style={{ color: '#d4d4d8', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Seu acesso exclusivo à plataforma de experiência.</p>
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
                                        title="Transmissão Ao Vivo"
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
                                        Assistir Transmissão (Clique para Abrir)
                                    </motion.button>
                                )
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }} className="hub-grid">

                    {/* Left Column: Details */}
                    <div style={{ display: 'grid', gap: '35px' }}>

                        {/* Event Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ background: '#fff', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', position: 'relative' }}
                        >
                            <div style={{ position: 'relative', width: '100%', height: '360px' }}>
                                <Image
                                    src={form.coverImage || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}
                                    alt={form.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    unoptimized={!form.coverImage}
                                />
                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)', color: '#fff' }}>
                                    <div style={{ display: 'flex', gap: '40px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{t('submissions.date')}</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{form.eventDate ? new Date(form.eventDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' }) : 'A definir'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{t('events.eventTimeLabel') || 'Horário'}</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                {form.eventTime || (form.eventDate ? new Date(form.eventDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : 'A definir')}
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
                                    <button style={{ marginTop: 'auto', background: '#f4f4f4', border: 'none', padding: '14px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>Explorar Rota</button>
                                </div>
                            ) : <div />}

                            {form.onlineLink ? (
                                <div style={{ background: '#fff', padding: '35px', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ background: '#f8f8f8', width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Video size={24} color="#333" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '6px' }}>{t('events.onlineLink')}</div>
                                        <div style={{ fontSize: '0.95rem', color: '#666' }}>Link disponível na sua cabine</div>
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
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1.5px' }}>{t('hub.responsibleMentor')}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>{form.creator.name}</div>
                                <p style={{ fontSize: '1rem', opacity: 0.7, lineHeight: 1.6, maxWidth: '500px' }}>{form.creator.bio || t('hub.mentorDefaultBio')}</p>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                    {form.creator.socialLinks?.instagram && <a href={form.creator.socialLinks.instagram} style={{ color: '#fff', opacity: 0.8, transition: '0.2s' }}><Instagram size={20} /></a>}
                                    {form.creator.socialLinks?.linkedin && <a href={form.creator.socialLinks.linkedin} style={{ color: '#fff', opacity: 0.8, transition: '0.2s' }}><Linkedin size={20} /></a>}
                                </div>
                            </div>
                        </div>

                        {/* NOVAS SEÇÕES DE PERSONALIZAÇÃO */}

                        {/* 1. Mensagem de Boas-Vindas */}
                        {form.welcomeMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                    borderRadius: '32px',
                                    padding: '45px',
                                    color: '#fff',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '14px' }}>
                                            <Sparkles size={24} color="#fbbf24" />
                                        </div>
                                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{t('hub.welcome')}</h2>
                                    </div>
                                    <p style={{ fontSize: '1.15rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', opacity: 0.9 }}>
                                        &ldquo;{form.welcomeMessage}&rdquo;
                                    </p>
                                    <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                        <Image
                                            src={form.creator.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.creator.name)}
                                            alt={form.creator.name}
                                            width={44}
                                            height={44}
                                            style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }}
                                        />
                                        <div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{form.creator.name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{t('hub.eventMentor')}</div>
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

                        {/* 4. Agenda */}
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
                                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f0f0f0', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Disponível após o evento">
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
                            style={{ background: '#fff', borderRadius: '32px', padding: '35px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}
                        >
                            {/* Countdown Timer - Minimalista Premium */}
                            <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px dashed #eee' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px' }}>
                                    {t('hub.remainingTime')}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    {[
                                        { val: countdown.days, label: t('hub.days') },
                                        { val: countdown.hours, label: t('hub.hours') },
                                        { val: countdown.minutes, label: t('hub.minutes') },
                                        { val: countdown.seconds, label: t('hub.seconds') }
                                    ].map((item, i) => (
                                        <div key={i} style={{ background: '#0a0a0a', borderRadius: '16px', padding: '15px 5px', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1, fontFamily: 'monospace' }}>{String(item.val).padStart(2, '0')}</div>
                                            <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '6px', textTransform: 'uppercase', fontWeight: 600 }}>{item.label}</div>
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
                                {isApproved && (
                                    (!form.eventDate || new Date() < new Date(form.eventDate)) ? (
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
                                                gap: '8px'
                                            }}
                                            title={t('hub.certificateAvailableAfter')}
                                        >
                                            🔒 {t('hub.certificateComingSoon')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                const dataMap = (submission as SubmissionData).data || {};
                                                const nameKey = Object.keys(dataMap).find(k =>
                                                    k.toLowerCase().includes('nome') ||
                                                    k.toLowerCase().includes('name')
                                                );
                                                const participantName = nameKey ? dataMap[nameKey] : "Participante";

                                                generateCertificate({
                                                    participantName: String(participantName),
                                                    eventTitle: form.title,
                                                    date: form.eventDate ? new Date(form.eventDate).toLocaleDateString() : 'A definir',
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
                                                transition: 'transform 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <Award size={20} /> {t('hub.downloadCertificate')}
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
                    </div>
                </div>

                {/* Footer Section */}
                <footer style={{ marginTop: '100px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '20px' }}>{t('hub.footerCopyright')}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
                        <a href="#" style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>{t('hub.support')}</a>
                        <a href="#" style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>{t('hub.privacy')}</a>
                        <a href="#" style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>{t('hub.terms')}</a>
                    </div>
                </footer>

            </div>

            <style jsx>{`
                @media (max-width: 900px) {
                    .hub-grid {
                        grid-template-columns: 1fr !important;
                    }
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
