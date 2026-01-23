"use client";

import { useEffect, useState } from 'react';
import { authService, UserData } from '@/lib/authService';
import { dashboardService, AdminStats, TrafficStats } from '@/lib/dashboardService';
import UsersList from '@/components/admin/UsersList';
import FormList from '@/components/admin/FormList';
import SubmissionList from '@/components/admin/SubmissionList';
import SupportTicketList from '@/components/admin/SupportTicketList';
import AdminFinance from '@/components/admin/AdminFinance';
import SupportModal from '@/components/mentor/SupportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, LogOut, Loader2, LayoutDashboard, Database, ShieldAlert, HelpCircle, LifeBuoy, Wallet, Settings, Eye, Wifi, Globe, Menu, X, ChevronDown, BarChart3, Newspaper } from 'lucide-react';
import ProfileModal from '@/components/mentor/ProfileModal';
import { useRouter } from 'next/navigation';
import { supportService } from '@/lib/supportService';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import { Linkedin, Mail, Send } from 'lucide-react';
import AdminMessageModal from '@/components/admin/AdminMessageModal';
import OnboardingTour, { Step } from '@/components/mentor/OnboardingTour';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, YAxis } from 'recharts';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useSocket } from '@/context/SocketContext';
import { useSpotlight } from '@/hooks/useSpotlight';

type Tab = 'overview' | 'users' | 'forms' | 'submissions' | 'support' | 'finance';

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
        { label: 'Receita Total', value: (stats?.revenue || 0).toLocaleString() + ' MT', icon: <TrendingUp size={24} />, color: '#B8860B', tab: 'finance' },
        { label: 'Inscrições', value: stats?.submissions || 0, icon: <TrendingUp size={24} />, color: '#805ad5', tab: 'submissions' },
    ];

    // Removed unused cards to fix lint errors

    const financialCards = [
        { label: 'Assinaturas Planos', value: (stats?.subscriptionRevenue || 0).toLocaleString() + ' MT', icon: <ShieldAlert size={24} />, color: '#6366f1', tab: 'finance' },
    ];

    const activityCards = [
        { label: t('dashboard.createdForms'), value: stats?.forms || 0, icon: <FileText size={24} />, color: '#3182ce', tab: 'forms' },
        { label: t('dashboard.approvedSubscriptions'), value: stats?.approved || 0, icon: <CheckCircle size={24} />, color: '#10b981', tab: 'submissions' },
    ];

    const menuItems = [
        { id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={20} /> },
        { id: 'users', label: t('dashboard.users'), icon: <Users size={20} /> },
        { id: 'forms', label: t('dashboard.forms'), icon: <FileText size={20} /> },
        { id: 'submissions', label: t('dashboard.submissions'), icon: <Database size={20} /> },
        { id: 'finance', label: t('dashboard.finance.title'), icon: <Wallet size={20} /> },
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

                    <Link
                        href="/dashboard/admin/blog"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '0.75rem 1rem',
                            width: '100%',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#888',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'left',
                            fontSize: '0.95rem',
                            position: 'relative',
                            textDecoration: 'none'
                        }}
                        className="hover:bg-gray-100 hover:text-black"
                    >
                        <Newspaper size={20} />
                        Gerenciar Blog
                    </Link>
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
                                            <span style={{ color: '#666', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</span>
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
                                                    <div key={idx} className="luxury-card" style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                                            <div style={{ color: card.color }}>{card.icon}</div>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>{card.label}</span>
                                                        </div>
                                                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{card.value}</div>
                                                    </div>
                                                ))}
                                                {financialCards.map((card, idx) => (
                                                    <div key={idx} className="luxury-card" style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                                            <div style={{ color: card.color }}>{card.icon}</div>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>{card.label}</span>
                                                        </div>
                                                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{card.value}</div>
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

                                                {/* Data is Power Section */}
                                                <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="split-grid">
                                                    <div className="luxury-card" style={{ padding: '2rem' }}>
                                                        <div className="spotlight" />
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                            <Database className="gold-text" size={20} /> Distribuição por Origem
                                                        </h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                                            {[
                                                                { label: 'E-mail Nativo', count: stats?.authStats?.native || 0, icon: <Mail size={16} />, color: '#666' },
                                                                {
                                                                    label: 'Google Auth', count: stats?.authStats?.google || 0, icon: (
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                                                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                                        </svg>
                                                                    ), color: '#db4437'
                                                                },
                                                                { label: 'LinkedIn Connect', count: stats?.authStats?.linkedin || 0, icon: <Linkedin size={16} />, color: '#0077b5' }
                                                            ].map((item, idx) => {
                                                                const total = (stats?.authStats?.native || 0) + (stats?.authStats?.google || 0) + (stats?.authStats?.linkedin || 0);
                                                                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                                                                return (
                                                                    <div key={idx}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: item.color }}>
                                                                                {item.icon} {item.label}
                                                                            </div>
                                                                            <span style={{ fontWeight: 700 }}>{item.count} ({Math.round(percentage)}%)</span>
                                                                        </div>
                                                                        <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${percentage}%` }}
                                                                                transition={{ duration: 1, delay: 0.5 + idx * 0.2 }}
                                                                                style={{ height: '100%', background: item.color }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="luxury-card" style={{ background: 'var(--gold-gradient)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#000' }}>
                                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-playfair)' }}>💡 Insight de Crescimento</h3>
                                                        <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                                                            {(stats?.authStats?.google || 0) + (stats?.authStats?.linkedin || 0) > (stats?.authStats?.native || 0)
                                                                ? "O login social está dominando! Considere simplificar ainda mais o fluxo removendo campos desnecessários no cadastro nativo."
                                                                : "A maioria prefere o e-mail tradicional. Pode ser uma boa oportunidade para destacar os benefícios de um clique dos logins sociais."
                                                            }
                                                        </p>
                                                        <div style={{ marginTop: '1.5rem', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <TrendingUp size={16} /> Dado é poder. Use com sabedoria.
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Traffic Section - PAGES */}
                                                <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="luxury-card" style={{ padding: '2rem', marginBottom: '3rem' }}>
                                                    <div className="spotlight" />
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                        <Globe className="gold-text" size={20} /> Páginas Mais Acessadas Hoje
                                                    </h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 100px', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem', fontWeight: 600, color: '#888', fontSize: '0.9rem', position: 'relative' }}>
                                                        <span>Página</span>
                                                        <span style={{ textAlign: 'right' }}>Visitas</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem', position: 'relative' }}>
                                                        {trafficStats?.topPages?.map((page, idx) => (
                                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 100px', gap: '1rem', fontSize: '0.95rem', alignItems: 'center' }}>
                                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1a1a1a', fontWeight: 500 }}>
                                                                    {page.page === '/' ? 'Página Inicial (Home)' : page.page}
                                                                </span>
                                                                <span style={{ textAlign: 'right', fontWeight: 700, color: '#D4AF37' }}>
                                                                    {page.count}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {(!trafficStats?.topPages || trafficStats.topPages.length === 0) && (
                                                            <div style={{ color: '#888', fontStyle: 'italic', padding: '1rem 0' }}>Nenhuma visita registrada ainda hoje.</div>
                                                        )}
                                                    </div>
                                                </motion.div>

                                                {/* NEW: Traffic Peaks and Geolocation */}
                                                <div className="charts-grid">
                                                    {/* Traffic Peaks Chart */}
                                                    <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="luxury-card" style={{ padding: '2rem' }}>
                                                        <div className="spotlight" />
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                            <TrendingUp className="gold-text" size={20} /> Picos de Tráfego (24h)
                                                        </h3>
                                                        <div style={{ height: '300px', width: '100%' }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={trafficStats?.trafficByHour || []}>
                                                                    <XAxis
                                                                        dataKey="hour"
                                                                        tickFormatter={(hour: number) => `${hour}h`}
                                                                        stroke="#888"
                                                                        fontSize={12}
                                                                        tickLine={false}
                                                                        axisLine={false}
                                                                    />
                                                                    <Tooltip
                                                                        cursor={{ fill: '#f4f4f4' }}
                                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                                        labelStyle={{ fontWeight: 'bold', color: '#000' }}
                                                                    />
                                                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                                        {(trafficStats?.trafficByHour || []).map((entry, index) => (
                                                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1a1a1a' : '#FFD700'} />
                                                                        ))}
                                                                    </Bar>
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                            {(!trafficStats?.trafficByHour || trafficStats.trafficByHour.length === 0) && (
                                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                                                    Sem dados de tráfego horário ainda.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>

                                                    {/* Top Countries List */}
                                                    <motion.div variants={itemVariants} onMouseMove={handleMouseMove} className="luxury-card" style={{ padding: '2rem' }}>
                                                        <div className="spotlight" />
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                                            <Globe className="gold-text" size={20} /> Top Países
                                                        </h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            {(trafficStats?.topCountries || []).map((item, idx) => {
                                                                const getFlagEmoji = (countryCode: string) => {
                                                                    if (!countryCode) return '🌍';
                                                                    const codePoints = countryCode
                                                                        .toUpperCase()
                                                                        .split('')
                                                                        .map(char => 127397 + char.charCodeAt(0));
                                                                    return String.fromCodePoint(...codePoints);
                                                                };

                                                                const percentage = trafficStats?.totalVisits ? Math.round((item.count / trafficStats.totalVisits) * 100) : 0;

                                                                return (
                                                                    <div key={idx} style={{ padding: '0.8rem', borderRadius: '12px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                            <span style={{ fontSize: '1.5rem' }}>{getFlagEmoji(item.country)}</span>
                                                                            <div>
                                                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.country}</div>
                                                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>{percentage > 0 ? `${percentage}% do tráfego` : 'Visitante Recente'}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a' }}>
                                                                            {item.count} <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 600 }}>VISITAS</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {(!trafficStats?.topCountries || trafficStats.topCountries.length === 0) && (
                                                                <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                                                    Nenhum país identificado ainda.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                </div>

                                                <motion.div variants={itemVariants} className="luxury-card" style={{ background: '#fff', padding: '2rem', marginBottom: '3rem' }}>
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <TrendingUp className="gold-text" size={20} /> Crescimento Mensal (Este Ano)
                                                    </h3>
                                                    <div style={{ height: '350px', width: '100%' }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={trafficStats?.trafficByMonth || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                                <defs>
                                                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                                                                        <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <XAxis
                                                                    dataKey="month"
                                                                    tickFormatter={(month: number) => monthNames[month - 1]}
                                                                    stroke="#888"
                                                                    fontSize={12}
                                                                    tickLine={false}
                                                                    axisLine={false}
                                                                />
                                                                <YAxis
                                                                    stroke="#888"
                                                                    fontSize={12}
                                                                    tickLine={false}
                                                                    axisLine={false}
                                                                    tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)}
                                                                />
                                                                <CartesianGrid vertical={false} stroke="#f5f5f5" />
                                                                <Tooltip
                                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                                    labelFormatter={(month: number) => monthNames[month - 1]}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="count"
                                                                    stroke="#FFD700"
                                                                    strokeWidth={3}
                                                                    fillOpacity={1}
                                                                    fill="url(#colorVisits)"
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                        {(!trafficStats?.trafficByMonth || trafficStats.trafficByMonth.length === 0) && (
                                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                                                Sem dados suficientes para gráfico mensal.
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
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
                `}</style>
            </main>
        </div >
    );
}
