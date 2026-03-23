"use client";

import { useState, useEffect, useCallback } from 'react';
import { financeService, TransactionModel, FinancialSummary } from '@/lib/financeService';
import { logService, PaymentAttemptLog } from '@/lib/logService';
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
    RefreshCcw,
    CreditCard
} from 'lucide-react';
import Cookies from 'js-cookie';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import TableScrollWrapper from '../common/TableScrollWrapper';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { useTranslate } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import Tooltip from '@/components/common/Tooltip';

export default function AdminFinance() {
    const { t } = useTranslate();
    const { currency, formatPrice } = useCurrency();
    const [transactions, setTransactions] = useState<TransactionModel[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [isRefreshingRate, setIsRefreshingRate] = useState(false);
    const [activeTab, setActiveTab] = useState<'transactions' | 'attempts'>('transactions');
    const [attempts, setAttempts] = useState<PaymentAttemptLog[]>([]);
    const [loadingAttempts, setLoadingAttempts] = useState(false);


    const [processingCapture, setProcessingCapture] = useState<string | null>(null);
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthNames = monthKeys.map(key => t(`common.months.${key}`));

    const getConvertedValue = useCallback((valueMZN: number) => {
        // We use formatPrice logic which is more robust, but for charts we need numbers.
        // The summary from backend usually comes in MZN (base for locally recorded transactions)
        // or USD (for Stripe). 
        // In this component, we'll assume base values are MZN for local records.
        // However, it's safer to just return the value if we don't have a specific conversion need here
        // or use a helper that doesn't return a string.
        return valueMZN;
    }, []);

    const formatCurrency = useCallback((value: number) => {
        // Base value in the finance system is typically MZN (for local) or USD (for stripe)
        // But for display consistency, we'll use formatPrice from MZN to current target
        return formatPrice(value, 'MZN', currency);
    }, [currency, formatPrice]);


    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const status = statusFilter === 'all' ? undefined : statusFilter;
            const method = paymentMethodFilter === 'all' ? undefined : paymentMethodFilter;
            const [txData, summaryData] = await Promise.all([
                financeService.getAdminTransactions(status, method),
                financeService.getAdminSummary()
            ]);
            setTransactions(txData);
            setSummary(summaryData);
        } catch (error) {
            console.error(error);
            toast.error(t('dashboard.adminFinance.messages.loadError'));
        } finally {
            setLoading(false);
        }
    }, [statusFilter, paymentMethodFilter, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (activeTab === 'attempts') {
            loadAttempts();
        }
    }, [activeTab]);

    const loadAttempts = async () => {
        try {
            setLoadingAttempts(true);
            const data = await logService.getPaymentAttempts();
            setAttempts(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar tentativas de pagamento");
        } finally {
            setLoadingAttempts(false);
        }
    };

    const handleConfirmPayment = async (id: string) => {
        if (!confirm(t('dashboard.adminFinance.messages.confirmPayment'))) return;
        try {
            const res = await financeService.confirmPayment(id);
            if (res.success) {
                toast.success(t('dashboard.adminFinance.messages.paymentSuccess'));
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error(t('dashboard.adminFinance.messages.approveError'));
        }
    };


    const handleManualCapture = async (orderId: string) => {
        if (!orderId) return;
        try {
            setProcessingCapture(orderId);
            toast.loading("Tentando capturar pagamento no PayPal...");
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paypal/orders/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ orderID: orderId }),
            });

            const data = await response.json();
            toast.dismiss();

            if (response.ok && data.success) {
                toast.success("Pagamento capturado com sucesso!");
                loadAttempts();
            toast.dismiss();
            toast.error(`Erro: ${error.message}`);
        }
    };

    const handleRejectPayment = async (id: string) => {
        if (!confirm(t('dashboard.adminFinance.messages.rejectConfirm'))) return;
        try {
            const res = await financeService.rejectPayment(id);
            if (res.success) {
                toast.success(t('dashboard.adminFinance.messages.rejectSuccess'));
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error(t('dashboard.adminFinance.messages.rejectError'));
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm(t('dashboard.adminFinance.messages.deleteConfirm'))) return;
        try {
            const res = await financeService.deleteTransaction(id);
            if (res.success) {
                toast.success(t('dashboard.adminFinance.messages.deleteSuccess'));
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error(t('dashboard.adminFinance.messages.deleteError'));
        }
    };

    const handleRefreshRate = async () => {
        try {
            setIsRefreshingRate(true);
            const res = await financeService.refreshExchangeRate();
            if (res.success) {
                toast.success(t('dashboard.adminFinance.messages.refreshRateSuccess', {
                    marketRate: res.marketRate,
                    adjustedRate: res.adjustedRate.toFixed(2)
                }));
                loadData();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('dashboard.adminFinance.messages.refreshRateError'));
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

    if (loading && !summary) return <div style={{ textAlign: 'center', padding: '4rem' }}>{t('dashboard.adminFinance.messages.loading')}</div>;

    const chartData = summary?.monthlyStats?.map((s: { month: number; platformFees: number; revenue: number }) => ({
        name: monthNames[s.month],
        fees: getConvertedValue(s.platformFees),
        revenue: getConvertedValue(s.revenue)
    })) || [];

    const pieData = summary?.paymentMethods ? Object.entries(summary.paymentMethods).map(([name, value]: [string, number]) => ({
        name: name === 'stripe' ? 'Stripe (Card)' : (name === 'paypal' ? 'PayPal' : (name === 'manual' ? t('common.manualPayment') : name)),
        value
    })) : [];

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('transactions')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'transactions' ? '#000' : 'transparent',
                        color: activeTab === 'transactions' ? '#FFD700' : '#666',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    {t('dashboard.adminFinance.transactionsTab')}
                </button>
                <button
                    onClick={() => setActiveTab('attempts')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'attempts' ? '#000' : 'transparent',
                        color: activeTab === 'attempts' ? '#FFD700' : '#666',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Clock size={16} /> {t('dashboard.adminFinance.attemptsTab')}
                </button>
            </div>

            {activeTab === 'transactions' ? (
                <>

            {/* Header Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatsCard
                    title={t('dashboard.adminFinance.totalRevenue')}
                    value={summary?.totalRevenue || 0}
                    icon={<TrendingUp size={24} />}
                    color="#D4AF37"
                    subtitle={t('dashboard.adminFinance.stats.totalProcessed')}
                    formattedValue={formatCurrency(summary?.totalRevenue || 0)}
                />
                <StatsCard
                    title={t('dashboard.adminFinance.subscriptionRevenue')}
                    value={summary?.subscriptionRevenue || 0}
                    icon={<TrendingUp size={24} />}
                    color="#6366f1"
                    subtitle={t('dashboard.adminFinance.stats.mentorUpgrades')}
                    formattedValue={formatCurrency(summary?.subscriptionRevenue || 0)}
                />
                <StatsCard
                    title={t('dashboard.adminFinance.eventFeeRevenue')}
                    value={summary?.eventFeeRevenue || 0}
                    icon={<TrendingUp size={24} />}
                    color="#10b981"
                    subtitle={t('dashboard.adminFinance.stats.collectedFees')}
                    formattedValue={formatCurrency(summary?.eventFeeRevenue || 0)}
                />
                <StatsCard
                    title={t('dashboard.adminFinance.pendingFees')}
                    value={summary?.pendingFees || 0}
                    icon={<Clock size={24} />}
                    color="#f59e0b"
                    subtitle={t('dashboard.adminFinance.stats.manualCharges')}
                    formattedValue={formatCurrency(summary?.pendingFees || 0)}
                />
            </div>

            {/* Analytics Grid */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Monthly Growth Chart */}
                <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', height: '400px' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('dashboard.adminFinance.growthChart')}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#1a1a1a', fontWeight: 600 }}>{t('dashboard.adminFinance.growthChartSubtitle', { currency })}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Tooltip content={t('dashboard.adminFinance.messages.syncExchangeTooltip')}>
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
                                >
                                    <RefreshCcw size={18} className={isRefreshingRate ? 'animate-spin' : ''} />
                                    {isRefreshingRate ? t('dashboard.adminFinance.messages.syncing') : t('dashboard.adminFinance.messages.syncExchange')}
                                </motion.button>
                            </Tooltip>

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
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    formatter={(value: string | number | undefined) => [formatPrice(Number(value || 0), 'MZN', currency), 'Taxa Plataforma']}
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
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('dashboard.adminFinance.paymentMethods')}</h3>
                            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1.5rem' }}>{t('dashboard.adminFinance.paymentMethodsSubtitle')}</p>
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
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>{t('dashboard.adminFinance.topMentors')}</h3>
                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                            {summary?.topMentors?.map((m: { name: string; business: string; platformFees: number }, idx: number) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: idx < 4 ? '1px solid #f9f9f9' : 'none' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#999' }}>{m.business}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>+{formatCurrency(m.platformFees)}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#ccc' }}>{t('dashboard.adminFinance.topMentorsFees')}</div>
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
                        placeholder={t('dashboard.adminFinance.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                        style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-start', width: '100%', maxWidth: '100%' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {['all', 'pending', 'completed', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setCurrentPage(1); // Reset page on filter change
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '10px',
                                    border: '1px solid #eee',
                                    background: statusFilter === status ? '#000' : '#f8f9fa',
                                    color: statusFilter === status ? '#FFD700' : '#666',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {status === 'all' ? t('dashboard.adminFinance.allStatus') : t(`dashboard.adminFinance.status.${status}`)}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {[
                            { id: 'all', label: 'Todos Métodos' },
                            { id: 'stripe', label: 'Stripe' },
                            { id: 'paypal', label: 'PayPal' },
                            { id: 'manual', label: 'Manual' }
                        ].map(method => (
                            <button
                                key={method.id}
                                onClick={() => {
                                    setPaymentMethodFilter(method.id);
                                    setCurrentPage(1);
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '10px',
                                    border: '1px solid #eee',
                                    background: paymentMethodFilter === method.id ? '#003087' : '#f8f9fa',
                                    color: paymentMethodFilter === method.id ? '#fff' : '#666',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.8rem'
                                }}
                            >
                                {method.id === 'all' ? t('dashboard.adminFinance.allMethods') : method.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <TableScrollWrapper>
                <table style={{ minWidth: '1000px', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>{t('dashboard.adminFinance.table.mentorBusiness')}</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>{t('dashboard.adminFinance.table.eventMethod')}</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>{t('dashboard.adminFinance.table.totalAmount')}</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>{t('dashboard.adminFinance.table.platformFee')}</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800 }}>{t('dashboard.adminFinance.table.status')}</th>
                            <th style={{ padding: '1.2rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 800, textAlign: 'right' }}>{t('dashboard.adminFinance.table.actions')}</th>
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
                                        <div style={{ fontWeight: 700 }}>{tx.mentor?.name || tx.user?.name || t('common.system')}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{tx.mentor?.businessName || tx.user?.businessName || tx.mentor?.email || tx.user?.email || t('dashboard.adminFinance.table.directSubscription')}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: 600 }}>{tx.type === 'subscription' ? t('dashboard.adminFinance.table.subscription', { plan: tx.metadata?.plan || t('common.upgrade') }) : (tx.form?.title || t('common.event'))}</div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            color: tx.paymentMethod === 'stripe' ? '#6366f1' : (tx.paymentMethod === 'paypal' ? '#003087' : '#f59e0b')
                                        }}>
                                            {tx.paymentMethod?.toUpperCase()}
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
                                            {t(`dashboard.adminFinance.statusLabels.${tx.status}`)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {tx.proofUrl && (
                                                <Tooltip content={t('dashboard.adminFinance.actions.viewProof')}>
                                                    <button
                                                        onClick={() => setSelectedProof(tx.proofUrl!)}
                                                        style={{
                                                            background: '#fff', border: '1px solid #ddd', padding: '0.6rem',
                                                            borderRadius: '8px', cursor: 'pointer', color: '#1a1a1a',
                                                            display: 'flex', alignItems: 'center', gap: '5px'
                                                        }}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {tx.status === 'pending' && (
                                                <>
                                                    <Tooltip content={t('dashboard.adminFinance.actions.approve')}>
                                                        <button
                                                            onClick={() => handleConfirmPayment(tx._id)}
                                                            style={{
                                                                background: '#000', color: '#FFD700', border: 'none', padding: '0.6rem 0.8rem',
                                                                borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: '5px'
                                                            }}
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip content={t('dashboard.adminFinance.actions.reject')}>
                                                        <button
                                                            onClick={() => handleRejectPayment(tx._id)}
                                                            style={{
                                                                background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.6rem 0.8rem',
                                                                borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: '5px'
                                                            }}
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip content={t('dashboard.adminFinance.actions.delete')}>
                                                <button
                                                    onClick={() => handleDeleteTransaction(tx._id)}
                                                    style={{
                                                        background: '#fff', border: '1px solid #ddd', color: '#999', padding: '0.6rem',
                                                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </Tooltip>
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
                        <p>{t('dashboard.adminFinance.messages.noTransactions')}</p>
                    </div>
                )}
            </TableScrollWrapper>

            {/* Pagination Controls */}
            {filteredTransactions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                    <div>
                        {t('dashboard.adminFinance.messages.pagination', {
                            start: indexOfFirstItem + 1,
                            end: Math.min(indexOfLastItem, filteredTransactions.length),
                            total: filteredTransactions.length
                        })}
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
                            {t('common.previous')}
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
                            {t('common.next')}
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
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('dashboard.adminFinance.proofModal.title')}</h3>
                                <button onClick={() => setSelectedProof(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={24} /></button>
                            </div>
                            <div style={{ flex: 1, overflow: 'auto', background: '#f8f9fa', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                                {selectedProof.toLowerCase().includes('.pdf') ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <FileText size={64} color="#666" style={{ marginBottom: '1rem' }} />
                                        <p>{t('dashboard.adminFinance.proofModal.pdfDetected')}</p>
                                        <a href={selectedProof} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', background: '#000', color: '#FFD700', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, marginTop: '1rem' }}>
                                            <ExternalLink size={18} /> {t('dashboard.adminFinance.proofModal.openPdf')}
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
                                    <Download size={16} /> {t('dashboard.adminFinance.proofModal.downloadOriginal')}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
                </>
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="luxury-card" style={{ background: '#fff', padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>{t('dashboard.adminFinance.attempts.title')}</h2>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>{t('dashboard.adminFinance.attempts.subtitle')}</p>
                        </div>
                        <button 
                            onClick={loadAttempts} 
                            disabled={loadingAttempts}
                            style={{ 
                                background: '#eee', border: 'none', padding: '10px 20px', borderRadius: '12px', 
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 
                            }}
                        >
                            <RefreshCcw size={16} className={loadingAttempts ? 'animate-spin' : ''} /> 
                            {t('common.refresh')}
                        </button>
                    </div>

                    <TableScrollWrapper>
                        <table style={{ minWidth: '1000px', width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('dashboard.adminFinance.attempts.table.userMentor')}</th>
                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('dashboard.adminFinance.attempts.table.eventDetails')}</th>
                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('dashboard.adminFinance.attempts.table.orderId')}</th>
                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('dashboard.adminFinance.attempts.table.status')}</th>
                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('dashboard.adminFinance.attempts.table.lastUpdate')}</th>
                                    <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>{t('dashboard.adminFinance.attempts.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingAttempts ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }}>
                                            <RefreshCcw size={32} className="animate-spin" style={{ margin: '0 auto', color: '#ccc' }} />
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {attempts.map((attempt) => {
                                            const paypalOrderId = attempt.metadata?.orderID as string || attempt.metadata?.orderId as string;
                                            const formTitle = attempt.metadata?.formTitle as string || attempt.type;
                                            return (
                                                <tr key={attempt._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                    <td style={{ padding: '1.2rem' }}>
                                                        <div style={{ fontWeight: 700 }}>{attempt.userId?.name || 'Anon'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{attempt.userId?.email || '-'}</div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem' }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{formTitle}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>{attempt.amount} {attempt.currency}</div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#666' }}>
                                                        {paypalOrderId || '-'}
                                                    </td>
                                                    <td style={{ padding: '1.2rem' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 800,
                                                            background: attempt.status === 'completed' ? '#38a16915' : attempt.status === 'capture_failed' ? '#e53e3e15' : '#f59e0b15',
                                                            color: attempt.status === 'completed' ? '#38a169' : attempt.status === 'capture_failed' ? '#e53e3e' : '#b45309',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {attempt.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem', fontSize: '0.8rem', color: '#888' }}>
                                                        {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString() : '-'}
                                                    </td>
                                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                                        {(attempt.status === 'capture_started' || attempt.status === 'capture_failed' || (attempt.status === 'initiated' && paypalOrderId)) ? (
                                                            <button
                                                                onClick={() => handleManualCapture(paypalOrderId)}
                                                                disabled={processingCapture === paypalOrderId}
                                                                style={{
                                                                    padding: '0.5rem 1rem',
                                                                    background: '#003087',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 800,
                                                                    cursor: processingCapture === paypalOrderId ? 'not-allowed' : 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                }}
                                                            >
                                                                {processingCapture === paypalOrderId ? (
                                                                    <><RefreshCcw size={14} className="animate-spin" /> {t('dashboard.adminFinance.attempts.table.capturing')}</>
                                                                ) : (
                                                                    <><RefreshCcw size={14} /> {t('dashboard.adminFinance.attempts.table.captureNow')}</>
                                                                )}
                                                            </button>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {attempts.length === 0 && (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
                                                    <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                                    <p>{t('dashboard.adminFinance.attempts.table.noAttempts')}</p>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </TableScrollWrapper>
                </motion.div>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, color, subtitle, formattedValue }: { title: string, value: number, icon: React.ReactNode, color: string, subtitle: string, formattedValue?: string }) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="luxury-card"
            style={{
                background: '#fff',
                padding: '1.5rem',
                border: '1px solid #eee',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--gold-gradient)' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    background: `${color}15`,
                    color: color,
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: '#1a1a1a', margin: 0, letterSpacing: '-0.5px' }}>
                    {formattedValue ? formattedValue : `${value.toLocaleString()} MT`}
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', fontWeight: 500 }}>{subtitle}</p>
            </div>

            {/* Subtle background element */}
            <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', width: '60px', height: '60px', background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`, borderRadius: '50%' }} />
        </motion.div>
    );
}
