"use client";

import { useEffect, useState } from 'react';
import { authService, UserData } from '@/lib/authService';
import { dashboardService, AdminStats } from '@/lib/dashboardService';
import UsersList from '@/components/admin/UsersList';
import FormList from '@/components/admin/FormList';
import SubmissionList from '@/components/admin/SubmissionList';
import SupportTicketList from '@/components/admin/SupportTicketList';
import AdminFinance from '@/components/admin/AdminFinance';
import SupportModal from '@/components/mentor/SupportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, LogOut, Loader2, LayoutDashboard, Database, ShieldAlert, HelpCircle, LifeBuoy, Wallet, Settings, Eye } from 'lucide-react';
import ProfileModal from '@/components/mentor/ProfileModal';
import { useRouter } from 'next/navigation';
import { supportService } from '@/lib/supportService';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import { Chrome, Linkedin, Mail, Send } from 'lucide-react';
import AdminMessageModal from '@/components/admin/AdminMessageModal';
import OnboardingTour, { Step } from '@/components/mentor/OnboardingTour';

const ADMIN_STEPS: Step[] = [
    {
        targetId: 'welcome-modal',
        title: 'Painel do Administrador 🛡️',
        description: 'Bem-vindo ao centro de comando. Aqui você tem supervisão total sobre usuários, finanças e conteúdo.',
        position: 'center'
    },
    {
        targetId: 'admin-nav-users',
        title: 'Gestão de Usuários',
        description: 'Gerencie mentores, alunos e admins. Acesse perfis detalhados e controle permissões.',
        position: 'right'
    },
    {
        targetId: 'admin-global-msg',
        title: 'Comunicação em Massa',
        description: 'Envie comunicados importantes para todos os usuários ou grupos específicos diretamente por aqui.',
        position: 'bottom'
    },
    {
        targetId: 'admin-view-visitor',
        title: 'Ver site como Visitante',
        description: 'Clique aqui para abrir uma nova aba e visualizar o site público como um visitante ou mentor, sem sair do painel.',
        position: 'bottom'
    },
    {
        targetId: 'admin-nav-finance',
        title: 'Controle Financeiro',
        description: 'Acompanhe o fluxo de caixa, saques de mentores e receita da plataforma.',
        position: 'right'
    },
    {
        targetId: 'admin-support-fab',
        title: 'Suporte Global',
        description: 'Visualize e responda tickets de suporte de todos os usuários em um só lugar.',
        position: 'left'
    }
];

type Tab = 'overview' | 'users' | 'forms' | 'submissions' | 'support' | 'finance';

export default function AdminDashboard() {
    const { t } = useTranslate();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState<{ id: string, name: string } | undefined>(undefined);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);

                const statsData = await dashboardService.getAdminStats();
                setStats(statsData);
            } catch (err) {
                console.error("Dashboard error:", err);
                if (err instanceof Error && (err.message.includes('401') || err.message.includes('perfil'))) {
                    router.push('/entrar');
                }
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
        loadUnreadCount();

        // Poll for unread count every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [router]);

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

    const cards = [
        { label: t('dashboard.activeMentors'), value: stats?.mentors || 0, icon: <Users size={24} />, color: '#FFD700', tab: 'users' },
        { label: t('dashboard.createdForms'), value: stats?.forms || 0, icon: <FileText size={24} />, color: '#3182ce', tab: 'forms' },
        { label: t('dashboard.totalSubscriptions'), value: stats?.submissions || 0, icon: <TrendingUp size={24} />, color: '#805ad5', tab: 'submissions' },
        { label: t('dashboard.approvedSubscriptions'), value: stats?.approved || 0, icon: <CheckCircle size={24} />, color: '#38a169', tab: 'submissions' },
    ];

    const menuItems = [
        { id: 'overview', label: t('dashboard.overview'), icon: <LayoutDashboard size={20} /> },
        { id: 'users', label: t('dashboard.users'), icon: <Users size={20} /> },
        { id: 'forms', label: t('dashboard.forms'), icon: <FileText size={20} /> },
        { id: 'submissions', label: t('dashboard.submissions'), icon: <Database size={20} /> },
        { id: 'finance', label: t('dashboard.finance'), icon: <Wallet size={20} /> },
        { id: 'support', label: t('dashboard.support'), icon: <LifeBuoy size={20} /> },
    ];

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
            <main style={{ marginLeft: '280px', flex: 1, padding: '2.5rem', minHeight: '100vh', maxWidth: 'calc(100vw - 280px)' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                            <ShieldAlert size={18} />
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{user.role} Dashboard</span>
                        </div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', lineHeight: 1.1, color: '#1a1a1a' }}
                        >
                            {t('dashboard.welcomeBack')}, <span className="gold-text">{user.name.split(' ')[0]}</span>
                        </motion.h1>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => {
                                setSelectedRecipient(undefined);
                                setIsMessageModalOpen(true);
                            }}
                            id="admin-global-msg"
                            style={{
                                padding: '0.9rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                borderRadius: '50px',
                                background: '#000',
                                color: '#FFD700',
                                border: '2px solid #000',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontSize: '0.85rem',
                                letterSpacing: '0.5px'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Send size={18} /> Comunicado Global
                        </button>
                        <Link
                            href="/"
                            target="_blank"
                            id="admin-view-visitor"
                            title="Visualize a plataforma como um usuário não logado ou mentor"
                            style={{
                                padding: '0.9rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                textTransform: 'uppercase',
                                fontSize: '0.8rem',
                                letterSpacing: '1px',
                                borderRadius: '50px',
                                background: 'transparent',
                                border: '1px solid #FFD700',
                                color: '#000',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#FFD700';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Eye size={18} /> Ver como Visitante
                        </Link>
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
                                borderRadius: '50px',
                                color: '#e53e3e',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 2px 8px rgba(229, 62, 62, 0.05)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#fff5f5'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                                {cards.map((card, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -5 }}
                                        onClick={() => setActiveTab(card.tab as Tab)}
                                        className="luxury-card"
                                        style={{ background: '#fff', padding: '1.8rem', border: 'none', borderTop: `1px solid ${card.color}40`, cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: `${card.color}15`, color: card.color, padding: '0.8rem', borderRadius: '12px' }}>
                                                {card.icon}
                                            </div>
                                            <span style={{ color: '#666', fontWeight: 500, fontSize: '0.95rem' }}>{card.label}</span>
                                        </div>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>{card.value}</h2>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Data is Power Section */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                                <div className="luxury-card" style={{ background: '#fff', padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Database className="gold-text" size={20} /> Distribuição por Origem
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        {[
                                            { label: 'E-mail Nativo', count: stats?.authStats?.native || 0, icon: <Mail size={16} />, color: '#666' },
                                            { label: 'Google Auth', count: stats?.authStats?.google || 0, icon: <Chrome size={16} />, color: '#db4437' },
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
                                                            transition={{ duration: 1, delay: idx * 0.2 }}
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
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>
                                <div className="luxury-card" style={{ background: '#000', color: '#fff', padding: '3rem', textAlign: 'center', border: '1px solid #333' }}>
                                    <h2 className="gold-text" style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-playfair)' }}>Modo Super Administrador Ativo</h2>
                                    <p style={{ color: '#aaa', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                        Você tem controle total sobre todos os mentores, formulários de inscrição e pagamentos realizados na plataforma Inscreva-se.
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                                        <button onClick={() => setActiveTab('users')} className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '0.9rem' }}>Gerenciar Usuários</button>
                                        <button onClick={() => setActiveTab('forms')} style={{ background: 'transparent', border: '1px solid #FFD700', color: '#FFD700', padding: '0.9rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Ver Atividades</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <UsersList onMessageUser={(user) => {
                                setSelectedRecipient({ id: user.id || user._id || '', name: user.name });
                                setIsMessageModalOpen(true);
                            }} />
                        </motion.div>
                    )}

                    {activeTab === 'forms' && (
                        <motion.div key="forms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <FormList />
                        </motion.div>
                    )}

                    {activeTab === 'submissions' && (
                        <motion.div key="submissions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <SubmissionList />
                        </motion.div>
                    )}

                    {activeTab === 'support' && (
                        <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <SupportTicketList />
                        </motion.div>
                    )}

                    {activeTab === 'finance' && (
                        <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
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

                <OnboardingTour steps={ADMIN_STEPS} storageKey="inscrevase_admin_tour_completed" />
            </main>
        </div >
    );
}
