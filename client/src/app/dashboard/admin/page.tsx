"use client";

import { useEffect, useState } from 'react';
import { authService, UserData } from '@/lib/authService';
import { dashboardService, AdminStats } from '@/lib/dashboardService';
import UsersList from '@/components/admin/UsersList';
import FormList from '@/components/admin/FormList';
import SubmissionList from '@/components/admin/SubmissionList';
import SupportTicketList from '@/components/admin/SupportTicketList';
import SupportModal from '@/components/mentor/SupportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, LogOut, Loader2, LayoutDashboard, Database, ShieldAlert, HelpCircle, LifeBuoy } from 'lucide-react';
import { supportService } from '@/lib/supportService';

type Tab = 'overview' | 'users' | 'forms' | 'submissions' | 'support';

export default function AdminDashboard() {
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);

                const statsData = await dashboardService.getAdminStats();
                setStats(statsData);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
        loadUnreadCount();

        // Poll for unread count every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

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

    if (!user) return null;

    const cards = [
        { label: 'Mentores Ativos', value: stats?.mentors || 0, icon: <Users size={24} />, color: '#FFD700', tab: 'users' },
        { label: 'Formulários Criados', value: stats?.forms || 0, icon: <FileText size={24} />, color: '#3182ce', tab: 'forms' },
        { label: 'Total Inscrições', value: stats?.submissions || 0, icon: <TrendingUp size={24} />, color: '#805ad5', tab: 'submissions' },
        { label: 'Inscrições Aprovadas', value: stats?.approved || 0, icon: <CheckCircle size={24} />, color: '#38a169', tab: 'submissions' },
    ];

    const menuItems = [
        { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={20} /> },
        { id: 'users', label: 'Usuários', icon: <Users size={20} /> },
        { id: 'forms', label: 'Eventos/Formulários', icon: <FileText size={20} /> },
        { id: 'submissions', label: 'Inscrições', icon: <Database size={20} /> },
        { id: 'support', label: 'Suporte', icon: <LifeBuoy size={20} /> },
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
                <div style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid #333' }}>
                    <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>
                        Inscreva<span className="gold-text">.se</span>
                    </h2>
                </div>

                <nav style={{ padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {menuItems.map((item) => (
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
                                fontSize: '0.95rem',
                                position: 'relative'
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

                <div style={{ padding: '2rem' }}>
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
                        <LogOut size={18} /> Sair
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
                            Olá, <span className="gold-text">{user.name.split(' ')[0]}</span>
                        </motion.h1>
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
                            <UsersList />
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
                </AnimatePresence>
                <button
                    onClick={() => setIsSupportOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
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
            </main>
        </div>
    );
}
