"use client";

import { useEffect, useState, useCallback } from 'react';
import { authService, UserData } from '@/lib/authService';
import { useRouter } from 'next/navigation';
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

import EditEventThemeModal from '@/components/mentor/EditEventThemeModal';
import AnalyticsCharts from '@/components/mentor/AnalyticsCharts';
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
    Eye
} from 'lucide-react';
import Image from 'next/image';
import StripeConnect from '@/components/StripeConnect';
import EarningsDashboard from '@/components/EarningsDashboard';
import PlanUpgradeModal from '@/components/PlanUpgradeModal';

type Tab = 'overview' | 'forms' | 'submissions' | 'reports' | 'settings' | 'earnings';

export default function MentorDashboard() {
    const { t } = useTranslate();
    const router = useRouter();
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
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const loadDashboard = useCallback(async () => {
        try {
            const [userProfile, statsData, formsData] = await Promise.all([
                authService.getProfile(),
                dashboardService.getMentorStats(),
                formService.getMyForms()
            ]);

            setUser(userProfile);
            setStats(statsData);
            setForms(formsData);
        } catch (error: unknown) {
            console.error("Dashboard error:", error);
            // If unauthorized, redirect to login
            if (error instanceof Error && (error.message.includes('401') || error.message.includes('Falha ao buscar perfil'))) {
                router.push('/entrar');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadDashboard();
        loadUnreadCount();

        // Poll for unread count every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [loadDashboard]);

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

    const loadUnreadCount = async () => {
        try {
            const data = await supportService.getUnreadCount();
            setUnreadCount(data.unreadCount);
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                background: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                zIndex: 1000,
                boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
            }}>
                <div style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid #333' }}>
                    <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>
                        Inscreva<span className="gold-text">.se</span>
                    </h2>
                </div>

                <nav style={{ padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {[
                        { id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={20} /> },
                        { id: 'forms', label: t('dashboard.myEvents'), icon: <FileText size={20} /> },
                        { id: 'submissions', label: t('dashboard.submissions'), icon: <Users size={20} /> },
                        { id: 'earnings', label: t('dashboard.earnings') || 'Ganhos', icon: <DollarSign size={20} /> },
                        { id: 'reports', label: t('dashboard.reports'), icon: <PieChart size={20} /> },
                        { id: 'settings', label: t('dashboard.myAccount'), icon: <Settings size={20} /> },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '1rem',
                                width: '100%',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeTab === item.id ? 'var(--gold-gradient)' : 'transparent',
                                color: activeTab === item.id ? '#000' : '#888',
                                fontWeight: activeTab === item.id ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'left',
                                fontSize: '0.95rem'
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
                            <div style={{ opacity: activeTab === item.id ? 1 : 0.7 }}>{item.icon}</div>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={() => setIsSupportOpen(true)}
                        style={{
                            width: '100%',
                            padding: '1rem',
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
                        <LifeBuoy size={18} /> {t('dashboard.support')}
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#ef4444',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                border: '2px solid #1a1a1a'
                            }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
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
            <main style={{ marginLeft: '280px', flex: 1, padding: '2.5rem', minHeight: '100vh', maxWidth: 'calc(100vw - 280px)' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div
                            onClick={() => setIsProfileModalOpen(true)}
                            style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', background: '#fff', border: '2px solid #FFD700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                        >
                            {user.profilePhoto ? (
                                <Image src={user.profilePhoto} alt={user.name} fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', background: '#000' }}>
                                    <UserIcon size={32} />
                                </div>
                            )}
                        </div>
                        <div>
                            <motion.h1
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', lineHeight: 1.1, color: '#1a1a1a' }}
                            >
                                {t('dashboard.welcomeBack')}, <span className="gold-text">{user.name.split(' ')[0]}</span>
                            </motion.h1>
                            <p style={{ color: '#666', marginTop: '0.4rem', fontSize: '1.05rem', fontWeight: 500 }}>
                                {t('dashboard.readyToManage')}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link
                            href="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1.5rem',
                                background: '#fff',
                                border: '1px solid #FFD700',
                                borderRadius: '12px',
                                color: '#000',
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#fffaf0'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                        >
                            <ArrowRight size={18} /> {t('nav.home')}
                        </Link>
                        <button
                            onClick={() => setIsEventModalOpen(true)} // Changed from setIsCreateModalOpen
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--gold-gradient)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#000',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Plus size={18} /> {t('common.createEvent')}
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    icon={<Users className="gold-text" />}
                                    label={t('dashboard.totalSubscribers')}
                                    value={stats?.submissions || 0}
                                    trend="+12%"
                                    color="rgba(10, 10, 10, 0.9)"
                                />
                                <StatCard
                                    icon={<FileText className="gold-text" />}
                                    label={t('dashboard.activeEvents')}
                                    value={forms.filter(f => f.active).length}
                                    trend="0"
                                    color="rgba(10, 10, 10, 0.9)"
                                />
                                <StatCard
                                    icon={<CheckCircle className="gold-text" />}
                                    label={t('dashboard.approvedSubscriptions')}
                                    value={stats?.approved || 0}
                                    trend="+5%"
                                    color="rgba(10, 10, 10, 0.9)"
                                />
                                <StatCard
                                    icon={<DollarSign className="gold-text" />}
                                    label={t('dashboard.estimatedRevenue')}
                                    value={`MT ${(stats?.revenue || 0).toLocaleString()}`}
                                    trend="+18%"
                                    color="rgba(10, 10, 10, 0.9)"
                                />
                            </div>

                            <div style={{ marginTop: '4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>{t('dashboard.recentEvents')}</h3>
                                    <button onClick={() => setActiveTab('forms')} style={{ background: 'none', border: 'none', color: '#FFD700', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>{t('dashboard.viewAll')}</button>
                                </div>

                                {forms.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {forms.slice(0, 3).map((form) => (
                                            <div key={form._id} className="luxury-card" style={{ background: '#fff', border: 'none', padding: '0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                                <div style={{ height: '4px', width: '100%', background: 'var(--gold-gradient)' }}></div>
                                                <div style={{ padding: '2rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                                        <h4 style={{ fontWeight: 700, fontSize: '1.3rem', fontFamily: 'var(--font-playfair)', maxWidth: '80%' }}>{form.title}</h4>
                                                        <span style={{
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 800,
                                                            background: form.active ? '#38a16915' : '#eee',
                                                            color: form.active ? '#38a169' : '#888',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {form.active ? t('dashboard.activeTitle') : t('dashboard.draftTitle')}
                                                        </span>
                                                    </div>

                                                    {form.capacity && (
                                                        <div style={{ marginBottom: '1.5rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                                                                <span>{t('dashboard.registrants')}: <b style={{ color: '#000' }}>{form.submissionCount || 0}</b></span>
                                                                <span>{t('dashboard.goal')}: <b>{form.capacity}</b></span>
                                                            </div>
                                                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                                <div
                                                                    style={{
                                                                        width: `${Math.min(100, Math.round(((form.submissionCount || 0) / form.capacity) * 100))}%`,
                                                                        height: '100%',
                                                                        background: 'var(--gold-gradient, linear-gradient(to right, #FFD700, #FDB931))',
                                                                        borderRadius: '4px',
                                                                        transition: 'width 1s ease'
                                                                    }}
                                                                />
                                                            </div>
                                                            <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '4px', color: '#999', fontWeight: 600 }}>
                                                                {Math.round(((form.submissionCount || 0) / form.capacity) * 100)}% {t('dashboard.reached')}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <button onClick={() => copyToClipboard(form.slug)} title={t('common.copyLink')} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                                                            <Copy size={16} /> {t('common.link')}
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                                                            style={{ flex: 3, padding: '1rem', background: '#000', color: '#FFD700', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                                        >
                                                            {t('common.view')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="luxury-card" style={{ background: '#fff', border: 'none', textAlign: 'center', padding: '4rem' }}>
                                        <FileText size={48} style={{ color: '#eee', marginBottom: '1rem' }} />
                                        <h4 style={{ color: '#999', marginBottom: '1rem' }}>{t('dashboard.noEventsYet')}</h4>
                                        <button onClick={() => setIsEventModalOpen(true)} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>{t('dashboard.createFirstEvent')}</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'forms' && (
                        <motion.div key="forms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="luxury-card" style={{ background: '#fff', border: 'none' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                            <th style={{ padding: '1rem', color: '#666' }}>{t('dashboard.eventName')}</th>
                                            <th style={{ padding: '1rem', color: '#666' }}>{t('dashboard.status')}</th>
                                            <th style={{ padding: '1rem', color: '#666' }}>{t('dashboard.registrants')}</th>
                                            <th style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>{t('common.visits')}</th>
                                            <th style={{ padding: '1rem', color: '#666', textAlign: 'right' }}>{t('dashboard.actions')}</th>
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
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '1rem', fontWeight: 600, color: '#333' }}>
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
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <StripeConnect />
                            <MentorSettings user={user} onUpdate={loadDashboard} />
                            <div style={{ marginTop: '2rem' }}>
                                <button
                                    onClick={() => setIsUpgradeModalOpen(true)}
                                    className="btn-secondary"
                                    style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid #ddd', background: '#fff' }}
                                >
                                    Fazer Upgrade de Plano
                                </button>
                            </div>
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
                    />
                )}

                <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string | number, trend: string, color: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="luxury-card"
            style={{ background: '#fff', padding: '1.8rem', border: 'none', borderTop: `1px solid ${color}` }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: `rgba(212,175,55,0.1)`, color: '#D4AF37', padding: '0.8rem', borderRadius: '12px' }}>
                    {icon}
                </div>
                <span style={{ color: '#666', fontWeight: 500, fontSize: '0.95rem' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>{value}</h2>
                <span style={{ fontSize: '0.85rem', color: trend.startsWith('+') ? '#10b981' : '#666', fontWeight: 600 }}>{trend}</span>
            </div>
        </motion.div>
    );
}
