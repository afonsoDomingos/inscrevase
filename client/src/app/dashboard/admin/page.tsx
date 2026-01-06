"use client";

import { useEffect, useState } from 'react';
import { authService, UserData } from '@/lib/authService';
import { dashboardService, AdminStats, RecentForm } from '@/lib/dashboardService';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, LogOut, Loader2, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentForms, setRecentForms] = useState<RecentForm[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);

                const [statsData, formsData] = await Promise.all([
                    dashboardService.getAdminStats(),
                    dashboardService.getRecentForms()
                ]);

                setStats(statsData);
                setRecentForms(formsData);
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
        { label: 'Mentores Ativos', value: stats?.mentors || 0, icon: <Users size={24} />, color: '#FFD700' },
        { label: 'Formulários Criados', value: stats?.forms || 0, icon: <FileText size={24} />, color: '#3182ce' },
        { label: 'Total Inscrições', value: stats?.submissions || 0, icon: <TrendingUp size={24} />, color: '#805ad5' },
        { label: 'Inscrições Aprovadas', value: stats?.approved || 0, icon: <CheckCircle size={24} />, color: '#38a169' },
    ];

    return (
        <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '100px' }}>
            <Navbar />

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}
                        >
                            Olá, <span className="gold-text">{user.name}</span>
                        </motion.h1>
                        <p style={{ color: '#666' }}>Bem-vindo ao centro de comando da Inscreva-se</p>
                    </div>

                    <button
                        onClick={() => authService.logout()}
                        style={{ background: '#fff', border: '1px solid #ddd', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </header>

                <div className="grid">
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="luxury-card"
                            style={{ background: '#fff', padding: '1.5rem', border: 'none' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ background: `${card.color}15`, color: card.color, padding: '0.8rem', borderRadius: '12px' }}>
                                    {card.icon}
                                </div>
                                <span style={{ color: '#666', fontWeight: 500 }}>{card.label}</span>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{card.value}</h2>
                        </motion.div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="luxury-card"
                        style={{ background: '#fff', border: 'none' }}
                    >
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>Formulários Recentes</h3>
                        {recentForms.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                            <th style={{ padding: '1rem 0', color: '#666' }}>Título</th>
                                            <th style={{ padding: '1rem 0', color: '#666' }}>Criador</th>
                                            <th style={{ padding: '1rem 0', color: '#666' }}>Data</th>
                                            <th style={{ padding: '1rem 0', color: '#666' }}>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentForms.map((form) => (
                                            <tr key={form._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: 600 }}>{form.title}</td>
                                                <td style={{ padding: '1rem 0' }}>{form.creator?.name || '---'}</td>
                                                <td style={{ padding: '1rem 0', color: '#888' }}>
                                                    {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td style={{ padding: '1rem 0' }}>
                                                    <a href={`/f/${form.slug}`} target="_blank" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 500 }}>
                                                        Ver <ExternalLink size={14} />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <FileText size={48} style={{ color: '#ddd', marginBottom: '1rem' }} />
                                <h3 style={{ color: '#999' }}>Nenhum formulário criado ainda</h3>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
