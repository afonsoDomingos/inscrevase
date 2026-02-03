"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';

import { authService, UserData } from '@/lib/authService';
import { formService, FormModel } from '@/lib/formService';
import { financeService } from '@/lib/financeService';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import PremiumBadge from '@/components/common/PremiumBadge';
import {
    LogOut,
    Loader2,
    Ticket,
    Compass,
    User,
    Menu,
    ChevronLeft,
    Bell,
    Calendar,
    Award,
    Crown,
    Search,
    MapPin,
    Zap,
    MessageCircle,
    Map as MapIcon,
    LifeBuoy,
    Plus,
    Newspaper,
    Video
} from 'lucide-react';
import ProfileModal from '@/components/mentor/ProfileModal';
import SupportModal from '@/components/mentor/SupportModal';
import OnboardingTour, { Step } from '@/components/mentor/OnboardingTour';
import { supportService } from '@/lib/supportService';
import { submissionService, SubmissionModel } from '@/lib/submissionService';
import ThemeToggle from '@/components/common/ThemeToggle';
import InternalBlogView from '@/components/common/InternalBlogView';

import InternalPlansView from '@/components/common/InternalPlansView';
import ParticipantLessons from '@/components/participant/ParticipantLessons';

type Tab = 'tickets' | 'explore' | 'lessons' | 'certificates' | 'blog' | 'plans' | 'profile';

export default function ParticipantDashboard() {
    const { t } = useTranslate();
    const CATEGORIES = [
        { id: 'Todos', label: t('categories.all') },
        { id: 'Negócios', label: t('categories.business') },
        { id: 'Tecnologia', label: t('categories.technology') },
        { id: 'Arte & Música', label: t('categories.artMusic') },
        { id: 'Educação', label: t('categories.education') },
        { id: 'Saúde & Bem-estar', label: t('categories.healthWellness') },
        { id: 'Outros', label: t('categories.others') }
    ];
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('tickets');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Explore State
    const [exploreEvents, setExploreEvents] = useState<FormModel[]>([]);
    const [exploreLoading, setExploreLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');

    // Upgrade State
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [unreadSupport, setUnreadSupport] = useState(0);
    const [targetMentor, setTargetMentor] = useState<{ id: string, name: string } | null>(null);
    const [tickets, setTickets] = useState<SubmissionModel[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);

    const availableMentors = useMemo(() => {
        const mentorsMap = new Map();
        tickets.forEach(ticket => {
            if (ticket?.form?.creator) {
                mentorsMap.set(ticket.form.creator._id, ticket.form.creator);
            }
        });
        return Array.from(mentorsMap.values());
    }, [tickets]);

    const participantSteps: Step[] = [
        {
            targetId: 'welcome-modal',
            title: t('dashboard.settings.participantTour.welcome.title'),
            description: t('dashboard.settings.participantTour.welcome.desc'),
            position: 'center'
        },
        {
            targetId: 'participant-nav-explore',
            title: t('dashboard.settings.participantTour.explore.title'),
            description: t('dashboard.settings.participantTour.explore.desc'),
            position: 'right'
        },
        {
            targetId: 'participant-nav-tickets',
            title: t('dashboard.settings.participantTour.tickets.title'),
            description: t('dashboard.settings.participantTour.tickets.desc'),
            position: 'right'
        },
        {
            targetId: 'participant-nav-certificates',
            title: t('dashboard.settings.participantTour.certificates.title'),
            description: t('dashboard.settings.participantTour.certificates.desc'),
            position: 'right'
        },
        {
            targetId: 'participant-nav-profile',
            title: t('dashboard.settings.participantTour.profile.title'),
            description: t('dashboard.settings.participantTour.profile.desc'),
            position: 'right'
        }
    ];

    const handleUpgrade = async (plan: string) => {
        if (plan === 'enterprise') {
            toast.info(t('plans.enterpriseContact'));
            return;
        }

        setUpgradeLoading(true);
        try {
            const response = await financeService.createSubscription(plan);
            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error: unknown) {
            console.error('Upgrade Error:', error);
            const message = error instanceof Error ? error.message : 'Erro ao processar assinatura';
            toast.error(message);
        } finally {
            setUpgradeLoading(false);
        }
    };

    const handleRestoreMentor = async () => {
        setUpgradeLoading(true);
        try {
            await authService.restoreMentor();
            toast.success(t('dashboard.mentorModeRestored'));
            router.push('/dashboard/mentor');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro ao restaurar modo mentor';
            toast.error(message);
        } finally {
            setUpgradeLoading(false);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userProfile = await authService.getProfile();
                if (userProfile.role !== 'participant') {
                    router.push('/dashboard/mentor');
                    return;
                }
                setUser(userProfile);

                // Fetch unread support
                const supportData = await supportService.getUnreadCount();
                setUnreadSupport(supportData.count);

                // Fetch tickets
                const ticketsData = await submissionService.getParticipantSubmissions();
                setTickets(ticketsData);
            } catch (error) {
                console.error("Error loading profile:", error);
                router.push('/entrar');
            } finally {
                setLoading(false);
                setTicketsLoading(false);
            }
        };
        loadProfile();

        // Poll for unread count
        const interval = setInterval(async () => {
            try {
                const data = await supportService.getUnreadCount();
                setUnreadSupport(data.count);
            } catch { }
        }, 30000);

        return () => clearInterval(interval);
    }, [router]);

    // Handle initial mobile check and window resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1024);
            if (window.innerWidth > 1024) {
                setIsMobileSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchExploreEvents = useCallback(async () => {
        setExploreLoading(true);
        try {
            const data = await formService.getExploreEvents(selectedCategory, searchQuery);
            setExploreEvents(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar eventos');
        } finally {
            setExploreLoading(false);
        }
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        if (activeTab === 'explore') {
            fetchExploreEvents();
        }
    }, [activeTab, selectedCategory, fetchExploreEvents]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchExploreEvents();
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', position: 'relative', overflowX: 'hidden' }}>
            {/* Mobile Toggle Button */}
            {isMobile && (
                <button
                    className="mobile-sidebar-toggle"
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    style={{
                        position: 'fixed',
                        top: '1.25rem',
                        left: '1.25rem',
                        zIndex: 2001,
                        background: '#1a1a1a',
                        color: '#FFD700',
                        border: '1px solid #FFD700',
                        borderRadius: '10px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    {isMobileSidebarOpen ? <Plus style={{ transform: 'rotate(45deg)' }} size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isMobileSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1999
                        }}
                    />
                )}
            </AnimatePresence>
            {/* Sidebar */}
            <aside style={{
                width: isMobile ? '280px' : (isSidebarCollapsed ? '80px' : '280px'),
                transform: isMobile ? (isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'var(--paper)',
                color: 'var(--foreground)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                zIndex: 2000,
                boxShadow: isMobile && !isMobileSidebarOpen ? 'none' : '4px 0 20px rgba(0,0,0,0.2)',
                overflowX: 'hidden'
            }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', borderBottom: '1px solid #333' }}>
                    {!isSidebarCollapsed && (
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}
                        >
                            Inscreva<span className="gold-text">.se</span>
                        </motion.h2>
                    )}
                    {!isMobile && (
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: isSidebarCollapsed ? '#FFD700' : '#666',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px',
                                transition: 'color 0.2s'
                            }}
                        >
                            {isSidebarCollapsed ? <Menu size={24} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                </div>

                <nav style={{ padding: '1rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { id: 'tickets', label: t('dashboard.myTickets'), icon: <Ticket size={20} /> },
                        { id: 'explore', label: t('dashboard.exploreEvents'), icon: <Compass size={20} /> },
                        { id: 'lessons', label: 'Aulas', icon: <Video size={20} /> },
                        { id: 'certificates', label: t('dashboard.myCertificates'), icon: <Award size={20} /> },
                        { id: 'blog', label: t('dashboard.blogArticles'), icon: <Newspaper size={20} /> },
                        { id: 'plans', label: t('dashboard.finance.viewPlans'), icon: <Crown size={20} /> },
                        { id: 'profile', label: t('dashboard.myAccount'), icon: <User size={20} /> },
                    ].map((item: { id: string; label: string; icon: React.ReactNode; link?: string }) => (
                        <button
                            key={item.id}
                            id={`participant-nav-${item.id}`}
                            onClick={() => {
                                if (item.link) {
                                    router.push(item.link);
                                } else {
                                    setActiveTab(item.id as Tab);
                                }
                            }}
                            title={isSidebarCollapsed ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: '12px 16px',
                                background: activeTab === item.id ? 'var(--gold-gradient)' : 'transparent',
                                color: activeTab === item.id ? '#000' : '#aaa',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: activeTab === item.id ? 700 : 500,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                                    e.currentTarget.style.color = '#FFD700';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#aaa';
                                }
                            }}
                        >
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="active-indicator-participant"
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        width: '4px',
                                        height: '24px',
                                        background: '#FFD700',
                                        borderTopRightRadius: '4px',
                                        borderBottomRightRadius: '4px'
                                    }}
                                />
                            )}
                            <div style={{ opacity: activeTab === item.id ? 1 : 0.7, minWidth: '24px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                            {!isSidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </button>
                    ))}

                    <button
                        onClick={() => window.dispatchEvent(new Event('start-onboarding'))}
                        title={isSidebarCollapsed ? t('dashboard.settings.guidedTour') : ""}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                            gap: '12px',
                            padding: '0.75rem 1rem',
                            width: '100%',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#FFD700',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'left',
                            fontSize: '0.95rem',
                            marginTop: '0.5rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <MapIcon size={20} />
                        {!isSidebarCollapsed && t('dashboard.settings.guidedTour')}
                    </button>
                </nav>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={() => { setTargetMentor(null); setIsSupportOpen(true); }}
                        title={isSidebarCollapsed ? t('dashboard.support') : ""}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: 'var(--paper-hover)',
                            border: '1px solid #FFD700',
                            borderRadius: '12px',
                            color: '#FFD700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            position: 'relative'
                        }}
                    >
                        <LifeBuoy size={18} />
                        {!isSidebarCollapsed && t('dashboard.support')}
                        {unreadSupport > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: '#ef4444',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                border: '2px solid #1a1a1a'
                            }}>
                                {unreadSupport}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => authService.logout()}
                        title={isSidebarCollapsed ? t('common.logout') : ""}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: 'var(--paper-hover)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: '#e53e3e',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={18} />
                        {!isSidebarCollapsed && t('common.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px'),
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flex: 1,
                padding: isMobile ? '1.5rem' : '2.5rem',
                paddingTop: isMobile ? '5rem' : '2.5rem',
                minHeight: '100vh',
                maxWidth: isMobile ? '100%' : `calc(100vw - ${isSidebarCollapsed ? '80px' : '280px'})`,
                overflowX: 'hidden'
            }}>
                {/* Header */}
                <header style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '1.5rem' : '3rem',
                    marginBottom: '3rem'
                }}>
                    <div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{
                                fontSize: isMobile ? '1.5rem' : '2rem',
                                fontWeight: 800,
                                fontFamily: 'var(--font-playfair)',
                                lineHeight: 1.2,
                                color: 'var(--foreground)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {!isMobile && t('common.hello') + ', '}
                            <span className="gold-text" style={{ wordBreak: 'break-word' }}>
                                {(user?.name || t('common.user')).split(' ')[0]}
                            </span>
                        </motion.h1>
                        <p style={{
                            color: '#666',
                            marginTop: '0.4rem',
                            fontSize: isMobile ? '0.9rem' : '1.05rem',
                            fontWeight: 500,
                            maxWidth: isMobile ? '280px' : 'none',
                            lineHeight: 1.4
                        }}>
                            {t('dashboard.participantWelcomeDesc')}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <ThemeToggle />
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #eee',
                            cursor: 'pointer'
                        }}>
                            <Bell size={20} color="#333" />
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #FFD700' }}>
                            {user.profilePhoto ? (
                                <Image src={user.profilePhoto} alt={user.name} width={48} height={48} style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#000', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'tickets' && (
                        <motion.div
                            key="tickets"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {ticketsLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                    <Loader2 className="animate-spin" size={40} color="#FFD700" />
                                </div>
                            ) : tickets.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                    {tickets.map(ticket => {
                                        if (!ticket?.form) return null;
                                        return (
                                            <div key={ticket._id} style={{ position: 'relative' }}>
                                                <Link href={`/hub/${ticket._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                                    <div style={{
                                                        background: 'var(--paper)',
                                                        borderRadius: '24px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                                        border: '1px solid var(--border)',
                                                        transition: 'transform 0.2s',
                                                        cursor: 'pointer'
                                                    }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                    >
                                                        <div style={{ position: 'relative', height: '160px' }}>
                                                            <Image
                                                                src={ticket.form.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'}
                                                                alt={ticket.form.title}
                                                                fill
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '12px',
                                                                right: '12px',
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                background: ticket.status === 'rejected' ? '#ef4444' : (ticket.status === 'approved' || ticket.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'),
                                                                color: '#fff',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700
                                                            }}>
                                                                {ticket.status === 'rejected' ? t('hub.status.rejected') : ((ticket.status === 'approved' || ticket.paymentStatus === 'paid') ? t('hub.status.confirmed') : t('hub.status.pending'))}
                                                            </div>
                                                        </div>
                                                        <div style={{ padding: '1.5rem' }}>
                                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--foreground)' }}>{ticket.form.title}</h3>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                                    <Calendar size={16} />
                                                                    {ticket.form.eventDate ? new Date(ticket.form.eventDate).toLocaleDateString() : t('common.toBeDefined')} {ticket.form.eventTime ? `${t('common.atTime')} ${ticket.form.eventTime}` : ''}
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                                                    <MapPin size={16} />
                                                                    {ticket.form.location || 'Online'}
                                                                </div>
                                                            </div>
                                                            <button style={{
                                                                width: '100%',
                                                                marginTop: '1.5rem',
                                                                padding: '0.8rem',
                                                                borderRadius: '12px',
                                                                background: 'var(--secondary)',
                                                                color: 'var(--primary)',
                                                                border: 'none',
                                                                fontWeight: 700,
                                                                fontSize: '0.9rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '8px'
                                                            }}>
                                                                <Ticket size={18} /> {t('hub.viewAccess')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Link>

                                                {/* Delete Button - Outside the Link to avoid collision but positioned absolute */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (confirm(t('dashboard.cancelAlert'))) {
                                                            const handleDelete = async () => {
                                                                try {
                                                                    await submissionService.deleteSubmission(ticket._id);
                                                                    setTickets(prev => prev.filter(t => t._id !== ticket._id));
                                                                    toast.success(t('dashboard.cancelSuccess'));
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    toast.error(t('dashboard.cancelError'));
                                                                }
                                                            };
                                                            handleDelete();
                                                        }
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        left: '12px', // Opposite side of status
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                        zIndex: 10
                                                    }}
                                                    title="Cancelar Inscrição"
                                                >
                                                    <LogOut size={16} style={{ transform: 'rotate(180deg)' }} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '3rem',
                                    background: 'var(--paper)',
                                    borderRadius: '20px',
                                    textAlign: 'center',
                                    border: '1px dashed var(--border)'
                                }}>
                                    <div style={{ background: 'rgba(255,215,0,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <Ticket size={40} color="#DAA520" />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Você ainda não tem ingressos</h3>
                                    <p style={{ color: '#666', marginBottom: '2rem' }}>Inscreva-se em eventos para vê-los aqui.</p>
                                    <button
                                        onClick={() => setActiveTab('explore')}
                                        className="btn-primary"
                                        style={{ padding: '0.8rem 2rem', borderRadius: '50px' }}
                                    >
                                        Explorar Eventos
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'lessons' && (
                        <motion.div
                            key="lessons"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <ParticipantLessons />
                        </motion.div>
                    )}

                    {activeTab === 'explore' && (
                        <motion.div
                            key="explore"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Search and Filters */}
                            <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={20} color="#666" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Buscar eventos..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1rem 1rem 3rem',
                                                borderRadius: '12px',
                                                border: '1px solid #ddd',
                                                outline: 'none',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ borderRadius: '12px', padding: '0 2rem' }}>
                                        Buscar
                                    </button>
                                </form>

                                {/* Categories */}
                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' }}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: selectedCategory === cat.id ? '1px solid #FFD700' : '1px solid #ddd',
                                                background: selectedCategory === cat.id ? '#FFF8E1' : '#fff',
                                                color: selectedCategory === cat.id ? '#B8860B' : '#666',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.9rem',
                                                fontWeight: selectedCategory === cat.id ? 600 : 400,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Events Grid */}
                            {exploreLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                    <Loader2 className="animate-spin" size={40} color="#FFD700" />
                                </div>
                            ) : exploreEvents.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                                    <Compass size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <h3>{t('common.explorePage.noEventsTitle')}</h3>
                                    <p>{t('common.explorePage.noEventsDesc')}</p>
                                </div>
                            ) : (
                                <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                                    {exploreEvents.map(event => (
                                        <div key={event._id} className="luxury-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div style={{ height: '200px', background: '#f0f0f0', position: 'relative' }}>
                                                {event.coverImage ? (
                                                    <Image src={event.coverImage} alt={event.title} fill style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
                                                        <Ticket size={40} color="#333" />
                                                    </div>
                                                )}
                                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#FFD700', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    {event.eventType === 'modeOnline' ? 'ONLINE' : (event.eventType === 'modeHybrid' ? 'HYBRID' : 'OFFLINE')}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#DAA520', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {event.category || t('common.general')}
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3, flex: 1 }}>{event.title}</h3>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                                    {event.eventDate && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Calendar size={14} /> {new Date(event.eventDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {event.location && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            <MapPin size={14} /> {event.location}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <User size={14} /> {event.creator?.businessName || event.creator?.name || t('common.organizer')}
                                                        {event.creator?.isVerified && <PremiumBadge type="verified" size="sm" showLabel={false} />}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <Link href={`/f/${event.slug}`} style={{ flex: 1, textAlign: 'center', padding: '0.8rem', background: 'var(--secondary)', color: 'var(--primary)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, transition: 'transform 0.2s' }}>
                                                        {t('common.explorePage.viewDetails')}
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setTargetMentor({
                                                                id: event.creator?._id || '',
                                                                name: event.creator?.businessName || event.creator?.name || t('common.mentor')
                                                            });
                                                            setIsSupportOpen(true);
                                                        }}
                                                        style={{ background: '#FFF8E1', border: '1px solid #FFD700', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title={t('common.explorePage.chatWithMentor')}
                                                    >
                                                        <MessageCircle size={20} color="#DAA520" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="luxury-card">
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('dashboard.myAccount')}</h3>
                                <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f0f0', overflow: 'hidden' }}>
                                            {user.profilePhoto ? <Image src={user.profilePhoto} alt="" width={80} height={80} style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={30} /></div>}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {user.name}
                                                {user.isVerified && <PremiumBadge type="verified" size="md" showLabel={false} />}
                                            </h4>
                                            <p style={{ color: '#666', margin: 0 }}>{user.email}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{t('dashboard.accountType')}</p>
                                        <p style={{ margin: 0, fontWeight: 700, textTransform: 'capitalize' }}>{user.role === 'mentor' ? t('dashboard.mentor') : t('dashboard.visitor')}</p>
                                    </div>

                                    <button
                                        onClick={() => setIsProfileModalOpen(true)}
                                        style={{ padding: '0.8rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        {t('dashboard.editProfile')}
                                    </button>
                                </div>
                            </div>

                            {/* Upgrade to Mentor Section */}
                            <div className="luxury-card" style={{ marginTop: '2rem', border: '1px solid #FFD700', background: 'linear-gradient(135deg, #fff 0%, #FFF8E1 100%)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--gold-gradient)', padding: '12px', borderRadius: '12px' }}>
                                        <Award size={24} color="#000" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{t('dashboard.becomeMentor')}</h3>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t('dashboard.becomeMentorDesc')}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (user && user.plan && user.plan !== 'free' ? '1fr' : '1fr 1fr'), gap: '1.5rem' }}>
                                    {user && user.plan && user.plan !== 'free' ? (
                                        /* Restore Access if already has a plan */
                                        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #FFD700', textAlign: 'center', width: '100%' }}>
                                            <Zap size={32} color="#DAA520" style={{ marginBottom: '1rem' }} />
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('dashboard.activeSubscriptionDetected')}</h4>
                                            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                                                {t('dashboard.activeSubscriptionMessage', { plan: user.plan })}
                                            </p>
                                            <button
                                                onClick={handleRestoreMentor}
                                                disabled={upgradeLoading}
                                                className="btn-primary"
                                                style={{ padding: '0.8rem 2.5rem', borderRadius: '50px' }}
                                            >
                                                {upgradeLoading ? <Loader2 className="animate-spin" size={20} /> : t('dashboard.restoreMentorMode')}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Pro Plan */}
                                            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('plans.pro.name')}</span>
                                                    <span style={{ background: '#E3F2FD', color: '#1976D2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>POPULAR</span>
                                                </div>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>499 MT</span>
                                                    <span style={{ color: '#666', fontSize: '0.9rem' }}>/mês</span>
                                                </div>
                                                <ul style={{ padding: 0, listStyle: 'none', margin: '0 0 2rem 0', flex: 1 }}>
                                                    <li style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> {t('dashboard.unlimitedEvents')}
                                                    </li>
                                                    <li style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> {t('dashboard.platformFee')}: 10%
                                                    </li>
                                                    <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> {t('dashboard.plans.f3')}
                                                    </li>
                                                </ul>
                                                <button
                                                    onClick={() => handleUpgrade('pro')}
                                                    disabled={upgradeLoading}
                                                    className="btn-primary"
                                                    style={{ width: '100%', borderRadius: '8px', padding: '0.8rem' }}
                                                >
                                                    {upgradeLoading ? <Loader2 className="animate-spin" size={20} /> : t('dashboard.subscribePro')}
                                                </button>
                                            </div>

                                            {/* Enterprise Plan */}
                                            <div style={{ background: '#1a1a1a', color: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Enterprise</span>
                                                </div>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>4.990 MT</span>
                                                    <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>/mês</span>
                                                </div>
                                                <ul style={{ padding: 0, listStyle: 'none', margin: '0 0 2rem 0', flex: 1 }}>
                                                    <li style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> {t('dashboard.platformFee')}: 0%
                                                    </li>
                                                    <li style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> {t('dashboard.dedicatedAccountManager')}
                                                    </li>
                                                    <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> {t('dashboard.advancedCustomization')}
                                                    </li>
                                                </ul>
                                                <button
                                                    onClick={() => handleUpgrade('enterprise')}
                                                    disabled={upgradeLoading}
                                                    style={{ width: '100%', borderRadius: '8px', padding: '0.8rem', background: '#fff', color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    {upgradeLoading ? <Loader2 className="animate-spin" size={20} /> : t('dashboard.talkToSales')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'certificates' && (
                        <motion.div
                            key="certificates"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                background: 'var(--paper)',
                                borderRadius: '20px',
                                color: 'var(--text-muted)'
                            }}>
                                <Award size={48} style={{ marginBottom: '1rem', color: '#DAA520', opacity: 0.5 }} />
                                <h3>{t('dashboard.noCertificatesYet')}</h3>
                                <p>{t('dashboard.noCertificatesDesc')}</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'blog' && (
                        <motion.div
                            key="blog"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <InternalBlogView />
                        </motion.div>
                    )}

                    {activeTab === 'plans' && (
                        <motion.div
                            key="plans"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <InternalPlansView />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals & Tour */}
            {user && (
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={user}
                    onSuccess={() => {
                        toast.success('Perfil atualizado!');
                        authService.getProfile().then(setUser);
                    }}
                />
            )}

            <SupportModal
                isOpen={isSupportOpen}
                onClose={() => { setIsSupportOpen(false); setTargetMentor(null); }}
                mode="user"
                targetMentorId={targetMentor?.id}
                targetMentorName={targetMentor?.name}
                availableMentors={availableMentors}
            />

            <OnboardingTour
                steps={participantSteps}
                storageKey="participant-tour-seen"
            />

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                @media (max-width: 768px) {
                    .luxury-card {
                        padding: 1.5rem !important;
                    }
                }

                @media (min-width: 1025px) {
                    .mobile-sidebar-toggle {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
