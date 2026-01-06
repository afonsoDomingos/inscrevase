"use client";

import { useEffect, useState, useCallback } from 'react';
import { authService, UserData } from '@/lib/authService';
import { dashboardService, AdminStats } from '@/lib/dashboardService';
import { formService, FormModel } from '@/lib/formService';
import Navbar from '@/components/Navbar';
import CreateEventModal from '@/components/mentor/CreateEventModal';
import ProfileModal from '@/components/mentor/ProfileModal';
import SubmissionManagement from '@/components/mentor/SubmissionManagement';
import MentorSettings from '@/components/mentor/MentorSettings';
import EditEventModal from '@/components/mentor/EditEventModal';
import { Pencil } from 'lucide-react';

import EditEventThemeModal from '@/components/mentor/EditEventThemeModal';
import AnalyticsCharts from '@/components/mentor/AnalyticsCharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    FileText,
    Users,
    TrendingUp,
    CheckCircle,
    LogOut,
    Loader2,
    LayoutDashboard,
    Database,
    Settings,
    Copy,
    Trash2,
    User as UserIcon,
    ChevronRight,
    Palette,
    DollarSign,
    PieChart
} from 'lucide-react';
import Image from 'next/image';

type Tab = 'overview' | 'forms' | 'submissions' | 'reports' | 'settings';

export default function MentorDashboard() {
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [forms, setForms] = useState<FormModel[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [editModalData, setEditModalData] = useState<{ isOpen: boolean; form: FormModel | null }>({ isOpen: false, form: null });
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedSubmissionFormId, setSelectedSubmissionFormId] = useState<string | null>(null);
    const [themeModalData, setThemeModalData] = useState<{ isOpen: boolean; form: FormModel | null }>({ isOpen: false, form: null });

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const copyToClipboard = (slug: string) => {
        const url = `${window.location.origin}/f/${slug}`;
        navigator.clipboard.writeText(url);
        alert('Link copiado para a área de transferência!');
    };

    const handleToggleStatus = async (form: FormModel) => {
        try {
            await formService.toggleFormStatus(form._id, !form.active);
            await loadDashboard();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao atualizar status');
        }
    };

    const handleDeleteForm = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este evento?')) return;
        try {
            await formService.deleteForm(id);
            await loadDashboard();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao excluir formulário');
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
        { label: 'Eventos Ativos', value: stats?.forms || 0, icon: <FileText size={20} />, color: '#FFD700' },
        { label: 'Total Inscritos', value: stats?.submissions || 0, icon: <Users size={20} />, color: '#3182ce' },
        { label: 'Inscrições Aprovadas', value: stats?.approved || 0, icon: <CheckCircle size={20} />, color: '#38a169' },
        { label: 'Faturamento Estimado', value: stats?.revenue ? new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(stats.revenue) : '0 MZN', icon: <DollarSign size={20} />, color: '#48bb78' },
        { label: 'Conversão', value: stats?.submissions ? `${Math.round((stats.approved / stats.submissions) * 100)}%` : '0%', icon: <TrendingUp size={20} />, color: '#805ad5' },
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
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={20} /> },
                        { id: 'forms', label: 'Meus Eventos', icon: <FileText size={20} /> },
                        { id: 'submissions', label: 'Inscritos', icon: <Users size={20} /> },
                        { id: 'reports', label: 'Relatórios', icon: <PieChart size={20} /> },
                        { id: 'settings', label: 'Minha Conta', icon: <Settings size={20} /> },
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
                                Olá, <span className="gold-text">{user.name.split(' ')[0]}</span>
                            </motion.h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>Bem-vindo de volta ao seu painel</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setIsEventModalOpen(true)}
                            className="btn-primary"
                            style={{ padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', borderRadius: '50px' }}
                        >
                            <Plus size={20} /> Criar Novo Evento
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                                {cards.slice(0, 3).map((card, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -5 }}
                                        className="luxury-card"
                                        style={{ background: '#fff', padding: '1.8rem', border: 'none', borderTop: `1px solid ${card.color}40` }}
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {cards.slice(3).map((card, index) => (
                                    <motion.div
                                        key={index + 3}
                                        whileHover={{ y: -5 }}
                                        className="luxury-card"
                                        style={{ background: '#fff', padding: '1.8rem', border: 'none', borderTop: `1px solid ${card.color}40` }}
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

                            <div style={{ marginTop: '4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>Eventos Recentes</h3>
                                    <button onClick={() => setActiveTab('forms')} style={{ background: 'none', border: 'none', color: '#FFD700', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Ver todos</button>
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
                                                            {form.active ? 'ATIVO' : 'RASCUNHO'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <button onClick={() => copyToClipboard(form.slug)} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                                                            <Copy size={16} /> Link
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                                                            style={{ flex: 3, padding: '1rem', background: '#000', color: '#FFD700', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                                        >
                                                            Visualizar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="luxury-card" style={{ background: '#fff', border: 'none', textAlign: 'center', padding: '4rem' }}>
                                        <FileText size={48} style={{ color: '#eee', marginBottom: '1rem' }} />
                                        <h4 style={{ color: '#999', marginBottom: '1rem' }}>Nenhum evento criado ainda</h4>
                                        <button onClick={() => setIsEventModalOpen(true)} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Criar Meu Primeiro Evento</button>
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
                                            <th style={{ padding: '1rem', color: '#666' }}>Nome do Evento</th>
                                            <th style={{ padding: '1rem', color: '#666' }}>Status</th>
                                            <th style={{ padding: '1rem', color: '#666' }}>Inscritos</th>
                                            <th style={{ padding: '1rem', color: '#666', textAlign: 'right' }}>Ações</th>
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
                                                        {form.active ? 'Ativo' : 'Inativo'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>{form.submissionCount || 0}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                        <button onClick={() => setEditModalData({ isOpen: true, form })} title="Editar Evento" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3182ce' }}><Pencil size={18} /></button>
                                                        <button onClick={() => setThemeModalData({ isOpen: true, form })} title="Personalizar Tema" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><Palette size={18} /></button>
                                                        <button onClick={() => copyToClipboard(form.slug)} title="Copiar Link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><Copy size={18} /></button>
                                                        <button onClick={() => { setSelectedSubmissionFormId(form._id); setActiveTab('submissions'); }} title="Ver Submissões" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><Users size={18} /></button>
                                                        <button onClick={() => handleDeleteForm(form._id)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}><Trash2 size={18} /></button>
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
                                Análise de Performance
                            </h2>
                            <AnalyticsCharts />
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <MentorSettings user={user} onUpdate={loadDashboard} />
                        </motion.div>
                    )}
                </AnimatePresence>

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
            </main>
        </div>
    );
}
