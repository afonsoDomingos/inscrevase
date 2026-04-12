"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Newspaper,
    Users,
    DollarSign,
    PieChart,
    Crown,
    Video,
    Settings,
    Menu,
    ChevronLeft,
    Map,
    LifeBuoy,
    LogOut,
    Plus,
    Bell,
    User as UserIcon,
    ArrowRight,
    Zap,
    ChevronDown,
    Link as LinkIcon,
    Trophy,
    Package,
    Monitor,
    Megaphone
} from 'lucide-react';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';

import { authService, UserData } from '@/lib/authService';
import { supportService } from '@/lib/supportService';
import { notificationService } from '@/lib/notificationService';
import { useTranslate } from '@/context/LanguageContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import PremiumBadge from '@/components/common/PremiumBadge';
import NotificationCenter from '@/components/mentor/NotificationCenter';
import { useSocket } from '@/context/SocketContext';
import Tooltip from '@/components/common/Tooltip';

interface MentorDashboardShellProps {
    children: React.ReactNode;
    activeRoute?: string;
}

export default function MentorDashboardShell({ children, activeRoute = 'lessons' }: MentorDashboardShellProps) {
    const { t } = useTranslate();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationBellRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const bellButtonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

    const { socket } = useSocket();

    const loadUnreadCounts = async () => {
        try {
            const [supportData, notificationData] = await Promise.all([
                supportService.getUnreadCount(),
                notificationService.getUnreadCount()
            ]);
            setUnreadCount(supportData.count);
            setUnreadNotifications(notificationData.count);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const profile = await authService.getProfile();
                setUser(profile);
            } catch (error) {
                console.error(error);
                router.push('/entrar');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
        loadUnreadCounts();

        const checkMobile = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            console.log('Screen Resize Detected. isMobile:', mobile);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, [router]);

    useEffect(() => {
        console.log('Sidebar State Changed - isMobileSidebarOpen:', isMobileSidebarOpen);
    }, [isMobileSidebarOpen]);

    // Socket listeners for counts
    useEffect(() => {
        if (!socket) return;

        socket.on('unread_count_update', loadUnreadCounts);
        socket.on('new_notification', loadUnreadCounts);

        return () => {
            socket.off('unread_count_update', loadUnreadCounts);
            socket.off('new_notification', loadUnreadCounts);
        };
    }, [socket]);

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

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        "DASHBOARD": true,
        "CONTEÚDO / PRODUTOS": true,
        "PARTICIPANTES / GESTÃO": true,
        "MARKETING / PROMOÇÃO": true,
        "FINANCEIRO": true,
        "CONTA / SISTEMA": true
    });

    const toggleSection = (title: string) => {
        setExpandedSections(prev => {
            const newState = { ...prev, [title]: !prev[title] };
            return newState;
        });
    };

    const navGroups = [
        {
            title: "DASHBOARD",
            items: [{ id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={20} />, link: '/dashboard/mentor' }]
        },
        {
            title: "CONTEÚDO / PRODUTOS",
            items: [
                { id: 'lessons', label: 'Aulas', icon: <Video size={20} />, link: '/dashboard/mentor?tab=lessons' },
                { id: 'forms', label: t('dashboard.myEvents'), icon: <FileText size={20} />, link: '/dashboard/mentor?tab=forms' },
                { id: 'blog', label: t('dashboard.blogArticles'), icon: <Newspaper size={20} />, link: '/dashboard/mentor?tab=blog' },
                { id: 'services', label: t('dashboard.services'), icon: <Package size={20} />, link: '/dashboard/mentor?tab=services' },
                { id: 'liveboard', label: 'Sala de Eventos (Lab)', icon: <Monitor size={20} />, link: '/dashboard/mentor?tab=liveboard' },
            ]
        },
        {
            title: "PARTICIPANTES / GESTÃO",
            items: [
                { id: 'submissions', label: 'Inscrições', icon: <Users size={20} />, link: '/dashboard/mentor?tab=submissions' },
                { id: 'referral', label: 'Indicações & Impacto', icon: <Trophy size={20} />, link: '/dashboard/mentor?tab=referral' },
            ]
        },
        {
            title: "MARKETING / PROMOÇÃO",
            items: [
                { id: 'ads', label: 'Anúncios', icon: <Megaphone size={20} />, link: '/dashboard/mentor?tab=ads' },
                { id: 'smartlinks', label: 'Smartlinks', icon: <LinkIcon size={20} />, link: '/dashboard/mentor?tab=smartlinks' },
                { id: 'marketing', label: 'Impulsionar Vendas', icon: <Zap size={20} />, link: '/dashboard/mentor?tab=marketing' },
            ]
        },
        {
            title: "FINANCEIRO",
            items: [
                { id: 'earnings', label: t('dashboard.settings.earnings'), icon: <DollarSign size={20} />, link: '/dashboard/mentor?tab=earnings' },
                { id: 'reports', label: t('dashboard.reports'), icon: <PieChart size={20} />, link: '/dashboard/mentor?tab=reports' },
            ]
        },
        {
            title: "CONTA / SISTEMA",
            items: [
                { id: 'plans', label: t('dashboard.finance.viewPlans'), icon: <Crown size={20} />, link: '/dashboard/mentor?tab=plans' },
                { id: 'settings', label: t('dashboard.myAccount'), icon: <Settings size={20} />, link: '/dashboard/mentor?tab=settings' },
            ]
        }
    ];

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #D4AF37', borderRadius: '50%' }}></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', position: 'relative', overflowX: 'hidden' }}>
            {/* Mobile Top Nav Bar — CSS controls visibility, always in DOM when sidebar closed */}
            {!isMobileSidebarOpen && (
                <button
                    className="mentor-mobile-toggle"
                    onClick={() => {
                        console.log('Mentor Mobile Toggle Clicked');
                        setIsMobileSidebarOpen(true);
                    }}
                >
                    <span className="toggle-logo">
                        INSCREVA<span>.SE</span>
                    </span>
                    <span className="toggle-chip">
                        <Menu size={18} /> MENU
                    </span>
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
                width: isMobile ? '100vw' : (isSidebarCollapsed ? '80px' : '280px'),
                transform: isMobile ? (isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'var(--paper)',
                color: 'var(--foreground)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                zIndex: 2000,
                boxShadow: isMobile && !isMobileSidebarOpen ? 'none' : '4px 0 30px rgba(0,0,0,0.1)',
                overflowX: 'hidden',
                overflowY: 'auto',
                borderRight: isMobile ? 'none' : '1px solid var(--border)'
            }}>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--border)' }}>
                    {!isSidebarCollapsed && (
                        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
                            Inscreva<span className="gold-text">.se</span>
                        </h2>
                    )}
                    {isMobile ? (
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            style={{
                                background: 'rgba(255,215,0,0.1)',
                                border: '1px solid rgba(255,215,0,0.3)',
                                color: '#FFD700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                borderRadius: '10px',
                                WebkitTapHighlightColor: 'transparent',
                                touchAction: 'manipulation'
                            }}
                        >
                            <Plus style={{ transform: 'rotate(45deg)' }} size={22} />
                        </button>
                    ) : (
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
                                padding: '4px'
                            }}
                        >
                            {isSidebarCollapsed ? <Menu size={24} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                </div>

                <nav className="luxury-scrollbar" style={{
                    padding: '1rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    overflowY: 'auto',
                }}>
                    {navGroups.map((section, idx) => (
                        <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                            {idx > 0 && (
                                <div style={{ height: '1px', background: 'rgba(255,215,0,0.15)', margin: '4px 16px 12px', width: 'auto' }} />
                            )}
                            {!isSidebarCollapsed && (
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.65rem 0.75rem',
                                        marginBottom: '0.25rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontWeight: 800,
                                        fontSize: '0.72rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.2px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        textAlign: 'left',
                                        WebkitTapHighlightColor: 'transparent',
                                        touchAction: 'manipulation'
                                    }}
                                >
                                    {section.title}
                                    <motion.div
                                        animate={{ rotate: expandedSections[section.title] ? 0 : -90 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}
                                    >
                                        <ChevronDown size={14} />
                                    </motion.div>
                                </button>
                            )}

                            <AnimatePresence initial={false}>
                                {(isSidebarCollapsed || expandedSections[section.title]) && (
                                    <motion.div
                                        initial={isSidebarCollapsed ? false : { height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        style={{ overflow: 'hidden', pointerEvents: 'auto' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                            {section.items.map((item) => (
                                                <Tooltip key={item.id} content={isSidebarCollapsed ? item.label : ''} position="right">
                                                    <Link
                                                        href={item.link}
                                                        onClick={() => {
                                                            if (isMobile) setIsMobileSidebarOpen(false);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                                            width: isSidebarCollapsed ? 'auto' : 'calc(100% - 1rem)',
                                                            margin: isSidebarCollapsed ? '0' : '0 0.5rem',
                                                            padding: '0.75rem 1rem',
                                                            background: activeRoute === item.id ? '#FFD700' : 'transparent',
                                                            color: activeRoute === item.id ? '#000' : 'rgba(255,255,255,0.6)',
                                                            borderRadius: '12px',
                                                            textDecoration: 'none',
                                                            transition: 'all 0.2s',
                                                            fontWeight: activeRoute === item.id ? 800 : 500,
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        <div style={{ opacity: activeRoute === item.id ? 1 : 0.7, minWidth: '24px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                                                        {!isSidebarCollapsed && (
                                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                                {item.label}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '1rem' }}>
                    {!isSidebarCollapsed && user && (
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
                            style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: '12px', padding: '0.75rem 1rem', width: '100%', borderRadius: '12px', border: 'none', background: 'transparent', color: '#FFD700', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.9rem' }}
                        >
                            <Map size={20} />
                            {!isSidebarCollapsed && t('dashboard.settings.guidedTour')}
                        </button>
                    </Tooltip>

                    <Tooltip content={isSidebarCollapsed ? t('dashboard.support') : ""} position="right">
                        <button
                            onClick={() => router.push('/dashboard/mentor?tab=support')}
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



                    <Tooltip content={isSidebarCollapsed ? t('common.logout') : ""} position="right">
                        <button
                            onClick={() => authService.logout()}
                            style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: '1px solid rgba(229, 62, 62, 0.2)', borderRadius: '12px', color: '#e53e3e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: '12px', fontWeight: 600, transition: 'all 0.2s', fontSize: '0.9rem' }}
                        >
                            <LogOut size={20} />
                            {!isSidebarCollapsed && t('common.logout')}
                        </button>
                    </Tooltip>
                </div>
            </aside>

            {/* Main Content */}
            <main 
                className="mentor-main"
                style={{
                    marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px'),
                    maxWidth: isMobile ? '100%' : `calc(100vw - ${isSidebarCollapsed ? '80px' : '280px'})`,
                }}
            >
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
                            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', lineHeight: 1.1, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {t('dashboard.welcomeBack')}, <span className="gold-text">{(user.businessName || user.name).split(' ')[0]}</span>
                                {user.isVerified && <PremiumBadge type="verified" size="md" showLabel={false} />}
                            </h1>
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

                    <div style={{ display: 'flex', gap: isMobile ? '0.35rem' : '0.5rem', width: isMobile ? '100.5%' : 'auto', overflowX: 'auto', paddingBottom: isMobile ? '5px' : '0', alignItems: 'center' }} className="no-scrollbar">
                        <Link
                            href="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.5rem 1rem',
                                background: 'var(--paper)',
                                border: '1px solid #FFD700',
                                borderRadius: '10px',
                                color: 'var(--foreground)',
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'all 0.3s',
                                fontSize: isMobile ? '0.75rem' : '0.9rem',
                                whiteSpace: 'nowrap',
                                height: isMobile ? '36px' : '40px'
                            }}
                        >
                            <ArrowRight size={16} /> {!isMobile && t('nav.home')}
                        </Link>

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
                                                console.log('🔔 [Bell] click fired, isOpen =', isNotificationsOpen);
                                                e.stopPropagation();
                                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                console.log('🔔 [Bell] rect =', JSON.stringify({ top: rect.top, bottom: rect.bottom, right: rect.right, left: rect.left }));
                                                const newPos = {
                                                    top: rect.bottom + 8,
                                                    right: window.innerWidth - rect.right
                                                };
                                                console.log('🔔 [Bell] dropdownPos =', newPos);
                                                setDropdownPos(newPos);
                                                setIsNotificationsOpen(prev => {
                                                    console.log('🔔 [Bell] state toggle:', prev, '->', !prev);
                                                    return !prev;
                                                });
                                            } catch (err) {
                                                console.error('🔴 [Bell] onClick error:', err);
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
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                fontSize: '0.6rem',
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

                            <Tooltip content={t('common.logout')}>
                                <button
                                    onClick={() => authService.logout()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: isMobile ? '36px' : '40px',
                                        height: isMobile ? '36px' : '40px',
                                        background: 'var(--paper)',
                                        border: '1px solid #333',
                                        borderRadius: '12px',
                                        color: '#e53e3e',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <LogOut size={20} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </header>

                {children}

            </main>
        </div>
    );
}
