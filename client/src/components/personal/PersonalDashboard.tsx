"use client";

import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, Target, 
    CheckCircle, Clock, Plus, Activity, X,
    Trash2, Edit3, Users, Building, User, Mail, Phone, Briefcase,
    BarChart3, PieChart as PieIcon, Sparkles, Send, Bot, AlertTriangle,
    ShieldCheck, PiggyBank, HelpCircle
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

interface AISuggestion {
    action: 'add_task' | 'add_transaction' | 'add_client' | 'add_saving' | 'add_project' | 'ask_info';
    data: unknown;
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



    const defaultTxForm: TxFormState = { type: 'income', category: '', amount: '', description: '', date: '', project: '', client: '' };
    const defaultTaskForm: TaskFormState = { title: '', deadline: '', priority: 'medium', project: '' };
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
    
    // Obter nome do utilizador para saudação
    const user = authService.getCurrentUser();
    const userFirstName = user ? user.name.split(' ')[0] : 'Líder';

    const fetchData = async () => {
        setLoading(true);
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
    const handleAISend = async (e?: React.FormEvent, customMsg?: string) => {
        if (e) e.preventDefault();
        
        const userMsg = customMsg || aiInput;
        if (!userMsg.trim()) return;

        // Se o usuário clicar em suporte, abrimos o seletor visual também para facilitar
        if (userMsg.toLowerCase().includes('/suporte')) {
            setIsAIOptionsOpen(true);
        }

        setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        if (!customMsg) setAiInput('');
        setAiLoading(true);

        const currentContext = aiMessages.length > 0 && aiMessages[aiMessages.length-1].role === 'bot' 
                                ? aiMessages[aiMessages.length-1].suggestion?.context 
                                : undefined;

        try {
            const res = await personalService.processAICommand(userMsg, currentContext || undefined);
            if (res.success) {
                setAiMessages(prev => [...prev, { 
                    role: 'bot', 
                    content: res.message,
                    suggestion: (res.action && res.action !== 'ask_info') 
                        ? { action: res.action, data: res.data, context: res.context } 
                        : (res.context ? { action: 'ask_info', data: null, context: res.context } : null) 
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
        setAiMessages([]);
        setAiInput('');
        setIsAIOptionsOpen(false);
        toast.info("Processo cancelado. O que vamos orquestrar agora?");
    };

    const confirmAISuggestion = async (suggestion: AISuggestion) => {
        setAiLoading(true);
        try {
            if (suggestion.action === 'add_task') {
                await personalService.addTask(suggestion.data as Partial<PersonalTask>);
                toast.success("Tarefa criada por IA!");
            } else if (suggestion.action === 'add_transaction') {
                await personalService.addTransaction(suggestion.data as Partial<PersonalTransaction>);
                toast.success("Transação registada por IA!");
            } else if (suggestion.action === 'add_client') {
                await personalService.addClient(suggestion.data as Partial<PersonalClient>);
                toast.success("Cliente registado por IA!");
            } else if (suggestion.action === 'add_saving') {
                await personalService.addSaving(suggestion.data as Partial<PersonalSaving>);
                toast.success("Poupança registada por IA!");
            } else if (suggestion.action === 'add_project') {
                await personalService.addProject(suggestion.data as Partial<PersonalProject>);
                toast.success("Projeto criado por IA!");
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

    const handleDeleteSaving = async (id: string) => {
        if (!window.confirm("Eliminar este registo de poupança?")) return;
        try {
            await personalService.deleteSaving(id);
            toast.success("Registo eliminado.");
            fetchData();
        } catch {
            toast.error("Erro ao eliminar");
        }
    };

    const handleAddSaving = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await personalService.addSaving({
                amount: parseFloat(savingForm.amount),
                account: savingForm.account,
                date: savingForm.date,
                description: savingForm.description || '',
                linkedTransactionId: savingForm.linkedTransactionId || undefined
            });
            toast.success("Poupança registada com sucesso!");
            setIsAddSavingOpen(false);
            setSavingForm({ amount: '', account: '', date: new Date().toISOString().split('T')[0], description: '', linkedTransactionId: '' });
            fetchData();
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
                        gap: 1.5rem !important; 
                        text-align: center !important;
                        margin-bottom: 2rem !important;
                    }
                    .personal-h1 { font-size: 1.8rem !important; }
                    .personal-tabs-container { gap: 0.5rem !important; padding: 0.3rem !important; }
                    .personal-tab-btn { padding: 10px 15px !important; font-size: 0.65rem !important; }
                    .ai-input-bar { flex-direction: column !important; gap: 10px !important; align-items: stretch !important; }
                    .ai-send-btn { width: 100% !important; height: 48px !important; border-radius: 12px !important; }
                }
            `}</style>
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', color: '#FFD700', fontSize: '1.1rem', fontWeight: 600 }}>
                    <Activity size={24} style={{ animation: 'spin 1s linear infinite' }} /> Carregando Saúde Profissional...
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
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Bot size={28} color="#D4AF37" />
                        <div style={{ position: 'absolute', top: -2, right: -2, width: '10px', height: '10px', background: '#FFD700', borderRadius: '50%', border: '2px solid #000' }} />
                    </div>
                    <span style={{ color: '#D4AF37', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Olá, {userFirstName}!</span>
                </div>

                <form onSubmit={handleAISend} className="ai-input-bar" style={{ position: 'relative', display: 'flex', gap: '15px', alignItems: 'center', zIndex: 1000 }}>
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
                            <input 
                                ref={aiInputRef}
                                className="gemini-ai-input"
                                placeholder="Para começar a orquestrar, digite /suporte ou clique no +" 
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
                            <div style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 15px)',
                                left: '0',
                                background: '#1e1e1f',
                                border: '1px solid rgba(255,215,0,0.2)',
                                borderRadius: '20px',
                                padding: '12px',
                                width: '300px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                                zIndex: 2000,
                                animation: 'fadeInUp 0.3s ease-out'
                            }}>
                                <div style={{ fontSize: '0.65rem', color: '#9aa0a6', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px', padding: '0 8px', letterSpacing: '1.5px' }}>Orquestração de Elite</div>
                                {[
                                    { text: "/Cria-Tarefa", icon: Target, template: "/Cria-Tarefa", sub: "Registar nova tarefa" },
                                    { text: "/Registar-Cliente", icon: Users, template: "/Registar-Cliente", sub: "Novo cliente" },
                                    { text: "/Registar-Transação", icon: Wallet, template: "/Registar-Transação", sub: "Fluxo financeiro" },
                                    { text: "/Nova-Alocação", icon: PiggyBank, template: "/Nova-Alocação", sub: "Poupança" },
                                    { text: "/Novo-Projecto", icon: Briefcase, template: "/Novo-Projecto", sub: "Criar projeto" },
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
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px', background: 'transparent', border: 'none',
                                            borderRadius: '12px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer',
                                            textAlign: 'left', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ background: 'rgba(255,215,0,0.1)', padding: '8px', borderRadius: '10px' }}>
                                            <opt.icon size={16} color="#FFD700" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 800 }}>{opt.text}</span>
                                            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{opt.sub}</span>
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
                            background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                            color: '#000',
                            border: 'none',
                            width: '54px',
                            height: '54px',
                            minWidth: '54px',
                            borderRadius: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: '0 10px 20px rgba(212,175,55,0.3)',
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
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <div style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', padding: '10px', borderRadius: '12px' }}>
                                <Bot size={22} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, color: '#fff', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{aiMessages[aiMessages.length-1].content}</p>
                                {(aiMessages[aiMessages.length-1].suggestion && aiMessages[aiMessages.length-1].suggestion!.action !== 'ask_info') && (
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '12px' }}>
                                        <button 
                                            onClick={() => confirmAISuggestion(aiMessages[aiMessages.length-1].suggestion!)}
                                            style={{
                                                padding: '12px 24px',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '14px',
                                                fontWeight: 800,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: '0 8px 16px rgba(16,185,129,0.2)',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <CheckCircle size={16} /> Confirmar Execução
                                        </button>
                                        <button 
                                            onClick={() => setAiMessages(prev => prev.slice(0, -1))}
                                            style={{
                                                padding: '12px 24px',
                                                background: 'rgba(255,255,255,0.03)',
                                                color: 'rgba(255,255,255,0.7)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '14px',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2rem' }}>
                <div className="personal-tabs-container" style={{ display: 'flex', width: '100%', gap: '0.5rem', padding: '0.4rem', background: '#f8f9fa', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)', overflowX: 'auto', scrollbarWidth: 'none' }}>
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
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Wallet size={14} /> Liquidez Total
                                </div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-1px', color: summary.balance >= 0 ? '#fff' : '#ff4444' }}>
                                    {formatPrice(summary.balance, 'MZN')}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                <div 
                                    onClick={() => setViewMode('finance')}
                                    style={{ 
                                        flex: 1, cursor: 'pointer', transition: 'all 0.3s',
                                        padding: '8px', borderRadius: '8px'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 800 }}>Entradas</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#00ff41' }}>+{formatPrice(summary.income, 'MZN').split(',')[0]}</div>
                                </div>
                                <div 
                                    onClick={() => setViewMode('finance')}
                                    style={{ 
                                        flex: 1, cursor: 'pointer', transition: 'all 0.3s',
                                        padding: '8px', borderRadius: '8px'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 800 }}>Saídas</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ff4444' }}>-{formatPrice(summary.expense, 'MZN').split(',')[0]}</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. PRODUCTIVITY (Tasks) */}
                        <div style={{ 
                            background: '#fff', 
                            color: '#000', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            border: '1px solid #e5e5e5',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Target size={14} /> Performance Operacional
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                    {[
                                        { label: 'Aberto', val: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length, color: '#000' },
                                        { label: 'Atraso', val: tasks.filter(t => t.status === 'late').length, color: '#ff4444' },
                                        { label: 'Concluído', val: tasks.filter(t => t.status === 'completed').length, color: '#000', opacity: 0.4 },
                                    ].map(it => (
                                        <div 
                                            key={it.label}
                                            onClick={() => setViewMode('tasks')}
                                            style={{ 
                                                cursor: 'pointer', transition: 'all 0.3s', 
                                                padding: '8px 12px', borderRadius: '12px' 
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = '#f9f9f9';
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: it.color, opacity: it.opacity }}>{it.val}</div>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>{it.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{ height: '4px', width: '100%', background: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%`, background: '#000', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, textAlign: 'right', marginTop: '6px' }}>
                                    {tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}% EFICIÊNCIA
                                </div>
                            </div>
                        </div>

                        {/* 3. MANAGEMENT (Entities) */}
                        <div style={{ 
                            background: '#f8f8f8', 
                            color: '#000', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            border: '1px solid #eee',
                            display: 'flex', 
                            flexDirection: 'column'
                        }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Activity size={14} /> Ativos em Gestão
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div 
                                    onClick={() => setViewMode('projects')}
                                    style={{ 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                        background: '#fff', padding: '0.8rem 1rem', borderRadius: '12px', 
                                        border: '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Briefcase size={16} opacity={0.5} /> Projetos
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{projects.length}</span>
                                </div>
                                <div 
                                    onClick={() => setViewMode('clients')}
                                    style={{ 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                        background: '#fff', padding: '0.8rem 1rem', borderRadius: '12px', 
                                        border: '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Users size={16} opacity={0.5} /> Clientes
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{clients.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. SAVINGS STATUS */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            boxShadow: '0 10px 30px rgba(16,185,129,0.15)',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            color: '#fff'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ShieldCheck size={14} /> Liquidez Estratégica
                                </div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px' }}>
                                    {formatPrice(savings.reduce((a, b) => a + b.amount, 0), 'MZN')}
                                </div>
                                <div style={{ marginTop: '4px', fontSize: '0.7rem', opacity: 0.8, fontWeight: 700 }}>
                                    TAXA DE POUPANÇA: {summary.income > 0 ? ((savings.reduce((a, b) => a + b.amount, 0) / summary.income) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setViewMode('savings')}
                                style={{ 
                                    marginTop: '1.5rem', 
                                    background: 'rgba(255,255,255,0.1)', 
                                    borderRadius: '12px', 
                                    padding: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.7, marginBottom: '5px' }}>ÚLTIMAS ALOCAÇÕES</div>
                                {savings.slice(0, 2).map((s, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <span>{s.account}</span>
                                        <span>+{formatPrice(s.amount, 'MZN').split(',')[0]}</span>
                                    </div>
                                ))}
                                {savings.length === 0 && <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Nenhuma reserva ativa</div>}
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

            {/* ── SAVINGS (POUPANÇA) ── */}
            {viewMode === 'savings' && (
                <div style={{ animation: 'fadeIn 0.4s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Gestão de Poupança</h2>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Controle as suas reservas e planeie o seu futuro financeiro.</p>
                        </div>
                        <button onClick={() => setIsAddSavingOpen(true)} style={btnPrimary}>
                            <Plus size={18} /> Nova Alocação
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
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
                                                <button onClick={() => handleDeleteSaving(s._id)} style={{ padding: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                                                    <Trash2 size={16} />
                                                </button>
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

            {/* Savings Modal */}
            {isAddSavingOpen && (
                <Modal title="Registar Nova Poupança" onClose={() => setIsAddSavingOpen(false)} onSubmit={handleAddSaving}>
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

