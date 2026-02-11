"use client";

import { useState, useEffect, useCallback } from 'react';
import { financeService, TransactionModel, FinancialSummary } from '@/lib/financeService';
import {
    Clock,
    CheckCircle,
    TrendingUp,
    FileText,
    Search,
    Eye,
    X,
    ExternalLink,
    Download,
    Trash2,
    XCircle,
    RefreshCcw
} from 'lucide-react';

import Image from 'next/image';
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
import { useTranslate } from '@/context/LanguageContext';

export default function AdminFinance() {
    const { t } = useTranslate();
    const [transactions, setTransactions] = useState<TransactionModel[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [displayCurrency, setDisplayCurrency] = useState<'MZN' | 'USD'>('USD');
    const [isRefreshingRate, setIsRefreshingRate] = useState(false);


    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const getConvertedValue = useCallback((valueMZN: number) => {
        if (displayCurrency === 'MZN') return valueMZN;
        const rate = summary?.exchangeRate || 64; // Fallback rate
        return valueMZN / rate;
    }, [displayCurrency, summary?.exchangeRate]);

    const formatCurrency = useCallback((value: number) => {
        const converted = getConvertedValue(value);
        return new Intl.NumberFormat(displayCurrency === 'MZN' ? 'pt-MZ' : 'en-US', {
            style: 'currency',
            currency: displayCurrency
        }).format(converted);
    }, [displayCurrency, getConvertedValue]);

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
        if (!confirm('Tem certeza que deseja confirmar este pagamento?')) return;
        try {
            const res = await financeService.confirmPayment(id);
            if (res.success) {
                toast.success("Pagamento confirmado e plano ativado!");
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Erro ao confirmar pagamento");
        }
    };

    const handleRejectPayment = async (id: string) => {
        if (!confirm('Tem certeza que deseja REJEITAR este pagamento?')) return;
        try {
            const res = await financeService.rejectPayment(id);
            if (res.success) {
                toast.success("Pagamento rejeitado.");
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Erro ao rejeitar pagamento");
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm('ATENÇÃO: Isso excluirá permanentemente o registro financeiro. Continuar?')) return;
        try {
            const res = await financeService.deleteTransaction(id);
            if (res.success) {
                toast.success("Transação eliminada.");
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Erro ao eliminar transação");
        }
    };

    const handleRefreshRate = async () => {
        try {
            setIsRefreshingRate(true);
            const res = await financeService.refreshExchangeRate();
            if (res.success) {
                toast.success(`Taxa atualizada! Mercado: ${res.marketRate} MT | Ajustada: ${res.adjustedRate.toFixed(2)} MT`);
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar taxa de câmbio");
        } finally {
            setIsRefreshingRate(false);
        }
    };


    const filteredTransactions = transactions.filter(tx => {
        const mentorMatch = tx.mentor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.mentor?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.mentor?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
        const formMatch = tx.form?.title.toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = tx.type?.toLowerCase().includes(searchTerm.toLowerCase());

        return mentorMatch || formMatch || typeMatch;
    });

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
        fees: getConvertedValue(s.platformFees),
        revenue: getConvertedValue(s.revenue)
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
                    formattedValue={formatCurrency(summary?.totalRevenue || 0)}
                />
                <StatsCard
                    title={t('dashboard.finance.subscriptionRevenue')}
                    value={summary?.subscriptionRevenue || 0}
                    icon={<TrendingUp size={24} />}
                    color="#6366f1"
                    subtitle="Upgrades de planos Mentores"
                    formattedValue={formatCurrency(summary?.subscriptionRevenue || 0)}
                />
                <StatsCard
                    title={t('dashboard.finance.eventFeeRevenue')}
                    value={summary?.eventFeeRevenue || 0}
                    icon={<TrendingUp size={24} />}
                    color="#10b981"
                    subtitle="Taxas coletadas de inscrições"
                    formattedValue={formatCurrency(summary?.eventFeeRevenue || 0)}
                />
                <StatsCard
                    title="Taxas Pendentes"
                    value={summary?.pendingFees || 0}
                    icon={<Clock size={24} />}
                    color="#f59e0b"
                    subtitle="Cobranças manuais a mentores"
                    formattedValue={formatCurrency(summary?.pendingFees || 0)}
                />
            </div>

            {/* Analytics Grid */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Monthly Growth Chart */}
                <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', height: '400px' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Crescimento de Receita</h3>
                            <p style={{ fontSize: '0.85rem', color: '#1a1a1a', fontWeight: 600 }}>Taxas da Plataforma ({displayCurrency}) por mês</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <motion.button
                                whileHover={{
                                    scale: 1.03,
                                    backgroundColor: '#111',
                                    boxShadow: '0 12px 30px rgba(212, 175, 55, 0.25)'
                                }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleRefreshRate}
                                disabled={isRefreshingRate}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '0.8rem 1.6rem',
                                    borderRadius: '18px',
                                    background: isRefreshingRate ? '#f8f9fa' : '#000',
                                    color: isRefreshingRate ? '#cbd5e1' : '#FFD700',
                                    border: isRefreshingRate ? '1px solid #e2e8f0' : '2px solid #D4AF37',
                                    fontSize: '0.75rem',
                                    fontWeight: 900,
                                    cursor: isRefreshingRate ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                                title="Atualizar taxa de câmbio via API agora"
                            >
                                <RefreshCcw size={18} className={isRefreshingRate ? 'animate-spin' : ''} />
                                {isRefreshingRate ? 'Sincronizando...' : 'Sincronizar Câmbio'}
                            </motion.button>

                            <div style={{
                                display: 'flex',
                                gap: '6px',
                                background: 'rgba(245, 245, 245, 0.8)',
                                padding: '6px',
                                borderRadius: '15px',
                                border: '1px solid #e2e8f0',
                                backdropFilter: 'blur(10px)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <button
                                    onClick={() => setDisplayCurrency('MZN')}
                                    style={{
                                        padding: '6px 18px',
                                        borderRadius: '11px',
                                        border: 'none',
                                        background: displayCurrency === 'MZN' ? '#fff' : 'transparent',
                                        color: displayCurrency === 'MZN' ? '#000' : '#888',
                                        fontWeight: 800,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        boxShadow: displayCurrency === 'MZN' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    MZN
                                </button>
                                <button
                                    onClick={() => setDisplayCurrency('USD')}
                                    style={{
                                        padding: '6px 18px',
                                        borderRadius: '11px',
                                        border: 'none',
                                        background: displayCurrency === 'USD' ? '#000' : 'transparent',
                                        color: displayCurrency === 'USD' ? '#fff' : '#888',
                                        fontWeight: 800,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        boxShadow: displayCurrency === 'USD' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    USD
                                </button>
                            </div>
                        </div>

                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    formatter={(value: string | number | undefined) => [`${Number(value || 0).toLocaleString()} ${displayCurrency}`, 'Taxa Plataforma']}
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
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>+{formatCurrency(m.platformFees)}</div>
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
                    {['all', 'pending', 'completed', 'rejected'].map(status => (
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
                            {status === 'all' ? 'Ver Todos' : status === 'pending' ? 'Pendentes' : status === 'rejected' ? 'Rejeitados' : 'Conciliados'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="luxury-card" style={{ background: '#fff', padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>Mentor / Business</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>Evento / Método</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>Valor Total</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>Taxa Plataforma</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>Status</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800, textAlign: 'right' }}>Ação</th>
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
                                        <div style={{ fontWeight: 700 }}>{tx.mentor?.name || tx.user?.name || 'Sistema'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{tx.mentor?.businessName || tx.user?.businessName || tx.mentor?.email || tx.user?.email || 'Assinatura Direta'}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: 600 }}>{tx.type === 'subscription' ? `Assinatura: ${tx.metadata?.plan || 'Upgrade'}` : (tx.form?.title || 'Evento')}</div>
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
                                            background: tx.status === 'completed' ? '#38a16915' : tx.status === 'rejected' ? '#e53e3e15' : '#f59e0b15',
                                            color: tx.status === 'completed' ? '#38a169' : tx.status === 'rejected' ? '#e53e3e' : '#b45309'
                                        }}>
                                            {tx.status === 'completed' ? <CheckCircle size={12} /> : tx.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                                            {tx.status === 'completed' ? 'CONCILIADO' : tx.status === 'rejected' ? 'REJEITADO' : 'AGUARDANDO MENTOR'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {tx.proofUrl && (
                                                <button
                                                    onClick={() => setSelectedProof(tx.proofUrl!)}
                                                    style={{
                                                        background: '#fff', border: '1px solid #ddd', padding: '0.6rem',
                                                        borderRadius: '8px', cursor: 'pointer', color: '#1a1a1a',
                                                        display: 'flex', alignItems: 'center', gap: '5px'
                                                    }}
                                                    title="Ver Comprovativo"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                            {tx.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleConfirmPayment(tx._id)}
                                                        style={{
                                                            background: '#000', color: '#FFD700', border: 'none', padding: '0.6rem 0.8rem',
                                                            borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: '5px'
                                                        }}
                                                        title="Aprovar"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectPayment(tx._id)}
                                                        style={{
                                                            background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.6rem 0.8rem',
                                                            borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: '5px'
                                                        }}
                                                        title="Rejeitar"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDeleteTransaction(tx._id)}
                                                style={{
                                                    background: '#fff', border: '1px solid #ddd', color: '#999', padding: '0.6rem',
                                                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                                                }}
                                                title="Eliminar Registro"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
            {/* Proof Modal */}
            <AnimatePresence>
                {selectedProof && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProof(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(5px)' }} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ position: 'relative', background: '#fff', borderRadius: '24px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Comprovativo de Pagamento</h3>
                                <button onClick={() => setSelectedProof(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={24} /></button>
                            </div>
                            <div style={{ flex: 1, overflow: 'auto', background: '#f8f9fa', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                                {selectedProof.toLowerCase().includes('.pdf') ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <FileText size={64} color="#666" style={{ marginBottom: '1rem' }} />
                                        <p>Ficheiro PDF detectado.</p>
                                        <a href={selectedProof} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', background: '#000', color: '#FFD700', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, marginTop: '1rem' }}>
                                            <ExternalLink size={18} /> ABRIR PDF
                                        </a>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', minHeight: '500px' }}>
                                        <Image src={selectedProof} alt="Proof" fill style={{ objectFit: 'contain' }} unoptimized />
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', textAlign: 'right' }}>
                                <a href={selectedProof} download style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.2rem', background: '#f0f0f0', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                                    <Download size={16} /> DOWNLOAD ORIGINAL
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatsCard({ title, value, icon, color, subtitle, formattedValue }: { title: string, value: number, icon: React.ReactNode, color: string, subtitle: string, formattedValue?: string }) {
    return (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #eee', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: `${color}15`, color: color, width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: '#000', fontWeight: 800 }}>{title}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000' }}>
                        {formattedValue ? formattedValue : `${value.toLocaleString()} MT`}
                    </div>
                </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#333', borderTop: '1px solid #f5f5f5', paddingTop: '0.8rem', fontWeight: 600 }}>{subtitle}</p>
        </div>
    );
}
