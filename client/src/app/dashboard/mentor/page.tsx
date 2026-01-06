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
    DollarSign
} from 'lucide-react';
import Image from 'next/image';

type Tab = 'overview' | 'forms' | 'submissions' | 'settings';

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
        <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
            <Navbar />

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div
                            onClick={() => setIsProfileModalOpen(true)}
                            style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', background: '#000', border: '2px solid #FFD700', cursor: 'pointer' }}
                        >
                            {user.profilePhoto ? (
                                <Image src={user.profilePhoto} alt={user.name} fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
                                    <UserIcon size={30} />
                                </div>
                            )}
                        </div>
                        <div>
                            <motion.h1
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                style={{ fontSize: '2rem', fontWeight: 800 }}
                            >
                                Painel do <span className="gold-text">Mentor</span>
                            </motion.h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <p style={{ color: '#666' }}>Olá, {user.name.split(' ')[0]}</p>
                                <button onClick={() => setIsProfileModalOpen(true)} style={{ background: 'none', border: 'none', color: '#FFD700', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    Editar Perfil <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setIsEventModalOpen(true)}
                            className="btn-primary"
                            style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={18} /> Criar Evento
                        </button>
                        <button
                            onClick={() => authService.logout()}
                            style={{ background: '#fff', border: '1px solid #ddd', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                        >
                            <LogOut size={18} /> Sair
                        </button>
                    </div>
                </header>

                {/* Tabs Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    {[
                        { id: 'overview', label: 'Início', icon: <LayoutDashboard size={18} /> },
                        { id: 'forms', label: 'Meus Eventos', icon: <FileText size={18} /> },
                        { id: 'submissions', label: 'Alunos Inscritos', icon: <Database size={18} /> },
                        { id: 'settings', label: 'Configurações', icon: <Settings size={18} /> },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.7rem 1.2rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: activeTab === item.id ? '#000' : 'transparent',
                                color: activeTab === item.id ? '#FFD700' : '#666',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="grid">
                                {cards.map((card, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -5 }}
                                        className="luxury-card"
                                        style={{ background: '#fff', padding: '1.5rem', border: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ background: `${card.color}15`, color: card.color, padding: '0.6rem', borderRadius: '10px' }}>
                                                {card.icon}
                                            </div>
                                            <span style={{ color: '#666', fontWeight: 500, fontSize: '0.9rem' }}>{card.label}</span>
                                        </div>
                                        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{card.value}</h2>
                                    </motion.div>
                                ))}
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Eventos Recentes</h3>
                                    <button onClick={() => setActiveTab('forms')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Ver todos</button>
                                </div>

                                {forms.length > 0 ? (
                                    <div className="grid">
                                        {forms.slice(0, 3).map((form) => (
                                            <div key={form._id} className="luxury-card" style={{ background: '#fff', border: 'none' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                    <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{form.title}</h4>
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 800,
                                                        background: form.active ? '#38a16915' : '#eee',
                                                        color: form.active ? '#38a169' : '#888'
                                                    }}>
                                                        {form.active ? 'ATIVO' : 'RASCUNHO'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                                                    <button onClick={() => copyToClipboard(form.slug)} style={{ flex: 1, padding: '0.5rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                        <Copy size={14} /> Link
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                                                        style={{ flex: 1, padding: '0.5rem', background: '#000', color: '#FFD700', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                                    >
                                                        Visualizar
                                                    </button>
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
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <MentorSettings user={user} onUpdate={loadDashboard} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
    );
}
