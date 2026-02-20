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
    MessageSquare
} from 'lucide-react';

import { authService, UserData } from '@/lib/authService';
import { supportService } from '@/lib/supportService';
import { notificationService } from '@/lib/notificationService';
import { useTranslate } from '@/context/LanguageContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import PremiumBadge from '@/components/common/PremiumBadge';
import NotificationCenter from '@/components/mentor/NotificationCenter';
import { useSocket } from '@/context/SocketContext';

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
            setIsMobile(window.innerWidth <= 1024);
            if (window.innerWidth > 1024) setIsMobileSidebarOpen(false);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, [router]);

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
            if (notificationBellRef.current && !notificationBellRef.current.contains(e.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const navItems = [
        { id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={20} />, link: '/dashboard/mentor' },
        { id: 'forms', label: t('dashboard.myEvents'), icon: <FileText size={20} />, link: '/dashboard/mentor?tab=forms' },
        { id: 'blog', label: t('dashboard.blogArticles'), icon: <Newspaper size={20} />, link: '/dashboard/mentor?tab=blog' },
        { id: 'submissions', label: t('dashboard.submissions'), icon: <Users size={20} />, link: '/dashboard/mentor?tab=submissions' },
        { id: 'earnings', label: t('dashboard.settings.earnings'), icon: <DollarSign size={20} />, link: '/dashboard/mentor?tab=earnings' },
        { id: 'reports', label: t('dashboard.reports'), icon: <PieChart size={20} />, link: '/dashboard/mentor?tab=reports' },
        { id: 'plans', label: t('dashboard.finance.viewPlans'), icon: <Crown size={20} />, link: '/dashboard/mentor?tab=plans' },
        { id: 'lessons', label: 'Aulas', icon: <Video size={20} />, link: '/dashboard/mentor/lessons' },
        { id: 'explore', label: t('dashboard.exploreEvents'), icon: <Map size={20} />, link: '/' },

        { id: 'settings', label: t('dashboard.myAccount'), icon: <Settings size={20} />, link: '/dashboard/mentor?tab=settings' },
        { id: 'feedback', label: 'Feedbacks', icon: <MessageSquare size={20} />, link: '/dashboard/mentor?tab=feedback' },
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
            {/* Mobile Toggle Button */}
            {isMobile && (
                <button
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
                        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
                            Inscreva<span className="gold-text">.se</span>
                        </h2>
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
                                padding: '4px'
                            }}
                        >
                            {isSidebarCollapsed ? <Menu size={24} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                </div>

                <nav style={{ padding: '1rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.link}
                            title={isSidebarCollapsed ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: '12px 16px',
                                background: activeRoute === item.id ? 'var(--gold-gradient)' : 'transparent',
                                color: activeRoute === item.id ? '#000' : '#aaa',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                fontWeight: activeRoute === item.id ? 700 : 500,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {activeRoute === item.id && (
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
                            <div style={{ opacity: activeRoute === item.id ? 1 : 0.7, minWidth: '24px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                            {!isSidebarCollapsed && (
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    ))}

                    <button
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
                            marginTop: 'auto'
                        }}
                    >
                        <Map size={20} />
                        {!isSidebarCollapsed && t('dashboard.settings.guidedTour')}
                    </button>

                    {!isSidebarCollapsed && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,215,0,0.05)', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.1)' }}>
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
                        onClick={() => router.push('/dashboard/mentor?tab=support')}
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
                            position: 'relative'
                        }}
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
                            fontWeight: 600
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

                    <div style={{ display: 'flex', gap: '0.5rem', width: isMobile ? '100%' : 'auto', overflowX: 'auto', paddingBottom: isMobile ? '5px' : '0', alignItems: 'center' }} className="no-scrollbar">
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
                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                whiteSpace: 'nowrap',
                                height: '40px'
                            }}
                        >
                            <ArrowRight size={16} /> {!isMobile && t('nav.home')}
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ThemeToggle />
                            <div ref={notificationBellRef} style={{ position: 'relative' }}>
                                <button
                                    ref={bellButtonRef}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                        setDropdownPos({
                                            top: rect.bottom + 8,
                                            right: window.innerWidth - rect.right
                                        });
                                        setIsNotificationsOpen(prev => !prev);
                                    }}
                                    title={t('dashboard.notifications')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
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
                            </div>

                            {/* Notification dropdown rendered at fixed position, immune to parent overflow */}
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
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
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--paper)',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    color: '#e53e3e',
                                    cursor: 'pointer'
                                }}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {children}

            </main>
        </div>
    );
}
