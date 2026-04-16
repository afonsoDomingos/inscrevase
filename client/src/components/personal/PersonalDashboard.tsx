"use client";

import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, Target, 
    CheckCircle, Clock, Plus, Activity, X,
    ArrowUpRight, ArrowDownRight,
    Trash2, Edit3, Users, Building, User, Mail, Phone, Briefcase,
    BarChart3, PieChart as PieIcon, Sparkles, Send, Bot, AlertTriangle
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';
import { personalService, PersonalTransaction, PersonalTask, PersonalProject, PersonalClient } from '@/lib/personalService';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from 'sonner';
import { LucideIcon } from 'lucide-react';

type ViewMode = 'overview' | 'finance' | 'tasks' | 'projects' | 'clients' | 'reports';
type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface ReportData {
    chartData: Array<{ date: string; income: number; expense: number }>;
    categories: Array<{ name: string; value: number }>;
    summary: {
        totalIncome: number;
        totalExpense: number;
        taskStats: {
            completed: number;
            total: number;
        };
    };
}

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

function Field({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
    return (
        <div style={fieldWrap}>
            <label style={labelStyle}>{label}</label>
            {children}
            {description && <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{description}</p>}
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
function Modal({ title, onClose, onSubmit, children, submitLabel = "Guardar Alterações" }: {
    title: string; onClose: () => void; onSubmit: (e: React.FormEvent) => void; children: React.ReactNode; submitLabel?: string;
}) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
            padding: '1rem'
        }}>
            <form onSubmit={onSubmit} style={{
                width: '100%', maxWidth: '500px',
                maxHeight: '90vh', overflowY: 'auto',
                background: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
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
                    width: '100%', marginTop: '1rem', padding: '14px',
                    background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                    border: 'none', borderRadius: '12px',
                    color: '#000', fontWeight: 800, fontSize: '0.95rem',
                    cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px'
                }}
                    onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
                    onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
                >
                    {submitLabel}
                </button>
            </form>
        </div>
    );
}

const DEFAULT_CATEGORIES = ['Serviços', 'Licenças', 'Impostos', 'Marketing', 'Infraestrutura', 'Branding', 'Consultoria', 'Vendas', 'Outros'];

interface TxFormState {
    type: 'income' | 'expense';
    category: string;
    amount: string;
    description: string;
    date: string;
    project: string;
    client: string;
}

interface TaskFormState {
    title: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
    project: string;
}

interface ProjectFormState {
    name: string;
    totalBudget: string;
    description: string;
    deadline: string;
    client: string;
}

interface AISuggestion {
    action: 'add_task' | 'add_transaction' | 'add_client';
    data: Partial<PersonalTask> | Partial<PersonalTransaction> | Partial<PersonalClient>;
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
    const [clients, setClients] = useState<PersonalClient[]>([]);

    // Report State
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [reportTimeframe, setReportTimeframe] = useState<Timeframe>('monthly');
    const [reportLoading, setReportLoading] = useState(false);

    const [isAddTxOpen, setIsAddTxOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);

    // Edit states
    const [editingTxId, setEditingTxId] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);



    const defaultTxForm: TxFormState = { type: 'income', category: '', amount: '', description: '', date: '', project: '', client: '' };
    const defaultTaskForm: TaskFormState = { title: '', deadline: '', priority: 'medium', project: '' };
    const defaultProjectForm: ProjectFormState = { name: '', totalBudget: '', description: '', deadline: '', client: '' };
    const defaultClientForm: Partial<PersonalClient> = { name: '', type: 'individual', email: '', phone: '', address: '', taxId: '', notes: '' };

    const [txForm, setTxForm] = useState<TxFormState>(defaultTxForm);
    const [taskForm, setTaskForm] = useState<TaskFormState>(defaultTaskForm);
    const [projectForm, setProjectForm] = useState<ProjectFormState>(defaultProjectForm);
    const [clientForm, setClientForm] = useState<Partial<PersonalClient>>(defaultClientForm);

    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // AI Assistant State
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'bot'; content: string; suggestion?: AISuggestion | null }[]>([]);
    const [aiLoading, setAiLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sum, txs, tsks, projs, cls] = await Promise.all([
                personalService.getFinanceSummary(),
                personalService.getTransactions(),
                personalService.getTasks(),
                personalService.getProjects(),
                personalService.getClients()
            ]);
            setSummary(sum);
            setTransactions(txs);
            setTasks(tsks);
            setProjects(projs);
            setClients(cls);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados do Workspace");
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async (tf: Timeframe) => {
        setReportLoading(true);
        try {
            const data = await personalService.getReportData(tf);
            setReportData(data);
        } catch { toast.error("Erro ao carregar relatórios"); }
        finally { setReportLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (viewMode === 'reports') fetchReport(reportTimeframe); }, [viewMode, reportTimeframe]);

    // --- FINANCE HANDLERS ---
    const handleAddTx = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalCategory = showNewCategory ? newCategoryName : txForm.category;
            const payload = { 
                ...txForm, 
                category: finalCategory,
                amount: Number(txForm.amount), 
                type: txForm.type as 'income' | 'expense' 
            };
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
        const projectVal = typeof tx.project === 'object' ? tx.project?._id : tx.project;
        const clientVal = typeof tx.client === 'object' ? tx.client?._id : tx.client;
        setTxForm({ 
            type: tx.type, 
            category: tx.category, 
            amount: tx.amount.toString(), 
            description: tx.description,
            date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : '',
            project: (projectVal as string) || '',
            client: (clientVal as string) || ''
        });
        setIsAddTxOpen(true);
    };

    const closeTxModal = () => {
        setIsAddTxOpen(false);
        setEditingTxId(null);
        setTxForm(defaultTxForm);
        setShowNewCategory(false);
        setNewCategoryName('');
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
        const projectVal = typeof task.project === 'object' ? task.project?._id : task.project;
        setTaskForm({
            title: task.title,
            deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
            priority: task.priority,
            project: (projectVal as string) || ''
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
            const payload = { 
                name: projectForm.name, 
                totalBudget: Number(projectForm.totalBudget), 
                description: projectForm.description, 
                deadline: projectForm.deadline,
                client: projectForm.client 
            };
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
        const clientVal = typeof proj.client === 'object' ? proj.client?._id : proj.client;
        setProjectForm({
            name: proj.name,
            totalBudget: proj.totalBudget.toString(),
            description: proj.description || '',
            deadline: proj.deadline ? new Date(proj.deadline).toISOString().split('T')[0] : '',
            client: (clientVal as string) || ''
        });
        setIsAddProjectOpen(true);
    };

    const closeProjectModal = () => {
        setIsAddProjectOpen(false);
        setEditingProjectId(null);
        setProjectForm(defaultProjectForm);
    };

    // --- CLIENT HANDLERS ---
    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if(editingClientId) {
                await personalService.updateClient(editingClientId, clientForm);
                toast.success("Cliente atualizado!");
            } else {
                await personalService.addClient(clientForm);
                toast.success("Cliente registado!");
            }
            closeClientModal();
            fetchData();
        } catch { toast.error("Erro ao guardar cliente"); }
    };

    const handleDeleteClient = async (id: string) => {
        if (confirm('Eliminar este cliente também o removerá de referências futuras. Continuar?')) {
            try {
                await personalService.deleteClient(id);
                toast.success("Cliente removido");
                fetchData();
            } catch { toast.error("Erro ao eliminar cliente"); }
        }
    };

    const openEditClient = (cl: PersonalClient) => {
        setEditingClientId(cl._id);
        setClientForm(cl);
        setIsAddClientOpen(true);
    };

    const closeClientModal = () => {
        setIsAddClientOpen(false);
        setEditingClientId(null);
        setClientForm(defaultClientForm);
    };

    // --- AI ASSISTANT HANDLERS ---
    const handleAISend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiInput.trim()) return;

        const userMsg = aiInput;
        setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setAiInput('');
        setAiLoading(true);

        try {
            const res = await personalService.processAICommand(userMsg);
            if (res.success) {
                setAiMessages(prev => [...prev, { 
                    role: 'bot', 
                    content: res.message,
                    suggestion: res.action ? { action: res.action, data: res.data } : null 
                }]);
            }
        } catch {
            setAiMessages(prev => [...prev, { role: 'bot', content: "Desculpe, tive um problema ao processar isso. Tente novamente." }]);
        } finally {
            setAiLoading(false);
        }
    };

    const confirmAISuggestion = async (suggestion: AISuggestion) => {
        setAiLoading(true);
        try {
            if (suggestion.action === 'add_task') {
                await personalService.addTask(suggestion.data);
                toast.success("Tarefa criada por IA!");
            } else if (suggestion.action === 'add_transaction') {
                await personalService.addTransaction(suggestion.data);
                toast.success("Transação registada por IA!");
            } else if (suggestion.action === 'add_client') {
                await personalService.addClient(suggestion.data);
                toast.success("Cliente registado por IA!");
            }
            setAiMessages(prev => [...prev, { role: 'bot', content: "Concluído com sucesso! ✅" }]);
            fetchData();
        } catch {
            toast.error("Erro ao executar ação da IA");
        } finally {
            setAiLoading(false);
        }
    };

    const priorityColor = (p: string) => p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#6b7280';
    const priorityLabel = (p: string) => p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa';

    const renderSmartAlerts = () => {
        const alerts = [];
        const lateCount = tasks.filter(t => t.status === 'late').length;
        const pendingValue = transactions.filter(t => t.status === 'pending').reduce((a, b) => a + b.amount, 0);

        if (summary.balance < 0) {
            alerts.push({ 
                type: 'danger', 
                title: 'Fluxo de Caixa Negativo', 
                msg: `As suas despesas superaram os ganhos em ${formatPrice(Math.abs(summary.balance))}. Considere rever os custos.` 
            });
        }
        if (lateCount > 0) {
            alerts.push({ 
                type: 'warning', 
                title: 'Eficiência sob Risco', 
                msg: `Tem ${lateCount} tarefas em atraso. Isto pode comprometer a entrega dos seus projectos.` 
            });
        }
        if (summary.income > 0 && summary.income > summary.expense * 2) {
            alerts.push({ 
                type: 'success', 
                title: 'Excelente Desempenho!', 
                msg: 'O seu faturamento está robusto e muito acima das despesas. Ótimo trabalho de gestão!' 
            });
        }
        if (pendingValue > 0) {
            alerts.push({ 
                type: 'info', 
                title: 'Valores a Receber', 
                msg: `Existem ${formatPrice(pendingValue)} em pagamentos pendentes. É um bom momento para cobrar clientes.` 
            });
        }

        if (alerts.length === 0) return null;

        return (
            <div style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {alerts.map((a, i) => (
                    <div key={i} style={{ 
                        background: a.type === 'danger' ? 'rgba(239,68,68,0.1)' : a.type === 'warning' ? 'rgba(245,158,11,0.1)' : a.type === 'success' ? 'rgba(255,215,0,0.1)' : 'rgba(59,130,246,0.1)',
                        border: `1px solid ${a.type === 'danger' ? '#ef4444' : a.type === 'warning' ? '#f59e0b' : a.type === 'success' ? '#FFD700' : '#3b82f6'}`,
                        borderRadius: '20px', padding: '1.25rem', display: 'flex', gap: '15px'
                    }}>
                        <div style={{ color: a.type === 'danger' ? '#ef4444' : a.type === 'warning' ? '#f59e0b' : a.type === 'success' ? '#FFD700' : '#3b82f6' }}>
                            {a.type === 'danger' || a.type === 'warning' ? <AlertTriangle size={20}/> : <Sparkles size={20}/>}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{a.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{a.msg}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

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

    const tabs: { id: ViewMode; label: string; icon: LucideIcon }[] = [
        { id: 'overview', label: 'Resumo Geral', icon: Activity },
        { id: 'finance', label: 'Finanças', icon: Wallet },
        { id: 'tasks', label: 'Tarefas', icon: Target },
        { id: 'projects', label: 'Projetos', icon: Briefcase },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'reports', label: 'Análises', icon: BarChart3 },
    ];

    const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...transactions.map(t => t.category)]));
    const PIE_COLORS = ['#FFD700', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: 'var(--foreground)' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 900, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-playfair)' }}>
                        <Activity color="#FFD700" size={32} /> Workspace <span style={{ fontWeight: 300, opacity: 0.5 }}>360</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '600px' }}>
                        O seu centro de controlo pessoal para organizar **projectos**, gerir **finanças**, acompanhar **tarefas** e manter a sua base de **clientes** num único lugar.
                    </p>
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: 'flex', background: 'var(--paper)', border: '1px solid var(--border)', padding: '6px', borderRadius: '16px', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflowX: 'auto', maxWidth: '100%' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setViewMode(tab.id)} style={{
                            padding: '10px 18px', borderRadius: '12px',
                            background: viewMode === tab.id ? 'linear-gradient(135deg,#FFD700,#B8860B)' : 'transparent',
                            color: viewMode === tab.id ? '#000' : 'var(--text-muted)',
                            fontWeight: viewMode === tab.id ? 800 : 600,
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
                        }}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── OVERVIEW ── */}
            {viewMode === 'overview' && (
                <>
                    {/* Smart Insights */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Insights Inteligentes</h3>
                        {renderSmartAlerts()}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {/* Balance card */}
                    <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '24px', padding: '2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '140px', height: '140px', background: 'rgba(255,215,0,0.05)', borderRadius: '50%' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#FFD700', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            <Wallet size={18} /> Saldo Disponível
                        </div>
                        <div style={{ fontSize: '3.2rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', marginBottom: '1.5rem', color: summary.balance >= 0 ? '#fff' : '#ef4444' }}>
                            {formatPrice(summary.balance, 'MZN')}
                        </div>
                        <div style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>
                                <ArrowUpRight size={18} /> {formatPrice(summary.income, 'MZN')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '1rem', fontWeight: 700 }}>
                                <ArrowDownRight size={18} /> {formatPrice(summary.expense, 'MZN')}
                            </div>
                        </div>
                    </div>

                    {/* Tasks card */}
                    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#FFD700', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            <Target size={18} /> Resumo de Produtividade
                        </div>
                        <div style={{ display: 'flex', gap: '30px', marginBottom: '1.5rem' }}>
                            {[
                                { label: 'Em Aberto', count: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length, color: '#f59e0b' },
                                { label: 'Atraso', count: tasks.filter(t => t.status === 'late').length, color: '#ef4444' },
                                { label: 'Feito', count: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ fontSize: '2.8rem', fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.count}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '8px' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                        {tasks.length > 0 ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-muted)' }}>
                                    <span>CONCLUÍDAS</span><span>{Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%</span>
                                </div>
                                <div style={{ height: '10px', background: 'var(--background)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <div style={{ height: '100%', width: `${Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%`, background: 'linear-gradient(90deg,#10b981,#059669)', transition: 'width 0.8s ease' }} />
                                </div>
                            </div>
                        ) : (
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma tarefa agendada.</p>
                        )}
                    </div>

                    {/* Entities Summary */}
                    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', color: '#FFD700', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            <Activity size={18} /> Entidades & Gestão
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--background)', padding: '15px', borderRadius: '16px' }}>
                                <div style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', padding: '10px', borderRadius: '12px' }}><Briefcase size={20}/></div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{projects.length}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PROJECTOS</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--background)', padding: '15px', borderRadius: '16px' }}>
                                <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '10px', borderRadius: '12px' }}><Users size={20}/></div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{clients.length}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>CLIENTES</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}

            {/* ── REPORTS ── */}
            {viewMode === 'reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Análise de Performance</h2>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Relatórios detalhados com inteligência financeira.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', background: 'var(--paper)', border: '1px solid var(--border)', padding: '4px', borderRadius: '12px' }}>
                            {(['daily', 'weekly', 'monthly', 'yearly'] as Timeframe[]).map(tf => (
                                <button key={tf} onClick={() => setReportTimeframe(tf)} style={{
                                    padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    background: reportTimeframe === tf ? '#FFD700' : 'transparent',
                                    color: reportTimeframe === tf ? '#000' : 'var(--text-muted)',
                                    fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', transition: 'all 0.2s'
                                }}>
                                    {tf === 'daily' ? 'Hoje' : tf === 'weekly' ? 'Semana' : tf === 'monthly' ? 'Mês' : 'Ano'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {reportLoading ? (
                        <div style={{ padding: '6rem', textAlign: 'center', color: '#FFD700' }}><Activity className="spin" size={32}/></div>
                    ) : reportData && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ background: 'var(--paper)', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Entradas</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{formatPrice(reportData.summary.totalIncome, 'MZN')}</div>
                                </div>
                                <div style={{ background: 'var(--paper)', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Saídas</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>{formatPrice(reportData.summary.totalExpense, 'MZN')}</div>
                                </div>
                                <div style={{ background: 'var(--paper)', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Lucro Projetado</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFD700' }}>{formatPrice(reportData.summary.totalIncome - reportData.summary.totalExpense, 'MZN')}</div>
                                </div>
                                <div style={{ background: 'var(--paper)', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Eficiência</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{reportData.summary.taskStats.total > 0 ? Math.round((reportData.summary.taskStats.completed/reportData.summary.taskStats.total)*100) : 0}%</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {/* Revenue Chart */}
                                <div style={{ background: 'var(--paper)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', minHeight: '350px' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp size={18} color="#FFD700"/> Fluxo de Caixa</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={reportData.chartData}>
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                                            <Tooltip contentStyle={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                            <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Categories Chart */}
                                <div style={{ background: 'var(--paper)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', minHeight: '350px' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}><PieIcon size={18} color="#FFD700"/> Categorias</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={reportData.categories} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {reportData.categories.map((_entry: { name: string; value: number }, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {reportData.categories.map((c: { name: string; value: number }, i: number) => (
                                            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    {c.name}
                                                </div>
                                                <span>{formatPrice(c.value, 'MZN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── FINANCE ── */}
            {viewMode === 'finance' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Minhas Finanças</h2>
                        <button onClick={() => setIsAddTxOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Registar Transação
                        </button>
                    </div>

                    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        {transactions.length === 0 ? (
                            <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <TrendingUp size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.3rem', color: 'var(--foreground)' }}>Sem Movimentações</h3>
                                <p style={{ margin: 0 }}>Comece a registar ganhos e despesas para ver o seu saldo.</p>
                                <button onClick={() => setIsAddTxOpen(true)} style={{ ...btnPrimary, marginTop: '2rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'none' }}>
                                    Adicionar Primeiro Registo
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                                            {['Data', 'Descrição', 'Categoria', 'Valor', 'Status', 'Ações'].map(h => (
                                                <th key={h} style={{ padding: '18px 24px', textAlign: h === 'Valor' ? 'right' : (h === 'Ações' || h === 'Status') ? 'center' : 'left', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx, i) => (
                                            <tr key={tx._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--background)', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '18px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(tx.date).toLocaleDateString('pt-PT')}</td>
                                                <td style={{ padding: '18px 24px', fontWeight: 700 }}>
                                                    {tx.description}
                                                    {tx.project && <div style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 500 }}>📁 {(tx.project as PersonalProject).name || 'Projecto'}</div>}
                                                </td>
                                                <td style={{ padding: '18px 24px' }}>
                                                    <span style={{ padding: '4px 12px', borderRadius: '12px', background: 'rgba(255,215,0,0.1)', color: '#B8860B', fontSize: '0.75rem', fontWeight: 800 }}>{tx.category}</span>
                                                </td>
                                                <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 900, color: tx.type === 'income' ? '#10b981' : '#ef4444', fontSize: '1.05rem' }}>
                                                    {tx.type === 'income' ? '+' : '−'} {formatPrice(tx.amount, tx.currency)}
                                                </td>
                                                <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 700, textTransform: 'uppercase', color: tx.status === 'paid' ? '#10b981' : '#f59e0b' }}>
                                                        {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button onClick={() => openEditTx(tx)} style={iconBtnStyle} title="Editar"><Edit3 size={15} /></button>
                                                        <button onClick={() => handleDeleteTx(tx._id)} style={{...iconBtnStyle, color: '#ef4444'}} title="Eliminar"><Trash2 size={15} /></button>
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
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Minhas Tarefas</h2>
                        <button onClick={() => setIsAddTaskOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Criar Tarefa
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {tasks.length === 0 ? (
                            <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '24px' }}>
                                <CheckCircle size={48} style={{ opacity: 0.15, marginBottom: '1.5rem', color: '#10b981' }} />
                                <h3 style={{ margin: '0', fontWeight: 800, fontSize: '1.3rem' }}>Nada para fazer?</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Comece a planear os seus objetivos de curto-prazo.</p>
                                <button onClick={() => setIsAddTaskOpen(true)} style={{ ...btnPrimary, marginTop: '2rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'none' }}>
                                    Adicionar Tarefa
                                </button>
                            </div>
                        ) : tasks.map(task => (
                            <div key={task._id} style={{
                                display: 'flex', alignItems: 'center',
                                padding: '1.5rem', background: 'var(--paper)', border: '1px solid var(--border)',
                                borderLeft: `6px solid ${task.status === 'late' ? '#ef4444' : task.status === 'completed' ? '#10b981' : '#FFD700'}`,
                                borderRadius: '20px', transition: 'all 0.2s',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                            }}>
                                <button onClick={() => toggleTaskStatus(task._id, task.status)} style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '20px',
                                    color: task.status === 'completed' ? '#10b981' : 'var(--border)',
                                    transition: 'color 0.2s'
                                }}>
                                    <CheckCircle size={30} fill={task.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'none'} />
                                </button>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: 800, fontSize: '1.1rem',
                                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                        opacity: task.status === 'completed' ? 0.5 : 1,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {task.title}
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '6px', flexWrap: 'wrap' }}>
                                        {task.deadline && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: task.status === 'late' ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
                                                <Clock size={14} /> Até {new Date(task.deadline).toLocaleDateString('pt-PT')}
                                            </div>
                                        )}
                                        {task.project && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                <Briefcase size={14} /> {(task.project as PersonalProject).name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '20px' }}>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '12px',
                                        background: `${priorityColor(task.priority)}15`,
                                        color: priorityColor(task.priority), border: `1px solid ${priorityColor(task.priority)}30`,
                                        textTransform: 'uppercase'
                                    }}>
                                        {priorityLabel(task.priority)}
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => openEditTask(task)} style={iconBtnStyle}><Edit3 size={15} /></button>
                                        <button onClick={() => handleDeleteTask(task._id)} style={{...iconBtnStyle, color: '#ef4444'}}><Trash2 size={15} /></button>
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
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Meus Projectos</h2>
                        <button onClick={() => setIsAddProjectOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Novo Projecto
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                        {projects.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', padding: '6rem 2rem', textAlign: 'center', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '24px' }}>
                                <Briefcase size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Sem Projectos Ativos</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Crie projectos para agrupar tarefas e monitorar lucros.</p>
                                <button onClick={() => setIsAddProjectOpen(true)} style={{ ...btnPrimary, marginTop: '2rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'none' }}>
                                    Criar Primeiro Projeto
                                </button>
                            </div>
                        ) : projects.map(proj => (
                            <div key={proj._id} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg,#FFD700,#B8860B)' }} />
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.name}</h3>
                                        {proj.client && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Users size={12}/> {(proj.client as PersonalClient).name}
                                        </div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => openEditProject(proj)} style={iconBtnStyle}><Edit3 size={15} /></button>
                                        <button onClick={() => handleDeleteProject(proj._id)} style={{...iconBtnStyle, color: '#ef4444'}}><Trash2 size={15} /></button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Valor Total</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900 }}>{formatPrice(proj.totalBudget, proj.currency)}</div>
                                    </div>
                                    <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Faturado</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#10b981' }}>{formatPrice(proj.receivedAmount, proj.currency)}</div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>PROGRESSO</span>
                                        <span style={{ color: '#FFD700' }}>{proj.progress ?? 0}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${proj.progress ?? 0}%`, background: 'linear-gradient(90deg,#FFD700,#B8860B)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── CLIENTS ── */}
            {viewMode === 'clients' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Meus Clientes</h2>
                        <button onClick={() => setIsAddClientOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Registar Cliente
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {clients.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', padding: '6rem 2rem', textAlign: 'center', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '24px' }}>
                                <Users size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Nenhum Cliente Registado</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Registe clientes para associar a projectos e facturação.</p>
                                <button onClick={() => setIsAddClientOpen(true)} style={{ ...btnPrimary, marginTop: '2rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'none' }}>
                                    Adicionar Cliente
                                </button>
                            </div>
                        ) : clients.map(cl => (
                            <div key={cl._id} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: cl.type === 'company' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)', color: cl.type === 'company' ? '#3b82f6' : '#8b5cf6', padding: '10px', borderRadius: '12px' }}>
                                            {cl.type === 'company' ? <Building size={20}/> : <User size={20}/>}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{cl.name}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.5 }}>{cl.type === 'company' ? 'Empresa' : 'Individual'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => openEditClient(cl)} style={iconBtnStyle}><Edit3 size={15} /></button>
                                        <button onClick={() => handleDeleteClient(cl._id)} style={{...iconBtnStyle, color: '#ef4444'}}><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
                                    {cl.email && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}><Mail size={14}/> {cl.email}</div>}
                                    {cl.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}><Phone size={14}/> {cl.phone}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── MODALS ── */}
            
            {/* Finance Modal */}
            {isAddTxOpen && (
                <Modal 
                    title={editingTxId ? "Editar Transação" : "Nova Transação Financeira"} 
                    onClose={closeTxModal} 
                    onSubmit={handleAddTx}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Natureza">
                            <StyledSelect value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value as 'income' | 'expense' })}>
                                <option value="income">Entrada (Ganho)</option>
                                <option value="expense">Saída (Gasto)</option>
                            </StyledSelect>
                        </Field>
                        <Field label="Data">
                            <StyledInput type="date" value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })} />
                        </Field>
                    </div>

                    <Field label="Descrição">
                        <StyledInput placeholder="Ex: Pagamento Mentoria Abril" required value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} />
                    </Field>

                    <Field label="Categoria">
                        {!showNewCategory ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <StyledSelect 
                                    value={txForm.category} 
                                    onChange={e => {
                                        if (e.target.value === 'NEW') setShowNewCategory(true);
                                        else setTxForm({ ...txForm, category: e.target.value });
                                    }}
                                    required
                                >
                                    <option value="">Seleccionar Categoria...</option>
                                    {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="NEW">+ Criar Nova Categoria...</option>
                                </StyledSelect>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <StyledInput 
                                    placeholder="Nome da Categoria..." 
                                    autoFocus
                                    value={newCategoryName} 
                                    onChange={e => setNewCategoryName(e.target.value)} 
                                />
                                <button type="button" onClick={() => setShowNewCategory(false)} style={{...iconBtnStyle, padding: '12px'}}><X size={18}/></button>
                            </div>
                        )}
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <Field label="Valor (MZN)">
                            <StyledInput type="number" placeholder="0.00" required min="0" step="0.01" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
                        </Field>
                        <Field label="Projecto">
                            <StyledSelect value={txForm.project} onChange={e => setTxForm({ ...txForm, project: e.target.value })}>
                                <option value="">Nenhum</option>
                                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </StyledSelect>
                        </Field>
                        <Field label="Cliente">
                            <StyledSelect value={txForm.client} onChange={e => setTxForm({ ...txForm, client: e.target.value })}>
                                <option value="">Nenhum</option>
                                {clients.map(cl => <option key={cl._id} value={cl._id}>{cl.name}</option>)}
                            </StyledSelect>
                        </Field>
                    </div>
                </Modal>
            )}

            {/* Task Modal */}
            {isAddTaskOpen && (
                <Modal title={editingTaskId ? "Editar Tarefa" : "Nova Tarefa"} onClose={closeTaskModal} onSubmit={handleAddTask}>
                    <Field label="O que fazer?">
                        <StyledInput placeholder="Título da tarefa..." required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Prazo">
                            <StyledInput type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                        </Field>
                        <Field label="Prioridade">
                            <StyledSelect value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' })}>
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </StyledSelect>
                        </Field>
                    </div>
                    <Field label="Projecto Associado">
                        <StyledSelect value={taskForm.project} onChange={e => setTaskForm({ ...taskForm, project: e.target.value })}>
                            <option value="">Tarefa Independente</option>
                            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </StyledSelect>
                    </Field>
                </Modal>
            )}

            {/* Project Modal */}
            {isAddProjectOpen && (
                <Modal title={editingProjectId ? "Editar Projeto" : "Abrir Projeto"} onClose={closeProjectModal} onSubmit={handleAddProject}>
                    <Field label="Nome do Projeto">
                        <StyledInput placeholder="Ex: Campanha MUV 2026" required value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />
                    </Field>
                    <Field label="Cliente Responsável">
                        <StyledSelect value={projectForm.client} onChange={e => setProjectForm({ ...projectForm, client: e.target.value })}>
                            <option value="">Seleccionar Cliente...</option>
                            {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </StyledSelect>
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Orçamento (MZN)">
                            <StyledInput type="number" placeholder="0.00" value={projectForm.totalBudget} onChange={e => setProjectForm({ ...projectForm, totalBudget: e.target.value })} />
                        </Field>
                        <Field label="Data Limite">
                            <StyledInput type="date" value={projectForm.deadline} onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })} />
                        </Field>
                    </div>
                    <Field label="Breve Contexto">
                        <StyledInput placeholder="Notas sobre o projecto..." value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                    </Field>
                </Modal>
            )}

            {/* Client Modal */}
            {isAddClientOpen && (
                <Modal title={editingClientId ? "Editar Cliente" : "Registar Cliente"} onClose={closeClientModal} onSubmit={handleAddClient}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Tipo de Cliente">
                            <StyledSelect value={clientForm.type} onChange={e => setClientForm({ ...clientForm, type: e.target.value as 'individual' | 'company' })}>
                                <option value="individual">Pessoa Individual</option>
                                <option value="company">Empresa / Entidade</option>
                            </StyledSelect>
                        </Field>
                        <Field label="NIF / NUIT (Opcional)">
                            <StyledInput placeholder="000 000 000" value={clientForm.taxId} onChange={e => setClientForm({ ...clientForm, taxId: e.target.value })} />
                        </Field>
                    </div>
                    <Field label="Nome Completo / Firma">
                        <StyledInput placeholder="Nome do cliente..." required value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="E-mail">
                            <StyledInput type="email" placeholder="email@exemplo.com" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} />
                        </Field>
                        <Field label="Telemóvel">
                            <StyledInput placeholder="+258..." value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} />
                        </Field>
                    </div>
                    <Field label="Notas Adicionais">
                        <StyledInput placeholder="Localização, preferências..." value={clientForm.notes} onChange={e => setClientForm({ ...clientForm, notes: e.target.value })} />
                    </Field>
                </Modal>
            )}

            {/* ── AI ASSISTANT PANEL ── */}
            <button 
                onClick={() => {
                    setIsAIOpen(!isAIOpen);
                    if (aiMessages.length === 0) {
                        setAiMessages([{ role: 'bot', content: "Olá! Sou o seu Assistente 360. Como posso ajudar com a sua gestão hoje?" }]);
                    }
                }}
                style={{
                    position: 'fixed', bottom: '30px', right: '30px', zIndex: 999,
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                    color: '#000', border: 'none', cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(184, 134, 11, 0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1) rotate(12deg)'}
                onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) rotate(0)'}
            >
                {isAIOpen ? <X size={28}/> : <Sparkles size={28}/>}
            </button>

            {isAIOpen && (
                <div style={{
                    position: 'fixed', bottom: '100px', right: '30px', zIndex: 999,
                    width: '380px', height: '500px', maxWidth: 'calc(100vw - 60px)',
                    background: 'var(--paper)', border: '1px solid var(--border)',
                    borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <div style={{ padding: '1.25rem', background: 'var(--background)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', padding: '8px', borderRadius: '12px' }}><Bot size={20}/></div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Assistente Inteligente</div>
                    </div>

                    <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {aiMessages.map((msg, i) => (
                            <div key={i} style={{ 
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', padding: '12px 16px', borderRadius: '16px',
                                background: msg.role === 'user' ? 'linear-gradient(135deg, #FFD700, #B8860B)' : 'var(--background)',
                                color: msg.role === 'user' ? '#000' : 'var(--foreground)',
                                fontSize: '0.85rem', fontWeight: msg.role === 'user' ? 700 : 500,
                                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}>
                                {msg.content}
                                {msg.suggestion && (
                                    <button 
                                        onClick={() => confirmAISuggestion(msg.suggestion)}
                                        style={{
                                            display: 'block', width: '100%', marginTop: '12px',
                                            padding: '8px', background: '#FFD700', color: '#000',
                                            border: 'none', borderRadius: '8px', fontWeight: 800,
                                            cursor: 'pointer', fontSize: '0.75rem'
                                        }}
                                    >
                                        Confirmar Ação
                                    </button>
                                )}
                            </div>
                        ))}
                        {aiLoading && <div style={{ alignSelf: 'flex-start', color: '#FFD700' }}><Activity size={18} className="spin"/></div>}
                    </div>

                    <form onSubmit={handleAISend} style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                        <div style={{ position: 'relative' }}>
                            <input 
                                placeholder="Eescreva algo..." 
                                value={aiInput}
                                onChange={e => setAiInput(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 45px 12px 16px', borderRadius: '12px',
                                    background: 'var(--paper)', border: '1px solid var(--border)',
                                    color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none'
                                }}
                            />
                            <button type="submit" style={{
                                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                background: 'transparent', border: 'none', color: '#FFD700', cursor: 'pointer'
                            }}>
                                <Send size={18}/>
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
