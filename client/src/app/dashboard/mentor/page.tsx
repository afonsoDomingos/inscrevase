"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { authService, UserData } from '@/lib/authService';
import { useRouter, useSearchParams } from 'next/navigation';
import { dashboardService, AdminStats } from '@/lib/dashboardService';
import { formService, FormModel } from '@/lib/formService';
import { lessonService, Lesson } from '@/lib/lessonService';
import { toast } from 'sonner';
import CreateEventModal from '@/components/mentor/CreateEventModal';
import ProfileModal from '@/components/mentor/ProfileModal';
import LessonPlayerModal from '@/components/mentor/LessonPlayerModal';
import SubmissionManagement from '@/components/mentor/SubmissionManagement';
import MentorSettings from '@/components/mentor/MentorSettings';
import EditEventModal from '@/components/mentor/EditEventModal';
import SupportModal from '@/components/mentor/SupportModal';
import ServicesManagement from '@/components/mentor/ServicesManagement';
import FeedbackManagement from '@/components/mentor/FeedbackManagement';
import Link from 'next/link';
import AdManagement from '@/components/mentor/AdManagement';
import AnalyticsCharts from '@/components/mentor/AnalyticsCharts';
import SmartInsights from '@/components/mentor/SmartInsights';
import { SmartLinksManager } from '@/components/mentor/SmartLinksManager';
import { useTranslate } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import SalaDeEventosContainer from '@/components/hub/liveboard/SalaDeEventosContainer';
import { adService } from '@/lib/adService';
import SponsoredAdCard, { SponsoredItem } from '@/components/home/SponsoredAdCard';
import { Pencil } from 'lucide-react';
import { supportService } from '@/lib/supportService';
import ReferralModal from '@/components/mentor/ReferralModal';
import { referralService, ReferralRanking } from '@/lib/referralService';
import { stripeService } from '@/lib/stripeService';

import NotificationCenter from '@/components/mentor/NotificationCenter';
import { notificationService } from '@/lib/notificationService';
import MarketingRequestModal from '@/components/mentor/MarketingRequestModal';
import { marketingService, MarketingRequest } from '@/lib/marketingService';

import EditEventThemeModal from '@/components/mentor/EditEventThemeModal';
import AcademyView from '@/components/mentor/AcademyView';
import OnboardingTour, { Step } from '@/components/mentor/OnboardingTour';
import Tooltip from '@/components/common/Tooltip';
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
    Bell,
    Map,
    ChevronLeft,
    Menu,
    Newspaper,
    Video,
    Trophy,
    ExternalLink,
    Monitor,
    Zap,
    Link as LinkIcon,
    Share2,
    Clock,
    Info,
    Play,
    Shield,
    Package,
    Megaphone,
    ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import StripeConnect from '../../../components/StripeConnect';
import EarningsDashboard from '../../../components/EarningsDashboard';
import PlanUpgradeModal from '../../../components/PlanUpgradeModal';

import PlansSection from '@/components/common/PlansSection';
import PremiumBadge from '@/components/common/PremiumBadge';
import InternalBlogView from '@/components/common/InternalBlogView';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';

type Tab = 'overview' | 'forms' | 'submissions' | 'reports' | 'settings' | 'earnings' | 'blog' | 'plans' | 'services' | 'ads' | 'feedback' | 'smartlinks' | 'marketing' | 'lessons' | 'liveboard';

import { Suspense } from 'react';

function MentorDashboardContent() {
    const { t } = useTranslate();
    const { currency, formatPrice } = useCurrency();
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
    const [isResending, setIsResending] = useState(false);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [referralRanking, setReferralRanking] = useState<ReferralRanking[]>([]);
    const [sponsoredItems, setSponsoredItems] = useState<SponsoredItem[]>([]);
    const notificationBellRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const bellButtonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
    const [selectedMarketingService, setSelectedMarketingService] = useState<{ type: 'boost_social' | 'meta_ads' | 'gestion_360', name: string } | null>(null);
    const [myMarketingRequests, setMyMarketingRequests] = useState<MarketingRequest[]>([]);
    const [platformTutorials, setPlatformTutorials] = useState<Lesson[]>([]);
    const [selectedTutorial, setSelectedTutorial] = useState<Lesson | null>(null);
    const [isLabActive, setIsLabActive] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        "DASHBOARD": true,
        "CONTEÚDO / PRODUTOS": true,
        "PARTICIPANTES / GESTÃO": true,
        "MARKETING / PROMOÇÃO": true,
        "FINANCEIRO": true,
        "CONTA / SISTEMA": true
    });

    const toggleSection = (title: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'superadmin';

    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            await authService.resendVerification();
            toast.success(t('auth.resendSuccess'));
        } catch (error: unknown) {
            toast.error((error as Error).message || 'Erro ao reenviar verificação');
        } finally {
            setIsResending(false);
        }
    };

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
            const [userProfile, statsData, formsData, events, activeAds] = await Promise.all([
                authService.getProfile(),
                dashboardService.getMentorStats().catch(() => null), // Fail gracefully if not mentor yet
                formService.getMyForms().catch(() => []),
                formService.getExploreEvents().catch(() => []),
                adService.getActiveAds().catch(() => [])
            ]);

            setUser(userProfile);

            // Process sponsored items
            const sponsoredEvents = events.filter(e => e.isSponsored);
            const combinedAds = [
                ...sponsoredEvents.map(e => ({
                    _id: e._id,
                    title: e.title,
                    description: e.description,
                    mediaUrl: e.coverImage,
                    mediaType: 'image' as const,
                    targetUrl: `/f/${e.slug}`,
                    metadata: { date: e.eventDate, location: e.location }
                })),
                ...activeAds.map(ad => ({
                    _id: ad._id,
                    title: ad.title,
                    description: ad.description,
                    mediaUrl: ad.mediaUrl,
                    mediaUrls: ad.mediaUrls,
                    mediaType: ad.mediaType,
                    productPrice: ad.productPrice,
                    targetUrl: ad.targetUrl,
                    metadata: { category: ad.category }
                }))
            ].sort(() => Math.random() - 0.5) as SponsoredItem[];

            setSponsoredItems(combinedAds);

            // Redirect if not a mentor or admin
            if (userProfile.role === 'participant') {
                const isSubscribing = searchParams.get('subscription') === 'success';
                const isAdPayment = searchParams.get('ad_payment') === 'success';

                if (isSubscribing || isAdPayment) {
                    console.log("Found active payment process, staying on current view or awaiting verification...");
                    // If it's an ad payment, the verifyAdPayment effect will handle it below
                    return;
                } else {
                    router.push('/dashboard/participant');
                    return;
                }
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

    // Handle celebration redirect from /assinatura/sucesso page
    useEffect(() => {
        if (searchParams.get('celebration') === 'true') {
            // User came from the success page — plan is already updated
            setShowUpgradeSuccess(true);
            router.replace('/dashboard/mentor'); // clear params

            // Reload user and data
            authService.getProfile()
                .then(profile => setUser(profile))
                .catch(e => console.error('Profile reload error', e));

            Promise.all([
                dashboardService.getMentorStats().catch(() => null),
                formService.getMyForms().catch(() => [])
            ]).then(([statsData, formsData]) => {
                setStats(statsData);
                setForms(formsData as unknown as FormModel[]);
                setLoading(false);
            });
            return;
        }
    }, [searchParams, router]);

    // Polling effect for subscription upgrade (legacy fallback)
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
                        setForms(formsData as unknown as FormModel[]);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [searchParams, router, t]);

    // Handle initial tab from query parameters
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            const validTabs: Tab[] = ['overview', 'forms', 'submissions', 'reports', 'settings', 'earnings', 'blog', 'plans', 'services', 'ads', 'feedback', 'smartlinks', 'marketing', 'lessons'];
            if (validTabs.includes(tab as Tab)) {
                setActiveTab(tab as Tab);
            }
        }
    }, [searchParams]);

    // Close notification panel on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const isInsideBell = notificationBellRef.current && notificationBellRef.current.contains(e.target as Node);
            const isInsideDropdown = notificationDropdownRef.current && notificationDropdownRef.current.contains(e.target as Node);

            if (!isInsideBell && !isInsideDropdown) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const refreshData = useCallback(async () => {
        try {
            const [supportData, notificationData, statsData, marketingData] = await Promise.all([
                supportService.getUnreadCount(),
                notificationService.getUnreadCount(),
                dashboardService.getMentorStats().catch(() => null),
                marketingService.getMyRequests().catch(() => [])
            ]);
            setUnreadCount(supportData.count);
            setUnreadNotifications(notificationData.count);
            if (statsData) setStats(statsData);
            setMyMarketingRequests(marketingData);

            // Load referral ranking for overview
            const ranking = await referralService.getRanking().catch(() => []);
            setReferralRanking(ranking);

            // Load platform tutorials
            const tutorials = await lessonService.getPlatformTutorials().catch(() => []);
            setPlatformTutorials(tutorials);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, []);

    // Handle ad payment success
    useEffect(() => {
        const verifyAdPayment = async () => {
            const sessionId = searchParams.get('session_id');
            if (searchParams.get('ad_payment') === 'success' && sessionId) {
                setLoading(true);
                try {
                    await stripeService.verifyPayment(sessionId);
                    toast.success('Pagamento do anúncio confirmado! Nosso time irá revisar o conteúdo em breve.');
                    await loadDashboard(); // Reload ads list
                    await refreshData();
                    setActiveTab('ads');
                } catch (error) {
                    console.error('Error verifying ad payment:', error);
                    toast.error('Erro ao verificar pagamento do anúncio.');
                } finally {
                    setLoading(false);
                    // Clear search params
                    const newUrl = window.location.pathname;
                    router.replace(newUrl);
                }
            } else if (searchParams.get('ad_payment') === 'success') {
                // Legacy or fallback (no sessionId)
                toast.success('Pagamento do anúncio confirmado!');
                setActiveTab('ads');
                router.replace('/dashboard/mentor');
            }
        };

        verifyAdPayment();
    }, [searchParams, router, loadDashboard, refreshData]);

    useEffect(() => {
        loadDashboard();
        refreshData();

        // Poll for data every 30 seconds
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, [loadDashboard, refreshData]);

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

    const handleToggleProfileVisibility = async (form: FormModel) => {
        try {
            await formService.togglePartnerVisibility(form._id);
            toast.success('Visibilidade no perfil atualizada');
            await loadDashboard();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar visibilidade no perfil');
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
            <aside style={{
                width: isSidebarCollapsed ? '80px' : '280px',
                height: '100vh',
                background: '#121212',
                borderRight: '1px solid rgba(255, 215, 0, 0.1)',
                position: 'fixed',
                left: isMobile ? (isMobileSidebarOpen ? '0' : '-100%') : '0',
                top: 0,
                zIndex: 1000,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', borderBottom: '1px solid rgba(255, 215, 0, 0.1)' }}>
                    {!isSidebarCollapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontWeight: 900,
                                fontSize: '1.6rem',
                                color: '#fff',
                                letterSpacing: '-0.5px',
                                fontFamily: 'var(--font-playfair)' // Using serif for the logo as in image
                            }}>
                                INSCREVA<span style={{ color: '#FFD700' }}>.SE</span>
                            </span>
                        </div>
                    )}
                    {!isMobile && (
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            style={{ background: 'rgba(255,215,0,0.1)', border: 'none', borderRadius: '8px', color: '#FFD700', padding: '6px', cursor: 'pointer', transition: 'all 0.3s' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,215,0,0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,215,0,0.1)'}
                        >
                            {isSidebarCollapsed ? <Menu size={24} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                </div>

                <nav
                    className="luxury-scrollbar"
                    style={{
                        padding: '1rem 1.5rem',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        overflowY: 'auto'
                    }}>
                    {[
                        {
                            title: "DASHBOARD",
                            items: [{ id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={20} /> }]
                        },
                        {
                            title: "CONTEÚDO / PRODUTOS",
                            items: [
                                { id: 'lessons', label: 'Aulas', icon: <Video size={20} /> },
                                { id: 'forms', label: t('dashboard.myEvents'), icon: <FileText size={20} /> },
                                { id: 'blog', label: t('dashboard.blogArticles'), icon: <Newspaper size={20} /> },
                                { id: 'services', label: t('dashboard.services'), icon: <Package size={20} /> },
                                { id: 'liveboard', label: 'Sala de Eventos (Lab)', icon: <Monitor size={20} /> },
                            ]
                        },
                        {
                            title: "PARTICIPANTES / GESTÃO",
                            items: [
                                { id: 'submissions', label: 'Inscrições', icon: <Users size={20} /> },
                                { id: 'referral', label: 'Indicações & Impacto', icon: <Trophy size={20} /> },
                            ]
                        },
                        {
                            title: "MARKETING / PROMOÇÃO",
                            items: [
                                { id: 'ads', label: 'Anúncios', icon: <Megaphone size={20} /> },
                                { id: 'smartlinks', label: 'Smartlinks', icon: <LinkIcon size={20} /> },
                                { id: 'marketing', label: 'Impulsionar Vendas', icon: <Zap size={20} /> },
                            ]
                        },
                        {
                            title: "FINANCEIRO",
                            items: [
                                { id: 'earnings', label: t('dashboard.settings.earnings'), icon: <DollarSign size={20} /> },
                                { id: 'reports', label: t('dashboard.reports'), icon: <PieChart size={20} /> },
                            ]
                        },
                        {
                            title: "CONTA / SISTEMA",
                            items: [
                                { id: 'plans', label: t('dashboard.finance.viewPlans'), icon: <Crown size={20} /> },
                                { id: 'settings', label: t('dashboard.myAccount'), icon: <Settings size={20} /> },
                            ]
                        }
                    ].map((section, idx) => (
                        <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                            {idx > 0 && (
                                <div style={{ height: '1px', background: 'rgba(255,215,0,0.15)', margin: '4px 16px 12px', width: 'auto' }} />
                            )}
                            {!isSidebarCollapsed && (
                                <div
                                    onClick={() => toggleSection(section.title)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem 0.75rem',
                                        marginBottom: '0.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.3)',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {section.title}
                                    <motion.div
                                        animate={{ rotate: expandedSections[section.title] ? 0 : -90 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown size={14} />
                                    </motion.div>
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {(isSidebarCollapsed || expandedSections[section.title]) && (
                                    <motion.div
                                        initial={isSidebarCollapsed ? false : { height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                            {section.items.map((item) => (
                                                <Tooltip key={item.id} content={isSidebarCollapsed ? item.label : ""} position="right">
                                                    <button
                                                        id={`mentor-nav-${item.id}`}
                                                        onClick={() => {
                                                            setActiveTab(item.id as Tab);
                                                            if (isMobile) setIsMobileSidebarOpen(false);
                                                            const params = new URLSearchParams(searchParams.toString());
                                                            params.set('tab', item.id);
                                                            router.push(`?${params.toString()}`, { scroll: false });
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                                            gap: '12px',
                                                            padding: '0.75rem 1rem',
                                                            width: isSidebarCollapsed ? 'auto' : 'calc(100% - 1rem)',
                                                            margin: isSidebarCollapsed ? '0' : '0 0.5rem',
                                                            borderRadius: '12px',
                                                            border: 'none',
                                                            background: activeTab === item.id ? '#FFD700' : 'transparent',
                                                            color: activeTab === item.id ? '#000' : 'rgba(255,255,255,0.6)',
                                                            fontWeight: activeTab === item.id ? 800 : 500,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            textAlign: 'left',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        <div style={{ opacity: activeTab === item.id ? 1 : 0.7, minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
                                                            {item.icon}
                                                        </div>
                                                        {!isSidebarCollapsed && <span>{item.label}</span>}
                                                    </button>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {!isSidebarCollapsed && (
                            <div style={{ padding: '1rem', background: 'rgba(255,215,0,0.05)', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.1)', marginBottom: '8px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('dashboard.settings.currentPlan')}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Crown size={16} color={user.plan === 'enterprise' ? '#000' : '#FFD700'} />
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{user.plan || 'Free'}</span>
                                </div>
                            </div>
                        )}

                        <Tooltip content={isSidebarCollapsed ? t('dashboard.settings.guidedTour') : ""} position="right">
                            <button
                                onClick={() => window.dispatchEvent(new Event('start-onboarding'))}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: '12px', padding: '0.75rem 1rem', width: '100%', borderRadius: '12px', border: 'none', background: 'transparent', color: '#FFD700', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.9rem' }}
                            >
                                <Map size={20} />
                                {!isSidebarCollapsed && t('dashboard.settings.guidedTour')}
                            </button>
                        </Tooltip>

                        <Tooltip content={isSidebarCollapsed ? t('dashboard.support') : ""} position="right">
                            <button
                                onClick={() => setIsSupportOpen(true)}
                                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '12px', color: '#FFD700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: '12px', fontWeight: 600, transition: 'all 0.2s', position: 'relative', fontSize: '0.9rem' }}
                            >
                                <LifeBuoy size={20} />
                                {!isSidebarCollapsed && t('dashboard.support')}
                                {unreadCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, border: '2px solid var(--paper)' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </Tooltip>

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            padding: '0.5rem 1rem',
                            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <LanguageSwitcher />
                            <CurrencySwitcher />
                        </div>

                        <button
                            onClick={() => authService.logout()}
                            style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: '1px solid rgba(229, 62, 62, 0.2)', borderRadius: '12px', color: '#e53e3e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: '12px', fontWeight: 600, transition: 'all 0.2s', fontSize: '0.9rem' }}
                        >
                            <LogOut size={20} />
                            {!isSidebarCollapsed && t('common.logout')}
                        </button>
                    </div>
                </nav>

                <style jsx>{`
                    .custom-sidebar-scroll::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-sidebar-scroll::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                        background: rgba(255, 215, 0, 0.2);
                        border-radius: 10px;
                    }
                    .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 215, 0, 0.4);
                    }
                    .custom-sidebar-scroll {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(255, 215, 0, 0.2) transparent;
                    }
                `}</style>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px'),
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flex: 1,
                padding: isMobile ? '1rem' : '2.5rem',
                paddingTop: isMobile ? '5rem' : '2.5rem',
                minHeight: '100vh',
                maxWidth: isMobile ? '100%' : `calc(100vw - ${isSidebarCollapsed ? '80px' : '280px'})`,
                overflowX: 'hidden'
            }}>
                {user && !user.isEmailVerified && user.role !== 'admin' && user.role !== 'SuperAdmin' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '16px',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                <Info size={20} color="#FFD700" />
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', marginBottom: '2px' }}>{t('dashboard.verifyEmailTitle')}</h4>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{t('dashboard.verifyEmailMessage')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleResendVerification}
                            disabled={isResending}
                            style={{
                                background: 'var(--gold-gradient)',
                                color: '#000',
                                border: 'none',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: isResending ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: isResending ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => !isResending && (e.currentTarget.style.transform = 'scale(1.02)')}
                            onMouseOut={(e) => !isResending && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {isResending ? <Loader2 className="animate-spin" size={16} /> : null}
                            {t('dashboard.resendEmail')}
                        </button>
                    </motion.div>
                )}

                {/* Header Section */}
                <header style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '1.5rem' : '3rem',
                    marginBottom: '2rem'
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
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Shield size={14} color="#3182ce" />
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 900,
                                    color: '#3182ce',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    PAINEL DO MENTOR
                                </span>
                            </div>
                            <h1 style={{
                                fontSize: isMobile ? '1.8rem' : '2.8rem',
                                fontWeight: 800,
                                fontFamily: 'var(--font-playfair)',
                                color: '#FFD700',
                                lineHeight: 1.1,
                                margin: 0
                            }}>
                                {t('common.hello')}, <span style={{ color: 'var(--foreground)' }}>{user.name.split(' ')[0]}</span>
                            </h1>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: isMobile ? '0.35rem' : '0.5rem', width: isMobile ? '100.5%' : 'auto', overflowX: 'auto', paddingBottom: isMobile ? '5px' : '0', alignItems: 'center' }} className="no-scrollbar">
                        <Link
                            href="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '12px',
                                background: 'rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                color: 'var(--foreground)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                textDecoration: 'none',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <ArrowRight size={18} /> {!isMobile && t('nav.home')}
                        </Link>

                        {user.canCreateEvents !== false && (user.isEmailVerified || user.role === 'admin' || user.role === 'SuperAdmin') ? (
                            <Tooltip content={t('common.createEvent')}>
                                <button
                                    onClick={() => setIsEventModalOpen(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '0.5rem 1rem',
                                        background: 'var(--gold-gradient)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#000',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                                        transition: 'all 0.3s',
                                        fontSize: isMobile ? '0.75rem' : '0.9rem',
                                        whiteSpace: 'nowrap',
                                        height: isMobile ? '36px' : '40px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <Plus size={18} /> {t('common.createEvent')}
                                </button>
                            </Tooltip>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.5rem 1rem',
                                background: isAdmin ? 'var(--gold-gradient)' : '#fff5f5',
                                border: isAdmin ? 'none' : '1px solid #fed7d7',
                                borderRadius: '10px',
                                color: isAdmin ? '#000' : '#c53030',
                                fontWeight: 700,
                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                height: '40px',
                                whiteSpace: 'nowrap'
                            }}>
                                {!isAdmin && <Lock size={16} />} {user.isEmailVerified || isAdmin ? t('dashboard.restrictedAccess') : t('dashboard.emailUnverified')}
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.35rem' : '0.5rem' }}>
                            <LanguageSwitcher />
                            <CurrencySwitcher />
                            <ThemeToggle />
                            <div ref={notificationBellRef} style={{ position: 'relative' }}>
                                <Tooltip content={t('dashboard.notifications')}>
                                    <button
                                        ref={bellButtonRef}
                                        onClick={(e) => {
                                            try {
                                                console.log('🔔 [Bell-Page] click fired, isOpen =', isNotificationsOpen);
                                                e.stopPropagation();
                                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                console.log('🔔 [Bell-Page] rect =', JSON.stringify({ top: rect.top, bottom: rect.bottom, right: rect.right, left: rect.left }));
                                                const newPos = {
                                                    top: rect.bottom + 8,
                                                    right: window.innerWidth - rect.right
                                                };
                                                console.log('🔔 [Bell-Page] dropdownPos =', newPos);
                                                setDropdownPos(newPos);
                                                setIsNotificationsOpen(prev => {
                                                    console.log('🔔 [Bell-Page] state toggle:', prev, '->', !prev);
                                                    return !prev;
                                                });
                                            } catch (err) {
                                                console.error('🔴 [Bell-Page] onClick error:', err);
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: isMobile ? '36px' : '40px',
                                            height: isMobile ? '36px' : '40px',
                                            background: isNotificationsOpen ? '#FFD700' : 'var(--paper)',
                                            border: '1px solid #FFD700',
                                            borderRadius: '12px',
                                            color: isNotificationsOpen ? '#000' : 'var(--foreground)',
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
                                                background: '#ef4444',
                                                color: '#fff',
                                                borderRadius: '50%',
                                                width: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                border: '2px solid var(--paper)'
                                            }}>
                                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                            </span>
                                        )}
                                    </button>
                                </Tooltip>
                            </div>

                            {/* Notification dropdown rendered at fixed position, immune to parent overflow */}
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        ref={notificationDropdownRef}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'fixed',
                                            top: dropdownPos.top,
                                            right: dropdownPos.right,
                                            zIndex: 9999,
                                            transformOrigin: 'top right'
                                        }}
                                    >
                                        <NotificationCenter onClose={() => setIsNotificationsOpen(false)} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={() => authService.logout()}
                                title={t('common.logout')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: isMobile ? '36px' : '40px',
                                    height: isMobile ? '36px' : '40px',
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

                {/* Sponsored Ads Section */}
                {sponsoredItems.length > 0 && (
                    <div style={{ marginBottom: '2.5rem' }}>
                        <SponsoredAdCard events={sponsoredItems} />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div id="mentor-stats-grid" className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'} mb-8`}>
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
                                    value={formatPrice(stats?.revenue || 0, 'MZN', currency)}
                                    trend="+18%"
                                />
                            </div>

                            {/* Smart AI Insights */}
                            <SmartInsights
                                user={user}
                                stats={stats}
                                forms={forms}
                                onCreateEvent={() => setIsEventModalOpen(true)}
                                onOpenSettings={() => setIsProfileModalOpen(true)}
                                onNavigate={(tab) => setActiveTab(tab as Tab)}
                            />

                            {/* Performance Analytics on Overview */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '32px', height: '4px', background: 'var(--gold-gradient)', borderRadius: '2px' }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {t('dashboard.performanceAnalysis')}
                                    </h3>
                                </div>
                                <AnalyticsCharts />
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
                                    {/* Promotion Banner for Ads Portal */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
                                            borderRadius: '24px',
                                            padding: isMobile ? '1.5rem' : '2rem',
                                            marginBottom: '2rem',
                                            display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '2rem',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(circle at 70% 30%, rgba(255,215,0,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                                        <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--gold-gradient)', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: '#000', marginBottom: '1rem' }}>
                                                <Zap size={12} fill="#000" /> Novidade: Portal de Destaques
                                            </div>
                                            <h4 style={{ color: '#fff', fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Destaque seu Evento hoje!</h4>
                                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                                Aumente sua visibilidade em até 10x aparecendo nas seções patrocinadas de toda a plataforma.
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setActiveTab('ads')}
                                            style={{
                                                background: '#fff',
                                                color: '#000',
                                                padding: '1rem 2rem',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                fontSize: '0.9rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s',
                                                whiteSpace: 'nowrap',
                                                boxShadow: '0 10px 20px rgba(255,255,255,0.1)'
                                            }}
                                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            Solicitar Destaque <Megaphone size={18} />
                                        </button>
                                    </motion.div>

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

                            {/* Impact Ranking Section */}
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{
                                    background: 'var(--paper)',
                                    borderRadius: '24px',
                                    padding: '2rem',
                                    border: '1px solid rgba(255, 215, 0, 0.1)'
                                }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Trophy size={20} color="#FFD700" /> {t('referral.ranking')}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {referralRanking.slice(0, 5).map((r, i) => (
                                            <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: i === 0 ? 'rgba(255, 215, 0, 0.05)' : 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: i === 0 ? 'var(--gold-gradient)' : '#eee',
                                                        color: i === 0 ? '#000' : '#666',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 900,
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.name === user.name ? 'Você' : r.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{r.referralCount} convites convertidos</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 900, color: '#FFD700' }}>{r.referralPoints} pts</div>
                                            </div>
                                        ))}

                                        {referralRanking.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: '#666', fontSize: '0.9rem' }}>
                                                O ranking de impacto começará a crescer em breve! 🚀
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setIsReferralModalOpen(true)}
                                            style={{
                                                width: '100%',
                                                marginTop: '0.5rem',
                                                background: '#111',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Participar & Ganhar Recompensas
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Platform Tutorials Section */}
                            {platformTutorials.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <div style={{
                                        background: 'var(--paper)',
                                        borderRadius: '24px',
                                        padding: '2rem',
                                        border: '1px solid rgba(255, 215, 0, 0.1)'
                                    }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Video size={20} color="#FFD700" /> Tutoriais da Plataforma
                                        </h3>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                            {platformTutorials.map(tutorial => (
                                                <div key={tutorial._id} style={{
                                                    background: 'rgba(0,0,0,0.02)',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(0,0,0,0.05)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'all 0.3s'
                                                }}>
                                                    {tutorial.thumbnailUrl ? (
                                                        <div style={{ width: '100%', height: '160px', position: 'relative' }}>
                                                            <Image src={tutorial.thumbnailUrl} alt={tutorial.title} fill style={{ objectFit: 'cover' }} unoptimized />
                                                        </div>
                                                    ) : (
                                                        <div style={{ width: '100%', height: '160px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Video size={40} color="#FFD700" opacity={0.5} />
                                                        </div>
                                                    )}
                                                    <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <h4 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tutorial.title}</h4>
                                                        {tutorial.description && <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tutorial.description}</p>}
                                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <button
                                                                onClick={() => setSelectedTutorial(tutorial)}
                                                                style={{
                                                                    background: 'var(--gold-gradient)',
                                                                    border: 'none',
                                                                    color: '#000',
                                                                    padding: '8px 16px',
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 800,
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    boxShadow: '0 4px 15px rgba(212,175,55,0.2)'
                                                                }}
                                                                className="hover:scale-105 transition-transform"
                                                            >
                                                                <Play size={16} fill="#000" /> {t('common.watch')}
                                                            </button>
                                                            <span style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {tutorial.views}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'forms' && (
                        <motion.div key="forms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="luxury-card" style={{ background: 'var(--paper)', border: 'none' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                    <colgroup>
                                        <col style={{ width: '18%' }} />
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '8%' }} />
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '44%' }} />
                                    </colgroup>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Evento</th>
                                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('common.visibility')}</th>
                                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Perfil</th>
                                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inscritos</th>
                                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Visitas</th>
                                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forms.map((form) => (
                                            <tr key={form._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                <td style={{ padding: '0.85rem 1rem', maxWidth: 0 }}>
                                                    <Tooltip content={form.title}>
                                                        <div
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: '0.9rem',
                                                                overflow: 'hidden',
                                                                whiteSpace: 'nowrap',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                        >{form.title}</div>
                                                    </Tooltip>
                                                    <Tooltip content={`/ ${form.slug}`}>
                                                        <div
                                                            style={{
                                                                fontSize: '0.7rem',
                                                                color: '#999',
                                                                overflow: 'hidden',
                                                                whiteSpace: 'nowrap',
                                                                textOverflow: 'ellipsis',
                                                                marginTop: '2px'
                                                            }}
                                                        >/{form.slug}</div>
                                                    </Tooltip>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <button
                                                        onClick={() => handleToggleStatus(form)}
                                                        style={{
                                                            padding: '0.25rem 0.6rem',
                                                            borderRadius: '20px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap',
                                                            background: form.active ? '#38a16915' : '#e53e3e15',
                                                            color: form.active ? '#38a169' : '#e53e3e'
                                                        }}
                                                    >
                                                        {form.active ? t('common.public') : t('common.private')}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    {user && form.creator._id !== user.id ? (
                                                        <button
                                                            onClick={() => handleToggleProfileVisibility(form)}
                                                            style={{
                                                                padding: '0.25rem 0.6rem',
                                                                borderRadius: '20px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 700,
                                                                border: '1px solid currentColor',
                                                                cursor: 'pointer',
                                                                background: 'transparent',
                                                                whiteSpace: 'nowrap',
                                                                color: form.partnersPublic?.includes(user.id) ? '#38a169' : '#e53e3e'
                                                            }}
                                                        >
                                                            {form.partnersPublic?.includes(user.id) ? 'Visível' : 'Oculto'}
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 600 }}>Dono</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{form.submissionCount || 0}</div>
                                                    {form.capacity && (
                                                        <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '1px' }}>Meta: {form.capacity}</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 700, color: 'var(--foreground)' }}>
                                                        <Eye size={14} color="#B8860B" /> {form.visits || 0}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                                                        {/* Primary Actions */}
                                                        <Tooltip content={t('common.viewPublicForm')}>
                                                            <button
                                                                onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                                    padding: '6px 12px', borderRadius: '8px',
                                                                    background: 'rgba(184,134,11,0.1)', color: '#B8860B',
                                                                    border: '1.5px solid rgba(184,134,11,0.3)',
                                                                    cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem',
                                                                    whiteSpace: 'nowrap', transition: 'all 0.2s'
                                                                }}
                                                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                            >
                                                                <ExternalLink size={14} /> Página Pública
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip content={t('common.viewEventHub')}>
                                                            <button
                                                                onClick={() => window.open(`/hub/${form.slug}`, '_blank')}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                                    padding: '6px 12px', borderRadius: '8px',
                                                                    background: 'var(--gold-gradient)', color: '#000',
                                                                    border: 'none',
                                                                    cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem',
                                                                    whiteSpace: 'nowrap', transition: 'all 0.2s',
                                                                    boxShadow: '0 2px 8px rgba(212,175,55,0.25)'
                                                                }}
                                                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,175,55,0.4)'; }}
                                                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(212,175,55,0.25)'; }}
                                                            >
                                                                <Monitor size={14} /> Página do Inscrito
                                                            </button>
                                                        </Tooltip>

                                                        {/* Divider */}
                                                        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />

                                                        {/* Secondary icon-only actions */}
                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                            <Tooltip content={t('common.editEvent')}>
                                                                <button onClick={() => setEditModalData({ isOpen: true, form })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3182ce', padding: '4px', borderRadius: '6px' }}><Pencil size={18} /></button>
                                                            </Tooltip>
                                                            <Tooltip content={t('common.customizeTheme')}>
                                                                <button onClick={() => setThemeModalData({ isOpen: true, form })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px', borderRadius: '6px' }}><Palette size={18} /></button>
                                                            </Tooltip>
                                                            <Tooltip content={t('common.copyLink')}>
                                                                <button onClick={() => copyToClipboard(form.slug)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px', borderRadius: '6px' }}><Copy size={18} /></button>
                                                            </Tooltip>
                                                            <Tooltip content={t('common.viewSubmissions')}>
                                                                <button onClick={() => { setSelectedSubmissionFormId(form._id); setActiveTab('submissions'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px', borderRadius: '6px' }}><Users size={18} /></button>
                                                            </Tooltip>
                                                            <Tooltip content={t('common.delete')}>
                                                                <button onClick={() => handleDeleteForm(form._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', padding: '4px', borderRadius: '6px' }}><Trash2 size={18} /></button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'lessons' && (
                        <motion.div key="lessons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <AcademyView />
                        </motion.div>
                    )}

                    {activeTab === 'submissions' && (
                        <motion.div
                            key="submissions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <SubmissionManagement
                                formId={selectedSubmissionFormId}
                                onAction={refreshData}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'ads' && (
                        <motion.div
                            key="ads"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <AdManagement />
                        </motion.div>
                    )}

                    {activeTab === 'smartlinks' && (
                        <motion.div
                            key="smartlinks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <SmartLinksManager />
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
                            <PlansSection />
                        </motion.div>
                    )}

                    {activeTab === 'services' && (
                        <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <ServicesManagement />
                        </motion.div>
                    )}

                    {activeTab === 'marketing' && (
                        <motion.div key="marketing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                                    Acelerador de <span className="gold-text">Vendas</span>
                                </h2>
                                <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '600px' }}>
                                    O seu conhecimento merece ser visto. Nós cuidamos de toda a estratégia para converter os seus <strong>cursos, workshops, palestras ou serviços</strong> em um sucesso de vendas.
                                </p>
                            </div>

                            {/* High-Conversion Sales Page Section */}
                            <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', background: '#0a0a0a', border: '1px solid rgba(255,215,0,0.1)', marginBottom: '4rem' }}>
                                {/* Hero Banner */}
                                <div style={{ position: 'relative', height: '450px', display: 'flex', alignItems: 'center', padding: isMobile ? '2rem' : '4rem' }}>
                                    <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
                                        <Image
                                            src="/marketing/hero.png"
                                            alt="Aceleração de Vendas"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 80%)' }} />
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', padding: '6px 16px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '1.5rem', border: '1px solid rgba(212,175,55,0.3)' }}>
                                            <Zap size={14} /> EXCLUSIVO PARA MENTORES
                                        </div>
                                        <h1 style={{ fontSize: isMobile ? '2.2rem' : '3.5rem', fontWeight: 900, lineHeight: 1.1, color: '#fff', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)' }}>
                                            Pare de Perder Vendas por <span className="gold-text">Falta de Tração.</span>
                                        </h1>
                                        <p style={{ fontSize: '1.1rem', color: '#aaa', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                                            Cansado de criar eventos incríveis que ninguém vê? A nossa equipa de especialistas assume o controlo do teu marketing para que tu te foques apenas no que fazes melhor: ensinar.
                                        </p>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedMarketingService({ type: 'gestion_360', name: 'Programa de Aceleração 360º' });
                                                    setIsMarketingModalOpen(true);
                                                }}
                                                style={{
                                                    padding: '1.2rem 2rem',
                                                    background: 'var(--gold-gradient)',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '16px',
                                                    fontWeight: 900,
                                                    fontSize: '1rem',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 20px 40px rgba(212,175,55,0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                }}
                                                className="hover:translate-y-[-5px] transition-all"
                                            >
                                                CONTACTAR VENDAS <Zap size={20} />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const message = encodeURIComponent("Olá! Estou no dashboard e tenho dúvidas sobre como funciona o Programa de Aceleração 360º. Podem ajudar?");
                                                    window.open(`https://wa.me/+258856079576?text=${message}`, '_blank');
                                                }}
                                                style={{
                                                    padding: '1.2rem 2rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: '#fff',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '16px',
                                                    fontWeight: 800,
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}
                                                className="hover:bg-white/10 transition-all"
                                            >
                                                <Info size={18} /> COMO FUNCIONA?
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Pain Points & Solutions */}
                                <div style={{ padding: isMobile ? '2rem' : '4rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '4rem', background: 'rgba(255,255,255,0.02)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>O que resolvemos para si?</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {[
                                                {
                                                    title: "Design de Criativos que Param o Scroll",
                                                    desc: "Criamos imagens e vídeos profissionais para os seus anúncios que captam a atenção imediata do seu público-alvo.",
                                                    icon: <Share2 color="#D4AF37" />
                                                },
                                                {
                                                    title: "Copywriting de Alta Persuasão",
                                                    desc: "Escrevemos os textos que vendem. Usamos gatilhos mentais estratégicos para transformar curiosos em inscritos pagos.",
                                                    icon: <Trophy color="#D4AF37" />
                                                },
                                                {
                                                    title: "Gestão de Campanhas Meta Ads",
                                                    desc: "Configuramos e otimizamos o seu tráfego pago no Facebook e Instagram diariamente para garantir o menor custo por lead.",
                                                    icon: <Zap color="#D4AF37" />
                                                },
                                                {
                                                    title: "Configuração de Pixel Inteligente",
                                                    desc: "Instalamos e configuramos o Pixel do Meta e Google Ads de forma avançada para traquear conversões e otimizar a sua inteligência de vendas.",
                                                    icon: <Monitor color="#D4AF37" />
                                                }
                                            ].map((item, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '20px' }}>
                                                    <div style={{ flexShrink: 0, width: '48px', height: '48px', background: 'rgba(212,175,55,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</h4>
                                                        <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '2rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ background: 'rgba(212,175,55,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                                <Trophy size={40} color="#D4AF37" />
                                            </div>
                                            <h4 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, marginBottom: '1rem' }}>Estratégia Validada</h4>
                                            <p style={{ color: '#888', fontSize: '0.95rem', maxWidth: '300px' }}>&quot;Nós cuidamos da estratégia técnica, você foca no seu conhecimento.&quot;</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Focused Section */}
                                <div style={{ padding: '3rem', textAlign: 'center', background: 'linear-gradient(180deg, transparent, rgba(37,99,235,0.05))', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>O seu sucesso é mensurável</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '2rem' }}>
                                        {[
                                            { label: "Visibilidade", val: "10x Mais Alcance" },
                                            { label: "Conversão", val: "ROI Focado" },
                                            { label: "Suporte", val: "Acompanhamento 24/7" }
                                        ].map((stat, i) => (
                                            <div key={i} style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{stat.label}</div>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D4AF37' }}>{stat.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* My Requests Section */}
                            {myMarketingRequests.length > 0 && (
                                <div style={{ marginTop: '0rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Clock size={24} color="#D4AF37" /> Meus Pedidos de Aceleração
                                    </h3>
                                    <div style={{ background: 'var(--paper)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Serviço</th>
                                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Data</th>
                                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Nota Admin</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myMarketingRequests.map((req) => (
                                                    <tr key={req._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '1.2rem' }}>
                                                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                                                                {req.serviceType === 'boost_social' ? 'Boost Social' : req.serviceType === 'meta_ads' ? 'Aceleração Meta Ads' : 'Programa de Aceleração 360º'}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ padding: '1.2rem' }}>
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 800,
                                                                background: req.status === 'pending' ? 'rgba(212,175,55,0.1)' : req.status === 'in_progress' ? 'rgba(37,99,235,0.1)' : req.status === 'completed' ? 'rgba(74,222,128,0.1)' : 'rgba(229,62,62,0.1)',
                                                                color: req.status === 'pending' ? '#D4AF37' : req.status === 'in_progress' ? '#3b82f6' : req.status === 'completed' ? '#4ade80' : '#e53e3e',
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {req.status === 'in_progress' ? 'Em Andamento' : req.status === 'completed' ? 'Concluído' : req.status === 'pending' ? 'Pendente' : req.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1.2rem', color: '#888', fontSize: '0.85rem' }}>
                                                            {req.adminNotes || 'A aguardar análise...'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,215,0,0.02)', border: '1px dashed rgba(212,175,55,0.2)', borderRadius: '20px', textAlign: 'center' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Ainda tens dúvidas de como funciona?</h4>
                                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Nossa equipe está pronta para te explicar cada detalhe da nossa estratégia.</p>
                                <button
                                    onClick={() => {
                                        const message = encodeURIComponent("Olá! Tenho algumas dúvidas sobre o Acelerador de Vendas da Inscreva-se. Podem me explicar melhor?");
                                        window.open(`https://wa.me/+258856079576?text=${message}`, '_blank');
                                    }}
                                    style={{ padding: '0.8rem 2rem', background: 'var(--paper)', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                                >
                                    FALAR COM O COMERCIAL <Share2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'liveboard' && (
                        <motion.div key="liveboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                                    padding: isMobile ? '2rem' : '4rem 3rem',
                                    borderRadius: '32px',
                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    color: '#fff'
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--gold-gradient)' }} />
                                    <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(255, 215, 0, 0.15)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#FFD700', marginBottom: '1.5rem' }}>
                                            🛸 Ambiente de Testes
                                        </div>
                                        <h2 style={{ fontSize: isMobile ? '2rem' : '3.5rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', lineHeight: 1.1, marginBottom: '1.5rem', color: '#fff' }}>
                                            Laboratório <span className="gold-text">Sala de Eventos</span>
                                        </h2>
                                        <p style={{ fontSize: '1.1rem', color: '#888', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                                            Este é o seu espaço privado para praticar. Teste todos os recursos da Sala de Eventos — pincéis, cronómetros, quizzes e sincronização — para garantir que a sua próxima aula em direto seja impecável.
                                        </p>

                                        <button
                                            onClick={() => setIsLabActive(true)}
                                            style={{
                                                background: 'var(--gold-gradient)',
                                                color: '#000',
                                                padding: '1.2rem 2.5rem',
                                                borderRadius: '20px',
                                                fontWeight: 900,
                                                fontSize: '1.1rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 20px 40px rgba(212, 175, 55, 0.2)'
                                            }}
                                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                                        >
                                            ENTRAR NO LABORATÓRIO <Monitor size={22} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '2rem' }}>
                                    {[
                                        { title: "Dominar Ferramentas", desc: "Pratique o uso de formas, textos e desenhos à mão livre para tornar a sua explicação visualmente rica.", icon: <Palette size={24} /> },
                                        { title: "Testar Quizzes", desc: "Crie e visualize como os alunos interagem com as perguntas em tempo real para maximizar a retenção.", icon: <CheckCircle size={24} /> },
                                        { title: "Gestão de Tempo", desc: "Habitue-se a usar o temporizador de foco para gerir os exercícios práticos da sua aula.", icon: <Clock size={24} /> }
                                    ].map((feature, i) => (
                                        <div key={i} style={{ padding: '2.5rem', borderRadius: '32px', background: 'var(--paper)', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                            <div style={{ color: '#D4AF37', marginBottom: '1.5rem', background: 'rgba(212, 175, 55, 0.05)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {feature.icon}
                                            </div>
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--foreground)' }}>{feature.title}</h4>
                                            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>{feature.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'feedback' && (
                        <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <FeedbackManagement />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Lab Interface Overlay */}
                <AnimatePresence>
                    {isLabActive && (
                        <SalaDeEventosContainer
                            formId={`lab-${user._id}`}
                            isMentor={true}
                            eventTitle="LABORATÓRIO DE TESTES"
                            mentorData={{
                                name: user.name,
                                photo: user.profilePhoto || "",
                                title: "MENTOR (MODO TESTE)",
                                socialLinks: {},
                                whatsapp: ""
                            }}
                            primaryColor="#D4AF37"
                            onClose={() => setIsLabActive(false)}
                        />
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
                    userPlan={user?.plan || 'free'}
                    userRole={user?.role}
                    onUpgradeClick={() => {
                        setIsEventModalOpen(false);
                        setIsUpgradeModalOpen(true);
                    }}
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

                {themeModalData.form && (
                    <EditEventThemeModal
                        isOpen={themeModalData.isOpen}
                        onClose={() => setThemeModalData({ isOpen: false, form: null })}
                        form={themeModalData.form}
                        onSuccess={loadDashboard}
                    />
                )}

                {editModalData.form && (
                    <EditEventModal
                        isOpen={editModalData.isOpen}
                        onClose={() => setEditModalData({ isOpen: false, form: null })}
                        form={editModalData.form}
                        onSuccess={loadDashboard}
                        userPlan={user?.plan || 'free'}
                        userRole={user?.role}
                        onUpgradeClick={() => {
                            setEditModalData({ isOpen: false, form: null });
                            setIsUpgradeModalOpen(true);
                        }}
                    />
                )}

                <ReferralModal
                    isOpen={isReferralModalOpen}
                    onClose={() => setIsReferralModalOpen(false)}
                />

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

                <AnimatePresence>
                    {selectedTutorial && (
                        <LessonPlayerModal
                            lesson={selectedTutorial}
                            onClose={() => setSelectedTutorial(null)}
                            onComplete={() => {
                                // Optionally refresh data or mark locally
                                setPlatformTutorials(prev => prev.map(t =>
                                    t._id === selectedTutorial._id ? { ...t, isCompleted: true } : t
                                ));
                            }}
                        />
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
                {selectedMarketingService && (
                    <MarketingRequestModal
                        isOpen={isMarketingModalOpen}
                        onClose={() => setIsMarketingModalOpen(false)}
                        serviceType={selectedMarketingService.type}
                        serviceName={selectedMarketingService.name}
                        onSuccess={refreshData}
                    />
                )}
            </main>
        </div>
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
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="luxury-card"
            style={{
                background: 'var(--paper)',
                backdropFilter: 'blur(10px)',
                padding: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--gold-gradient)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                    background: 'rgba(212,175,55,0.08)',
                    color: '#D4AF37',
                    padding: '6px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {React.cloneElement(icon as React.ReactElement, { size: 18 })}
                </div>
                {trend !== '0' && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: trend.startsWith('+') ? '#f0fdf4' : '#fef2f2',
                        padding: '1px 6px',
                        borderRadius: '20px',
                        border: `1px solid ${trend.startsWith('+') ? '#dcfce7' : '#fee2e2'}`
                    }}>
                        <span style={{ fontSize: '0.6rem', color: trend.startsWith('+') ? '#16a34a' : '#ef4444', fontWeight: 800 }}>{trend}</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: 'var(--foreground)', margin: 0, letterSpacing: '-0.5px' }}>{value}</h2>
            </div>

            {/* Subtle background element */}
            <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', width: '60px', height: '60px', background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)', borderRadius: '50%' }} />
        </motion.div>
    );
}
