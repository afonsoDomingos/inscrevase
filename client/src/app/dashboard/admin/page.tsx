"use client";

import { useEffect, useState } from 'react';
import { authService, UserData } from '@/lib/authService';
import { dashboardService, AdminStats } from '@/lib/dashboardService';
import Navbar from '@/components/Navbar';
import UsersList from '@/components/admin/UsersList';
import FormList from '@/components/admin/FormList';
import SubmissionList from '@/components/admin/SubmissionList';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, LogOut, Loader2, LayoutDashboard, Database, ShieldAlert } from 'lucide-react';

type Tab = 'overview' | 'users' | 'forms' | 'submissions';

export default function AdminDashboard() {
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);

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
    }, []);

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
    ];

    return (
        <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
            <Navbar />

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                            <ShieldAlert size={18} />
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{user.role} Dashboard</span>
                        </div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{ fontSize: '2.2rem', fontWeight: 800 }}
                        >
                            Olá, <span className="gold-text">{user.name.split(' ')[0]}</span>
                        </motion.h1>
                    </div>

                    <button
                        onClick={() => authService.logout()}
                        style={{ background: '#fff', border: '1px solid #ddd', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, transition: 'all 0.3s' }}
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </header>

                {/* Tabs Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '2.5rem', borderBottom: '1px solid #eee', paddingBottom: '10px', overflowX: 'auto' }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeTab === item.id ? '#000' : 'transparent',
                                color: activeTab === item.id ? '#FFD700' : '#666',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="grid">
                                {cards.map((card, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -5 }}
                                        onClick={() => setActiveTab(card.tab as Tab)}
                                        className="luxury-card"
                                        style={{ background: '#fff', padding: '1.5rem', border: 'none', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ background: `${card.color}15`, color: card.color, padding: '0.8rem', borderRadius: '12px' }}>
                                                {card.icon}
                                            </div>
                                            <span style={{ color: '#666', fontWeight: 500 }}>{card.label}</span>
                                        </div>
                                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{card.value}</h2>
                                    </motion.div>
                                ))}
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>
                                <div className="luxury-card" style={{ background: '#000', color: '#fff', padding: '2.5rem', textAlign: 'center' }}>
                                    <h2 className="gold-text" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Modo Super Administrador Ativo</h2>
                                    <p style={{ color: '#aaa', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                                        Você tem controle total sobre todos os mentores, formulários de inscrição e pagamentos realizados na plataforma Inscreva-se.
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                        <button onClick={() => setActiveTab('users')} className="btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}>Gerenciar Usuários</button>
                                        <button onClick={() => setActiveTab('forms')} style={{ background: 'transparent', border: '1px solid #FFD700', color: '#FFD700', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Ver Atividades</button>
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
                </AnimatePresence>
            </div>
        </main>
    );
}
