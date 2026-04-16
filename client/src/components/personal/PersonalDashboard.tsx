"use client";

import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, Target, 
    CheckCircle, Clock, Plus, Activity, X,
    Folder, AlertTriangle, ArrowUpRight, ArrowDownRight,
    Trash2, Edit3, MoreHorizontal
} from 'lucide-react';
import { personalService, PersonalTransaction, PersonalTask, PersonalProject } from '@/lib/personalService';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from 'sonner';

type ViewMode = 'overview' | 'finance' | 'tasks' | 'projects';

/* ─── Shared styled sub-components ─── */

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1.5px solid var(--border)',
    background: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
};

const fieldWrap: React.CSSProperties = { marginBottom: '1.1rem' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={fieldWrap}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            {...props}
            style={{
                ...inputStyle,
                borderColor: focused ? '#FFD700' : 'var(--border)',
                boxShadow: focused ? '0 0 0 3px rgba(255,215,0,0.1)' : 'none',
                ...props.style
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    const [focused, setFocused] = useState(false);
    return (
        <select
            {...props}
            style={{
                ...inputStyle,
                cursor: 'pointer',
                borderColor: focused ? '#FFD700' : 'var(--border)',
                boxShadow: focused ? '0 0 0 3px rgba(255,215,0,0.1)' : 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '40px',
                ...props.style
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
}

/* ─── Modal wrapper ─── */
function Modal({ title, onClose, onSubmit, children }: {
    title: string; onClose: () => void; onSubmit: (e: React.FormEvent) => void; children: React.ReactNode;
}) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
            padding: '1rem'
        }}>
            <form onSubmit={onSubmit} style={{
                width: '100%', maxWidth: '460px',
                background: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                position: 'relative',
            }}>
                <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '3px', background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', borderRadius: '3px 3px 0 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--foreground)', fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                    <button type="button" onClick={onClose} style={{
                        background: 'var(--background)', border: '1px solid var(--border)',
                        borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--background)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {children}

                <button type="submit" style={{
                    width: '100%', marginTop: '0.5rem', padding: '14px',
                    background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                    border: 'none', borderRadius: '12px',
                    color: '#000', fontWeight: 800, fontSize: '0.95rem',
                    cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px'
                }}
                    onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
                    onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
                >
                    Guardar Alterações
                </button>
            </form>
        </div>
    );
}

/* ─── Main component ─── */
export default function PersonalDashboard() {
    const { formatPrice } = useCurrency();
    const [viewMode, setViewMode] = useState<ViewMode>('overview');
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
    const [tasks, setTasks] = useState<PersonalTask[]>([]);
    const [projects, setProjects] = useState<PersonalProject[]>([]);

    const [isAddTxOpen, setIsAddTxOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

    // Edit states
    const [editingTxId, setEditingTxId] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    const defaultTxForm = { type: 'income', category: '', amount: '', description: '', date: '' };
    const defaultTaskForm = { title: '', deadline: '', priority: 'medium' };
    const defaultProjectForm = { name: '', totalBudget: '', description: '', deadline: '' };

    const [txForm, setTxForm] = useState(defaultTxForm);
    const [taskForm, setTaskForm] = useState(defaultTaskForm);
    const [projectForm, setProjectForm] = useState(defaultProjectForm);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sum, txs, tsks, projs] = await Promise.all([
                personalService.getFinanceSummary(),
                personalService.getTransactions(),
                personalService.getTasks(),
                personalService.getProjects()
            ]);
            setSummary(sum);
            setTransactions(txs);
            setTasks(tsks);
            setProjects(projs);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados do Workspace");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- FINANCE HANDLERS ---
    const handleAddTx = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...txForm, amount: Number(txForm.amount), type: txForm.type as 'income' | 'expense' };
            if (editingTxId) {
                await personalService.updateTransaction(editingTxId, payload);
                toast.success("Transação atualizada!");
            } else {
                await personalService.addTransaction(payload);
                toast.success("Transação registada!");
            }
            closeTxModal();
            fetchData();
        } catch { toast.error("Erro ao guardar transação"); }
    };

    const handleDeleteTx = async (id: string) => {
        if (confirm('Tem a certeza que deseja eliminar este registo financeiro?')) {
            try {
                await personalService.deleteTransaction(id);
                toast.success("Transação eliminada");
                fetchData();
            } catch { toast.error("Erro ao eliminar transação"); }
        }
    };

    const openEditTx = (tx: PersonalTransaction) => {
        setEditingTxId(tx._id);
        setTxForm({ 
            type: tx.type, 
            category: tx.category, 
            amount: tx.amount.toString(), 
            description: tx.description,
            date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : ''
        });
        setIsAddTxOpen(true);
    };

    const closeTxModal = () => {
        setIsAddTxOpen(false);
        setEditingTxId(null);
        setTxForm(defaultTxForm);
    };

    // --- TASK HANDLERS ---
    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...taskForm, priority: taskForm.priority as 'low' | 'medium' | 'high' };
            if(editingTaskId) {
                await personalService.updateTask(editingTaskId, payload);
                toast.success("Tarefa atualizada!");
            } else {
                await personalService.addTask(payload);
                toast.success("Tarefa adicionada!");
            }
            closeTaskModal();
            fetchData();
        } catch { toast.error("Erro ao guardar tarefa"); }
    };

    const handleDeleteTask = async (id: string) => {
        if (confirm('Tem a certeza que deseja eliminar esta tarefa?')) {
            try {
                await personalService.deleteTask(id);
                toast.success("Tarefa eliminada");
                fetchData();
            } catch { toast.error("Erro ao eliminar tarefa"); }
        }
    };

    const openEditTask = (task: PersonalTask) => {
        setEditingTaskId(task._id);
        setTaskForm({
            title: task.title,
            deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
            priority: task.priority
        });
        setIsAddTaskOpen(true);
    };

    const closeTaskModal = () => {
        setIsAddTaskOpen(false);
        setEditingTaskId(null);
        setTaskForm(defaultTaskForm);
    };

    const toggleTaskStatus = async (id: string, currentStatus: string) => {
        try {
            await personalService.updateTaskStatus(id, currentStatus === 'completed' ? 'pending' : 'completed');
            fetchData();
        } catch { toast.error("Erro ao atualizar status"); }
    };

    // --- PROJECT HANDLERS ---
    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { name: projectForm.name, totalBudget: Number(projectForm.totalBudget), description: projectForm.description, deadline: projectForm.deadline };
            if(editingProjectId) {
                await personalService.updateProject(editingProjectId, payload);
                toast.success("Projecto atualizado!");
            } else {
                await personalService.addProject(payload);
                toast.success("Projeto criado!");
            }
            closeProjectModal();
            fetchData();
        } catch { toast.error("Erro ao guardar projeto"); }
    };

    const handleDeleteProject = async (id: string) => {
        if (confirm('Atenção: Tem a certeza que deseja eliminar este projecto permanentemente?')) {
            try {
                await personalService.deleteProject(id);
                toast.success("Projeto eliminado");
                fetchData();
            } catch { toast.error("Erro ao eliminar projeto"); }
        }
    };

    const openEditProject = (proj: PersonalProject) => {
        setEditingProjectId(proj._id);
        setProjectForm({
            name: proj.name,
            totalBudget: proj.totalBudget.toString(),
            description: proj.description || '',
            deadline: proj.deadline ? new Date(proj.deadline).toISOString().split('T')[0] : ''
        });
        setIsAddProjectOpen(true);
    };

    const closeProjectModal = () => {
        setIsAddProjectOpen(false);
        setEditingProjectId(null);
        setProjectForm(defaultProjectForm);
    };


    const priorityColor = (p: string) => p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#6b7280';
    const priorityLabel = (p: string) => p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa';

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', color: '#FFD700', fontSize: '1.1rem', fontWeight: 600 }}>
            <Activity size={24} style={{ animation: 'spin 1s linear infinite' }} /> Carregando Workspace...
        </div>
    );

    const btnPrimary: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', background: 'linear-gradient(135deg, #FFD700, #B8860B)',
        border: 'none', borderRadius: '10px', color: '#000', fontWeight: 800,
        cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', letterSpacing: '0.3px',
        whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(184, 134, 11, 0.25)'
    };
    
    const iconBtnStyle: React.CSSProperties = {
        padding: '6px', background: 'var(--background)', border: '1px solid var(--border)',
        borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer',
        display: 'inline-flex', transition: 'all 0.2s'
    };

    const tabs: { id: ViewMode; label: string }[] = [
        { id: 'overview', label: 'Visão Geral' },
        { id: 'finance', label: 'Finanças' },
        { id: 'tasks', label: 'Tarefas' },
        { id: 'projects', label: 'Projetos' },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: 'var(--foreground)' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-playfair)' }}>
                        <Activity color="#FFD700" size={32} /> Workspace <span style={{ fontWeight: 300, opacity: 0.5 }}>360</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>O seu hub central de gestão financeira, produtividade e projetos.</p>
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: 'flex', background: 'var(--paper)', border: '1px solid var(--border)', padding: '6px', borderRadius: '14px', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setViewMode(tab.id)} style={{
                            padding: '10px 20px', borderRadius: '10px',
                            background: viewMode === tab.id ? 'linear-gradient(135deg,#FFD700,#B8860B)' : 'transparent',
                            color: viewMode === tab.id ? '#000' : 'var(--text-muted)',
                            fontWeight: viewMode === tab.id ? 800 : 600,
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
                        }}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── OVERVIEW ── */}
            {viewMode === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {/* Balance card */}
                    <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px', padding: '1.75rem', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(255,215,0,0.05)', borderRadius: '50%' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#FFD700', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Wallet size={18} /> Saldo Disponível
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', marginBottom: '1.5rem', color: summary.balance >= 0 ? '#fff' : '#ef4444' }}>
                            {formatPrice(summary.balance, 'MZN')}
                        </div>
                        <div style={{ display: 'flex', gap: '20px', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.95rem', fontWeight: 700 }}>
                                <ArrowUpRight size={16} /> {formatPrice(summary.income, 'MZN')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.95rem', fontWeight: 700 }}>
                                <ArrowDownRight size={16} /> {formatPrice(summary.expense, 'MZN')}
                            </div>
                        </div>
                    </div>

                    {/* Tasks card */}
                    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#FFD700', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Target size={18} /> Progresso de Tarefas
                        </div>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '1.5rem' }}>
                            {[
                                { label: 'Pendentes', count: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length, color: '#f59e0b' },
                                { label: 'Atrasadas', count: tasks.filter(t => t.status === 'late').length, color: '#ef4444' },
                                { label: 'Concluídas', count: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.count}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                        {/* mini progress bar */}
                        {tasks.length > 0 ? (
                            <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%`, background: 'linear-gradient(90deg,#10b981,#059669)', transition: 'width 0.5s', borderRadius: '4px' }} />
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sem tarefas registadas.</div>
                        )}
                    </div>

                    {/* Projects card */}
                    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#FFD700', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Folder size={18} /> Projetos Activos
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--foreground)', lineHeight: 1 }}>
                                {projects.filter(p => p.status === 'active').length}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                                de {projects.length} totais<br/>registados
                            </div>
                        </div>
                        
                        {projects.length > 0 && projects.filter(p => p.status === 'active').length === 0 && (
                            <div style={{ marginTop: '1.5rem', padding: '10px 14px', background: 'var(--background)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                Todos os projectos estão concluídos ou pendentes.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── FINANCE ── */}
            {viewMode === 'finance' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Histórico de Transações</h2>
                        <button onClick={() => setIsAddTxOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Nova Transação
                        </button>
                    </div>

                    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        {transactions.length === 0 ? (
                            <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ background: 'var(--background)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--border)' }}>
                                    <TrendingUp size={32} style={{ opacity: 0.5, margin: '0 auto' }} />
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.2rem', color: 'var(--foreground)' }}>Nenhuma transação</h3>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>Ainda não registrou fluxos financeiros.</p>
                                <button onClick={() => setIsAddTxOpen(true)} style={{ ...btnPrimary, marginTop: '1.5rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'none' }}>
                                    Adicionar a Primeira
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                                            {['Data', 'Descrição', 'Categoria', 'Valor', 'Ações'].map(h => (
                                                <th key={h} style={{ padding: '16px 24px', textAlign: h === 'Valor' ? 'right' : h === 'Ações' ? 'center' : 'left', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx, i) => (
                                            <tr key={tx._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--background)' }}>
                                                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{new Date(tx.date).toLocaleDateString('pt-PT')}</td>
                                                <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--foreground)' }}>{tx.description}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', fontSize: '0.8rem', color: '#B8860B', fontWeight: 800 }}>
                                                        {tx.category}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 900, color: tx.type === 'income' ? '#10b981' : '#ef4444', fontSize: '1.1rem' }}>
                                                    {tx.type === 'income' ? '+' : '−'} {formatPrice(tx.amount, tx.currency)}
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button onClick={() => openEditTx(tx)} style={iconBtnStyle} title="Editar"><Edit3 size={16} /></button>
                                                        <button onClick={() => handleDeleteTx(tx._id)} style={{...iconBtnStyle, color: '#ef4444'}} title="Eliminar"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── TASKS ── */}
            {viewMode === 'tasks' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Lista de Tarefas</h2>
                        <button onClick={() => setIsAddTaskOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Nova Tarefa
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {tasks.length === 0 ? (
                            <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                                <div style={{ background: 'var(--background)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--border)' }}>
                                    <CheckCircle size={32} style={{ opacity: 0.5, margin: '0 auto' }} />
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.2rem', color: 'var(--foreground)' }}>Parabéns!</h3>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>Nenhuma tarefa pendente na sua lista.</p>
                                <button onClick={() => setIsAddTaskOpen(true)} style={{ ...btnPrimary, marginTop: '1.5rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'none' }}>
                                    Agendar Trabalho
                                </button>
                            </div>
                        ) : tasks.map(task => (
                            <div key={task._id} style={{
                                display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                                padding: '1.25rem 1.5rem',
                                background: 'var(--paper)',
                                border: '1px solid var(--border)',
                                borderLeft: `5px solid ${task.status === 'late' ? '#ef4444' : task.status === 'completed' ? '#10b981' : '#FFD700'}`,
                                borderRadius: '16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                                    <button onClick={() => toggleTaskStatus(task._id, task.status)} style={{
                                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                                        color: task.status === 'completed' ? '#10b981' : 'var(--text-muted)',
                                        transition: 'color 0.2s, transform 0.2s'
                                    }}
                                    onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'}
                                    onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
                                    >
                                        <CheckCircle size={28} fill={task.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'none'} />
                                    </button>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: 800, fontSize: '1.05rem', color: 'var(--foreground)',
                                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                            opacity: task.status === 'completed' ? 0.5 : 1,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {task.title}
                                        </div>
                                        {task.deadline && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: task.status === 'late' ? '#ef4444' : 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                                                {task.status === 'late' && <AlertTriangle size={14} />}
                                                <Clock size={14} /> Prazo: {new Date(task.deadline).toLocaleDateString('pt-PT')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        flexShrink: 0, fontSize: '0.75rem', fontWeight: 900, padding: '5px 12px', borderRadius: '20px',
                                        background: `${priorityColor(task.priority)}18`,
                                        color: priorityColor(task.priority),
                                        border: `1px solid ${priorityColor(task.priority)}40`,
                                        textTransform: 'uppercase', letterSpacing: '0.5px'
                                    }}>
                                        {priorityLabel(task.priority)}
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => openEditTask(task)} style={iconBtnStyle} title="Editar"><Edit3 size={15} /></button>
                                        <button onClick={() => handleDeleteTask(task._id)} style={{...iconBtnStyle, color: '#ef4444'}} title="Eliminar"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── PROJECTS ── */}
            {viewMode === 'projects' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Projetos</h2>
                        <button onClick={() => setIsAddProjectOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Novo Projeto
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {projects.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                                <div style={{ background: 'var(--background)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--border)' }}>
                                    <Folder size={32} style={{ opacity: 0.5, margin: '0 auto' }} />
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.2rem', color: 'var(--foreground)' }}>Nenhum Projecto</h3>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>Pode associar tarefas e finanças a um projecto macro.</p>
                                <button onClick={() => setIsAddProjectOpen(true)} style={{ ...btnPrimary, marginTop: '1.5rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'none' }}>
                                    Criar o Primeiro
                                </button>
                            </div>
                        ) : projects.map(proj => (
                            <div key={proj._id} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#FFD700,#B8860B)' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--foreground)' }}>{proj.name}</h3>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 900,
                                            background: proj.status === 'active' ? 'rgba(16,185,129,0.1)' : 'var(--background)',
                                            color: proj.status === 'active' ? '#10b981' : 'var(--text-muted)',
                                            border: `1px solid ${proj.status === 'active' ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                                            textTransform: 'uppercase', letterSpacing: '0.5px'
                                        }}>
                                            {proj.status}
                                        </span>
                                        <button onClick={() => openEditProject(proj)} style={{...iconBtnStyle, padding: '4px'}} title="Editar"><Edit3 size={14} /></button>
                                        <button onClick={() => handleDeleteProject(proj._id)} style={{...iconBtnStyle, padding: '4px', color: '#ef4444'}} title="Eliminar"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Orçamento Fechado</span>
                                        <span style={{ fontWeight: 800, color: 'var(--foreground)' }}>{formatPrice(proj.totalBudget, proj.currency)}</span>
                                    </div>
                                    <div style={{ height: '1px', background: 'var(--border)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Já Faturado</span>
                                        <span style={{ fontWeight: 900, color: '#10b981' }}>{formatPrice(proj.receivedAmount, proj.currency)}</span>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <span>Tarefas Concluídas</span><span style={{ color: 'var(--foreground)' }}>{proj.progress ?? 0}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${proj.progress ?? 0}%`, background: 'linear-gradient(90deg,#FFD700,#B8860B)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── MODALS ── */}
            {isAddTxOpen && (
                <Modal title={editingTxId ? "Editar Transação" : "Nova Transação Financeira"} onClose={closeTxModal} onSubmit={handleAddTx}>
                    <Field label="Natureza do Registo">
                        <StyledSelect value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value })}>
                            <option value="income">Entrada (Ganho Financeiro)</option>
                            <option value="expense">Saída (Despesa / Custo)</option>
                        </StyledSelect>
                    </Field>
                    <Field label="Data da Transação">
                        <StyledInput type="date" value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })} />
                    </Field>
                    <Field label="Descrição da Transação">
                        <StyledInput placeholder="Ex: Sessão de Mentoria com Cliente X" required value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} />
                    </Field>
                    <Field label="Categoria da Transação">
                        <StyledInput placeholder="Ex: Serviços, Licenças, Impostos..." required value={txForm.category} onChange={e => setTxForm({ ...txForm, category: e.target.value })} />
                    </Field>
                    <Field label="Valor Exacto (MZN)">
                        <StyledInput type="number" placeholder="0.00" required min="0" step="0.01" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
                    </Field>
                </Modal>
            )}

            {isAddTaskOpen && (
                <Modal title={editingTaskId ? "Editar Tarefa" : "Nova Tarefa a Adicionar"} onClose={closeTaskModal} onSubmit={handleAddTask}>
                    <Field label="O Que Precisa de Fazer?">
                        <StyledInput placeholder="Ex: Entregar planeamento da semana 3..." required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                    </Field>
                    <Field label="Prazo Final de Entrega">
                        <StyledInput type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                    </Field>
                    <Field label="Nível de Prioridade">
                        <StyledSelect value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                            <option value="low">Baixa — Pode Esperar</option>
                            <option value="medium">Média — Normal</option>
                            <option value="high">Alta — Urgente!</option>
                        </StyledSelect>
                    </Field>
                </Modal>
            )}

            {isAddProjectOpen && (
                <Modal title={editingProjectId ? "Editar Projeto" : "Abrir Novo Projeto"} onClose={closeProjectModal} onSubmit={handleAddProject}>
                    <Field label="Nome do Projeto ou Cliente">
                        <StyledInput placeholder="Ex: Consultoria de Marketing Brand X" required value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />
                    </Field>
                    <Field label="Contexto / Descrição Breve">
                        <StyledInput placeholder="Rebranding e optimização de funil..." value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                    </Field>
                    <Field label="Valor Orçamentado e Fechado (MZN)">
                        <StyledInput type="number" placeholder="0.00" min="0" step="0.01" value={projectForm.totalBudget} onChange={e => setProjectForm({ ...projectForm, totalBudget: e.target.value })} />
                    </Field>
                    <Field label="Prazo Final de Entrega">
                        <StyledInput type="date" value={projectForm.deadline} onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })} />
                    </Field>
                </Modal>
            )}

        </div>
    );
}
