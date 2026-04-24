"use client";

import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, Target, 
    CheckCircle, Clock, Plus, Activity, X,
    Trash2, Edit3, Users, Building, User, Mail, Phone, Briefcase,
    BarChart3, PieChart as PieIcon, Sparkles, Send, Bot, AlertTriangle,
    ShieldCheck, PiggyBank, HelpCircle, Calendar, MessageSquare, Zap
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';
import { authService } from '@/lib/authService';
import { personalService, PersonalTransaction, PersonalTask, PersonalProject, PersonalClient, PersonalSaving } from '@/lib/personalService';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from 'sonner';


type ViewMode = 'overview' | 'finance' | 'tasks' | 'projects' | 'clients' | 'reports' | 'savings';
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

/* --- Shared styled sub-components --- */

// Parses simple markdown: **bold**, newlines → line breaks
const parseMarkdown = (text: string): React.ReactNode[] => {
    return text.split('\n').map((line, li) => {
        const parts: React.ReactNode[] = [];
        const regex = /\*\*(.+?)\*\*/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(line)) !== null) {
            if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
            parts.push(<strong key={`b-${li}-${match.index}`} style={{ fontWeight: 800, color: '#fff' }}>{match[1]}</strong>);
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < line.length) parts.push(line.slice(lastIndex));
        return <span key={li}>{parts}{li < text.split('\n').length - 1 && <br />}</span>;
    });
};

const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => text.substring(0, prev.length + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 12);
        return () => clearInterval(interval);
    }, [text]);

    return <>{parseMarkdown(displayedText)}</>;
};

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

/* --- Modal wrapper --- */
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
                    width: '100%', marginTop: '1.2rem', padding: '16px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                    border: 'none', borderRadius: '16px',
                    color: '#000', fontWeight: 900, fontSize: '0.95rem',
                    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                    letterSpacing: '1px', textTransform: 'uppercase',
                    boxShadow: '0 12px 24px rgba(212,175,55,0.2)'
                }}
                    onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 18px 36px rgba(212,175,55,0.3)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(212,175,55,0.2)';
                    }}
                >
                    {submitLabel}
                </button>
            </form>
        </div>
    );
}

const DEFAULT_CATEGORIES = ['Serviços', 'Licenças', 'Impostos', 'Marketing', 'Infraestrutura', 'Branding', 'Consultoria', 'Vendas', 'Outros'];
const PIE_COLORS = ['#FFD700', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

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
    client: string;
}

interface ProjectFormState {
    name: string;
    totalBudget: string;
    description: string;
    deadline: string;
    client: string;
}

interface SavingFormState {
    amount: string;
    account: string;
    date: string;
    description: string;
    linkedTransactionId: string;
}

const DASHBOARD_TABS = [
    { id: 'overview' as ViewMode, label: 'Resumo Geral', icon: Activity },
    { id: 'finance' as ViewMode, label: 'Finanças', icon: Wallet },
    { id: 'savings' as ViewMode, label: 'Poupança', icon: PiggyBank },
    { id: 'tasks' as ViewMode, label: 'Tarefas', icon: Target },
    { id: 'projects' as ViewMode, label: 'Projetos', icon: Briefcase },
    { id: 'clients' as ViewMode, label: 'Clientes', icon: Users },
    { id: 'reports' as ViewMode, label: 'Análises', icon: BarChart3 },
];

interface AICommandAction {
    id: string;
    label: string;
    sub: string;
}

interface AISuggestion {
    action: 'add_task' | 'add_transaction' | 'add_client' | 'add_saving' | 'add_project' | 'ask_info' | 'show_commands' | 'view_tab';
    data: unknown;
    options?: string[];
    context?: Record<string, unknown>;
}

interface SmartAlertItem {
    type: 'danger' | 'warning' | 'info' | 'success';
    title: string;
    msg: string;
}

const SmartAlerts = ({ summary, tasks, transactions, savings, formatPrice }: {
    summary: { income: number; expense: number; balance: number };
    tasks: Array<{ status: string }>;
    transactions: Array<{ status: string; amount: number }>;
    savings: Array<{ amount: number }>;
    formatPrice: (v: number, c?: string) => string;
}) => {
    const alerts: SmartAlertItem[] = [];
    const lateCount = tasks.filter((t) => t.status === 'late').length;
    const pendingValue = transactions.filter((t) => t.status === 'pending').reduce((a, b) => a + b.amount, 0);

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

    const totalSaved = savings.reduce((a, b) => a + b.amount, 0);
    const savingsRate = summary.income > 0 ? (totalSaved / summary.income) : 0;

    if (summary.income > 0 && savingsRate < 0.15) {
        alerts.push({
            type: 'warning',
            title: 'Atenção à Poupança',
            msg: `A sua taxa de poupança actual é de ${(savingsRate * 100).toFixed(1)}%. Recomendamos atingir os 20% para garantir estabilidade a longo prazo.`
        });
    }

    if (summary.balance > 10000 && savingsRate < 0.05) {
        alerts.push({
            type: 'info',
            title: 'Liquidez Ociosa',
            msg: 'Tem um saldo positivo considerável. Considere mover uma parte para a sua conta de poupança ou investimentos.'
        });
    }

    if (savingsRate > 0.25) {
        alerts.push({
            type: 'success',
            title: 'Reserva Robusta!',
            msg: `Incrível! Superou a meta de 25% de poupança. O seu futuro financeiro está a ser construído com alicerces fortes.`
        });
    }

    if (alerts.length === 0) return null;

    return (
        <div style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {alerts.map((a, i) => (
                <div key={i} style={{ 
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '12px', padding: '1.2rem', display: 'flex', gap: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#D4AF37';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#eee';
                }}>
                    <div style={{ color: a.type === 'danger' ? '#ff4444' : a.type === 'warning' ? '#ffb000' : a.type === 'success' ? '#00ff41' : '#3b82f6' }}>
                        {a.type === 'danger' || a.type === 'warning' ? <AlertTriangle size={18}/> : <Sparkles size={18}/>}
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>{a.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5', fontWeight: 500 }}>{a.msg}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

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
    const [savings, setSavings] = useState<PersonalSaving[]>([]);

    // Report State
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [reportTimeframe, setReportTimeframe] = useState<Timeframe>('monthly');
    const [reportLoading, setReportLoading] = useState(false);

    const [isAddTxOpen, setIsAddTxOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [isAddSavingOpen, setIsAddSavingOpen] = useState(false);

    // Edit states
    const [editingTxId, setEditingTxId] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);
    const [editingSavingId, setEditingSavingId] = useState<string | null>(null);



    const defaultTxForm: TxFormState = { type: 'income', category: '', amount: '', description: '', date: '', project: '', client: '' };
    const defaultTaskForm: TaskFormState = { title: '', deadline: '', priority: 'medium', project: '', client: '' };
    const defaultProjectForm: ProjectFormState = { name: '', totalBudget: '', description: '', deadline: '', client: '' };
    const defaultClientForm: Partial<PersonalClient> = { name: '', type: 'individual', email: '', phone: '', address: '', taxId: '', notes: '' };

    const [txForm, setTxForm] = useState<TxFormState>(defaultTxForm);
    const [taskForm, setTaskForm] = useState<TaskFormState>(defaultTaskForm);
    const [projectForm, setProjectForm] = useState<ProjectFormState>(defaultProjectForm);
    const [clientForm, setClientForm] = useState<Partial<PersonalClient>>(defaultClientForm);
    const [savingForm, setSavingForm] = useState<SavingFormState>({ amount: '', account: '', date: new Date().toISOString().split('T')[0], description: '', linkedTransactionId: '' });
    
    const aiInputRef = React.useRef<HTMLInputElement>(null);

    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // AI Assistant State
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'bot'; content: string; suggestion?: AISuggestion | null }[]>([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [isAIOptionsOpen, setIsAIOptionsOpen] = useState(false);
    const [draftEdit, setDraftEdit] = useState<Record<string, string>>({});
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [conversaModeActive, setConversaModeActive] = useState(false);
    
    // Obter nome do utilizador para saudação
    const user = authService.getCurrentUser();
    const userFirstName = user ? user.name.split(' ')[0] : 'Líder';

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [sum, txs, tsks, projs, cls, svs] = await Promise.all([
                personalService.getFinanceSummary(),
                personalService.getTransactions(),
                personalService.getTasks(),
                personalService.getProjects(),
                personalService.getClients(),
                personalService.getSavings()
            ]);
            setSummary(sum);
            setTransactions(txs);
            setTasks(tsks);
            setProjects(projs);
            setClients(cls);
            setSavings(svs);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados do ecossistema Saúde Profissional");
        } finally {
            if (showLoading) setLoading(false);
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

    useEffect(() => { fetchData(true); }, []);
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
            fetchData(false);
        } catch { toast.error("Erro ao guardar transação"); }
    };

    const handleDeleteTx = async (id: string) => {
        if (confirm('Tem a certeza que deseja eliminar este registo financeiro?')) {
            try {
                await personalService.deleteTransaction(id);
                toast.success("Transação eliminada");
                fetchData(false);
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
            fetchData(false);
        } catch { toast.error("Erro ao guardar tarefa"); }
    };

    const handleDeleteTask = async (id: string) => {
        if (confirm('Tem a certeza que deseja eliminar esta tarefa?')) {
            try {
                await personalService.deleteTask(id);
                toast.success("Tarefa eliminada");
                fetchData(false);
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
            project: (projectVal as string) || '',
            client: (typeof task.client === 'object' ? task.client?._id : task.client) || ''
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
            fetchData(false);
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
            fetchData(false);
        } catch { toast.error("Erro ao guardar projeto"); }
    };

    const handleDeleteProject = async (id: string) => {
        if (confirm('Atenção: Tem a certeza que deseja eliminar este projecto permanentemente?')) {
            try {
                await personalService.deleteProject(id);
                toast.success("Projeto eliminado");
                fetchData(false);
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
            fetchData(false);
        } catch { toast.error("Erro ao guardar cliente"); }
    };

    const handleDeleteClient = async (id: string) => {
        if (confirm('Eliminar este cliente também o removerá de referências futuras. Continuar?')) {
            try {
                await personalService.deleteClient(id);
                toast.success("Cliente removido");
                fetchData(false);
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
    const handleAISend = async (e?: React.FormEvent, customMsg?: string) => {
        if (e) e.preventDefault();
        
        const userMsg = customMsg || aiInput;
        if (!userMsg.trim()) return;

        setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        if (!customMsg) setAiInput('');
        setAiLoading(true);

        // Se o usuário escrever /suporte, garantimos que o seletor visual (+) não abre sozinho
        if (userMsg.toLowerCase().trim() === '/suporte') {
            setIsAIOptionsOpen(false);
        }

        // Troca de aba automática baseada no comando para melhor UX visual imersiva
        const lowerMsg = userMsg.toLowerCase();
        if (lowerMsg.includes('/registar-cliente') || lowerMsg.includes('/cliente')) setViewMode('clients');
        else if (lowerMsg.includes('/cria-tarefa') || lowerMsg.includes('/tarefa')) setViewMode('tasks');
        else if (lowerMsg.includes('/novo-projecto') || lowerMsg.includes('/projeto')) setViewMode('projects');
        else if (lowerMsg.includes('/registar-transação') || lowerMsg.includes('/financas')) setViewMode('finance');
        else if (lowerMsg.includes('/nova-alocação') || lowerMsg.includes('/poupanca')) setViewMode('savings');

        // Opção de Reset Rápido do Agente
        if (userMsg.toLowerCase().trim() === '/limpar' || userMsg.toLowerCase().trim() === '/reset') {
            setAiMessages([]);
            setAiInput('');
            setAiLoading(false);
            setConversaModeActive(false);
            toast.success("O Agente foi redefinido com sucesso.");
            return;
        }

        // Activar modo conversa
        if (userMsg.toLowerCase().trim() === '/conversa') {
            setConversaModeActive(true);
            setAiLoading(false);
            setAiMessages(prev => [...prev, {
                role: 'bot',
                content: `💬 **Modo Conversa activado!**\n\nOlá ${userFirstName}! Agora podes falar livremente comigo sobre a tua saúde financeira.\n\nPodes perguntar sobre:\n• **saúde financeira** — estado geral\n• **receitas / despesas** — análise de fluxo\n• **poupanças** — tracking de reservas\n• **tarefas / projetos / clientes**\n• **dicas** — conselhos personalizados\n• **resumo** — visão global\n\nPara voltar ao modo orquestração, escreve **/sair**.`
            }]);
            return;
        }

        // Desactivar modo conversa
        if (userMsg.toLowerCase().trim() === '/sair') {
            setConversaModeActive(false);
            setAiLoading(false);
            setAiMessages(prev => [...prev, {
                role: 'bot',
                content: `✅ Modo conversa terminado. Voltei ao modo **Orquestração de Elite**!\n\nO que vamos registar agora? Use /suporte para ver todos os comandos.`
            }]);
            return;
        }

        const isNewCommand = userMsg.trim().startsWith('/');
        const currentContext = conversaModeActive
            ? { mode: 'conversation' }
            : (!isNewCommand && aiMessages.length > 0 && aiMessages[aiMessages.length-1].role === 'bot' 
                ? aiMessages[aiMessages.length-1].suggestion?.context 
                : undefined);

        try {
            const res = await personalService.processAICommand(userMsg, currentContext || undefined);
            if (res.success) {
                setAiMessages(prev => [...prev, { 
                    role: 'bot', 
                    content: res.message,
                    suggestion: (res.action && res.action !== 'ask_info') 
                        ? { action: res.action, data: res.data, context: res.context, options: res.options } 
                        : (res.context || res.options ? { action: res.action || 'ask_info', data: res.data || null, context: res.context, options: res.options } : null) 
                }]);
            }
        } catch {
            setAiMessages(prev => [...prev, { 
                role: 'bot', 
                content: "Pedimos desculpa, mas o meu centro de inteligência está temporariamente indisponível. 🧠⚠️\n\nPor favor, tente novamente em alguns instantes ou utilize os menus de registo manual para continuar a sua gestão de excelência." 
            }]);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAICancel = () => {
        setAiMessages(prev => [...prev, { 
            role: 'bot', 
            content: "Operação cancelada com sucesso. 🛑\n\nO que vamos orquestrar agora? Estou aqui para ajudar na sua gestão de excelência." 
        }]);
        setAiInput('');
        setIsAIOptionsOpen(false);
    };

    const confirmAISuggestion = async (suggestion: AISuggestion) => {
        setAiLoading(true);
        // Merge any inline edits from draftEdit into the suggestion data
        const mergedData = { ...(suggestion.data as Record<string, unknown>), ...draftEdit };
        // Convert numeric fields back to numbers
        if (mergedData.amount) mergedData.amount = parseFloat(mergedData.amount as string) || mergedData.amount;
        if (mergedData.totalBudget) mergedData.totalBudget = parseFloat(mergedData.totalBudget as string) || mergedData.totalBudget;
        setDraftEdit({});
        try {
            let targetTab: ViewMode = 'overview';
            if (suggestion.action === 'add_task') {
                await personalService.addTask(mergedData as Partial<PersonalTask>);
                targetTab = 'tasks';
            } else if (suggestion.action === 'add_transaction') {
                await personalService.addTransaction(mergedData as Partial<PersonalTransaction>);
                targetTab = 'finance';
            } else if (suggestion.action === 'add_client') {
                await personalService.addClient(mergedData as Partial<PersonalClient>);
                targetTab = 'clients';
            } else if (suggestion.action === 'add_saving') {
                await personalService.addSaving(mergedData as Partial<PersonalSaving>);
                targetTab = 'savings';
            } else if (suggestion.action === 'add_project') {
                await personalService.addProject(mergedData as Partial<PersonalProject>);
                targetTab = 'projects';
            }
            
            setAiMessages(prev => [...prev, { 
                role: 'bot', 
                content: "Concluído com sucesso! ✅ O registo já está visível no seu ecossistema.",
                suggestion: { action: 'view_tab', data: targetTab }
            }]);
            fetchData(false);
        } catch {
            setAiMessages(prev => [...prev, { 
                role: 'bot', 
                content: "⚠️ Lamento, mas ocorreu um erro técnico ao tentar processar o registo. Por favor, verifique a conexão ou tente novamente via menu manual." 
            }]);
        } finally {
            setAiLoading(false);
        }
    };

    const priorityColor = (p: string) => p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#6b7280';
    const priorityLabel = (p: string) => p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa';

    const handleDeleteSaving = async (id: string) => {
        if (!window.confirm("Eliminar este registo de poupança?")) return;
        try {
            await personalService.deleteSaving(id);
            toast.success("Registo eliminado.");
            fetchData(false);
        } catch {
            toast.error("Erro ao eliminar");
        }
    };

    const openEditSaving = (s: PersonalSaving) => {
        setEditingSavingId(s._id);
        setSavingForm({
            amount: String(s.amount),
            account: s.account,
            date: s.date ? s.date.toString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: s.description || '',
            linkedTransactionId: s.linkedTransactionId || ''
        });
        setIsAddSavingOpen(true);
    };

    const closeSavingModal = () => {
        setIsAddSavingOpen(false);
        setEditingSavingId(null);
        setSavingForm({ amount: '', account: '', date: new Date().toISOString().split('T')[0], description: '', linkedTransactionId: '' });
    };

    const handleAddSaving = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            amount: parseFloat(savingForm.amount),
            account: savingForm.account,
            date: savingForm.date,
            description: savingForm.description || '',
            linkedTransactionId: savingForm.linkedTransactionId || undefined
        };
        try {
            if (editingSavingId) {
                await personalService.updateSaving(editingSavingId, payload);
                toast.success("Poupança actualizada!");
            } else {
                await personalService.addSaving(payload);
                toast.success("Poupança registada com sucesso!");
            }
            closeSavingModal();
            fetchData(false);
        } catch {
            toast.error("Erro ao guardar poupança");
        }
    };

    const btnPrimary: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '12px 24px', background: 'linear-gradient(135deg, #000 0%, #333 100%)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 800,
        cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        letterSpacing: '0.5px', whiteSpace: 'nowrap', boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        textTransform: 'uppercase'
    };

    const iconBtnStyle: React.CSSProperties = {
        padding: '6px', background: 'var(--background)', border: '1px solid var(--border)',
        borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer',
        display: 'inline-flex', transition: 'all 0.2s'
    };

    const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...transactions.map(t => t.category)]));

    return (
        <div 
            id="personal-dashboard-root"
            style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: 'var(--foreground)' }}
        >
            <style>{`
                @media (max-width: 768px) {
                    #personal-dashboard-root { padding: 12px !important; }
                    .personal-header { 
                        flex-direction: column !important; 
                        gap: 1rem !important; 
                        text-align: center !important;
                        align-items: center !important;
                        margin-bottom: 2rem !important;
                    }
                    .responsive-grid-cards { grid-template-columns: 1fr !important; gap: 1rem !important; }
                    .personal-h1 { font-size: 1.8rem !important; }
                    .personal-tabs-container { gap: 0.5rem !important; padding: 0.4rem !important; flex-wrap: nowrap !important; }
                    .personal-tab-btn { padding: 10px 15px !important; font-size: 0.65rem !important; flex-shrink: 0; }
                    .personal-tabs-wrapper { position: relative; padding-right: 30px !important; }
                    .mobile-scroll-arrow { 
                        display: flex !important; position: absolute; right: -5px; top: 50%; transform: translateY(-50%);
                        width: 32px; height: 32px; background: rgba(0,0,0,0.9); color: #FFD700; border-radius: 50%;
                        align-items: center; justify-content: center; z-index: 10; font-weight: bold; font-size: 1rem;
                        box-shadow: -10px 0 15px rgba(248,249,250,1); animation: pulse 2s infinite; cursor: pointer; border: 1px solid rgba(255,215,0,0.3);
                    }
                    .ai-action-buttons { flex-direction: column !important; gap: 8px !important; }
                    .ai-action-buttons button { width: 100% !important; justify-content: center; }
                    .ai-input-bar { flex-direction: column !important; gap: 10px !important; align-items: stretch !important; }
                    .ai-send-btn { width: 100% !important; height: 48px !important; border-radius: 12px !important; }
                    .ai-cancel-btn { right: 15px !important; padding: 4px 10px !important; font-size: 0.65rem !important; }
                    .gemini-ai-input { padding-right: 90px !important; font-size: 0.8rem !important; }
                    .gemini-ai-input::placeholder { font-size: 0.75rem !important; }
                    .ai-edit-grid { grid-template-columns: 1fr !important; }
                    .dashboard-loading-container { min-height: 260px !important; border-radius: 16px !important; padding: 10px !important; }
                    .loading-aura-bg { width: 120px !important; height: 120px !important; }
                    .loading-shield-icon { padding: 8px !important; }
                    .loading-shield-svg { width: 22px !important; height: 22px !important; }
                    .loading-main-title { font-size: 0.9rem !important; text-align: center; margin-bottom: 4px !important; }
                    .loading-sub-text { font-size: 0.6rem !important; max-width: 180px !important; line-height: 1.3 !important; }
                    .loading-steps-container { width: 100% !important; max-width: 180px !important; margin-top: 16px !important; gap: 6px !important; }
                    .loading-steps-container span { font-size: 0.6rem !important; }
                    .loading-progress-bar { margin-top: 16px !important; width: 140px !important; }
                    .marquee-placeholder span {
                        animation: marquee-bounce 6s ease-in-out infinite alternate !important;
                        display: inline-block;
                    }
                    .ai-options-dropdown {
                        width: 230px !important;
                        left: -5px !important;
                    }
                    .ai-bot-message-container {
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                    }
                    .ai-bot-message-container > div {
                        width: 100% !important;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                }
                @keyframes marquee-bounce {
                    0%, 15% { transform: translateX(0); }
                    85%, 100% { transform: translateX(-40%); }
                }
                @media (min-width: 769px) {
                    .mobile-scroll-arrow { display: none !important; }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes shimmer-loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(250%); }
                }
                @keyframes border-glow {
                    0% { border-color: rgba(255,215,0,0.1); box-shadow: 0 0 10px rgba(255,215,0,0.05); }
                    50% { border-color: rgba(255,215,0,0.3); box-shadow: 0 0 30px rgba(255,215,0,0.15); }
                    100% { border-color: rgba(255,215,0,0.1); box-shadow: 0 0 10px rgba(255,215,0,0.05); }
                }
            `}</style>
            {loading ? (
                <div className="dashboard-loading-container" style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    minHeight: '500px', background: 'linear-gradient(160deg,#060606,#0f0f0f)',
                    borderRadius: '40px', border: '1px solid rgba(255,215,0,0.08)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Background aura */}
                    <div className="loading-aura-bg" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                    
                    {/* Icon with multi-ring orbit */}
                    <div style={{ position: 'relative', marginBottom: '36px' }}>
                        <div style={{ position: 'absolute', inset: '-28px', borderRadius: '50%', border: '1.5px solid rgba(255,215,0,0.08)', animation: 'spin 10s linear infinite reverse' }} />
                        <div style={{ position: 'absolute', inset: '-16px', borderRadius: '50%', border: '1.5px solid rgba(255,215,0,0.15)', borderTopColor: '#FFD700', animation: 'spin 2s linear infinite' }} />
                        <div className="loading-shield-icon" style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)', padding: '22px', borderRadius: '50%', boxShadow: '0 0 60px rgba(255,215,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2.5s ease-in-out infinite' }}>
                            <ShieldCheck size={44} color="#000" className="loading-shield-svg" />
                        </div>
                    </div>

                    <h2 className="loading-main-title" style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '0.5px' }}>A Processar o seu Ecossistema</h2>
                    <p className="loading-sub-text" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center', maxWidth: '320px', lineHeight: '1.6' }}>Analisando finanças, tarefas, projetos e poupanças em tempo real.</p>
                    
                    {/* Step indicators */}
                    <div className="loading-steps-container" style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '10px', width: '260px' }}>
                        {[
                            { label: 'Fluxo financeiro', done: true },
                            { label: 'Produtividade operacional', done: true },
                            { label: 'Gestão de activos', done: false },
                            { label: 'Reservas estratégicas', done: false },
                        ].map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, background: step.done ? '#FFD700' : 'rgba(255,255,255,0.06)', border: step.done ? 'none' : '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.5s', animationDelay: `${i * 0.3}s` }}>
                                    {step.done && <span style={{ fontSize: '9px', color: '#000', fontWeight: 900 }}>✓</span>}
                                    {!step.done && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.2}s` }} />}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: step.done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', fontWeight: step.done ? 700 : 500, transition: 'color 0.5s', letterSpacing: '0.3px' }}>{step.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="loading-progress-bar" style={{ marginTop: '32px', width: '200px', height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', width: '80px', animation: 'shimmer-loading 1.8s infinite ease-in-out' }} />
                    </div>
                </div>
            ) : (
                <>



            {/* ── Smart Command Center (AI) ── */}
            <div style={{ 
                marginBottom: '2rem', 
                background: 'linear-gradient(145deg, #050505, #121212)', 
                padding: '1.5rem', 
                borderRadius: '24px', 
                border: '1px solid rgba(255,215,0,0.2)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                position: 'relative',
                zIndex: 1000
            }}>
                {/* Decorative background circle (contained) */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: '24px' }}>
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
                    {/* Left: bot icon + greeting */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <Bot size={28} color={conversaModeActive ? '#06b6d4' : '#D4AF37'} style={{ transition: 'color 0.3s' }} />
                            <div style={{ position: 'absolute', top: -2, right: -2, width: '10px', height: '10px', background: conversaModeActive ? '#06b6d4' : '#22c55e', borderRadius: '50%', border: '2px solid #000', transition: 'background 0.3s' }} />
                        </div>
                        <div>
                            <span style={{ color: conversaModeActive ? '#06b6d4' : '#D4AF37', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'color 0.3s' }}>Olá, {userFirstName}!</span>
                            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '1px' }}>
                                {conversaModeActive ? 'Modo Conversa Activo' : 'Orquestração de Elite'}
                            </div>
                        </div>
                    </div>

                    {/* Right: always-visible mode toggle button */}
                    <button
                        type="button"
                        onClick={() => handleAISend(undefined, conversaModeActive ? '/sair' : '/conversa')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 11px',
                            borderRadius: '20px',
                            border: conversaModeActive
                                ? '1px solid rgba(239,68,68,0.35)'
                                : '1px solid rgba(6,182,212,0.35)',
                            background: conversaModeActive
                                ? 'rgba(239,68,68,0.08)'
                                : 'rgba(6,182,212,0.08)',
                            color: conversaModeActive ? '#ef4444' : '#06b6d4',
                            fontSize: '0.58rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.04)';
                            e.currentTarget.style.boxShadow = conversaModeActive
                                ? '0 0 12px rgba(239,68,68,0.25)'
                                : '0 0 12px rgba(6,182,212,0.25)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {conversaModeActive
                            ? <><Zap size={11} /> Sair da Conversa</>
                            : <><MessageSquare size={11} /> Modo Conversa</>
                        }
                    </button>
                </div>

                <form onSubmit={handleAISend} className="ai-input-bar" style={{ position: 'relative', display: 'flex', gap: '15px', alignItems: 'center', zIndex: 10 }}>
                    <style>{`
                        @keyframes spin-gemini-border {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        .gemini-ai-wrapper {
                            position: relative;
                            flex: 1;
                            border-radius: 50px;
                            padding: 2px;
                            display: flex;
                            overflow: hidden;
                            background: #111;
                        }
                        .gemini-ai-wrapper::before {
                            content: "";
                            position: absolute;
                            top: -150%; right: -50%; bottom: -150%; left: -50%;
                            background: conic-gradient(from 0deg, transparent 0%, transparent 40%, #4285f4 60%, #ea4335 70%, #fbbc05 80%, #34a853 90%, transparent 100%);
                            animation: spin-gemini-border 3s linear infinite;
                            z-index: 0;
                        }
                        .gemini-ai-input {
                            position: relative;
                            z-index: 1;
                            width: 100%;
                            background: #131314;
                            border: none;
                            border-radius: 48px;
                            padding: 16px 24px 16px 54px;
                            color: #fff;
                            font-size: 1rem;
                            outline: none;
                            font-weight: 500;
                            letter-spacing: 0.3px;
                        }
                        .gemini-ai-input::placeholder {
                            color: #9aa0a6;
                        }
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .ai-cancel-btn {
                            position: absolute;
                            right: 75px;
                            top: 50%;
                            transform: translateY(-50%);
                            background: rgba(239, 68, 68, 0.1);
                            color: #ef4444;
                            border: 1px solid rgba(239, 68, 68, 0.2);
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 0.7rem;
                            font-weight: 800;
                            cursor: pointer;
                            z-index: 10;
                            transition: all 0.2s;
                            text-transform: uppercase;
                        }
                        .ai-cancel-btn:hover {
                            background: #ef4444;
                            color: #fff;
                        }
                    `}</style>

                    <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                        <div className="gemini-ai-wrapper">
                            {!aiInput && (
                                <div className="marquee-placeholder" aria-hidden="true" style={{ position: 'absolute', left: '54px', right: '90px', top: 0, bottom: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', overflow: 'hidden', zIndex: 2, maskImage: 'linear-gradient(90deg, #000 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, #000 85%, transparent 100%)' }}>
                                    <span style={{ color: '#9aa0a6', fontSize: '0.80rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                        {conversaModeActive
                                        ? "Faz uma pergunta sobre a tua saúde financeira..."
                                        : (aiMessages.length > 0 && aiMessages[aiMessages.length-1].role === 'bot' && aiMessages[aiMessages.length-1].suggestion?.context)
                                          ? "Digite a sua resposta aqui..."
                                          : "Para começar a orquestrar, digite /suporte ou clique no +"}
                                    </span>
                                </div>
                            )}
                            <input 
                                ref={aiInputRef}
                                className="gemini-ai-input"
                                placeholder="" 
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                            />
                        </div>

                        {/* Reset / Cancel Button inside input area when a flow is active */}
                        {(aiMessages.length > 0 && aiMessages[aiMessages.length-1].suggestion?.context) && (
                            <button type="button" onClick={handleAICancel} className="ai-cancel-btn">
                                Cancelar
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsAIOptionsOpen(!isAIOptionsOpen)}
                            style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,215,0,0.14)',
                                color: '#FFD700',
                                border: '1px solid rgba(255,215,0,0.3)',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                transition: 'all 0.3s'
                            }}
                        >
                            <Plus size={18} style={{ transform: isAIOptionsOpen ? 'rotate(45deg)' : 'none', transition: 'all 0.3s' }} />
                        </button>

                        {isAIOptionsOpen && (
                            <div className="ai-options-dropdown" style={{
                                position: 'absolute',
                                top: 'calc(100% + 15px)',
                                left: '0',
                                background: '#1e1e1f',
                                border: '1px solid rgba(255,215,0,0.2)',
                                borderRadius: '18px',
                                padding: '8px',
                                width: '280px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                                zIndex: 2000,
                                animation: 'fadeInDown 0.3s ease-out'
                            }}>
                                <style>{`
                                    @keyframes fadeInDown {
                                        from { opacity: 0; transform: translateY(-10px); }
                                        to { opacity: 1; transform: translateY(0); }
                                    }
                                `}</style>
                                <div style={{ fontSize: '0.6rem', color: '#9aa0a6', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', padding: '0 8px', letterSpacing: '1.5px' }}>Orquestração de Elite</div>
                                {[
                                    { text: "/Cria-Tarefa", icon: Target, template: "/Cria-Tarefa", sub: "Registar nova tarefa" },
                                    { text: "/Registar-Cliente", icon: Users, template: "/Registar-Cliente", sub: "Novo cliente" },
                                    { text: "/Registar-Transação", icon: Wallet, template: "/Registar-Transação", sub: "Fluxo financeiro" },
                                    { text: "/Nova-Alocação", icon: PiggyBank, template: "/Nova-Alocação", sub: "Poupança" },
                                    { text: "/Novo-Projecto", icon: Briefcase, template: "/Novo-Projecto", sub: "Criar projeto" },
                                    { text: "/conversa", icon: MessageSquare, template: "/conversa", sub: "Activar modo conversa" },
                                    { text: "/suporte", icon: HelpCircle, template: "/suporte", sub: "Todos os comandos" }
                                ].map((opt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            handleAISend(undefined, opt.template);
                                            setIsAIOptionsOpen(false);
                                            setTimeout(() => aiInputRef.current?.focus(), 200);
                                        }}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '7px 10px', background: 'transparent', border: 'none',
                                            borderRadius: '10px', color: '#fff', fontSize: '0.78rem', cursor: 'pointer',
                                            textAlign: 'left', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ background: 'rgba(255,215,0,0.1)', padding: '6px', borderRadius: '8px' }}>
                                            <opt.icon size={14} color="#FFD700" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 800 }}>{opt.text}</span>
                                            <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{opt.sub}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="ai-send-btn"
                        disabled={aiLoading || !aiInput.trim()} 
                        style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)',
                            color: '#000',
                            border: 'none',
                            width: '46px',
                            height: '46px',
                            minWidth: '46px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: '0 8px 16px rgba(212,175,55,0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
                            transform: 'translateY(0)',
                            zIndex: 10
                        }}
                    >
                        {aiLoading ? <Activity size={20} className="spin" /> : <Send size={20} />}
                    </button>
                </form>

                {/* AI Results/Suggestions Display */}
                {aiMessages.length > 0 && aiMessages[aiMessages.length-1].role === 'bot' && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,215,0,0.1)', paddingTop: '1.5rem' }}>
                        <div className="ai-bot-message-container" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <div style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
                                <Bot size={22} />
                            </div>
                            <div style={{ flex: 1, width: '100%' }}>
                                <div style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: '1.7', width: '100%' }}>
                                    <TypewriterText text={aiMessages[aiMessages.length-1].content} />
                                </div>
                                {(aiMessages[aiMessages.length-1].suggestion && 
                                  aiMessages[aiMessages.length-1].suggestion!.action !== 'ask_info' && 
                                  aiMessages[aiMessages.length-1].suggestion!.action !== 'show_commands' &&
                                  aiMessages[aiMessages.length-1].suggestion!.action !== 'view_tab') && (() => {
                                    const sug = aiMessages[aiMessages.length-1].suggestion!;
                                    const d = sug.data as Record<string, unknown>;
                                    // Define editable fields per action type
                                    const fieldMap: Record<string, Array<{key: string; label: string; type?: string; options?: string[]}>> = {
                                        add_task: [
                                            { key: 'title', label: 'Título' },
                                            { key: 'priority', label: 'Prioridade', options: ['low', 'medium', 'high'] },
                                            { key: 'deadline', label: 'Prazo', type: 'date' },
                                        ],
                                        add_transaction: [
                                            { key: 'amount', label: 'Valor', type: 'number' },
                                            { key: 'category', label: 'Categoria' },
                                            { key: 'date', label: 'Data', type: 'date' },
                                        ],
                                        add_project: [
                                            { key: 'name', label: 'Nome' },
                                            { key: 'totalBudget', label: 'Orçamento', type: 'number' },
                                            { key: 'deadline', label: 'Prazo', type: 'date' },
                                        ],
                                        add_client: [
                                            { key: 'name', label: 'Nome' },
                                            { key: 'email', label: 'E-mail', type: 'email' },
                                            { key: 'phone', label: 'Telefone' },
                                        ],
                                        add_saving: [
                                            { key: 'amount', label: 'Valor', type: 'number' },
                                            { key: 'account', label: 'Conta / Destino' },
                                            { key: 'date', label: 'Data', type: 'date' },
                                        ],
                                    };
                                    const fields = fieldMap[sug.action] || [];
                                    const priorityLabels: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };
                                    return (
                                        <div style={{ marginTop: '1.2rem' }}>
                                            {fields.length > 0 && (
                                                <div style={{ marginBottom: '1rem', borderRadius: '12px', border: '1px solid rgba(255,215,0,0.12)', background: 'rgba(255,215,0,0.04)', padding: '12px 14px' }}>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#FFD700', opacity: 0.6, marginBottom: '10px' }}>✏️ Editar antes de confirmar</div>
                                                    <div className="ai-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                        {fields.map(f => {
                                                            const currentVal = String((draftEdit[f.key] !== undefined ? draftEdit[f.key] : d?.[f.key]) ?? '');
                                                            if (f.options) {
                                                                return (
                                                                    <div key={f.key}>
                                                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>{f.label}</div>
                                                                        <select
                                                                            value={currentVal}
                                                                            onChange={e => setDraftEdit(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                                            style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', boxSizing: 'border-box' }}
                                                                        >
                                                                            {f.options.map(o => <option key={o} value={o}>{priorityLabels[o] || o}</option>)}
                                                                        </select>
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div key={f.key}>
                                                                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>{f.label}</div>
                                                                    <input
                                                                        type={f.type || 'text'}
                                                                        value={currentVal}
                                                                        onChange={e => setDraftEdit(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                                        style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="ai-action-buttons" style={{ display: 'flex', gap: '12px' }}>
                                                <button 
                                                    onClick={() => confirmAISuggestion(sug)}
                                                    style={{
                                                        padding: '12px 24px',
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        color: '#fff', border: 'none', borderRadius: '14px',
                                                        fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                        boxShadow: '0 8px 16px rgba(16,185,129,0.2)', transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <CheckCircle size={16} /> Confirmar Execução
                                                </button>
                                                <button 
                                                    onClick={() => { setAiMessages(prev => prev.slice(0, -1)); setDraftEdit({}); }}
                                                    style={{
                                                        padding: '12px 24px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        color: 'rgba(255,255,255,0.7)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '14px',
                                                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                  })()}

                                {aiMessages[aiMessages.length-1].suggestion?.action === 'show_commands' && (
                                    <div style={{ 
                                        marginTop: '1.2rem', 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                                        gap: '10px' 
                                    }}>
                                        {(aiMessages[aiMessages.length-1].suggestion?.data as AICommandAction[]).map(cmd => (
                                            <button 
                                                key={cmd.id}
                                                onClick={() => handleAISend(undefined, cmd.id)}
                                                style={{
                                                    padding: '12px',
                                                    background: 'rgba(255,215,0,0.05)',
                                                    border: '1px solid rgba(255,215,0,0.15)',
                                                    borderRadius: '12px',
                                                    color: '#FFD700',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
                                                    e.currentTarget.style.borderColor = '#FFD700';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'rgba(255,215,0,0.05)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,215,0,0.15)';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Sparkles size={14} />
                                                    <span>{cmd.label}</span>
                                                </div>
                                                <span style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 500 }}>{cmd.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {aiMessages[aiMessages.length-1].suggestion?.options && (() => {
                                    const allOpts = aiMessages[aiMessages.length-1].suggestion!.options!;
                                    const fixedOpts = ['Hoje', 'Amanhã', 'Saltar'];
                                    // Separate 'fixed' options (always last) from 'client' options
                                    const dynamicOpts = allOpts.filter(o => !fixedOpts.includes(o));
                                    const staticOpts = allOpts.filter(o => fixedOpts.includes(o));
                                    const MAX_VISIBLE = 4;
                                    const hasMore = dynamicOpts.length > MAX_VISIBLE;
                                    const visibleDynamic = (hasMore && !showMoreOptions) ? dynamicOpts.slice(0, MAX_VISIBLE) : dynamicOpts;
                                    const renderBtn = (opt: string) => (
                                        <button 
                                            key={opt}
                                            onClick={() => { handleAISend(undefined, opt); setShowMoreOptions(false); }}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'rgba(255,215,0,0.05)',
                                                border: '1px solid rgba(255,215,0,0.2)',
                                                borderRadius: '12px',
                                                color: '#FFD700',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(255,215,0,0.15)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(255,215,0,0.05)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    );
                                    return (
                                        <div style={{ marginTop: '1.2rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {visibleDynamic.map(renderBtn)}
                                            {hasMore && !showMoreOptions && (
                                                <button
                                                    onClick={() => setShowMoreOptions(true)}
                                                    style={{
                                                        padding: '10px 16px',
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px dashed rgba(255,255,255,0.2)',
                                                        borderRadius: '12px',
                                                        color: 'rgba(255,255,255,0.6)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                                                >
                                                    Ver mais (+{dynamicOpts.length - MAX_VISIBLE})
                                                </button>
                                            )}
                                            {hasMore && showMoreOptions && (
                                                <button
                                                    onClick={() => setShowMoreOptions(false)}
                                                    style={{
                                                        padding: '10px 16px',
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px dashed rgba(255,255,255,0.2)',
                                                        borderRadius: '12px',
                                                        color: 'rgba(255,255,255,0.6)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                                                >
                                                    Ver menos
                                                </button>
                                            )}
                                            {staticOpts.map(renderBtn)}
                                            {allOpts.includes('Hoje') && (
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <input 
                                                        type="date"
                                                        onChange={(e) => {
                                                            if (e.target.value) handleAISend(undefined, e.target.value);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            visibility: 'hidden',
                                                            width: 0,
                                                            height: 0
                                                        }}
                                                    />
                                                    <button 
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                            if (input && input.showPicker) input.showPicker();
                                                        }}
                                                        style={{
                                                            padding: '10px 20px',
                                                            background: 'rgba(255,215,0,0.05)',
                                                            border: '1px dashed rgba(255,215,0,0.4)',
                                                            borderRadius: '12px',
                                                            color: '#FFD700',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <Calendar size={16} /> Calendário
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {aiMessages[aiMessages.length-1].suggestion?.action === 'view_tab' && (
                                    <div style={{ marginTop: '1.2rem' }}>
                                        <button 
                                            onClick={() => setViewMode(aiMessages[aiMessages.length-1].suggestion!.data as ViewMode)}
                                            style={{
                                                padding: '12px 24px',
                                                background: 'rgba(255,215,0,0.1)',
                                                color: '#FFD700',
                                                border: '1px solid #FFD700',
                                                borderRadius: '14px',
                                                fontWeight: 800,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#FFD700';
                                                e.currentTarget.style.color = '#000';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
                                                e.currentTarget.style.color = '#FFD700';
                                            }}
                                        >
                                            <TrendingUp size={16} /> Ver no Painel de {(aiMessages[aiMessages.length-1].suggestion!.data as string).charAt(0).toUpperCase() + (aiMessages[aiMessages.length-1].suggestion!.data as string).slice(1)}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="personal-tabs-wrapper" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2rem', position: 'relative' }}>
                <button 
                    className="mobile-scroll-arrow" 
                    onClick={() => {
                        const el = document.getElementById('dashboard-mobile-tabs');
                        if (el) el.scrollBy({ left: 150, behavior: 'smooth' });
                    }}
                >
                    ➔
                </button>
                <div id="dashboard-mobile-tabs" className="personal-tabs-container" style={{ display: 'flex', width: '100%', gap: '0.5rem', padding: '0.4rem', background: '#f8f9fa', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
                    {DASHBOARD_TABS.map(tab => {
                        const isActive = viewMode === tab.id;
                        return (
                            <button 
                                key={tab.id} 
                                className="personal-tab-btn"
                                onClick={() => setViewMode(tab.id as ViewMode)} 
                                style={{
                                    padding: '12px 24px', 
                                    background: isActive ? '#000' : 'transparent',
                                    color: isActive ? '#D4AF37' : '#777',
                                    fontWeight: isActive ? 900 : 700,
                                    border: 'none',
                                    borderRadius: '16px',
                                    cursor: 'pointer', 
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                    fontSize: '0.75rem',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px', 
                                    whiteSpace: 'nowrap',
                                    boxShadow: isActive ? '0 8px 16px rgba(0,0,0,0.06)' : 'none',
                                    textTransform: 'uppercase', 
                                    letterSpacing: '1px',
                                    position: 'relative',
                                }}
                            >
                                <tab.icon size={16} color={isActive ? '#D4AF37' : '#888'} /> 
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── OVERVIEW ── */}
            {viewMode === 'overview' && (
                <>
                    {/* Smart Insights */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Insights Inteligentes</h3>
                        <SmartAlerts 
                            summary={summary} 
                            tasks={tasks} 
                            transactions={transactions} 
                            savings={savings} 
                            formatPrice={formatPrice} 
                        />
                    </div>

                    {/* ── TESLA THEMED OVERVIEW CARDS ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                        
                        {/* 1. FINANCIAL HEALTH (Balance) */}
                        <div style={{ 
                            background: '#0a0a0a', 
                            color: '#fff', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            border: '1px solid rgba(14,165,233,0.2)',
                            boxShadow: '0 4px 20px rgba(14,165,233,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: 'rgba(14,165,233,0.15)', filter: 'blur(40px)', borderRadius: '50%' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                                    <Wallet size={14} /> Liquidez Total
                                </div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>
                                    {formatPrice(summary.balance, 'MZN')}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', position: 'relative', zIndex: 1 }}>
                                <div 
                                    onClick={() => setViewMode('finance')}
                                    style={{ 
                                        flex: 1, cursor: 'pointer', transition: 'all 0.3s',
                                        padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(14,165,233,0.1)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ fontSize: '0.6rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>Entradas</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>+{formatPrice(summary.income, 'MZN').split(',')[0]}</div>
                                </div>
                                <div 
                                    onClick={() => setViewMode('finance')}
                                    style={{ 
                                        flex: 1, cursor: 'pointer', transition: 'all 0.3s',
                                        padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ fontSize: '0.6rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>Saídas</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>-{formatPrice(summary.expense, 'MZN').split(',')[0]}</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. PRODUCTIVITY (Tasks) */}
                        <div style={{ 
                            background: '#0a0a0a', 
                            color: '#fff', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            border: '1px solid rgba(245,158,11,0.2)',
                            boxShadow: '0 4px 20px rgba(245,158,11,0.05)',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: 'rgba(245,158,11,0.15)', filter: 'blur(40px)', borderRadius: '50%' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
                                    <Target size={14} /> Performance Operacional
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                                    {[
                                        { label: 'Aberto', val: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length, color: '#fff', bg: 'rgba(255,255,255,0.1)' },
                                        { label: 'Atraso', val: tasks.filter(t => t.status === 'late').length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                                        { label: 'Concluído', val: tasks.filter(t => t.status === 'completed').length, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                                    ].map(it => (
                                        <div 
                                            key={it.label}
                                            onClick={() => setViewMode('tasks')}
                                            style={{ 
                                                cursor: 'pointer', transition: 'all 0.3s', 
                                                padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', width: '31%'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = it.bg;
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: it.color }}>{it.val}</div>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '2px', opacity: 0.7 }}>{it.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.6 }}>EFICIÊNCIA GERAL</span>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#fbbf24' }}>
                                        {tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                                    </span>
                                </div>
                                <div style={{ height: '5px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%`, background: '#fbbf24', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                                </div>
                            </div>
                        </div>

                        {/* 3. MANAGEMENT (Entities) */}
                        <div style={{ 
                            background: '#0a0a0a', 
                            color: '#fff', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            border: '1px solid rgba(168,85,247,0.2)',
                            boxShadow: '0 4px 20px rgba(168,85,247,0.05)',
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: 'rgba(168,85,247,0.15)', filter: 'blur(40px)', borderRadius: '50%' }} />
                            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc' }}>
                                    <Activity size={14} /> Ativos em Gestão
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1, justifyContent: 'center' }}>
                                    <div 
                                        onClick={() => setViewMode('projects')}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                            background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '12px', 
                                            border: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                                            <Briefcase size={16} color="#c084fc" /> Projetos
                                        </div>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{projects.length}</span>
                                    </div>
                                    <div 
                                        onClick={() => setViewMode('clients')}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                            background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '12px', 
                                            border: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                                            <Users size={16} color="#c084fc" /> Clientes
                                        </div>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{clients.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. SAVINGS STATUS */}
                        <div style={{ 
                            background: '#0a0a0a', 
                            color: '#fff', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            border: '1px solid rgba(16,185,129,0.2)',
                            boxShadow: '0 4px 20px rgba(16,185,129,0.05)',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: 'rgba(16,185,129,0.15)', filter: 'blur(40px)', borderRadius: '50%' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
                                    <ShieldCheck size={14} /> Liquidez Estratégica
                                </div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>
                                    {formatPrice(savings.reduce((a, b) => a + b.amount, 0), 'MZN')}
                                </div>
                                <div style={{ marginTop: '4px', fontSize: '0.65rem', fontWeight: 800, opacity: 0.7 }}>
                                    TAXA DE POUPANÇA: <span style={{ color: '#34d399' }}>{summary.income > 0 ? ((savings.reduce((a, b) => a + b.amount, 0) / summary.income) * 100).toFixed(1) : 0}%</span>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setViewMode('savings')}
                                style={{ 
                                    marginTop: '1.2rem', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px', 
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    position: 'relative', zIndex: 1
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.6, marginBottom: '6px', textTransform: 'uppercase' }}>Histórico Recente</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {savings.slice(0, 2).map((s, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{s.account}</span>
                                            <span style={{ color: '#10b981' }}>+{formatPrice(s.amount, 'MZN').split(',')[0]}</span>
                                        </div>
                                    ))}
                                    {savings.length === 0 && <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Nenhuma reserva ativa</div>}
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
                    <div className="personal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
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

            {/* ── SAVINGS (POUPANÇA) ── */}
            {viewMode === 'savings' && (
                <div style={{ animation: 'fadeIn 0.4s ease' }}>
                    <div className="personal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Gestão de Poupança</h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Controle as suas reservas e planeie o seu futuro financeiro.</p>
                        </div>
                        <button onClick={() => setIsAddSavingOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Nova Alocação
                        </button>
                    </div>

                    <div className="responsive-grid-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ background: '#000', color: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', opacity: 0.6 }}>
                                    <ShieldCheck size={20} /> <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Escudo Financeiro</span>
                                </div>
                                <div style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-1px' }}>
                                    {formatPrice(savings.reduce((a, b) => a + b.amount, 0), 'MZN')}
                                </div>
                                <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7, lineHeight: '1.6' }}>
                                    Património total alocado em contas de poupança e reservas estratégicas.
                                </div>
                            </div>
                            
                            <div style={{ background: 'var(--paper)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5 }}>Dica de Saúde Profissional</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                    Tente poupar pelo menos 20% de cada entrada (receita) que recebe. Vincular a poupança directamente a uma entrada ajuda-o a manter a disciplina.
                                </p>
                            </div>
                        </div>

                        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Data</th>
                                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Conta / Destino</th>
                                        <th style={{ padding: '18px 24px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Valor</th>
                                        <th style={{ padding: '18px 24px', textAlign: 'center' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savings.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                                Nenhum registo de poupança efectuado ainda.
                                            </td>
                                        </tr>
                                    ) : savings.map(s => (
                                        <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '18px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(s.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '18px 24px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.account}</div>
                                                {s.linkedTransactionId && (
                                                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                                                        Linked: {transactions.find(t => t._id === s.linkedTransactionId)?.description || 'Original Entry'}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 800 }}>{formatPrice(s.amount, 'MZN')}</td>
                                            <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button onClick={() => openEditSaving(s)} style={iconBtnStyle}><Edit3 size={15} /></button>
                                                    <button onClick={() => handleDeleteSaving(s._id)} style={{...iconBtnStyle, color: '#ef4444'}}><Trash2 size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TASKS ── */}
            {viewMode === 'tasks' && (
                <div>
                    <div className="personal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Minhas Tarefas</h2>
                        <button onClick={() => setIsAddTaskOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Criar Tarefa
                        </button>
                    </div>

                    <div className="responsive-grid-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                                        {task.client && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                <Users size={14} /> {(task.client as PersonalClient).name}
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
                    <div className="personal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Meus Projectos</h2>
                        <button onClick={() => setIsAddProjectOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Novo Projecto
                        </button>
                    </div>

                    <div className="responsive-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
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
                    <div className="personal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Meus Clientes</h2>
                        <button onClick={() => setIsAddClientOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Registar Cliente
                        </button>
                    </div>

                    <div className="responsive-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Projecto Associado">
                            <StyledSelect value={taskForm.project} onChange={e => setTaskForm({ ...taskForm, project: e.target.value })}>
                                <option value="">Tarefa Independente</option>
                                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </StyledSelect>
                        </Field>
                        <Field label="Cliente Associado">
                            <StyledSelect value={taskForm.client} onChange={e => setTaskForm({ ...taskForm, client: e.target.value })}>
                                <option value="">Nenhum Cliente</option>
                                {clients.map(cl => <option key={cl._id} value={cl._id}>{cl.name}</option>)}
                            </StyledSelect>
                        </Field>
                    </div>
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

            {/* Savings Modal */}
            {isAddSavingOpen && (
                <Modal title={editingSavingId ? "Editar Poupança" : "Registar Nova Poupança"} onClose={closeSavingModal} onSubmit={handleAddSaving}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Valor da Poupança">
                            <StyledInput type="number" step="0.01" placeholder="0.00" required value={savingForm.amount} onChange={e => setSavingForm({ ...savingForm, amount: e.target.value })} />
                        </Field>
                        <Field label="Data">
                            <StyledInput type="date" required value={savingForm.date} onChange={e => setSavingForm({ ...savingForm, date: e.target.value })} />
                        </Field>
                    </div>
                    <Field label="Conta de Destino">
                        <StyledInput placeholder="Ex: Conta Activa, Investimento, Cofre..." required value={savingForm.account} onChange={e => setSavingForm({ ...savingForm, account: e.target.value })} />
                    </Field>
                    <Field label="Vincular a uma Entrada (Opcional)">
                        <StyledSelect value={savingForm.linkedTransactionId} onChange={e => setSavingForm({ ...savingForm, linkedTransactionId: e.target.value })}>
                            <option value="">Nenhuma entrada específica</option>
                            {transactions.filter(t => t.type === 'income').map(tx => (
                                <option key={tx._id} value={tx._id}>{new Date(tx.date).toLocaleDateString()} - {tx.description} ({formatPrice(tx.amount)})</option>
                            ))}
                        </StyledSelect>
                    </Field>
                    <Field label="Descrição Extra">
                        <StyledInput placeholder="Motivo ou nota adicional..." value={savingForm.description} onChange={e => setSavingForm({ ...savingForm, description: e.target.value })} />
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

            </>)}
        </div>
    );
}

