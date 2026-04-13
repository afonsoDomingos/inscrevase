"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authService, UserData } from '@/lib/authService';
import { dashboardService, AdminStats, TrafficStats, TopMentor } from '@/lib/dashboardService';
import UsersList from '@/components/admin/UsersList';
import FormList from '@/components/admin/FormList';
import SubmissionList from '@/components/admin/SubmissionList';
import SupportTicketList from '@/components/admin/SupportTicketList';
import AdminFinance from '@/components/admin/AdminFinance';
import NewsletterList from '@/components/admin/NewsletterList';
import BlogManager from '@/components/admin/BlogManager';
import LessonsManager from '@/components/admin/LessonsManager';
import AdRequestList from '@/components/admin/AdRequestList';
import SmartLinkList from '@/components/admin/SmartLinkList';
import SystemSettings from '@/components/admin/SystemSettings';
import MarketingRequestList from '@/components/admin/MarketingRequestList';
import PaypalPayouts from '@/components/admin/PaypalPayouts';
import BooksManager from '@/components/admin/BooksManager';
import WhatsAppLogs from '@/components/dashboard/WhatsAppLogs';
import VacanciesAdmin from '@/components/admin/VacanciesAdmin';
import MotivaManager from '@/components/admin/MotivaManager';
import SupportModal from '@/components/mentor/SupportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, LogOut, Loader2, LayoutDashboard, Database, ShieldAlert, HelpCircle, LifeBuoy, Wallet, Settings, Eye, EyeOff, Wifi, Globe, Menu, X, ChevronDown, BarChart3, Newspaper, Mail, Send, Video, Megaphone, Trophy, Bell, Link as LinkIcon, Zap, Clock, DollarSign, Book, MessageCircle, Smartphone, Briefcase } from 'lucide-react';

import ProfileModal from '@/components/mentor/ProfileModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supportService } from '@/lib/supportService';
import { referralService, ReferralRanking, ReferralHistory } from '@/lib/referralService';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import AdminMessageModal from '@/components/admin/AdminMessageModal';
import AdminEmailModal from '@/components/admin/AdminEmailModal';
import OnboardingTour, { Step } from '@/components/mentor/OnboardingTour';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, YAxis, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, Legend, ComposedChart, Line } from 'recharts';


import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useSocket } from '@/context/SocketContext';
import { useSpotlight } from '@/hooks/useSpotlight';
import NotificationCenter from '@/components/mentor/NotificationCenter';
import { notificationService } from '@/lib/notificationService';
import { adService } from '@/lib/adService';
import { formService } from '@/lib/formService';
import SponsoredAdCard, { SponsoredItem } from '@/components/home/SponsoredAdCard';
import ThemeToggle from '@/components/common/ThemeToggle';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import Tooltip from '@/components/common/Tooltip';

type Tab = 'overview' | 'users' | 'forms' | 'submissions' | 'support' | 'finance' | 'newsletter' | 'blog' | 'lessons' | 'ads' | 'referrals' | 'smartlinks' | 'settings' | 'marketing' | 'payouts' | 'books' | 'whatsapp' | 'vacancies' | 'motiva';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } }
};

function AdminDashboardContent() {
    const { t } = useTranslate();
    const { currency, formatPrice } = useCurrency();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<UserData | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // Handle tab switching from URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && (['overview', 'users', 'forms', 'submissions', 'support', 'finance', 'newsletter', 'blog', 'lessons', 'ads', 'referrals', 'smartlinks', 'settings', 'marketing', 'payouts', 'books', 'whatsapp', 'vacancies', 'motiva'].includes(tab))) {
            setActiveTab(tab as Tab);
            
            // Auto expand relevant sections if needed
            if (tab === 'vacancies' || tab === 'users' || tab === 'forms') {
                setExpandedSections(prev => ({ ...prev, superAdmin: true }));
            }
        }
    }, [searchParams]);

    const monthNames = [
        t('common.months.jan'), t('common.months.feb'), t('common.months.mar'),
        t('common.months.apr'), t('common.months.may'), t('common.months.jun'),
        t('common.months.jul'), t('common.months.aug'), t('common.months.sep'),
        t('common.months.oct'), t('common.months.nov'), t('common.months.dec')
    ];



    const adminSteps: Step[] = [
        {
            targetId: 'welcome-modal',
            title: t('dashboard.settings.adminTour.welcome.title'),
            description: t('dashboard.settings.adminTour.welcome.desc'),
            position: 'center'
        },
        {
            targetId: 'admin-nav-users',
            title: t('dashboard.settings.adminTour.users.title'),
            description: t('dashboard.settings.adminTour.users.desc'),
            position: 'right'
        },
        {
            targetId: 'admin-global-msg',
            title: t('dashboard.settings.adminTour.comm.title'),
            description: t('dashboard.settings.adminTour.comm.desc'),
            position: 'bottom'
        },
        {
            targetId: 'admin-view-visitor',
            title: t('dashboard.settings.adminTour.visitor.title'),
            description: t('dashboard.settings.adminTour.visitor.desc'),
            position: 'bottom'
        },
        {
            targetId: 'admin-nav-finance',
            title: t('dashboard.settings.adminTour.finance.title'),
            description: t('dashboard.settings.adminTour.finance.desc'),
            position: 'right'
        },
        {
            targetId: 'admin-support-fab',
            title: t('dashboard.settings.adminTour.support.title'),
            description: t('dashboard.settings.adminTour.support.desc'),
            position: 'left'
        }
    ];

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const peakHourToday = trafficStats?.trafficByHour?.length 
        ? [...trafficStats.trafficByHour].sort((a,b) => b.count - a.count)[0] 
        : null;
        
    const peakDayPatternData = trafficStats?.peakDays?.length 
        ? [...trafficStats.peakDays].sort((a,b) => b.count - a.count)[0] 
        : null;
        
    const peakDayPatternName = peakDayPatternData 
        ? [
            t('common.days.sun'), t('common.days.mon'), t('common.days.tue'),
            t('common.days.wed'), t('common.days.thu'), t('common.days.fri'),
            t('common.days.sat')
          ][peakDayPatternData.day - 1] 
        : null;
    const [topMentors, setTopMentors] = useState<TopMentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { onlineUsers } = useSocket();
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState<{ id: string, name: string } | undefined>(undefined);
    const [selectedEmailRecipient, setSelectedEmailRecipient] = useState<{ id: string, name: string } | undefined>(undefined);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        traffic: false,
        users: false,
        performance: false,
        activity: false,
        superAdmin: true
    });
    const [showValues, setShowValues] = useState(true);
    const [isMigrating, setIsMigrating] = useState(false);
    const [referralRanking, setReferralRanking] = useState<ReferralRanking[]>([]);
    const [auditUser, setAuditUser] = useState<ReferralRanking | null>(null);
    const [auditHistory, setAuditHistory] = useState<ReferralHistory[]>([]);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [sponsoredItems, setSponsoredItems] = useState<SponsoredItem[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    interface SuperAdminAnalytics {
        recentLogins: {
            _id: string;
            name: string;
            email: string;
            profilePhoto?: string;
            lastLoginAt: string;
            loginCount: number;
            role: string;
        }[];
        activeUsers: {
            _id: string;
            name: string;
            email: string;
            profilePhoto?: string;
            loginCount: number;
            role: string;
        }[];
    }
    const [superAdminAnalytics, setSuperAdminAnalytics] = useState<SuperAdminAnalytics | null>(null);

    const handleMigrateUsers = async () => {
        if (!confirm('Você tem certeza que deseja marcar TODOS os usuários como verificados? Esta ação é irreversível.')) {
            return;
        }

        setIsMigrating(true);
        try {
            const message = await authService.migrateVerifiedUsers();
            toast.success(message);
        } catch (error: unknown) {
            toast.error((error as Error).message || 'Erro na migração');
        } finally {
            setIsMigrating(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const { handleMouseMove } = useSpotlight();

    useEffect(() => {
        loadUnreadNotifications();

        const interval = setInterval(loadUnreadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUnreadNotifications = async () => {
        try {
            const data = await notificationService.getMyNotifications();
            setUnreadNotifications(data.filter(n => !n.read).length);
        } catch {
            // Silently fail - não é crítico
        }
    };

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                console.log('🔵 [Admin Dashboard] Starting data load...');
                const currentUser = authService.getCurrentUser();
                console.log('🔵 [Admin Dashboard] Current user:', currentUser);

                if (!currentUser) {
                    console.error('🔴 [Admin Dashboard] No user found, redirecting to login');
                    router.push('/entrar');
                    return;
                }

                setUser(currentUser);
                console.log('🔵 [Admin Dashboard] User set successfully');

                console.log('🔵 [Admin Dashboard] Fetching admin stats...');
                const statsData = await dashboardService.getAdminStats();
                console.log('🔵 [Admin Dashboard] Stats received:', statsData);
                setStats(statsData);
                const trafficData = await dashboardService.getTrafficStats();
                setTrafficStats(trafficData);

                try {
                    const [topMentorsData, ranking, events, activeAds] = await Promise.all([
                        dashboardService.getTopMentors(),
                        referralService.getRanking(),
                        formService.getExploreEvents().catch(() => []),
                        adService.getActiveAds().catch(() => [])
                    ]);
                    setTopMentors(topMentorsData);
                    setReferralRanking(ranking);

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
                } catch (e) {
                    console.error("Top mentors or ads error", e);
                }

                if (currentUser.role === 'SuperAdmin') {
                    const superData = await dashboardService.getSuperAdminAnalytics();
                    setSuperAdminAnalytics(superData);
                }

                console.log('✅ [Admin Dashboard] Dashboard loaded successfully');
            } catch (err) {
                console.error("🔴 [Admin Dashboard] Error loading dashboard:", err);
                if (err instanceof Error && (err.message.includes('401') || err.message.includes('perfil'))) {
                    console.log('🔴 [Admin Dashboard] Unauthorized, redirecting...');
                    router.push('/entrar');
                }
            } finally {
                setLoading(false);
                console.log('🔵 [Admin Dashboard] Loading state set to false');
            }
        };

        loadDashboard();
        loadUnreadCount();

        // Poll for updates every 15 seconds (stats, traffic, unread)
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                dashboardService.getAdminStats().then(setStats).catch(err => console.error("Stats polling error", err));
                dashboardService.getTrafficStats().then(setTrafficStats).catch(err => console.error("Traffic polling error", err));
                if (user?.role === 'SuperAdmin') {
                    dashboardService.getSuperAdminAnalytics().then(setSuperAdminAnalytics).catch(err => console.error("Super Admin Analytics polling error", err));
                }
                loadUnreadCount();
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [router, user?.role]);

    const loadUnreadCount = async () => {
        try {
            const data = await supportService.getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const handleAuditUser = async (userId: string) => {
        try {
            setLoading(true);
            const data = await referralService.getAdminUserReferrals(userId);
            setAuditUser(data.user);
            setAuditHistory(data.history);
            setIsAuditModalOpen(true);
        } catch {
            toast.error('Erro ao buscar auditoria de convites');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        );
    }

    if (!user) {
        if (!loading) router.push('/entrar');
        return null;
    }

    const totalUsers = (stats?.mentors || 0) + (stats?.participants || 0);

    const vitalCards = [
        { label: t('dashboard.totalUsers') || 'Total Utilizadores', value: showValues ? (stats?.totalUsers || totalUsers) : '••', icon: <Users size={24} />, color: '#6366f1', tab: 'users' },
        { label: 'Experts / Mentors', value: showValues ? stats?.mentors || 0 : '••', icon: <Trophy size={24} />, color: '#D4AF37', tab: 'users' },
        { label: t('dashboard.usersList.audience.participants') || 'Participantes', value: showValues ? stats?.participants || 0 : '••', icon: <Users size={24} />, color: '#10b981', tab: 'users' },
        { label: t('dashboard.onlineNow'), value: onlineUsers.length, icon: <Wifi size={24} />, color: '#38a169', tab: 'users' },
        { label: t('dashboard.visitsToday'), value: trafficStats?.visitsToday || 0, icon: <Eye size={24} />, color: '#ed8936', tab: 'overview' },
        { label: t('dashboard.totalVisitors') || 'Total Visitantes', value: trafficStats?.totalVisits || 0, icon: <Globe size={24} />, color: '#3182ce', tab: 'overview' },
        { label: t('dashboard.adminFinance.totalRevenue'), value: showValues ? formatPrice(stats?.revenue || 0, 'MZN', currency) : '••••', icon: <TrendingUp size={24} />, color: '#B8860B', tab: 'finance' },
        { label: t('dashboard.submissions'), value: showValues ? stats?.submissions || 0 : '••', icon: <TrendingUp size={24} />, color: '#805ad5', tab: 'submissions' },
    ];

    // Removed unused cards to fix lint errors



    const activityCards = [
        { label: t('dashboard.createdForms'), value: stats?.forms || 0, icon: <FileText size={24} />, color: '#3182ce', tab: 'forms' },
        { label: t('dashboard.approvedSubscriptions'), value: showValues ? stats?.approved || 0 : '••', icon: <CheckCircle size={24} />, color: '#10b981', tab: 'submissions' },
    ];

    const menuGroups = [
        {
            title: t('dashboard.navigation') || 'Geral',
            items: [
                { id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={18} /> },
                { id: 'lessons', label: t('academy.title') || 'Aulas', icon: <Video size={18} /> },
                { id: 'users', label: t('dashboard.users'), icon: <Users size={18} /> },
            ]
        },
        {
            title: t('dashboard.management') || 'Gestão',
            items: [
                { id: 'forms', label: t('dashboard.forms'), icon: <FileText size={18} /> },
                { id: 'submissions', label: t('dashboard.submissions') || 'Inscrições', icon: <Database size={18} /> },
                { id: 'smartlinks', label: t('dashboard.smartlinks') || 'SmartLinks', icon: <LinkIcon size={18} /> },
                { id: 'ads', label: t('dashboard.ads') || 'Anúncios', icon: <Megaphone size={18} /> },
                { id: 'blog', label: t('dashboard.manageBlog'), icon: <Newspaper size={18} /> },
                { id: 'books', label: t('nav.books') || 'Livros', icon: <Book size={18} /> },
                { id: 'vacancies', label: 'Gestão de Vagas', icon: <Briefcase size={18} /> },
            ]
        },
        {
            title: t('dashboard.marketingAndOps') || 'Marketing & Operações',
            items: [
                { id: 'marketing', label: t('dashboard.marketing') || 'Marketing', icon: <Zap size={18} /> },
                { id: 'referrals', label: t('referral.title') || 'Referenciações', icon: <Trophy size={18} /> },
                { id: 'newsletter', label: t('dashboard.newsletter'), icon: <Mail size={18} /> },
                { id: 'motiva', label: 'Prémio MOTIVA', icon: <Trophy size={18} />, isNew: true },
            ]
        },
        {
            title: t('dashboard.adminFinance.title') || 'Financeiro',
            items: [
                { id: 'finance', label: t('dashboard.adminFinance.title') || 'Financeiro', icon: <Wallet size={18} /> },
                { id: 'payouts', label: t('dashboard.payouts') || 'Pagamentos', icon: <DollarSign size={18} /> },
            ]
        },
        {
            title: t('dashboard.system') || 'Sistema',
            items: [
                { id: 'support', label: t('dashboard.support'), icon: <LifeBuoy size={18} /> },
                { id: 'whatsapp', label: 'WhatsApp Automação', icon: <MessageCircle size={18} /> },
                { id: 'settings', label: t('dashboard.settings.title') || 'Definições', icon: <Settings size={18} /> },
            ]
        }

    ].map(group => ({
        ...group,
        items: group.items.filter(item => (item.id !== 'finance' && item.id !== 'ads' && item.id !== 'settings' && item.id !== 'marketing' && item.id !== 'payouts' && item.id !== 'whatsapp' && item.id !== 'vacancies' && item.id !== 'motiva') || user?.role === 'SuperAdmin' || (user?.role === 'admin' && (item.id === 'vacancies' || item.id === 'motiva')))
    }));

    return (
        <div className="admin-container" style={{ position: 'relative' }}>
            <div className="bg-mesh" />
            <button
                className="admin-mobile-toggle"
                onClick={() => setIsSidebarOpen(true)}
                style={{ visibility: isSidebarOpen ? 'hidden' : undefined, pointerEvents: isSidebarOpen ? 'none' : undefined }}
            >
                {/* Logo */}
                <span className="toggle-logo">
                    INSCREVA<span>.SE</span>
                </span>
                {/* Chip */}
                <span className="toggle-chip">
                    <Menu size={16} /> Menu
                </span>
            </button>

            <div
                className={`admin-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''} ${isDesktopSidebarCollapsed ? 'collapsed' : ''}`}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' }}>
                    {!isDesktopSidebarCollapsed ? (
                        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                            INSCREVA<span className="gold-text">.SE</span>
                        </h2>
                    ) : (
                        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: '#FFD700', margin: 0 }}>
                            I.
                        </h2>
                    )}
                    {/* Mobile close button inside sidebar */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="admin-sidebar-close-btn"
                        style={{
                            display: 'none',
                            background: 'rgba(255,215,0,0.1)',
                            border: '1px solid rgba(255,215,0,0.3)',
                            color: '#FFD700',
                            borderRadius: '10px',
                            padding: '8px',
                            cursor: 'pointer',
                            alignItems: 'center',
                            justifyContent: 'center',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="luxury-scrollbar" style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {!isDesktopSidebarCollapsed && (
                                <div style={{
                                    padding: '0 1rem',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    color: '#888',
                                    letterSpacing: '1px',
                                    marginBottom: '0.5rem',
                                    opacity: 0.6
                                }}>
                                    {group.title}
                                </div>
                            )}
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id as Tab); setIsSidebarOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 14px',
                                        width: '100%',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: activeTab === item.id ? 'var(--gold-gradient)' : 'transparent',
                                        color: activeTab === item.id ? '#000' : '#888',
                                        fontWeight: activeTab === item.id ? 800 : 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        textAlign: 'left',
                                        fontSize: '0.85rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    id={'admin-nav-' + item.id}
                                >
                                    <div style={{ opacity: activeTab === item.id ? 1 : 0.7, minWidth: '20px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                                    {!isDesktopSidebarCollapsed && (
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.label}
                                        </span>
                                    )}
                                    {!isDesktopSidebarCollapsed && item.isNew && (
                                        <span style={{
                                            marginLeft: '8px',
                                            padding: '2px 6px',
                                            background: activeTab === item.id ? '#000' : '#FFD700',
                                            color: activeTab === item.id ? '#FFD700' : '#000',
                                            borderRadius: '6px',
                                            fontSize: '0.6rem',
                                            fontWeight: 900,
                                            textTransform: 'uppercase'
                                        }}>
                                            Novo
                                        </span>
                                    )}
                                    {!isDesktopSidebarCollapsed && item.id === 'support' && unreadCount > 0 && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            background: '#ef4444',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: 700
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <button
                    onClick={() => window.dispatchEvent(new Event('start-onboarding'))}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isDesktopSidebarCollapsed ? 'center' : 'flex-start',
                        gap: '12px',
                        padding: isDesktopSidebarCollapsed ? '0.75rem' : '0.75rem 2rem',
                        width: '100%',
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
                    <HelpCircle size={20} />
                    {!isDesktopSidebarCollapsed && t('dashboard.settings.guidedTour')}
                </button>

                <div style={{ padding: '1.5rem' }}>
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'none',
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            color: '#000',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontWeight: 600,
                            marginBottom: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Settings size={18} /> {!isDesktopSidebarCollapsed && t('events.profile.title')}
                    </button>
                </div>
                <button
                    onClick={() => authService.logout()}
                    style={{
                        width: '100%',
                        padding: '1rem',
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
                    <LogOut size={18} /> {!isDesktopSidebarCollapsed && t('common.logout')}
                </button>
            </aside>

            {/* Main Content */}
            <main className={`admin-main ${isDesktopSidebarCollapsed ? 'expanded' : ''}`}>
                {/* Header */}
                <header className="admin-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1.5rem',
                    marginBottom: '3rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1 1 300px', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Tooltip content={isDesktopSidebarCollapsed ? "Mostrar Menu" : "Ocultar Menu"}>
                            <button
                                className="desktop-sidebar-toggle"
                                onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
                            >
                                <Menu size={24} />
                            </button>
                        </Tooltip>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                                <ShieldAlert size={16} />
                                <span style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>{(user.role === 'admin' || user.role === 'SuperAdmin') ? t('dashboard.adminDashboard') : t('dashboard.mentorDashboard')}</span>
                            </div>
                            <motion.h1
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                style={{
                                    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                                    fontWeight: 800,
                                    fontFamily: 'var(--font-playfair)',
                                    lineHeight: 1.1,
                                    color: 'var(--foreground)',
                                    overflowWrap: 'break-word',
                                    wordWrap: 'break-word',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}
                            >
                                <span className="gold-text" style={{ wordBreak: 'break-word' }}>
                                    {user.name?.split(' ')[0] || 'Admin'}
                                </span>
                            </motion.h1>
                        </div>
                    </div>

                    <div className="admin-actions-group" style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <LanguageSwitcher />
                        <CurrencySwitcher />
                        <ThemeToggle />
                        <div style={{ position: 'relative' }}>
                            <Tooltip content="Notificações">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
                                        background: '#fff',
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
                            </Tooltip>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: isMobile ? 'fixed' : 'absolute',
                                            top: isMobile ? '70px' : '55px',
                                            right: isMobile ? '16px' : 0,
                                            left: isMobile ? '16px' : 'auto',
                                            zIndex: 2000,
                                            display: isMobile ? 'flex' : 'block',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <NotificationCenter onClose={() => { setIsNotificationsOpen(false); loadUnreadNotifications(); }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={() => setShowValues(!showValues)}
                            style={{
                                padding: '0.7rem 1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                borderRadius: '50px',
                                background: '#fff',
                                color: '#000',
                                border: '2px solid #000',
                                whiteSpace: 'nowrap',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontSize: '0.75rem',
                                letterSpacing: '0.3px'
                            }}
                        >
                            {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showValues ? t('dashboard.hideValues') : t('dashboard.showValues')}
                        </button>
                        <button
                            onClick={() => {
                                setSelectedRecipient(undefined);
                                setIsMessageModalOpen(true);
                            }}
                            id="admin-global-msg"
                            style={{
                                padding: '0.7rem 1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                borderRadius: '50px',
                                background: '#000',
                                color: '#FFD700',
                                border: '2px solid #000',
                                whiteSpace: 'nowrap',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontSize: '0.75rem',
                                letterSpacing: '0.3px'
                            }}
                            className="hover:translate-y-[-2px] hover:shadow-lg"
                        >
                            <Send size={16} /> {t('dashboard.broadcast')}
                        </button>
                        <button
                            onClick={() => {
                                setSelectedEmailRecipient(undefined);
                                setIsEmailModalOpen(true);
                            }}
                            style={{
                                padding: '0.7rem 1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                borderRadius: '50px',
                                background: '#B8860B',
                                color: '#fff',
                                border: 'none',
                                whiteSpace: 'nowrap',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontSize: '0.75rem',
                                letterSpacing: '0.3px'
                            }}
                            className="hover:translate-y-[-2px] hover:shadow-lg"
                        >
                            <Mail size={16} /> {t('common.sendEmail')}
                        </button>
                        <Link
                            href="/"
                            target="_blank"
                            id="admin-view-visitor"
                            style={{
                                padding: '0.7rem 1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                                letterSpacing: '0.5px',
                                borderRadius: '50px',
                                background: 'transparent',
                                border: '1px solid #FFD700',
                                color: '#000',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                transition: 'all 0.3s'
                            }}
                            className="hover:bg-[#FFD700] hover:translate-y-[-2px]"
                        >
                            <Eye size={16} /> {t('dashboard.visitor')}
                        </Link>
                        <Tooltip content={t('common.logout')}>
                            <button
                                onClick={() => authService.logout()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                    background: '#fff',
                                    border: '1px solid #fed7d7',
                                    borderRadius: '50%',
                                    color: '#e53e3e',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <LogOut size={18} />
                            </button>
                        </Tooltip>
                    </div>
                </header >

                {/* Sponsored Ads Section */}
                {
                    sponsoredItems.length > 0 && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <SponsoredAdCard events={sponsoredItems} />
                        </div>
                    )
                }

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Vital Stats Grid */}
                            <div id="admin-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '2.5rem' }}>
                                {vitalCards.map((card, index) => (
                                    <StatCard
                                        key={index}
                                        icon={card.icon}
                                        label={card.label}
                                        value={card.value}
                                        color={card.color}
                                        onClick={() => setActiveTab(card.tab as Tab)}
                                    />
                                ))}
                            </div>

                            {/* Super Admin Performance - Recent Logins & Most Active */}
                            {user?.role === 'SuperAdmin' && superAdminAnalytics && (
                                <div className="accordion-section" style={{ marginBottom: '2.5rem' }}>
                                    <button
                                        onClick={() => toggleSection('superAdmin')}
                                        style={{
                                            width: '100%',
                                            padding: '1.2rem 1.8rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: '#fff',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '18px',
                                            color: '#1a1a1a',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s ease',
                                            marginBottom: expandedSections.superAdmin ? '1.5rem' : '0'
                                        }}
                                        className="hover:shadow-md"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                                            <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                                <ShieldAlert size={20} className="gold-text" />
                                            </div>
                                            Performance & Atividade Global (Super Admin)
                                        </div>
                                        <motion.div animate={{ rotate: expandedSections.superAdmin ? 180 : 0 }}>
                                            <ChevronDown size={22} />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedSections.superAdmin && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                                    <motion.div variants={itemVariants} className="luxury-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e0e0e0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>

                                                            <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                                                <Clock size={22} className="gold-text" />
                                                            </div>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Últimos 10 Acessos</h3>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            {superAdminAnalytics.recentLogins.map((login, idx) => (
                                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.8rem', background: 'rgba(0,0,0,0.02)', borderRadius: '14px' }}>
                                                                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                                                                        <Image
                                                                            src={login.profilePhoto || 'https://ui-avatars.com/api/?name=' + login.name}
                                                                            width={40}
                                                                            height={40}
                                                                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                                                                            alt={login.name}
                                                                            unoptimized
                                                                        />
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' }}>{login.name}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            {login.email}
                                                                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(212, 175, 55, 0.1)', color: '#B8860B', borderRadius: '4px', fontWeight: 800 }}>
                                                                                {login.loginCount || 0} acessos
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#B8860B' }}>
                                                                            {new Date(login.lastLoginAt).toLocaleDateString()}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.7rem', color: '#888' }}>
                                                                            {new Date(login.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>

                                                    <motion.div variants={itemVariants} className="luxury-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e0e0e0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                                            <div style={{ background: 'rgba(56, 161, 105, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                                                <Zap size={22} style={{ color: '#38a169' }} />
                                                            </div>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Usuários Mais Ativos</h3>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            {superAdminAnalytics.activeUsers.map((active, idx) => (
                                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.8rem', background: 'rgba(0,0,0,0.02)', borderRadius: '14px' }}>
                                                                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                                                                        <Image
                                                                            src={active.profilePhoto || 'https://ui-avatars.com/api/?name=' + active.name}
                                                                            width={40}
                                                                            height={40}
                                                                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                                                                            alt={active.name}
                                                                            unoptimized
                                                                        />
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' }}>{active.name}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{active.email}</div>
                                                                    </div>
                                                                    <div style={{ textAlign: 'center', minWidth: '60px', background: 'var(--gold-gradient)', padding: '4px 8px', borderRadius: '10px' }}>
                                                                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#000' }}>{active.loginCount || 0}</div>
                                                                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>Acessos</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Collapsible Secondary Stats */}
                            {/* Operational Details */}
                            <div className="accordion-section" style={{ marginBottom: '1.2rem' }}>
                                <button
                                    onClick={() => toggleSection('activity')}
                                    style={{
                                        width: '100%',
                                        padding: '1.2rem 1.8rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: '#fff',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '18px',
                                        color: '#1a1a1a',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    className="hover:shadow-md"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                                        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                            <FileText size={20} className="gold-text" />
                                        </div>
                                        {t('dashboard.operationalActivity')}
                                    </div>
                                    <motion.div animate={{ rotate: expandedSections.activity ? 180 : 0 }}>
                                        <ChevronDown size={22} />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {expandedSections.activity && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="stats-grid" style={{ padding: '1.5rem 0.5rem' }}>
                                                {activityCards.map((card, idx) => (
                                                    <div key={idx} className="luxury-card" style={{ background: '#fff', padding: '1.25rem', border: '1px solid #f0f0f0', borderRadius: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                                            <div style={{ background: `${card.color}15`, color: card.color, padding: '8px', borderRadius: '10px' }}>{card.icon}</div>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
                                                        </div>
                                                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#000', fontFamily: 'var(--font-inter)' }}>{card.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* System Tools */}
                            <div className="accordion-section" style={{ marginBottom: '1.2rem' }}>
                                <div style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '18px',
                                    padding: '1.2rem 1.8rem',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 800, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Settings size={20} className="gold-text" />
                                        Ferramentas do Sistema
                                    </h4>
                                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={handleMigrateUsers}
                                            disabled={isMigrating}
                                            style={{
                                                background: isMigrating ? '#ccc' : '#2a2a2a',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '10px 20px',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                cursor: isMigrating ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {isMigrating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                            Verificar Todos os E-mails (Limpeza de Base)
                                        </button>
                                    </div>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '0.75rem', color: '#666' }}>
                                        Esta ação marcará todos os usuários existentes como verificados. Use apenas uma vez para limpar a base antiga.
                                    </p>
                                </div>
                            </div>

                            {/* Advanced Insights Section (Fixed) */}
                            <div style={{ marginTop: '3rem', marginBottom: '2.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    marginBottom: '2rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '2px solid rgba(212, 175, 55, 0.2)'
                                }}>
                                    <BarChart3 size={28} className="gold-text" style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.3))' }} />
                                    <div>
                                        <h2 style={{
                                            fontSize: '1.4rem',
                                            fontWeight: 900,
                                            letterSpacing: '2px',
                                            textTransform: 'uppercase',
                                            color: '#1a1a1a',
                                            fontFamily: 'var(--font-playfair)'
                                        }}>
                                            {t('dashboard.analyticsAndInsights')}
                                        </h2>
                                        <p style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>Dados estratégicos e performance global</p>
                                    </div>
                                </div>

                                <div style={{ paddingTop: '1rem' }}>

                                    {/* User Acquisition Section */}
                                    <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="split-grid">
                                        <div className="luxury-card" style={{ padding: '2rem' }}>
                                            <div className="spotlight" />
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                <Database className="gold-text" size={20} /> {t('dashboard.originDistribution')}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1, minWidth: '250px' }}>
                                                    {[
                                                        { label: t('dashboard.nativeEmail'), count: stats?.authStats?.native || 0, color: '#1a1a1a' },
                                                        { label: t('dashboard.googleAuth'), count: stats?.authStats?.google || 0, color: '#db4437' },
                                                        { label: t('dashboard.linkedinConnect'), count: stats?.authStats?.linkedin || 0, color: '#0077b5' }
                                                    ].map((item, idx) => {
                                                        const total = (stats?.authStats?.native || 0) + (stats?.authStats?.google || 0) + (stats?.authStats?.linkedin || 0);
                                                        const percentage = total > 0 ? (item.count / total) * 100 : 0;
                                                        return (
                                                            <div key={idx} style={{ marginBottom: '1rem' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                                                                    <span style={{ fontWeight: 700, color: item.color }}>{item.label}</span>
                                                                    <span style={{ fontWeight: 800 }}>{item.count} ({Math.round(percentage)}%)</span>
                                                                </div>
                                                                <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${percentage}%` }}
                                                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                                                        style={{ height: '100%', background: item.color }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div style={{ width: '180px', height: '180px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={[
                                                                    { name: 'Nativo', value: stats?.authStats?.native || 0 },
                                                                    { name: 'Google', value: stats?.authStats?.google || 0 },
                                                                    { name: 'LinkedIn', value: stats?.authStats?.linkedin || 0 },
                                                                ]}
                                                                innerRadius={50}
                                                                outerRadius={70}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                <Cell fill="#1a1a1a" />
                                                                <Cell fill="#db4437" />
                                                                <Cell fill="#0077b5" />
                                                            </Pie>
                                                            <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />

                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="luxury-card" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#000', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                                                <Database size={150} />
                                            </div>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-playfair)', position: 'relative' }}>💡 {t('dashboard.growthInsight')}</h3>
                                            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9, fontWeight: 500, position: 'relative' }}>
                                                {(stats?.authStats?.google || 0) + (stats?.authStats?.linkedin || 0) > (stats?.authStats?.native || 0)
                                                    ? t('dashboard.socialLoginInsight')
                                                    : t('dashboard.nativeEmailInsight')
                                                }
                                            </p>
                                            <div style={{ marginTop: '1.5rem', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', background: 'rgba(0,0,0,0.1)', padding: '8px 15px', borderRadius: '50px', width: 'fit-content' }}>
                                                <TrendingUp size={16} /> {t('common.dataIsPower')}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* NEW: Health & Progress Dashboard */}
                                    <div className="charts-grid" style={{ marginBottom: '2.5rem' }}>
                                        {/* Radar Chart: Platform Health */}
                                        <motion.div
                                            variants={itemVariants}
                                            onMouseMove={handleMouseMove}
                                            className="luxury-card"
                                            style={{
                                                padding: '2.5rem',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div className="spotlight" />
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', color: '#1a1a1a', fontFamily: 'var(--font-playfair)' }}>
                                                <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '12px' }}>
                                                    <LayoutDashboard className="gold-text" size={24} />
                                                </div>
                                                {t('dashboard.engagementBalance')}
                                            </h3>
                                            <div style={{ height: '320px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart key={`radar-${expandedSections.performance}`} cx="50%" cy="50%" outerRadius="80%" data={[
                                                        { subject: t('dashboard.mentors'), A: stats?.mentors || 0, fullMark: 100 },
                                                        { subject: t('dashboard.forms'), A: stats?.forms || 0, fullMark: 100 },
                                                        { subject: t('dashboard.participants'), A: stats?.participants || 0, fullMark: 100 },
                                                        { subject: t('dashboard.submissions'), A: stats?.submissions || 0, fullMark: 100 },
                                                        { subject: t('dashboard.estimatedRevenue'), A: (stats?.revenue || 0) / 1000, fullMark: 100 },
                                                    ]}>
                                                        <PolarGrid stroke="#eee" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 10 }} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                        <Radar name="Performance" dataKey="A" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.6} />
                                                        <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />

                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </motion.div>

                                        {/* Top Mentors Leaderboard */}
                                        <motion.div
                                            variants={itemVariants}
                                            onMouseMove={handleMouseMove}
                                            className="luxury-card"
                                            style={{
                                                padding: '2rem',
                                                background: '#fff',
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                                                overflow: 'hidden',
                                                minHeight: '400px'
                                            }}
                                        >
                                            <div className="spotlight" />
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', fontFamily: 'var(--font-playfair)' }}>
                                                <div style={{ background: '#FFD700', padding: '6px', borderRadius: '50%', color: '#000' }}>
                                                    <TrendingUp size={16} />
                                                </div>
                                                {t('dashboard.admin.topMentorsElite')}
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', zIndex: 1 }}>
                                                {topMentors.length > 0 ? topMentors.map((mentor, idx) => (
                                                    <div key={mentor.id} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '15px',
                                                        padding: '12px',
                                                        borderRadius: '12px',
                                                        background: idx === 0 ? 'var(--gold-gradient)' : 'rgba(0,0,0,0.02)',
                                                        color: idx === 0 ? '#000' : '#333',
                                                        border: idx === 0 ? 'none' : '1px solid #f0f0f0'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '1rem',
                                                            fontWeight: 900,
                                                            color: idx === 0 ? '#000' : '#aaa',
                                                            width: '24px',
                                                            textAlign: 'center'
                                                        }}>#{idx + 1}</div>

                                                        {/* Avatar */}
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            background: '#ddd',
                                                            backgroundImage: `url(${mentor.user?.profilePhoto || 'https://via.placeholder.com/40'})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            border: '2px solid #fff'
                                                        }} />

                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{mentor.user?.name || 'Desconhecido'}</div>
                                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{mentor.user?.email}</div>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '15px', textAlign: 'right' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{mentor.submissions}</div>
                                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7 }}>{t('dashboard.admin.formsSubCount')}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{mentor.visits}</div>
                                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7 }}>{t('dashboard.admin.visitsLabel')}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                                                        Nenhum dado disponível ainda.
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>



                                        {/* Radial Bar: Monthly Goals Progress */}
                                        <motion.div
                                            variants={itemVariants}
                                            onMouseMove={handleMouseMove}
                                            className="luxury-card"
                                            style={{
                                                padding: '2.5rem',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div className="spotlight" />
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', color: '#1a1a1a', fontFamily: 'var(--font-playfair)' }}>
                                                <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '12px' }}>
                                                    <CheckCircle className="gold-text" size={24} />
                                                </div>
                                                {t('dashboard.monthlyGoals')}
                                            </h3>
                                            <div style={{ height: '380px', width: '100%', position: 'relative' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadialBarChart
                                                        key={`radial-${expandedSections.performance}`}
                                                        cx="50%" cy="45%"
                                                        innerRadius="30%" outerRadius="90%"
                                                        barSize={20}
                                                        data={[
                                                            { name: t('dashboard.submissions'), uv: stats?.submissions || 0, fill: '#805ad5' },
                                                            { name: t('dashboard.estimatedRevenue'), uv: (stats?.revenue || 0) / 100, fill: '#D4AF37' },
                                                            { name: t('dashboard.activeMentors'), uv: (stats?.mentors || 0) * 10, fill: '#1a1a1a' },
                                                            { name: t('dashboard.visitsToday'), uv: (trafficStats?.visitsToday || 0), fill: '#ed8936' }
                                                        ]}
                                                    >
                                                        <RadialBar
                                                            label={{ position: 'insideStart', fill: '#fff', fontSize: '10px', fontWeight: 700 }}
                                                            background={{ fill: '#f0f0f0' }}
                                                            dataKey="uv"
                                                            cornerRadius={10}
                                                        />
                                                        <Legend
                                                            iconSize={12}
                                                            layout="horizontal"
                                                            verticalAlign="bottom"
                                                            align="center"
                                                            wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '0.85rem' }}
                                                        />
                                                        <RechartsTooltip
                                                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                                        />

                                                    </RadialBarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </motion.div>
                                    </div>

                                    <div className="charts-grid" style={{ marginBottom: '2.5rem' }}>
                                        {/* Traffic & Conversion Composed Chart */}
                                        <motion.div
                                            variants={itemVariants}
                                            onMouseMove={handleMouseMove}
                                            className="luxury-card"
                                            style={{
                                                padding: '2.5rem',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div className="spotlight" />
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', color: '#1a1a1a', fontFamily: 'var(--font-playfair)' }}>
                                                <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '12px' }}>
                                                    <TrendingUp className="gold-text" size={24} />
                                                </div>
                                                {t('dashboard.trafficVsActivityToday')}
                                            </h3>
                                            <div style={{ height: '320px', width: '100%' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <ComposedChart key={`composed-${expandedSections.performance}`} data={trafficStats?.trafficByHour || []}>
                                                        <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                                        <RechartsTooltip cursor={{ fill: '#f4f4f4' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />

                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                        <Bar dataKey="count" fill="#FFD700" radius={[4, 4, 0, 0]} name={t('dashboard.visitsToday')} />
                                                        <Line type="monotone" dataKey="count" stroke="#1a1a1a" strokeWidth={3} dot={{ r: 4 }} name={t('dashboard.trend')} />
                                                    </ComposedChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </motion.div>

                                        {/* Monthly Growth Chart (Access Evolution) */}
                                        <motion.div
                                            variants={itemVariants}
                                            onMouseMove={handleMouseMove}
                                            className="luxury-card"
                                            style={{
                                                padding: '2rem',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div className="spotlight" />
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', color: '#1a1a1a', fontFamily: 'var(--font-playfair)' }}>
                                                <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '12px' }}>
                                                    <BarChart3 className="gold-text" size={24} />
                                                </div>
                                                {t('dashboard.admin.accessEvolutionYear')}
                                            </h3>
                                            <div style={{ height: '300px', width: '100%' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart key={`area-${expandedSections.performance}`} data={trafficStats?.trafficByMonth?.map(m => ({ name: monthNames[m.month - 1], count: m.count })) || []}>
                                                        <defs>
                                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />

                                                        <Area type="monotone" dataKey="count" stroke="#D4AF37" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={3} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* NEW: Peak Time Analysis */}
                                    <motion.div
                                        variants={itemVariants}
                                        onMouseMove={handleMouseMove}
                                        className="luxury-card"
                                        style={{
                                            padding: '2.5rem',
                                            background: '#fff',
                                            marginBottom: '2.5rem',
                                            border: '1px solid rgba(212, 175, 55, 0.1)',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                                            borderRadius: '24px'
                                        }}
                                    >
                                        <div className="spotlight" />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '15px' }}>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#1a1a1a', fontFamily: 'var(--font-playfair)', margin: 0 }}>
                                                <div style={{ background: 'rgba(212, 175, 55, 0.12)', padding: '8px', borderRadius: '12px' }}>
                                                    <Clock className="gold-text" size={24} />
                                                </div>
                                                {t('dashboard.admin.peakAnalyticsTitle')}
                                            </h3>
                                            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 700, background: '#f8f8f8', padding: '6px 12px', borderRadius: '50px' }}>
                                                {t('dashboard.admin.usagePattern')}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                                            {/* Days of Week Chart */}
                                            <div>
                                                <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 800, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '4px', height: '16px', background: '#D4AF37', borderRadius: '2px' }} />
                                                    {t('dashboard.admin.peakDaysTitle')}
                                                </div>
                                                <div style={{ height: '280px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={[1, 2, 3, 4, 5, 6, 7].map(d => {
                                                            const dayMatch = trafficStats?.peakDays?.find(p => p.day === d);
                                                            const daysList = [
                                                                t('common.days.sun'), t('common.days.mon'), t('common.days.tue'),
                                                                t('common.days.wed'), t('common.days.thu'), t('common.days.fri'),
                                                                t('common.days.sat')
                                                            ];
                                                            return { name: daysList[d - 1], count: dayMatch ? dayMatch.count : 0 };
                                                        })}>
                                                            <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                                                            <RechartsTooltip cursor={{ fill: '#f8f8f8' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                                            <Bar dataKey="count" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={24} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* Hours of Day Pattern */}
                                            <div>
                                                <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 800, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '4px', height: '16px', background: '#1a1a1a', borderRadius: '2px' }} />
                                                    {t('dashboard.admin.peakHoursTitle')}
                                                </div>
                                                <div style={{ height: '280px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={Array.from({ length: 24 }, (_, i) => {
                                                            const hourMatch = trafficStats?.peakHours?.find(p => p.hour === i);
                                                            return { hour: i, count: hourMatch ? hourMatch.count : 0 };
                                                        })}>
                                                            <defs>
                                                                <linearGradient id="colorHourPeak" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                                                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                                            <Area type="monotone" dataKey="count" stroke="#1a1a1a" fillOpacity={1} fill="url(#colorHourPeak)" strokeWidth={3} dot={false} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Intelligent Insight Message */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                marginTop: '2.5rem',
                                                padding: '1.5rem 2rem',
                                                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 100%)',
                                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                                borderRadius: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '24px'
                                            }}
                                        >
                                            <div style={{ 
                                                background: 'var(--gold-gradient)', 
                                                color: '#000', 
                                                padding: '12px', 
                                                borderRadius: '14px',
                                                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                                            }}>
                                                <Zap size={24} fill="#000" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    fontSize: '0.75rem', 
                                                    textTransform: 'uppercase', 
                                                    fontWeight: 900, 
                                                    color: '#B8860B', 
                                                    letterSpacing: '1px',
                                                    marginBottom: '4px' 
                                                }}>
                                                    {t('dashboard.admin.todayPeakInsight')}
                                                </div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', lineHeight: 1.4 }}>
                                                    {peakHourToday 
                                                        ? t('dashboard.admin.todayPeakMessage')
                                                            .replace('{hour}', peakHourToday.hour.toString())
                                                            .replace('{count}', peakHourToday.count.toString())
                                                        : t('common.loading') + '...'}
                                                </div>
                                                {peakDayPatternName && (
                                                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px', fontWeight: 500 }}>
                                                        {t('dashboard.admin.patternPeakMessage').replace('{day}', peakDayPatternName)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div style={{ 
                                                background: 'rgba(0,0,0,0.03)', 
                                                padding: '10px 18px', 
                                                borderRadius: '12px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#999', fontWeight: 700 }}>{t('dashboard.admin.peakNow')}</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1a1a1a' }}>{peakHourToday?.hour || 0}h</div>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Pages and Geography */}
                                    <div className="split-grid" style={{ marginTop: '2rem' }}>
                                        <div className="luxury-card" style={{
                                            padding: '2.5rem',
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            border: '1px solid rgba(212, 175, 55, 0.2)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                        }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#1a1a1a', fontFamily: 'var(--font-playfair)' }}>
                                                <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '12px' }}>
                                                    <Globe className="gold-text" size={24} />
                                                </div>
                                                {t('dashboard.admin.topCountries')}
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {(trafficStats?.topCountries || []).slice(0, 5).map((item, idx) => {
                                                    const countryMap: Record<string, { name: string, flag: string }> = {
                                                        'MZ': { name: 'Moçambique', flag: '🇲🇿' },
                                                        'US': { name: 'Estados Unidos', flag: '🇺🇸' },
                                                        'AO': { name: 'Angola', flag: '🇦🇴' },
                                                        'FR': { name: 'França', flag: '🇫🇷' },
                                                        'GW': { name: 'Guiné-Bissau', flag: '🇬🇼' },
                                                        'PT': { name: 'Portugal', flag: '🇵🇹' },
                                                        'BR': { name: 'Brasil', flag: '🇧🇷' },
                                                        'CV': { name: 'Cabo Verde', flag: '🇨🇻' },
                                                        'ZA': { name: 'África do Sul', flag: '🇿🇦' },
                                                        'ST': { name: 'São Tomé', flag: '🇸🇹' }
                                                    };
                                                    const countryData = countryMap[item.country.toUpperCase()] || { name: item.country, flag: '🌍' };

                                                    return (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                                            <span style={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontSize: '1.2rem' }}>{countryData.flag}</span>
                                                                {countryData.name}
                                                            </span>
                                                            <span style={{ fontWeight: 800, color: '#D4AF37' }}>{item.count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="luxury-card" style={{
                                            padding: '2.5rem',
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            border: '1px solid rgba(212, 175, 55, 0.2)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                        }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#1a1a1a', fontFamily: 'var(--font-playfair)' }}>
                                                <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '12px' }}>
                                                    <FileText className="gold-text" size={24} />
                                                </div>
                                                Páginas Ativas
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {(trafficStats?.topPages || []).slice(0, 5).map((page, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{page.page}</span>
                                                        <span style={{ fontWeight: 800, color: '#1a1a1a' }}>{page.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div >
                            </div >

                            <motion.div variants={itemVariants} onMouseMove={handleMouseMove} style={{ marginTop: '2.5rem' }}>
                                <div className="luxury-card" style={{
                                    position: 'relative',
                                    background: '#000',
                                    color: '#fff',
                                    padding: '4rem 2rem',
                                    textAlign: 'center',
                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                    overflow: 'hidden',
                                    borderRadius: '30px'
                                }}>
                                    {/* Image Background Wrapper */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundImage: 'url("/admin-card-bg.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        opacity: 0.4,
                                        zIndex: 0
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 100%)',
                                        zIndex: 0
                                    }} />

                                    <div className="spotlight" style={{ zIndex: 1 }} />

                                    <div style={{ position: 'relative', zIndex: 10 }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            background: 'rgba(255,215,0,0.1)',
                                            padding: '8px 20px',
                                            borderRadius: '50px',
                                            border: '1px solid rgba(255,215,0,0.3)',
                                            marginBottom: '2rem'
                                        }}>
                                            <ShieldAlert size={18} className="gold-text" />
                                            <span style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>INSCREVA<span style={{ color: '#FFD700' }}>.SE</span></span>
                                        </div>

                                        <h2 style={{
                                            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                                            marginBottom: '1.2rem',
                                            fontFamily: 'var(--font-playfair)',
                                            background: 'linear-gradient(to right, #fff, #60a5fa)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 900
                                        }}>
                                            Modo Super Administrador Ativo
                                        </h2>

                                        <p style={{
                                            color: 'rgba(255,255,255,0.85)',
                                            maxWidth: '650px',
                                            margin: '0 auto 3rem',
                                            fontSize: '1.2rem',
                                            lineHeight: 1.6,
                                            fontWeight: 400
                                        }}>
                                            Gestão centralizada de mentores, formulários inteligentes e fluxos financeiros.
                                            Bem-vindo ao centro de comando da <span className="gold-text" style={{ fontWeight: 700 }}>Inscreva-se</span>.
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setActiveTab('users')}
                                                className="btn-primary"
                                                style={{
                                                    padding: '1.1rem 2.8rem',
                                                    fontSize: '0.95rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                <Users size={20} /> Gerenciar Usuários
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('forms')}
                                                className="gold-border-btn"
                                                style={{
                                                    padding: '1.1rem 2.8rem',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    backdropFilter: 'blur(5px)'
                                                }}
                                            >
                                                <BarChart3 size={20} /> Estatísticas Elite
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div >
                    )
                    }

                    {
                        activeTab === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <ErrorBoundary>
                                    <UsersList
                                        onMessageUser={(user) => {
                                            setSelectedRecipient({ id: user.id || user._id || '', name: user.name });
                                            setIsMessageModalOpen(true);
                                        }}
                                        onEmailUser={(user) => {
                                            setSelectedEmailRecipient({ id: user.id || user._id || '', name: user.name });
                                            setIsEmailModalOpen(true);
                                        }}
                                    />
                                </ErrorBoundary>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'forms' && (
                            <motion.div key="forms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <FormList onEmailMentor={(mentorId, mentorName) => {
                                    setSelectedEmailRecipient({ id: mentorId, name: mentorName });
                                    setIsEmailModalOpen(true);
                                }} />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'submissions' && (
                            <motion.div key="submissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <SubmissionList />
                            </motion.div>
                        )
                    }

                    {activeTab === 'support' && (
                        <ErrorBoundary>
                            <SupportTicketList />
                        </ErrorBoundary>
                    )}

                    {activeTab === 'whatsapp' && user.role === 'SuperAdmin' && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '24px',
                            padding: '3rem',
                            textAlign: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '2rem', fontFamily: 'var(--font-playfair)' }}>
                                Automação WhatsApp 💬
                            </h2>

                            <iframe 
                                    src={`${(process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) : 'http://localhost:5000')).replace(/\/api$/, '')}/api/admin/whatsapp/qr`}
                                    style={{
                                        width: '100%',
                                        height: '460px', // Aumentado ligeiramente para acomodar o form de código
                                        border: 'none',
                                        overflow: 'hidden',
                                        borderRadius: '16px',
                                        marginBottom: '1rem',
                                        background: '#fff'
                                    }}
                                    title="WhatsApp QR Monitor"
                                />

                            <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '1.5rem', borderRadius: '16px', width: '100%' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Smartphone size={18} /> Instruções Rápidas:
                                </h3>
                                <ol style={{ paddingLeft: '1.2rem', color: '#555', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <li>Abra o WhatsApp no telemóvel da empresa.</li>
                                    <li>Vá a <strong>Definições</strong> ou <strong>Aparelhos Conectados</strong>.</li>
                                    <li>Se aparecer &quot;Connected&quot;, o sistema está ativo! Se aparecer um QR Code, lê-o agora.</li>
                                    <li>Mantenha o telemóvel ligado à internet para envios em tempo real.</li>
                                </ol>
                            </div>

                            {/* Tabela de Relatórios e Auditoria de Disparos */}
                            <WhatsAppLogs />
                        </div>
                    )}

                    {activeTab === 'vacancies' && (
                        <ErrorBoundary>
                            <VacanciesAdmin />
                        </ErrorBoundary>
                    )}
                    
                    {activeTab === 'motiva' && (
                        <ErrorBoundary>
                            <MotivaManager />
                        </ErrorBoundary>
                    )}

                    {activeTab === 'settings' && user.role === 'SuperAdmin' && (
                        <ErrorBoundary>
                            <SystemSettings />
                        </ErrorBoundary>
                    )}
                    {
                        activeTab === 'finance' && user?.role === 'SuperAdmin' && (
                            <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <AdminFinance />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'books' && (
                            <motion.div key="books" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <BooksManager />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'newsletter' && (
                            <motion.div key="newsletter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <NewsletterList />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'blog' && (
                            <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <BlogManager />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'lessons' && (
                            <motion.div key="lessons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <LessonsManager />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'ads' && user?.role === 'SuperAdmin' && (
                            <motion.div key="ads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <AdRequestList />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'smartlinks' && (
                            <motion.div key="smartlinks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <SmartLinkList onEmailMentor={(mentorId, mentorName) => {
                                    setSelectedEmailRecipient({ id: mentorId, name: mentorName });
                                    setIsEmailModalOpen(true);
                                }} />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'marketing' && user?.role === 'SuperAdmin' && (
                            <motion.div key="marketing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <MarketingRequestList />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'settings' && user?.role === 'SuperAdmin' && (
                            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <SystemSettings />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'referrals' && (
                            <motion.div key="referrals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div className="luxury-card" style={{ background: '#fff', border: 'none' }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', fontFamily: 'var(--font-playfair)' }}>
                                        {t('referral.adminTitle')}
                                    </h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                                <th style={{ padding: '1rem', color: '#666' }}>{t('referral.table.member')}</th>
                                                <th style={{ padding: '1rem', color: '#666' }}>{t('referral.table.currentPlan')}</th>
                                                <th style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>{t('referral.table.activeInvites')}</th>
                                                <th style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>{t('referral.table.points')}</th>
                                                <th style={{ padding: '1rem', color: '#666', textAlign: 'right' }}>{t('referral.table.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {referralRanking.map((r) => (
                                                <tr key={r._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 700 }}>{r.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{r.email}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            background: r.plan === 'enterprise' ? '#000' : (r.plan === 'pro' ? '#FFD700' : '#eee'),
                                                            color: r.plan === 'enterprise' ? '#FFD700' : (r.plan === 'pro' ? '#000' : '#666'),
                                                            fontSize: '0.7rem',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {r.plan}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>{r.referralCount}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 900, color: '#FFD700' }}>{r.referralPoints} pts</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleAuditUser(r._id)}
                                                                style={{ padding: '6px', borderRadius: '8px', background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                title={t('referral.table.viewReferrals')}
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm(`${t('referral.assignReward')} Pro (30 ${t('common.days')}) a ${r.name}?`)) {
                                                                        try {
                                                                            await referralService.assignReward(r._id, 'pro', 30);
                                                                            toast.success(t('common.success'));
                                                                            const updRanking = await referralService.getRanking();
                                                                            setReferralRanking(updRanking);
                                                                        } catch { toast.error(t('common.error')); }
                                                                    }
                                                                }}
                                                                style={{ padding: '6px 12px', borderRadius: '8px', background: '#111', color: '#FFD700', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                                                            >
                                                                {t('referral.table.assignPro')}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {referralRanking.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                                                        {t('referral.table.noActivity')}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )
                    }
                    {
                        activeTab === 'payouts' && (
                            <motion.div key="payouts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <PaypalPayouts />
                            </motion.div>
                        )
                    }
                </AnimatePresence >
                <button
                    onClick={() => setIsSupportOpen(true)}
                    id="admin-support-fab"
                    style={{
                        position: 'fixed',
                        bottom: '130px',
                        right: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#000',
                        color: '#FFD700',
                        border: '2px solid #FFD700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        zIndex: 2000,
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Central de Suporte"
                >
                    <HelpCircle size={24} />
                </button>

                <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} mode="admin" />

                <AdminMessageModal
                    isOpen={isMessageModalOpen}
                    onClose={() => {
                        setIsMessageModalOpen(false);
                        setSelectedRecipient(undefined);
                    }}
                    recipientId={selectedRecipient?.id}
                    recipientName={selectedRecipient?.name}
                />

                <AdminEmailModal
                    isOpen={isEmailModalOpen}
                    onClose={() => {
                        setIsEmailModalOpen(false);
                        setSelectedEmailRecipient(undefined);
                    }}
                    recipientId={selectedEmailRecipient?.id}
                    recipientName={selectedEmailRecipient?.name}
                />

                <ProfileModal
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    user={user}
                    onSuccess={() => {
                        const updatedUser = authService.getCurrentUser();
                        if (updatedUser) setUser(updatedUser);
                    }}
                />

                {/* Audit Modal */}
                <AnimatePresence>
                    {isAuditModalOpen && auditUser && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 3000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                style={{
                                    background: '#fff',
                                    borderRadius: '30px',
                                    width: '100%',
                                    maxWidth: '800px',
                                    maxHeight: '90vh',
                                    overflow: 'hidden',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                                }}
                            >
                                <div style={{ background: 'linear-gradient(135deg, #000 0%, #333 100%)', padding: '30px', color: '#fff', position: 'relative' }}>
                                    <button
                                        onClick={() => setIsAuditModalOpen(false)}
                                        style={{ position: 'absolute', right: '25px', top: '25px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}
                                    >
                                        <X size={20} />
                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ background: 'var(--gold-gradient)', padding: '15px', borderRadius: '20px', color: '#000' }}>
                                            <Trophy size={32} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Auditoria de Convites</h3>
                                            <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Explorando o impacto de <strong>{auditUser.name}</strong></p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', marginTop: '25px' }}>
                                        <div style={{ background: 'rgba(255,215,0,0.1)', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.2)' }}>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Pontos Totais</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFD700' }}>{auditUser.referralPoints} pts</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Total Invitados</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{auditUser.referralCount}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '30px', overflowY: 'auto', maxHeight: 'calc(90vh - 250px)' }}>
                                    {auditHistory.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {auditHistory.map((item, idx) => (
                                                <div key={idx} style={{ padding: '20px', borderRadius: '15px', background: '#f8f9fa', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a1a1a' }}>{item.referredUser?.name}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>{item.referredUser?.email}</div>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <span style={{ fontSize: '0.7rem', background: '#fff', padding: '3px 8px', borderRadius: '5px', border: '1px solid #ddd', fontWeight: 600 }}>
                                                                Plano: {item.referredUser?.plan || 'free'}
                                                            </span>
                                                            <span style={{ fontSize: '0.7rem', background: '#fff', padding: '3px 8px', borderRadius: '5px', border: '1px solid #ddd' }}>
                                                                Desde: {new Date(item.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ color: '#FFD700', fontWeight: 900, fontSize: '1.2rem' }}>+{item.pointsEarned} pts</div>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>{item.status}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            <Database size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                            <p>Este usuário ainda não possui indicações registradas.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <OnboardingTour steps={adminSteps} storageKey="inscrevase_admin_tour_completed" />

                <style jsx>{`
                    @media (max-width: 768px) {
                        .admin-header h1 {
                            font-size: 1.8rem !important;
                            letter-spacing: -0.5px;
                        }
                        .admin-actions-group {
                            width: 100%;
                            justify-content: flex-start;
                        }
                        #admin-support-fab {
                            width: 45px !important;
                            height: 45px !important;
                            right: 1.5rem !important;
                            bottom: 1.5rem !important;
                        }
                        #admin-support-fab :global(svg) {
                            width: 20px !important;
                            height: 20px !important;
                        }
                        :global(.luxury-card), .luxury-card {
                            padding: 1.25rem !important;
                        }
                        :global(.stats-grid) {
                            grid-template-columns: 1fr !important;
                            gap: 1rem !important;
                        }
                    }

                    .split-grid {
                        display: grid;
                        grid-template-columns: 2fr 1fr;
                        gap: 2rem;
                        margin-bottom: 2.5rem;
                    }
                    .charts-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
                        gap: 2rem;
                    }
                    :global(.luxury-card), .luxury-card {
                        padding: 2.5rem !important;
                        border-radius: 20px !important;
                        box-shadow: 0 15px 35px rgba(0,0,0,0.06) !important;
                    }
                    @media (max-width: 1024px) {
                        .split-grid, .charts-grid {
                            grid-template-columns: 1fr;
                            gap: 1.5rem;
                        }
                    }
                `}</style>
            </main >
        </div >
    );
}

function StatCard({ icon, label, value, color, onClick }: { icon: React.ReactNode, label: string, value: string | number, color: string, onClick?: () => void }) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={onClick}
            className="luxury-card"
            style={{
                background: '#fff',
                padding: '1.5rem',
                border: '1px solid #eee',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                cursor: onClick ? 'pointer' : 'default'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--gold-gradient)' }}></div>

            <div style={{
                background: `${color}15`,
                color: color,
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {React.cloneElement(icon as React.ReactElement, { size: 22 })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: '#1a1a1a', margin: 0, letterSpacing: '-0.5px' }}>{value}</h2>
            </div>

            {/* Subtle background element */}
            <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', width: '70px', height: '70px', background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`, borderRadius: '50%' }} />
        </motion.div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}><Loader2 className="animate-spin" size={48} color="#FFD700" /></div>}>
            <AdminDashboardContent />
        </Suspense>
    );
}
