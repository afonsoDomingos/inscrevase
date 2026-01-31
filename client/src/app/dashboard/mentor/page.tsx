"use client";

import { useEffect, useState, useCallback } from 'react';
import { authService, UserData } from '@/lib/authService';
import { useRouter, useSearchParams } from 'next/navigation';
import { dashboardService, AdminStats } from '@/lib/dashboardService';
import { formService, FormModel } from '@/lib/formService';
import { toast } from 'sonner';
import CreateEventModal from '@/components/mentor/CreateEventModal';
import ProfileModal from '@/components/mentor/ProfileModal';
import SubmissionManagement from '@/components/mentor/SubmissionManagement';
import MentorSettings from '@/components/mentor/MentorSettings';
import EditEventModal from '@/components/mentor/EditEventModal';
import SupportModal from '@/components/mentor/SupportModal';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import { Pencil } from 'lucide-react';
import { supportService } from '@/lib/supportService';

import NotificationCenter from '@/components/mentor/NotificationCenter';
import { notificationService } from '@/lib/notificationService';

import EditEventThemeModal from '@/components/mentor/EditEventThemeModal';
import AnalyticsCharts from '@/components/mentor/AnalyticsCharts';
import OnboardingTour, { Step } from '@/components/mentor/OnboardingTour';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    ArrowRight,
    FileText,
    Users,
    CheckCircle,
    LogOut,
    Loader2,
    LayoutDashboard,
    Settings,
    Copy,
    Trash2,
    User as UserIcon,
    Palette,
    DollarSign,
    PieChart,
    LifeBuoy,
    Eye,
    Crown,
    Lock,
    AlertCircle,
    Bell,
    Map,
    ChevronLeft,
    Menu,
    Newspaper,
    Video,
    Award
} from 'lucide-react';
import Image from 'next/image';
import StripeConnect from '../../../components/StripeConnect';
import EarningsDashboard from '../../../components/EarningsDashboard';
import PlanUpgradeModal from '../../../components/PlanUpgradeModal';

import InternalPlansView from '@/components/common/InternalPlansView';
import PremiumBadge from '@/components/common/PremiumBadge';
import InternalBlogView from '@/components/common/InternalBlogView';
import ThemeToggle from '@/components/common/ThemeToggle';

type Tab = 'overview' | 'forms' | 'submissions' | 'reports' | 'settings' | 'earnings' | 'blog' | 'plans';

import { Suspense } from 'react';

function MentorDashboardContent() {
    const { t } = useTranslate();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [forms, setForms] = useState<FormModel[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [editModalData, setEditModalData] = useState<{ isOpen: boolean; form: FormModel | null }>({ isOpen: false, form: null });
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedSubmissionFormId, setSelectedSubmissionFormId] = useState<string | null>(null);
    const [themeModalData, setThemeModalData] = useState<{ isOpen: boolean; form: FormModel | null }>({ isOpen: false, form: null });
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

    const steps: Step[] = [
        {
            targetId: 'welcome-modal', // Virtual target for center modal
            title: t('dashboard.settings.tour.welcome.title'),
            description: t('dashboard.settings.tour.welcome.desc'),
            position: 'center'
        },
        {
            targetId: 'mentor-create-btn',
            title: t('dashboard.settings.tour.create.title'),
            description: t('dashboard.settings.tour.create.desc'),
            position: 'bottom'
        },
        {
            targetId: 'mentor-stats-grid',
            title: t('dashboard.settings.tour.stats.title'),
            description: t('dashboard.settings.tour.stats.desc'),
            position: 'bottom'
        },
        {
            targetId: 'mentor-support-btn',
            title: t('dashboard.settings.tour.support.title'),
            description: t('dashboard.settings.tour.support.desc'),
            position: 'right'
        },
        {
            targetId: 'mentor-profile-photo',
            title: t('dashboard.settings.tour.profile.title'),
            description: t('dashboard.settings.tour.profile.desc'),
            position: 'left'
        }
    ];

    const loadDashboard = useCallback(async () => {
        try {
            const [userProfile, statsData, formsData] = await Promise.all([
                authService.getProfile(),
                dashboardService.getMentorStats().catch(() => null), // Fail gracefully if not mentor yet
                formService.getMyForms().catch(() => [])
            ]);

            setUser(userProfile);

            // Redirect if not a mentor or admin
            if (userProfile.role === 'participant') {
                const isSubscribing = searchParams.get('subscription') === 'success';
                if (isSubscribing) {
                    console.log("Waiting for role update...");
                    // Don't redirect, let the polling effect handle it
                    return;
                }
                router.push('/dashboard/participant');
                return;
            }

            setStats(statsData);
            setForms(formsData);
        } catch (error: unknown) {
            console.error("Dashboard error:", error);
            // If unauthorized, redirect to login
            if (error instanceof Error && (error.message.includes('401') || error.message.includes('Falha ao buscar perfil'))) {
                router.push('/entrar');
            }
        } finally {
            // Only set loading false if we are not waiting for subscription
            if (searchParams.get('subscription') !== 'success') {
                setLoading(false);
            }
        }
    }, [router, searchParams]);

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

    // Polling effect for subscription upgrade
    useEffect(() => {
        if (searchParams.get('subscription') === 'success') {
            setLoading(true);
            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
                try {
                    // Try to sync periodically if stuck
                    if (attempts % 3 === 0) {
                        const token = authService.getToken();
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/subscription/sync`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        }).catch(err => console.log('Sync attempt failed', err));
                    }

                    const profile = await authService.getProfile();
                    if (profile.role === 'mentor' && profile.plan !== 'free') {
                        setUser(profile);
                        setLoading(false);
                        setShowUpgradeSuccess(true);
                        clearInterval(interval);
                        router.replace('/dashboard/mentor'); // clear param

                        // Reload data
                        const [statsData, formsData] = await Promise.all([
                            dashboardService.getMentorStats().catch(() => null),
                            formService.getMyForms().catch(() => [])
                        ]);
                        setStats(statsData);
                        setForms(formsData);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [searchParams, router, t]);

    const loadUnreadCounts = useCallback(async () => {
        try {
            const [supportData, notificationData] = await Promise.all([
                supportService.getUnreadCount(),
                notificationService.getUnreadCount()
            ]);
            setUnreadCount(supportData.count);
            setUnreadNotifications(notificationData.count);
        } catch (error) {
            console.error('Error loading unread counts:', error);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
        loadUnreadCounts();

        // Poll for unread count every 30 seconds
        const interval = setInterval(loadUnreadCounts, 30000);
        return () => clearInterval(interval);
    }, [loadDashboard, loadUnreadCounts]);

    const copyToClipboard = (slug: string) => {
        const url = `${window.location.origin}/f/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success(t('common.copyLinkSuccess'));
    };

    const handleToggleStatus = async (form: FormModel) => {
        try {
            await formService.toggleFormStatus(form._id, !form.active);
            await loadDashboard();
        } catch (error: unknown) {
            console.error(error);
            toast.error(t('common.updateStatusError'));
        }
    };

    const handleDeleteForm = async (id: string) => {
        if (confirm(t('common.confirmDelete'))) {
            try {
                await formService.deleteForm(id);
                toast.success(t('common.deleteFormSuccess'));
                await loadDashboard();
            } catch (error: unknown) {
                console.error(error);
                toast.error(t('common.deleteFormError'));
            }
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        );
    }

    if (!user) {
        if (!loading) router.push('/entrar');
        return null;
    }

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

                <nav style={{ padding: '1rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {[
                        { id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={20} /> },
                        { id: 'forms', label: t('dashboard.myEvents'), icon: <FileText size={20} /> },
                        { id: 'blog', label: t('dashboard.blogArticles'), icon: <Newspaper size={20} /> },
                        { id: 'submissions', label: t('dashboard.submissions'), icon: <Users size={20} /> },
                        { id: 'earnings', label: t('dashboard.settings.earnings'), icon: <DollarSign size={20} /> },
                        { id: 'reports', label: t('dashboard.reports'), icon: <PieChart size={20} /> },
                        { id: 'plans', label: t('dashboard.finance.viewPlans'), icon: <Crown size={20} /> },
                        { id: 'lessons', label: 'Aulas', icon: <Video size={20} />, link: '/dashboard/mentor/lessons' },
                        { id: 'certificates', label: 'Certificados', icon: <Award size={20} />, link: '/dashboard/mentor/certificates' },
                        { id: 'settings', label: t('dashboard.myAccount'), icon: <Settings size={20} /> },
                    ].map((item: { id: string; label: string; icon: React.ReactNode; link?: string }) => (
                        <button
                            key={item.id}
                            id={`mentor-nav-${item.id}`}
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
                                position: 'relative', // Added for the active indicator
                                overflow: 'hidden' // Added for the active indicator
                            }}
                        >
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="active-indicator"
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
                            fontSize: '0.95rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Map size={20} />
                        {!isSidebarCollapsed && t('dashboard.settings.guidedTour')}
                    </button>

                    {!isSidebarCollapsed && (
                        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,215,0,0.05)', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.1)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('dashboard.settings.currentPlan')}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Crown size={16} color={user.plan === 'enterprise' ? '#000' : '#FFD700'} />
                                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', textTransform: 'capitalize' }}>
                                    {user.plan || 'Free'}
                                </span>
                            </div>
                        </div>
                    )}
                </nav>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        id="mentor-support-btn"
                        onClick={() => setIsSupportOpen(true)}
                        title={isSidebarCollapsed ? t('dashboard.support') : ""}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: '#2a2a2a',
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
                        onMouseOver={(e) => e.currentTarget.style.background = '#333'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                        <LifeBuoy size={18} />
                        {!isSidebarCollapsed && t('dashboard.support')}
                        {unreadCount > 0 && (
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
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>


                    <button
                        onClick={() => authService.logout()}
                        title={isSidebarCollapsed ? t('common.logout') : ""}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: '#2a2a2a',
                            border: '1px solid #333',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div
                            id="mentor-profile-photo"
                            onClick={() => setIsProfileModalOpen(true)}
                            style={{ position: 'relative', width: isMobile ? '50px' : '64px', height: isMobile ? '50px' : '64px', borderRadius: '50%', overflow: 'hidden', background: '#fff', border: '2px solid #FFD700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', flexShrink: 0 }}
                        >
                            {user.profilePhoto ? (
                                <Image
                                    src={user.profilePhoto}
                                    alt={user.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    unoptimized={user.profilePhoto.startsWith('http')}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', background: 'var(--secondary)' }}>
                                    <UserIcon size={isMobile ? 24 : 32} />
                                </div>
                            )}
                            {user.isVerified && (
                                <div style={{ position: 'absolute', bottom: '0', right: '0', zIndex: 10 }}>
                                    <PremiumBadge type="verified" size="sm" showLabel={false} />
                                </div>
                            )}
                        </div>
                        <div>
                            <motion.h1
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', lineHeight: 1.1, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {t('dashboard.welcomeBack')}, <span className="gold-text">{(user.businessName || user.name).split(' ')[0]}</span>
                                {user.isVerified && <PremiumBadge type="verified" size="md" showLabel={false} />}
                            </motion.h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <p style={{ color: '#666', marginTop: '0.4rem', fontSize: isMobile ? '0.9rem' : '1.05rem', fontWeight: 500 }}>
                                    {t('dashboard.readyToManage')}
                                </p>
                                {!isMobile && (
                                    <span style={{
                                        marginTop: '4px',
                                        background: user.plan === 'enterprise' ? '#000' : user.plan === 'pro' ? 'var(--gold-gradient)' : 'var(--muted)',
                                        color: user.plan === 'enterprise' ? '#FFD700' : (user.plan === 'pro' ? '#000' : 'var(--foreground)'),
                                        padding: '2px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {user.plan} {t('dashboard.account')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {
                        user.canCreateEvents === false && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    background: 'linear-gradient(90deg, #fff5f5 0%, #fff 100%)',
                                    borderLeft: '4px solid #c53030',
                                    padding: '1.2rem 1.5rem',
                                    borderRadius: '12px',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    boxShadow: '0 4px 12px rgba(197, 48, 48, 0.08)'
                                }}
                            >
                                <div style={{ background: '#c53030', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h4 style={{ color: '#c53030', fontWeight: 800, fontSize: '0.95rem', marginBottom: '2px' }}>{t('dashboard.settings.creationBlockedTitle')}</h4>
                                    <p style={{ color: '#666', fontSize: '0.85rem' }}>
                                        {t('dashboard.settings.creationBlockedDesc')}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    }

                    <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto', overflowX: 'auto', paddingBottom: isMobile ? '5px' : '0' }} className="no-scrollbar">
                        <Link
                            href="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.5rem',
                                background: 'var(--paper)',
                                border: '1px solid #FFD700',
                                borderRadius: '10px',
                                color: 'var(--foreground)',
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'all 0.3s',
                                fontSize: isMobile ? '0.8rem' : '1rem',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--paper-hover)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'var(--paper)'}
                        >
                            <ArrowRight size={18} /> {!isMobile && t('nav.home')}
                        </Link>
                        {user.canCreateEvents !== false ? (
                            <button
                                id="mentor-create-btn"
                                onClick={() => setIsEventModalOpen(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.5rem',
                                    background: 'var(--gold-gradient)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#000',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                                    transition: 'all 0.3s',
                                    fontSize: isMobile ? '0.8rem' : '1rem',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Plus size={18} /> {t('common.createEvent')}
                            </button>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1.5rem',
                                background: '#fff5f5',
                                border: '1px solid #fed7d7',
                                borderRadius: '12px',
                                color: '#c53030',
                                fontWeight: 700,
                                fontSize: '0.85rem'
                            }}>
                                <Lock size={16} /> {t('dashboard.restrictedAccess')}
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <ThemeToggle />
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    title={t('dashboard.notifications')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '45px',
                                        height: '45px',
                                        background: 'var(--paper)',
                                        border: '1px solid #FFD700',
                                        borderRadius: '12px',
                                        color: '#000',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        position: 'relative'
                                    }}
                                >
                                    <Bell size={20} />
                                    {unreadNotifications > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            background: 'var(--gold-gradient)',
                                            color: '#000',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #fff'
                                        }}>
                                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotificationsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            style={{
                                                position: 'absolute',
                                                top: '55px',
                                                right: 0,
                                                zIndex: 2000
                                            }}
                                        >
                                            <NotificationCenter onClose={() => setIsNotificationsOpen(false)} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => authService.logout()}
                                title={t('common.logout')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '45px',
                                    height: '45px',
                                    background: '#fff',
                                    border: '1px solid #fed7d7',
                                    borderRadius: '12px',
                                    color: '#e53e3e',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 2px 8px rgba(229, 62, 62, 0.05)'
                                }}
                                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = '#fff5f5'; }}
                                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = '#fff'; }}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header >

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div id="mentor-stats-grid" className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'} mb-8`}>
                                <StatCard
                                    icon={<Users className="gold-text" />}
                                    label={t('dashboard.totalSubscribers')}
                                    value={stats?.submissions || 0}
                                    trend="+12%"
                                />
                                <StatCard
                                    icon={<FileText className="gold-text" />}
                                    label={t('dashboard.activeEvents')}
                                    value={forms.filter(f => f.active).length}
                                    trend="0"
                                />
                                <StatCard
                                    icon={<CheckCircle className="gold-text" />}
                                    label={t('dashboard.approvedSubscriptions')}
                                    value={stats?.approved || 0}
                                    trend="+5%"
                                />
                                <StatCard
                                    icon={<DollarSign className="gold-text" />}
                                    label={t('dashboard.estimatedRevenue')}
                                    value={`MT ${(stats?.revenue || 0).toLocaleString()}`}
                                    trend="+18%"
                                />
                            </div>

                            <div style={{
                                marginTop: isMobile ? '2rem' : '4rem',
                                position: 'relative',
                                padding: isMobile ? '1.25rem' : '2.5rem',
                                borderRadius: isMobile ? '24px' : '32px',
                                background: 'var(--paper)',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 215, 0, 0.2)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.04)'
                            }}>
                                {/* Decorative Elements */}
                                <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>{t('dashboard.recentEvents')}</h3>
                                        <button onClick={() => setActiveTab('forms')} style={{ background: 'none', border: 'none', color: '#FFD700', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>{t('dashboard.viewAll')}</button>
                                    </div>

                                    {forms.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {forms.slice(0, 3).map((form) => (
                                                <div key={form._id} className="luxury-card" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', padding: '0', overflow: 'hidden', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)' }}>
                                                    <div style={{ height: '4px', width: '100%', background: 'var(--gold-gradient)' }}></div>
                                                    <div style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
                                                            <h4 style={{ fontWeight: 800, fontSize: isMobile ? '1.1rem' : '1.3rem', fontFamily: 'var(--font-playfair)', color: 'var(--foreground)', lineHeight: 1.2 }}>{form.title}</h4>
                                                            <span style={{
                                                                padding: '0.4rem 0.8rem',
                                                                borderRadius: '8px',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 900,
                                                                background: form.active ? '#f0fdf4' : '#f8f9fa',
                                                                color: form.active ? '#16a34a' : '#94a3b8',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '1px',
                                                                flexShrink: 0
                                                            }}>
                                                                {form.active ? t('dashboard.activeTitle') : t('dashboard.draftTitle')}
                                                            </span>
                                                        </div>
                                                        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', marginBottom: '1.5rem' }} />

                                                        {form.capacity && (
                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                                                                    <span style={{ color: '#64748b', fontWeight: 500 }}>{t('dashboard.registrants')}: <b style={{ color: '#1a1a1a', fontWeight: 700 }}>{form.submissionCount || 0}</b></span>
                                                                    <span style={{ color: '#64748b', fontWeight: 500 }}>{t('dashboard.goal')}: <b style={{ color: '#1a1a1a', fontWeight: 700 }}>{form.capacity}</b></span>
                                                                </div>
                                                                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                                                                    <div
                                                                        style={{
                                                                            width: `${Math.min(100, Math.round(((form.submissionCount || 0) / form.capacity) * 100))}%`,
                                                                            height: '100%',
                                                                            background: 'var(--gold-gradient)',
                                                                            borderRadius: '10px',
                                                                            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                            boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)'
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '0.5rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>
                                                                    {Math.round(((form.submissionCount || 0) / form.capacity) * 100)}% {t('dashboard.reached')}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: isMobile ? 'row' : 'row' }}>
                                                            <button
                                                                onClick={() => copyToClipboard(form.slug)}
                                                                title={t('common.copyLink')}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: isMobile ? '0.8rem' : '1rem',
                                                                    background: 'var(--paper)',
                                                                    border: '1.5px solid var(--border)',
                                                                    borderRadius: '12px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 700,
                                                                    color: 'var(--text-muted)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#FFD700'; e.currentTarget.style.color = '#000'; }}
                                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                                            >
                                                                <Copy size={16} /> {isMobile ? '' : t('common.link')}
                                                            </button>
                                                            <button
                                                                onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                                                                style={{
                                                                    flex: isMobile ? 2.5 : 3,
                                                                    padding: 0,
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    display: 'flex',
                                                                    height: isMobile ? '45px' : '52px',
                                                                    cursor: 'pointer',
                                                                    transition: 'transform 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                            >
                                                                <div style={{
                                                                    background: 'var(--secondary)',
                                                                    color: 'var(--primary)',
                                                                    flex: 1,
                                                                    borderRadius: '12px 0 0 12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 800,
                                                                    fontSize: isMobile ? '0.7rem' : '0.85rem',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '1px',
                                                                    border: '1px solid #1a1a1a'
                                                                }}>
                                                                    {t('common.view')}
                                                                </div>
                                                                <div style={{
                                                                    background: 'var(--gold-gradient)',
                                                                    width: isMobile ? '40px' : '52px',
                                                                    borderRadius: '0 12px 12px 0',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: '#000',
                                                                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'
                                                                }}>
                                                                    <ArrowRight size={18} strokeWidth={3} />
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="luxury-card" style={{ background: 'var(--paper)', border: 'none', textAlign: 'center', padding: '4rem' }}>
                                            <FileText size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
                                            <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('dashboard.noEventsYet')}</h4>
                                            <button onClick={() => setIsEventModalOpen(true)} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>{t('dashboard.createFirstEvent')}</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'forms' && (
                        <motion.div key="forms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="luxury-card" style={{ background: 'var(--paper)', border: 'none' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Evento</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Inscritos</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Visitas</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forms.map((form) => (
                                            <tr key={form._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 700 }}>{form.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>/{form.slug}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button
                                                        onClick={() => handleToggleStatus(form)}
                                                        style={{
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '20px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: form.active ? '#38a16915' : '#e53e3e15',
                                                            color: form.active ? '#38a169' : '#e53e3e'
                                                        }}
                                                    >
                                                        {form.active ? t('common.active') : t('common.inactive')}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{form.submissionCount || 0}</div>
                                                    {form.capacity && (
                                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{t('dashboard.goal')}: {form.capacity}</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>
                                                        <Eye size={16} color="#B8860B" /> {form.visits || 0}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                        <button onClick={() => setEditModalData({ isOpen: true, form })} title={t('common.editEvent')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3182ce' }}><Pencil size={18} /></button>
                                                        <button onClick={() => setThemeModalData({ isOpen: true, form })} title={t('common.customizeTheme')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><Palette size={18} /></button>
                                                        <button onClick={() => copyToClipboard(form.slug)} title={t('common.copyLink')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><Copy size={18} /></button>
                                                        <button onClick={() => { setSelectedSubmissionFormId(form._id); setActiveTab('submissions'); }} title={t('common.viewSubmissions')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><Users size={18} /></button>
                                                        <button onClick={() => handleDeleteForm(form._id)} title={t('common.delete')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'submissions' && (
                        <motion.div
                            key="submissions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <SubmissionManagement formId={selectedSubmissionFormId} />
                        </motion.div>
                    )}

                    {activeTab === 'reports' && (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', fontFamily: 'var(--font-playfair)' }}>
                                {t('dashboard.performanceAnalysis')}
                            </h2>
                            <AnalyticsCharts />
                        </motion.div>
                    )}

                    {activeTab === 'earnings' && (
                        <motion.div key="earnings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <EarningsDashboard />
                            <div style={{ marginTop: '2rem' }}>
                                <button
                                    onClick={() => setIsUpgradeModalOpen(true)}
                                    className="btn-secondary"
                                    style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--paper)', color: 'var(--foreground)' }}
                                >
                                    Fazer Upgrade de Plano
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <StripeConnect />
                            <MentorSettings user={user} onUpdate={loadDashboard} />
                        </motion.div>
                    )}

                    {activeTab === 'blog' && (
                        <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <InternalBlogView />
                        </motion.div>
                    )}

                    {activeTab === 'plans' && (
                        <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <InternalPlansView />
                        </motion.div>
                    )}
                </AnimatePresence>

                <PlanUpgradeModal
                    isOpen={isUpgradeModalOpen}
                    onClose={() => setIsUpgradeModalOpen(false)}
                />

                <CreateEventModal
                    isOpen={isEventModalOpen}
                    onClose={() => setIsEventModalOpen(false)}
                    onSuccess={loadDashboard}
                />

                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={user}
                    onSuccess={loadDashboard}
                    onUpgradeClick={() => {
                        setIsProfileModalOpen(false);
                        setIsUpgradeModalOpen(true);
                    }}
                />

                {
                    themeModalData.form && (
                        <EditEventThemeModal
                            isOpen={themeModalData.isOpen}
                            onClose={() => setThemeModalData({ isOpen: false, form: null })}
                            form={themeModalData.form}
                            onSuccess={loadDashboard}
                        />
                    )
                }

                {
                    editModalData.form && (
                        <EditEventModal
                            isOpen={editModalData.isOpen}
                            onClose={() => setEditModalData({ isOpen: false, form: null })}
                            form={editModalData.form}
                            onSuccess={loadDashboard}
                        />
                    )
                }

                <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} mode="mentor" />
                <OnboardingTour steps={steps} storageKey="inscrevase_mentor_tour_completed" />

                <AnimatePresence>
                    {showUpgradeSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                style={{ background: '#fff', borderRadius: '30px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', position: 'relative' }}
                            >
                                <div style={{ width: '80px', height: '80px', background: 'var(--gold-gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <Crown size={40} color="#000" />
                                </div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '10px', color: '#000' }}>{t('dashboard.plans.upgradeSuccess')}</h2>
                                <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
                                    {t('dashboard.plans.upgradeSuccessMessage').replace('{plan}', (user?.plan || 'Free').toUpperCase())}
                                </p>
                                <button
                                    onClick={() => setShowUpgradeSuccess(false)}
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '15px', fontWeight: 700 }}
                                >
                                    {t('dashboard.plans.startExploring')}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                        
                        table {
                            display: block;
                            overflow-x: auto;
                            white-space: nowrap;
                        }

                        .grid-cols-1 {
                            gap: 1rem !important;
                        }
                    }

                    @media (min-width: 1025px) {
                        .mobile-sidebar-toggle {
                            display: none !important;
                        }
                    }
                `}</style>
            </main >
        </div >
    );
}

export default function MentorDashboard() {
    return (
        <Suspense fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        }>
            <MentorDashboardContent />
        </Suspense>
    );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string | number, trend: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="luxury-card"
            style={{
                background: '#fff',
                padding: '1.5rem',
                border: 'none',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--gold-gradient)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: `rgba(212,175,55,0.08)`, color: '#D4AF37', padding: '0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <span style={{ color: '#666', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: '#1a1a1a' }}>{value}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: trend.startsWith('+') ? '#f0fdf4' : '#fef2f2', padding: '4px 8px', borderRadius: '20px' }}>
                    <span style={{ fontSize: '0.75rem', color: trend.startsWith('+') ? '#16a34a' : '#ef4444', fontWeight: 800 }}>{trend}</span>
                </div>
            </div>
        </motion.div>
    );
}
