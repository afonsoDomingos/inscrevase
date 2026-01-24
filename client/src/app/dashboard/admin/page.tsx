"use client";

import { useEffect, useState } from 'react';
import { authService, UserData } from '@/lib/authService';
import { dashboardService, AdminStats, TrafficStats } from '@/lib/dashboardService';
import UsersList from '@/components/admin/UsersList';
import FormList from '@/components/admin/FormList';
import SubmissionList from '@/components/admin/SubmissionList';
import SupportTicketList from '@/components/admin/SupportTicketList';
import AdminFinance from '@/components/admin/AdminFinance';
import NewsletterList from '@/components/admin/NewsletterList';
import BlogManager from '@/components/admin/BlogManager';
import SupportModal from '@/components/mentor/SupportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, LogOut, Loader2, LayoutDashboard, Database, ShieldAlert, HelpCircle, LifeBuoy, Wallet, Settings, Eye, EyeOff, Wifi, Globe, Menu, X, ChevronDown, BarChart3, Newspaper, Mail, Send } from 'lucide-react';
import ProfileModal from '@/components/mentor/ProfileModal';
import { useRouter } from 'next/navigation';
import { supportService } from '@/lib/supportService';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import AdminMessageModal from '@/components/admin/AdminMessageModal';
import OnboardingTour, { Step } from '@/components/mentor/OnboardingTour';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, YAxis, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, Legend, ComposedChart, Line } from 'recharts';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useSocket } from '@/context/SocketContext';
import { useSpotlight } from '@/hooks/useSpotlight';

type Tab = 'overview' | 'users' | 'forms' | 'submissions' | 'support' | 'finance' | 'newsletter' | 'blog';

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

export default function AdminDashboard() {
    const { t } = useTranslate();
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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

    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { onlineUsers } = useSocket();
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState<{ id: string, name: string } | undefined>(undefined);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        traffic: false,
        users: false,
        performance: false,
        activity: false
    });
    const [showValues, setShowValues] = useState(true);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const { handleMouseMove } = useSpotlight();

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
                loadUnreadCount();
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [router]);

    const loadUnreadCount = async () => {
        try {
            const data = await supportService.getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error loading unread count:', error);
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

    const vitalCards = [
        { label: 'Online Agora', value: onlineUsers.length, icon: <Wifi size={24} />, color: '#38a169', tab: 'users' },
        { label: 'Visitas Hoje', value: trafficStats?.visitsToday || 0, icon: <Eye size={24} />, color: '#ed8936', tab: 'overview' },
        { label: 'Receita Total', value: showValues ? (stats?.revenue || 0).toLocaleString() + ' MT' : '•••• MT', icon: <TrendingUp size={24} />, color: '#B8860B', tab: 'finance' },
        { label: 'Inscrições', value: showValues ? stats?.submissions || 0 : '••', icon: <TrendingUp size={24} />, color: '#805ad5', tab: 'submissions' },
    ];

    // Removed unused cards to fix lint errors

    const financialCards = [
        { label: 'Assinaturas Planos', value: showValues ? (stats?.subscriptionRevenue || 0).toLocaleString() + ' MT' : '•••• MT', icon: <ShieldAlert size={24} />, color: '#6366f1', tab: 'finance' },
    ];

    const activityCards = [
        { label: t('dashboard.createdForms'), value: stats?.forms || 0, icon: <FileText size={24} />, color: '#3182ce', tab: 'forms' },
        { label: t('dashboard.approvedSubscriptions'), value: showValues ? stats?.approved || 0 : '••', icon: <CheckCircle size={24} />, color: '#10b981', tab: 'submissions' },
    ];

    const menuItems = [
        { id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={20} /> },
        { id: 'users', label: t('dashboard.users'), icon: <Users size={20} /> },
        { id: 'forms', label: t('dashboard.forms'), icon: <FileText size={20} /> },
        { id: 'submissions', label: t('dashboard.submissions'), icon: <Database size={20} /> },
        { id: 'finance', label: t('dashboard.finance.title'), icon: <Wallet size={20} /> },
        { id: 'newsletter', label: 'Newsletter', icon: <Mail size={20} /> },
        { id: 'blog', label: 'Gerenciar Blog', icon: <Newspaper size={20} /> },
        { id: 'support', label: t('dashboard.support'), icon: <LifeBuoy size={20} /> },
    ];

    return (
        <div className="admin-container" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="bg-mesh" />
            <button
                className="admin-mobile-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div
                className={`admin-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid #333' }}>
                    <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>
                        Inscreva<span className="gold-text">.se</span>
                    </h2>
                </div>

                <nav style={{ padding: '1rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '0.75rem 1rem',
                                width: '100%',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeTab === item.id ? 'var(--gold-gradient)' : 'transparent',
                                color: activeTab === item.id ? '#000' : '#888',
                                fontWeight: activeTab === item.id ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'left',
                                fontSize: '0.95rem',
                                position: 'relative'
                            }}
                            id={'admin-nav-' + item.id}
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
                            <div style={{ opacity: activeTab === item.id ? 1 : 0.7 }}>{item.icon}</div>
                            {item.label}
                            {item.id === 'support' && unreadCount > 0 && (
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

                </nav>

                <button
                    onClick={() => window.dispatchEvent(new Event('start-onboarding'))}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0.75rem 2rem',
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
                    Tour Guiado
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
                        <Settings size={18} /> {t('events.profile.title') || 'Perfil'}
                    </button>
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
                        <LogOut size={18} /> {t('common.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <header className="admin-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1.5rem',
                    marginBottom: '3rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                            <ShieldAlert size={16} />
                            <span style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>{user.role} Dashboard</span>
                        </div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{
                                fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                                fontWeight: 800,
                                fontFamily: 'var(--font-playfair)',
                                lineHeight: 1.1,
                                color: '#1a1a1a',
                                overflowWrap: 'break-word',
                                wordWrap: 'break-word'
                            }}
                        >
                            {t('dashboard.welcomeBack')}, <span className="gold-text">{user.name?.split(' ')[0] || 'Admin'}</span>
                        </motion.h1>
                    </div>

                    <div className="admin-actions-group" style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
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
                            {showValues ? 'Ocultar Valores' : 'Mostrar Valores'}
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
                            <Send size={16} /> Comunicado
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
                            <Eye size={16} /> Visitante
                        </Link>
                        <button
                            onClick={() => authService.logout()}
                            title={t('common.logout')}
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
                    </div>
                </header>

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
                            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                                {vitalCards.map((card, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onMouseMove={handleMouseMove}
                                        onClick={() => setActiveTab(card.tab as Tab)}
                                        className="luxury-card"
                                        style={{ background: 'rgba(255,255,255,0.7)', padding: '1.5rem', border: 'none', cursor: 'pointer' }}
                                    >
                                        <div className="spotlight" />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', position: 'relative' }}>
                                            <div style={{ background: `${card.color}15`, color: card.color, padding: '0.6rem', borderRadius: '10px' }}>
                                                {card.icon}
                                            </div>
                                            <span style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</span>
                                        </div>
                                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', position: 'relative' }}>{card.value}</h2>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Collapsible Secondary Stats */}
                            {/* Operational Details */}
                            <div className="accordion-section">
                                <button
                                    onClick={() => toggleSection('activity')}
                                    style={{
                                        width: '100%', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: '#fff', border: '1px solid #f0f0f0', borderRadius: '15px', color: '#1a1a1a', fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FileText size={18} className="gold-text" /> Atividade Operacional
                                    </div>
                                    <motion.div animate={{ rotate: expandedSections.activity ? 180 : 0 }}>
                                        <ChevronDown size={20} />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {expandedSections.activity && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="stats-grid" style={{ padding: '1rem 0' }}>
                                                {activityCards.map((card, idx) => (
                                                    <div key={idx} className="luxury-card" style={{ background: '#fff', padding: '1.5rem', border: '1px solid #f0f0f0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                                            <div style={{ color: card.color }}>{card.icon}</div>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a' }}>{card.label}</span>
                                                        </div>
                                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000' }}>{card.value}</div>
                                                    </div>
                                                ))}
                                                {financialCards.map((card, idx) => (
                                                    <div key={idx} className="luxury-card" style={{ background: '#fff', padding: '1.5rem', border: '1px solid #f0f0f0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                                            <div style={{ color: card.color }}>{card.icon}</div>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a' }}>{card.label}</span>
                                                        </div>
                                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000' }}>{card.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>


                            {/* Advanced Insights Drawer */}
                            <div className="accordion-section" style={{ marginBottom: '3rem' }}>
                                <button
                                    onClick={() => toggleSection('performance')}
                                    style={{
                                        width: '100%', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)', borderRadius: '15px', color: '#FFD700', fontWeight: 800, cursor: 'pointer',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)', border: 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', letterSpacing: '1px' }}>
                                        <BarChart3 size={22} /> ANALYTICS E INSIGHTS
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{expandedSections.performance ? 'RECOLHER' : 'EXPANDIR'}</span>
                                        <motion.div animate={{ rotate: expandedSections.performance ? 180 : 0 }}>
                                            <ChevronDown size={20} />
                                        </motion.div>
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expandedSections.performance && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{ paddingTop: '2rem' }}>

                                                {/* User Acquisition Section */}
                                                <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="split-grid">
                                                    <div className="luxury-card" style={{ padding: '2rem' }}>
                                                        <div className="spotlight" />
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                            <Database className="gold-text" size={20} /> Distribuição por Origem
                                                        </h3>
                                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <div style={{ flex: 1, minWidth: '250px' }}>
                                                                {[
                                                                    { label: 'E-mail Nativo', count: stats?.authStats?.native || 0, color: '#1a1a1a' },
                                                                    { label: 'Google Auth', count: stats?.authStats?.google || 0, color: '#db4437' },
                                                                    { label: 'LinkedIn Connect', count: stats?.authStats?.linkedin || 0, color: '#0077b5' }
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
                                                                        <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="luxury-card" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#000', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                                                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                                                            <Database size={150} />
                                                        </div>
                                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-playfair)', position: 'relative' }}>💡 Insight de Crescimento</h3>
                                                        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9, fontWeight: 500, position: 'relative' }}>
                                                            {(stats?.authStats?.google || 0) + (stats?.authStats?.linkedin || 0) > (stats?.authStats?.native || 0)
                                                                ? "O login social está sendo o caminho preferido dos seus usuários! Simplifique ainda mais o registro nativo."
                                                                : "O e-mail tradicional ainda é o mais confiável para sua audiência. Otimize a segurança do fluxo nativo."
                                                            }
                                                        </p>
                                                        <div style={{ marginTop: '1.5rem', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', background: 'rgba(0,0,0,0.1)', padding: '8px 15px', borderRadius: '50px', width: 'fit-content' }}>
                                                            <TrendingUp size={16} /> DADO É PODER
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* NEW: Health & Progress Dashboard */}
                                                <div className="charts-grid" style={{ marginBottom: '2.5rem' }}>
                                                    {/* Radar Chart: Platform Health */}
                                                    <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="luxury-card" style={{ padding: '2.5rem' }}>
                                                        <div className="spotlight" />
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                            <LayoutDashboard className="gold-text" size={20} /> Equilíbrio de Engagement
                                                        </h3>
                                                        <div style={{ height: '320px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                                                    { subject: 'Mentores', A: stats?.mentors || 0, fullMark: 100 },
                                                                    { subject: 'Eventos', A: stats?.forms || 0, fullMark: 100 },
                                                                    { subject: 'Participantes', A: stats?.participants || 0, fullMark: 100 },
                                                                    { subject: 'Inscrições', A: stats?.submissions || 0, fullMark: 100 },
                                                                    { subject: 'Receita', A: (stats?.revenue || 0) / 1000, fullMark: 100 },
                                                                ]}>
                                                                    <PolarGrid stroke="#eee" />
                                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 11, fontWeight: 600 }} />
                                                                    <Radar name="Plataforma" dataKey="A" stroke="#B8860B" fill="#FFD700" fillOpacity={0.6} />
                                                                    <Tooltip />
                                                                </RadarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </motion.div>

                                                    {/* Radial Bar: Goals Progress */}
                                                    <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="luxury-card" style={{ padding: '2.5rem' }}>
                                                        <div className="spotlight" />
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                            <CheckCircle className="gold-text" size={20} /> Metas Mensais
                                                        </h3>
                                                        <div style={{ height: '320px', width: '100%' }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <RadialBarChart
                                                                    cx="50%" cy="50%"
                                                                    innerRadius="20%" outerRadius="100%"
                                                                    barSize={15}
                                                                    data={[
                                                                        { name: 'Inscrições', uv: stats?.submissions || 0, fill: '#805ad5' },
                                                                        { name: 'Receita', uv: (stats?.revenue || 0) / 100, fill: '#B8860B' },
                                                                        { name: 'Mentores', uv: (stats?.mentors || 0) * 10, fill: '#1a1a1a' },
                                                                        { name: 'Visitas', uv: (trafficStats?.visitsToday || 0), fill: '#ed8936' }
                                                                    ]}
                                                                >
                                                                    <RadialBar
                                                                        label={{ position: 'insideStart', fill: '#fff' }}
                                                                        background
                                                                        dataKey="uv"
                                                                    />
                                                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                                                    <Tooltip />
                                                                </RadialBarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </motion.div>
                                                </div>

                                                <div className="charts-grid" style={{ marginBottom: '2.5rem' }}>
                                                    {/* Traffic & Conversion Composed Chart */}
                                                    <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="luxury-card" style={{ padding: '2.5rem' }}>
                                                        <div className="spotlight" />
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                            <TrendingUp className="gold-text" size={20} /> Tráfego vs Atividade (Hoje)
                                                        </h3>
                                                        <div style={{ height: '320px', width: '100%' }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <ComposedChart data={trafficStats?.trafficByHour || []}>
                                                                    <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                                                    <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                                                    <Tooltip cursor={{ fill: '#f4f4f4' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                                    <Bar dataKey="count" fill="#FFD700" radius={[4, 4, 0, 0]} name="Visitas" />
                                                                    <Line type="monotone" dataKey="count" stroke="#1a1a1a" strokeWidth={3} dot={{ r: 4 }} name="Tendência" />
                                                                </ComposedChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </motion.div>

                                                    {/* Monthly Growth Chart */}
                                                    <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="luxury-card" style={{ padding: '2rem' }}>
                                                        <div className="spotlight" />
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                            <BarChart3 className="gold-text" size={20} /> Evolução de Acessos (Ano)
                                                        </h3>
                                                        <div style={{ height: '300px', width: '100%' }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <AreaChart data={trafficStats?.trafficByMonth?.map(m => ({ name: monthNames[m.month - 1], count: m.count })) || []}>
                                                                    <defs>
                                                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                                                                            <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                                                                        </linearGradient>
                                                                    </defs>
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                                    <Area type="monotone" dataKey="count" stroke="#B8860B" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={3} />
                                                                </AreaChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </motion.div>
                                                </div>

                                                {/* Pages and Geography */}
                                                <div className="split-grid" style={{ marginTop: '2rem' }}>
                                                    <div className="luxury-card" style={{ padding: '2rem' }}>
                                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Globe className="gold-text" size={18} /> Top Países
                                                        </h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                            {(trafficStats?.topCountries || []).slice(0, 5).map((item, idx) => (
                                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f5f5f5' }}>
                                                                    <span style={{ fontWeight: 600 }}>{item.country}</span>
                                                                    <span style={{ fontWeight: 800, color: '#FFD700' }}>{item.count}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="luxury-card" style={{ padding: '2rem' }}>
                                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <FileText className="gold-text" size={18} /> Páginas Ativas
                                                        </h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                            {(trafficStats?.topPages || []).slice(0, 5).map((page, idx) => (
                                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f5f5f5' }}>
                                                                    <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{page.page}</span>
                                                                    <span style={{ fontWeight: 800 }}>{page.count}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.div variants={itemVariants} onMouseMove={handleMouseMove} style={{ marginTop: '2.5rem' }}>
                                <div className="luxury-card" style={{ background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '3rem', textAlign: 'center', border: '1px solid #333' }}>
                                    <div className="spotlight" />
                                    <h2 className="gold-text" style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-playfair)', position: 'relative' }}>Modo Super Administrador Ativo</h2>
                                    <p style={{ color: '#aaa', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem', lineHeight: 1.6, position: 'relative' }}>
                                        Você tem controle total sobre todos os mentores, formulários de inscrição e pagamentos realizados na plataforma Inscreva-se.
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', position: 'relative' }}>
                                        <button onClick={() => setActiveTab('users')} className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '0.9rem' }}>Gerenciar Usuários</button>
                                        <button onClick={() => setActiveTab('forms')} className="gold-border-btn" style={{ padding: '0.9rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Ver Atividades</button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', damping: 20 }}>
                            <ErrorBoundary>
                                <UsersList onMessageUser={(user) => {
                                    setSelectedRecipient({ id: user.id || user._id || '', name: user.name });
                                    setIsMessageModalOpen(true);
                                }} />
                            </ErrorBoundary>
                        </motion.div>
                    )}

                    {activeTab === 'forms' && (
                        <motion.div key="forms" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', damping: 20 }}>
                            <FormList />
                        </motion.div>
                    )}

                    {activeTab === 'submissions' && (
                        <motion.div key="submissions" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', damping: 20 }}>
                            <SubmissionList />
                        </motion.div>
                    )}

                    {activeTab === 'support' && (
                        <motion.div key="support" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', damping: 20 }}>
                            <SupportTicketList />
                        </motion.div>
                    )}

                    {activeTab === 'finance' && (
                        <motion.div key="finance" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', damping: 20 }}>
                            <AdminFinance />
                        </motion.div>
                    )}

                    {activeTab === 'newsletter' && (
                        <motion.div key="newsletter" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', damping: 20 }}>
                            <NewsletterList />
                        </motion.div>
                    )}

                    {activeTab === 'blog' && (
                        <motion.div key="blog" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', damping: 20 }}>
                            <BlogManager />
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsSupportOpen(true)}
                    id="admin-support-fab"
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '5rem',
                        width: '60px',
                        height: '60px',
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
                    <HelpCircle size={28} />
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

                <ProfileModal
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    user={user}
                    onSuccess={() => {
                        const updatedUser = authService.getCurrentUser();
                        if (updatedUser) setUser(updatedUser);
                    }}
                />

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

                    /* Readability Boost */
                    :global(.admin-main h1), :global(.admin-main h2), :global(.admin-main h3), :global(.admin-main h4) {
                        color: #1a1a1a !important;
                        text-shadow: none !important;
                    }
                    :global(.admin-main p), :global(.admin-main span:not(.gold-text)), :global(.admin-main td) {
                        color: #333 !important;
                    }
                    :global(.gold-text) {
                        color: #B8860B !important; /* Darker gold for better contrast on white/light grey */
                        font-weight: 800 !important;
                    }
                    :global(.admin-main input), :global(.admin-main select) {
                        color: #000 !important;
                        border-color: #ccc !important;
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
            </main>
        </div >
    );
}
