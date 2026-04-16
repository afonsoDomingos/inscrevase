"use client";

import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, Target, 
    CheckCircle, Clock, Plus, Activity, X,
    Folder, AlertTriangle, ArrowUpRight, ArrowDownRight
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
    border: '1.5px solid rgba(255,215,0,0.25)',
    background: 'rgba(255,255,255,0.04)',
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
    color: 'rgba(255,215,0,0.7)',
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
                borderColor: focused ? '#FFD700' : 'rgba(255,215,0,0.25)',
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
                borderColor: focused ? '#FFD700' : 'rgba(255,215,0,0.25)',
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
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            padding: '1rem'
        }}>
            <form onSubmit={onSubmit} style={{
                width: '100%', maxWidth: '460px',
                background: '#1a1a1a',
                border: '1px solid rgba(255,215,0,0.2)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                position: 'relative',
            }}>
                {/* Gold accent top line */}
                <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', borderRadius: '1px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                    <button type="button" onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', color: '#aaa', cursor: 'pointer', padding: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,0,0,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#aaa'; }}
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
                    Confirmar
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

    const [txForm, setTxForm] = useState({ type: 'income', category: '', amount: '', description: '' });
    const [taskForm, setTaskForm] = useState({ title: '', deadline: '', priority: 'medium' });
    const [projectForm, setProjectForm] = useState({ name: '', totalBudget: '', description: '' });

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

    const handleAddTx = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await personalService.addTransaction({ ...txForm, amount: Number(txForm.amount), type: txForm.type as 'income' | 'expense' });
            toast.success("Transação adicionada!");
            setIsAddTxOpen(false);
            setTxForm({ type: 'income', category: '', amount: '', description: '' });
            fetchData();
        } catch { toast.error("Erro ao adicionar transação"); }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await personalService.addTask({ ...taskForm, priority: taskForm.priority as 'low' | 'medium' | 'high' });
            toast.success("Tarefa adicionada!");
            setIsAddTaskOpen(false);
            setTaskForm({ title: '', deadline: '', priority: 'medium' });
            fetchData();
        } catch { toast.error("Erro ao adicionar tarefa"); }
    };

    const toggleTaskStatus = async (id: string, currentStatus: string) => {
        try {
            await personalService.updateTaskStatus(id, currentStatus === 'completed' ? 'pending' : 'completed');
            fetchData();
        } catch { toast.error("Erro ao atualizar tarefa"); }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await personalService.addProject({ name: projectForm.name, totalBudget: Number(projectForm.totalBudget), description: projectForm.description });
            toast.success("Projeto criado!");
            setIsAddProjectOpen(false);
            setProjectForm({ name: '', totalBudget: '', description: '' });
            fetchData();
        } catch { toast.error("Erro ao criar projeto"); }
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
        whiteSpace: 'nowrap'
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-playfair)' }}>
                        <Activity color="#FFD700" /> Workspace <span style={{ fontWeight: 300, opacity: 0.5 }}>360</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>O seu hub central de gestão financeira, produtividade e projetos.</p>
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.1)', padding: '5px', borderRadius: '14px', gap: '4px' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setViewMode(tab.id)} style={{
                            padding: '8px 18px', borderRadius: '10px',
                            background: viewMode === tab.id ? 'linear-gradient(135deg,#FFD700,#B8860B)' : 'transparent',
                            color: viewMode === tab.id ? '#000' : 'rgba(255,255,255,0.5)',
                            fontWeight: viewMode === tab.id ? 800 : 500,
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.88rem'
                        }}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── OVERVIEW ── */}
            {viewMode === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Balance card */}
                    <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(255,215,0,0.05)', borderRadius: '50%' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#FFD700', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Wallet size={16} /> Saldo Disponível
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', marginBottom: '1.25rem', color: summary.balance >= 0 ? '#fff' : '#ef4444' }}>
                            {formatPrice(summary.balance, 'MZN')}
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                                <ArrowUpRight size={14} /> {formatPrice(summary.income, 'MZN')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                                <ArrowDownRight size={14} /> {formatPrice(summary.expense, 'MZN')}
                            </div>
                        </div>
                    </div>

                    {/* Tasks card */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', color: '#FFD700', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Target size={16} /> Progresso de Tarefas
                        </div>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '1.25rem' }}>
                            {[
                                { label: 'Pendentes', count: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length, color: '#f59e0b' },
                                { label: 'Atrasadas', count: tasks.filter(t => t.status === 'late').length, color: '#ef4444' },
                                { label: 'Concluídas', count: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, color: item.color }}>{item.count}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                        {/* mini progress bar */}
                        {tasks.length > 0 && (
                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%`, background: 'linear-gradient(90deg,#10b981,#059669)', transition: 'width 0.5s' }} />
                            </div>
                        )}
                    </div>

                    {/* Projects card */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', color: '#FFD700', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Folder size={16} /> Projetos Activos
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{projects.filter(p => p.status === 'active').length}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>de {projects.length} projectos totais</div>
                    </div>
                </div>
            )}

            {/* ── FINANCE ── */}
            {viewMode === 'finance' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Histórico de Transações</h2>
                        <button onClick={() => setIsAddTxOpen(true)} style={btnPrimary}>
                            <Plus size={16} /> Nova Transação
                        </button>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
                        {transactions.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                <TrendingUp size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ margin: 0 }}>Nenhuma transação registrada ainda.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {['Data', 'Descrição', 'Categoria', 'Valor'].map(h => (
                                            <th key={h} style={{ padding: '14px 20px', textAlign: h === 'Valor' ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,215,0,0.6)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx, i) => (
                                        <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{new Date(tx.date).toLocaleDateString('pt-PT')}</td>
                                            <td style={{ padding: '14px 20px', fontWeight: 600 }}>{tx.description}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', fontSize: '0.78rem', color: '#FFD700', fontWeight: 700 }}>
                                                    {tx.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, color: tx.type === 'income' ? '#10b981' : '#ef4444', fontSize: '1rem' }}>
                                                {tx.type === 'income' ? '+' : '−'} {formatPrice(tx.amount, tx.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ── TASKS ── */}
            {viewMode === 'tasks' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Minhas Tarefas</h2>
                        <button onClick={() => setIsAddTaskOpen(true)} style={btnPrimary}>
                            <Plus size={16} /> Nova Tarefa
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {tasks.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>
                                <CheckCircle size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ margin: 0 }}>Nenhuma tarefa ainda. Oba!</p>
                            </div>
                        ) : tasks.map(task => (
                            <div key={task._id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderLeft: `4px solid ${task.status === 'late' ? '#ef4444' : task.status === 'completed' ? '#10b981' : 'rgba(255,215,0,0.3)'}`,
                                borderRadius: '14px',
                                transition: 'border-color 0.2s',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                    <button onClick={() => toggleTaskStatus(task._id, task.status)} style={{
                                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                                        color: task.status === 'completed' ? '#10b981' : 'rgba(255,255,255,0.2)',
                                        transition: 'color 0.2s'
                                    }}>
                                        <CheckCircle size={26} fill={task.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'none'} />
                                    </button>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: 700, fontSize: '1rem',
                                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                            opacity: task.status === 'completed' ? 0.45 : 1,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {task.title}
                                        </div>
                                        {task.deadline && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: task.status === 'late' ? '#ef4444' : 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                                                {task.status === 'late' && <AlertTriangle size={11} />}
                                                <Clock size={11} /> Prazo: {new Date(task.deadline).toLocaleDateString('pt-PT')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span style={{
                                    flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                                    background: `${priorityColor(task.priority)}18`,
                                    color: priorityColor(task.priority),
                                    border: `1px solid ${priorityColor(task.priority)}40`,
                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                }}>
                                    {priorityLabel(task.priority)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── PROJECTS ── */}
            {viewMode === 'projects' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Meus Projetos</h2>
                        <button onClick={() => setIsAddProjectOpen(true)} style={btnPrimary}>
                            <Plus size={16} /> Novo Projeto
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                        {projects.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>
                                <Folder size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ margin: 0 }}>Comece organizando os seus trabalhos em projectos.</p>
                            </div>
                        ) : projects.map(proj => (
                            <div key={proj._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#FFD700,#B8860B)' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{proj.name}</h3>
                                    <span style={{
                                        flexShrink: 0, fontSize: '0.65rem', padding: '3px 9px', borderRadius: '20px', fontWeight: 800,
                                        background: proj.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(255,215,0,0.1)',
                                        color: proj.status === 'active' ? '#10b981' : '#FFD700',
                                        border: `1px solid ${proj.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(255,215,0,0.3)'}`,
                                        textTransform: 'uppercase', letterSpacing: '0.5px'
                                    }}>
                                        {proj.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Orçamento</span>
                                        <span style={{ fontWeight: 700 }}>{formatPrice(proj.totalBudget, proj.currency)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Recebido</span>
                                        <span style={{ fontWeight: 700, color: '#10b981' }}>{formatPrice(proj.receivedAmount, proj.currency)}</span>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'rgba(255,255,255,0.5)' }}>
                                        <span>Progresso de tarefas</span><span>{proj.progress ?? 0}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${proj.progress ?? 0}%`, background: 'linear-gradient(90deg,#FFD700,#B8860B)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── MODALS ── */}
            {isAddTxOpen && (
                <Modal title="Nova Transação" onClose={() => setIsAddTxOpen(false)} onSubmit={handleAddTx}>
                    <Field label="Tipo">
                        <StyledSelect value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value })}>
                            <option value="income">📈 Entrada (Receita)</option>
                            <option value="expense">📉 Saída (Despesa)</option>
                        </StyledSelect>
                    </Field>
                    <Field label="Descrição">
                        <StyledInput placeholder="Ex: Venda de Mentoria" required value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} />
                    </Field>
                    <Field label="Categoria">
                        <StyledInput placeholder="Ex: Vendas, Subscrições..." required value={txForm.category} onChange={e => setTxForm({ ...txForm, category: e.target.value })} />
                    </Field>
                    <Field label="Valor (MZN)">
                        <StyledInput type="number" placeholder="0.00" required min="0" step="0.01" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
                    </Field>
                </Modal>
            )}

            {isAddTaskOpen && (
                <Modal title="Nova Tarefa" onClose={() => setIsAddTaskOpen(false)} onSubmit={handleAddTask}>
                    <Field label="O que precisa ser feito?">
                        <StyledInput placeholder="Ex: Entregar proposta ao cliente..." required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                    </Field>
                    <Field label="Prazo (opcional)">
                        <StyledInput type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                    </Field>
                    <Field label="Prioridade">
                        <StyledSelect value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                            <option value="low">🟢 Baixa</option>
                            <option value="medium">🟡 Média</option>
                            <option value="high">🔴 Alta</option>
                        </StyledSelect>
                    </Field>
                </Modal>
            )}

            {isAddProjectOpen && (
                <Modal title="Novo Projecto" onClose={() => setIsAddProjectOpen(false)} onSubmit={handleAddProject}>
                    <Field label="Nome do Projecto">
                        <StyledInput placeholder="Ex: Consultoria Brand X" required value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />
                    </Field>
                    <Field label="Descrição (opcional)">
                        <StyledInput placeholder="Breve descrição do trabalho..." value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                    </Field>
                    <Field label="Orçamento Total (MZN)">
                        <StyledInput type="number" placeholder="0.00" min="0" step="0.01" value={projectForm.totalBudget} onChange={e => setProjectForm({ ...projectForm, totalBudget: e.target.value })} />
                    </Field>
                </Modal>
            )}

        </div>
    );
}
