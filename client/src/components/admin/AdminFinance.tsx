"use client";

import { useState, useEffect, useCallback } from 'react';
import { financeService, TransactionModel, FinancialSummary } from '@/lib/financeService';
import {
    Clock,
    CheckCircle,
    TrendingUp,
    FileText,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

export default function AdminFinance() {
    const [transactions, setTransactions] = useState<TransactionModel[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const status = statusFilter === 'all' ? undefined : statusFilter;
            const [txData, summaryData] = await Promise.all([
                financeService.getAdminTransactions(status),
                financeService.getAdminSummary()
            ]);
            setTransactions(txData);
            setSummary(summaryData);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados financeiros");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleConfirmPayment = async (id: string) => {
        try {
            const res = await financeService.confirmPayment(id);
            if (res.success) {
                toast.success("Pagamento confirmado!");
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Erro ao confirmar pagamento");
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.form.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Color palette for charts
    const COLORS = ['#FFD700', '#B8860B', '#DAA520', '#C5B358', '#FFDF00'];

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    if (loading && !summary) return <div style={{ textAlign: 'center', padding: '4rem' }}>Carregando finanças...</div>;

    const chartData = summary?.monthlyStats?.map((s: { month: number; platformFees: number; revenue: number }) => ({
        name: monthNames[s.month],
        fees: s.platformFees,
        revenue: s.revenue
    })) || [];

    const pieData = summary?.paymentMethods ? Object.entries(summary.paymentMethods).map(([name, value]: [string, number]) => ({
        name: name === 'stripe' ? 'Stripe (Cartão)' : 'Manual (Transferência)',
        value
    })) : [];

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Header Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatsCard
                    title="Volume Transacionado"
                    value={summary?.totalRevenue || 0}
                    icon={<TrendingUp size={24} />}
                    color="#D4AF37"
                    subtitle="Total processado (Stripe + Manual)"
                />
                <StatsCard
                    title="Taxas Coletadas"
                    value={summary?.collectedFees || 0}
                    icon={<CheckCircle size={24} />}
                    color="#10b981"
                    subtitle="Dinheiro em caixa (Plataforma)"
                />
                <StatsCard
                    title="Taxas Pendentes"
                    value={summary?.pendingFees || 0}
                    icon={<Clock size={24} />}
                    color="#f59e0b"
                    subtitle="Cobranças a mentores (Manual)"
                />
            </div>

            {/* Analytics Grid */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Monthly Growth Chart */}
                <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', height: '400px' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Crescimento de Receita</h3>
                            <p style={{ fontSize: '0.8rem', color: '#888' }}>Taxas da Plataforma (MT) por mês</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    formatter={(value: string | number | undefined) => [`${Number(value || 0).toLocaleString()} MT`, 'Taxa Plataforma']}
                                />
                                <Area type="monotone" dataKey="fees" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Mentors and Methods Split */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Métodos de Pagamento</h3>
                            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1.5rem' }}>Divisão entre Automático e Manual</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {pieData.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx] }}></div>
                                        <span style={{ color: '#555' }}>{item.name}:</span>
                                        <span style={{ fontWeight: 700 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ width: '150px', height: '150px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Top Mentors (Receita Gerada)</h3>
                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                            {summary?.topMentors?.map((m: { name: string; business: string; platformFees: number }, idx: number) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: idx < 4 ? '1px solid #f9f9f9' : 'none' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#999' }}>{m.business}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>+{m.platformFees.toLocaleString()} MT</div>
                                        <div style={{ fontSize: '0.7rem', color: '#ccc' }}>Taxas geradas</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '350px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Buscar por mentor ou evento..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                        style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {['all', 'pending', 'completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setCurrentPage(1); // Reset page on filter change
                            }}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                border: '1px solid #eee',
                                background: statusFilter === status ? '#000' : '#fff',
                                color: statusFilter === status ? '#FFD700' : '#666',
                                cursor: 'pointer',
                                fontWeight: 700,
                                textTransform: 'capitalize'
                            }}
                        >
                            {status === 'all' ? 'Ver Todos' : status === 'pending' ? 'Pendentes' : 'Conciliados'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="luxury-card" style={{ background: '#fff', padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>Mentor / Business</th>
                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>Evento / Método</th>
                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>Valor Total</th>
                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>Taxa Plataforma</th>
                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>Status</th>
                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem', textAlign: 'right' }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {currentTransactions.map(tx => (
                                <motion.tr
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key={tx._id}
                                    style={{ borderBottom: '1px solid #f9f9f9', fontSize: '0.9rem' }}
                                >
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: 700 }}>{tx.mentor.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{tx.mentor.businessName || tx.mentor.email}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: 600 }}>{tx.form.title}</div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            color: tx.paymentMethod === 'stripe' ? '#6366f1' : '#f59e0b'
                                        }}>
                                            {tx.paymentMethod}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', fontWeight: 700 }}>
                                        {tx.amount.toLocaleString()} {tx.currency}
                                    </td>
                                    <td style={{ padding: '1.2rem', color: '#10b981', fontWeight: 800 }}>
                                        {tx.platformFee.toLocaleString()} {tx.currency}
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: tx.status === 'completed' ? '#38a16915' : '#f59e0b15',
                                            color: tx.status === 'completed' ? '#38a169' : '#b45309'
                                        }}>
                                            {tx.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            {tx.status === 'completed' ? 'CONCILIADO' : 'AGUARDANDO MENTOR'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        {tx.status === 'pending' && (
                                            <button
                                                onClick={() => handleConfirmPayment(tx._id)}
                                                style={{
                                                    background: '#000',
                                                    color: '#FFD700',
                                                    border: 'none',
                                                    padding: '0.6rem 1rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    marginLeft: 'auto'
                                                }}
                                            >
                                                <ArrowUpRight size={14} /> CONFIRMAR RECEBIMENTO
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
                        <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Nenhuma transação encontrada.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {filteredTransactions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                    <div>
                        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} de {filteredTransactions.length} transações
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                background: currentPage === 1 ? '#f5f5f5' : '#fff',
                                color: currentPage === 1 ? '#aaa' : '#333',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Anterior
                        </button>
                        {Array.from({ length: Math.ceil(filteredTransactions.length / itemsPerPage) }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: currentPage === i + 1 ? 'none' : '1px solid #ddd',
                                    borderRadius: '6px',
                                    background: currentPage === i + 1 ? '#FFD700' : '#fff',
                                    color: currentPage === i + 1 ? '#000' : '#333',
                                    fontWeight: currentPage === i + 1 ? 700 : 400,
                                    cursor: 'pointer'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredTransactions.length / itemsPerPage)))}
                            disabled={indexOfLastItem >= filteredTransactions.length}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                background: indexOfLastItem >= filteredTransactions.length ? '#f5f5f5' : '#fff',
                                color: indexOfLastItem >= filteredTransactions.length ? '#aaa' : '#333',
                                cursor: indexOfLastItem >= filteredTransactions.length ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, color, subtitle }: { title: string, value: number, icon: React.ReactNode, color: string, subtitle: string }) {
    return (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #eee', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: `${color}15`, color: color, width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>{title}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000' }}>
                        {value.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>MT</span>
                    </div>
                </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#888', borderTop: '1px solid #f5f5f5', paddingTop: '0.8rem' }}>{subtitle}</p>
        </div>
    );
}
