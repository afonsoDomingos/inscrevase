"use client";

import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, TrendingDown, Target, 
    CheckCircle, Clock, Plus, Activity 
} from 'lucide-react';
import { personalService, PersonalTransaction, PersonalTask, PersonalProject } from '@/lib/personalService';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from 'sonner';

type ViewMode = 'overview' | 'finance' | 'tasks' | 'projects';

export default function PersonalDashboard() {
    const { formatPrice } = useCurrency();
    const [viewMode, setViewMode] = useState<ViewMode>('overview');
    const [loading, setLoading] = useState(true);
    
    // Data State
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
    const [tasks, setTasks] = useState<PersonalTask[]>([]);
    const [projects, setProjects] = useState<PersonalProject[]>([]);

    // Modals internal state (simplified)
    const [isAddTxOpen, setIsAddTxOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

    // Form states
    const [txForm, setTxForm] = useState({ type: 'income', category: '', amount: '', description: '' });
    const [taskForm, setTaskForm] = useState({ title: '', deadline: '', priority: 'medium' });
    const [projectForm, setProjectForm] = useState({ name: '', totalBudget: '' });

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddTx = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await personalService.addTransaction({
                ...txForm,
                amount: Number(txForm.amount),
                type: txForm.type as 'income' | 'expense'
            });
            toast.success("Transação adicionada!");
            setIsAddTxOpen(false);
            setTxForm({ type: 'income', category: '', amount: '', description: '' });
            fetchData();
        } catch (_error) {
            toast.error("Erro ao adicionar transação");
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await personalService.addTask({
                ...taskForm,
                priority: taskForm.priority as 'low'|'medium'|'high'
            });
            toast.success("Tarefa adicionada!");
            setIsAddTaskOpen(false);
            setTaskForm({ title: '', deadline: '', priority: 'medium' });
            fetchData();
        } catch (_error) {
            toast.error("Erro ao adicionar tarefa");
        }
    };

    const toggleTaskStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        try {
            await personalService.updateTaskStatus(id, newStatus);
            fetchData(); // reload
        } catch (_error) {
            toast.error("Erro ao atualizar tarefa");
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await personalService.addProject({
                name: projectForm.name,
                totalBudget: Number(projectForm.totalBudget)
            });
            toast.success("Projeto criado!");
            setIsAddProjectOpen(false);
            setProjectForm({ name: '', totalBudget: '' });
            fetchData();
        } catch (_error) {
            toast.error("Erro ao criar projeto");
        }
    };

    if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Carregando Workspace...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color)' }}>
            
            {/* Cabecalho e Abas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity color="var(--primary)" /> Workspace <span style={{ fontWeight: 300, opacity: 0.6 }}>360</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>O seu hub central de gestão financeira, produtividade e projetos.</p>
                </div>
                
                <div style={{ display: 'flex', background: 'var(--paper)', padding: '5px', borderRadius: '12px', gap: '5px' }}>
                    {(['overview', 'finance', 'tasks', 'projects'] as ViewMode[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                background: viewMode === mode ? 'var(--primary)' : 'transparent',
                                color: viewMode === mode ? '#000' : 'var(--text-muted)',
                                fontWeight: viewMode === mode ? 700 : 500,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {mode === 'overview' ? 'Visão Geral' : mode === 'finance' ? 'Finanças' : mode === 'tasks' ? 'Tarefas' : 'Projetos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* OVERVIEW MODE */}
            {viewMode === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* Finance Card */}
                    <div className="luxury-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Wallet size={18} color="var(--primary)" /> Saldo Geral
                            </h3>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>
                            {formatPrice(summary.balance, 'MZN')}
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '1rem' }}>
                            <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                <TrendingUp size={14} /> Entradas: {formatPrice(summary.income, 'MZN')}
                            </div>
                            <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                <TrendingDown size={14} /> Saídas: {formatPrice(summary.expense, 'MZN')}
                            </div>
                        </div>
                    </div>

                    {/* Tasks Card */}
                    <div className="luxury-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Target size={18} color="var(--primary)" /> Suas Tarefas
                            </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>{tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendentes</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>{tasks.filter(t => t.status === 'late').length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Atrasadas</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{tasks.filter(t => t.status === 'completed').length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Concluídas</div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* FINANCE MODE */}
            {viewMode === 'finance' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Histórico de Transações</h2>
                        <button onClick={() => setIsAddTxOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={16} /> Nova Transação
                        </button>
                    </div>

                    <div className="luxury-card" style={{ overflow: 'hidden' }}>
                        {transactions.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma transação registrada.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '15px' }}>Data</th>
                                        <th style={{ padding: '15px' }}>Descrição</th>
                                        <th style={{ padding: '15px' }}>Categoria</th>
                                        <th style={{ padding: '15px', textAlign: 'right' }}>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <tr key={tx._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {new Date(tx.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '15px', fontWeight: 500 }}>{tx.description}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--background)', fontSize: '0.8rem' }}>
                                                    {tx.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'right', fontWeight: 800, color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>
                                                {tx.type === 'income' ? '+' : '-'} {formatPrice(tx.amount, tx.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* TASKS MODE */}
            {viewMode === 'tasks' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Minhas Tarefas</h2>
                        <button onClick={() => setIsAddTaskOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={16} /> Nova Tarefa
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {tasks.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }} className="luxury-card">Nenhuma tarefa pendente. Oba!</div>
                        ) : (
                            tasks.map(task => (
                                <div key={task._id} className="luxury-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: task.status === 'late' ? '4px solid #ef4444' : '4px solid transparent' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <button 
                                            onClick={() => toggleTaskStatus(task._id, task.status)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: task.status === 'completed' ? '#10b981' : 'var(--border)' }}
                                        >
                                            <CheckCircle size={24} fill={task.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'none'} />
                                        </button>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.5 : 1 }}>
                                                {task.title}
                                            </h4>
                                            {task.deadline && (
                                                <div style={{ fontSize: '0.8rem', color: task.status === 'late' ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                    <Clock size={12} /> Prazo: {new Date(task.deadline).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                                            {task.priority}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* PROJECTS MODE */}
            {viewMode === 'projects' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Meus Projetos</h2>
                        <button onClick={() => setIsAddProjectOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={16} /> Novo Projeto
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {projects.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }} className="luxury-card">
                                Comece organizando seus trabalhos em projetos.
                            </div>
                        ) : (
                            projects.map(proj => (
                                <div key={proj._id} className="luxury-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{proj.name}</h3>
                                        <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: 'var(--primary)', color: '#000', fontWeight: 800 }}>
                                            {proj.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Orçamento Total</span>
                                            <span style={{ fontWeight: 700 }}>{formatPrice(proj.totalBudget, proj.currency)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Faturado (Recebido)</span>
                                            <span style={{ fontWeight: 700, color: '#10b981' }}>{formatPrice(proj.receivedAmount, proj.currency)}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar (Tasks) */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', fontWeight: 600 }}>
                                            <span>Progresso de Tarefas</span>
                                            <span>{proj.progress}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${proj.progress}%`, background: 'var(--primary)' }} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* SIMPLE MODALS (For demonstration) */}
            {isAddTxOpen && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 9999, justifyContent: 'center' }}>
                    <form onSubmit={handleAddTx} className="luxury-card" style={{ padding: '2rem', width: '400px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Nova Transação</h3>
                        <select className="form-input" style={{ marginBottom: '1rem' }} value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value})}>
                            <option value="income">Entrada (Receita)</option>
                            <option value="expense">Saída (Despesa)</option>
                        </select>
                        <input className="form-input" style={{ marginBottom: '1rem' }} placeholder="Descrição Ex: Venda de Mentoria" required value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} />
                        <input className="form-input" style={{ marginBottom: '1rem' }} placeholder="Categoria Ex: Vendas" required value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})} />
                        <input className="form-input" style={{ marginBottom: '1.5rem' }} type="number" placeholder="Valor MZN" required value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Salvar</button>
                            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddTxOpen(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {isAddTaskOpen && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 9999, justifyContent: 'center' }}>
                    <form onSubmit={handleAddTask} className="luxury-card" style={{ padding: '2rem', width: '400px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Nova Tarefa</h3>
                        <input className="form-input" style={{ marginBottom: '1rem' }} placeholder="O que você precisa fazer?" required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                        <input className="form-input" style={{ marginBottom: '1rem' }} type="date" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                        <select className="form-input" style={{ marginBottom: '1.5rem' }} value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                            <option value="low">Baixa Prioridade</option>
                            <option value="medium">Média Prioridade</option>
                            <option value="high">Alta Prioridade</option>
                        </select>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Salvar</button>
                            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddTaskOpen(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {isAddProjectOpen && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 9999, justifyContent: 'center' }}>
                    <form onSubmit={handleAddProject} className="luxury-card" style={{ padding: '2rem', width: '400px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Novo Projeto</h3>
                        <input className="form-input" style={{ marginBottom: '1rem' }} placeholder="Nome do Projeto Ex: Consultoria Brand X" required value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} />
                        <input className="form-input" style={{ marginBottom: '1.5rem' }} type="number" placeholder="Orçamento Total Fechado" value={projectForm.totalBudget} onChange={e => setProjectForm({...projectForm, totalBudget: e.target.value})} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Criar</button>
                            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddProjectOpen(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
