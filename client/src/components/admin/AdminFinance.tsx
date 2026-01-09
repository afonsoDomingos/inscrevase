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

export default function AdminFinance() {
    const [transactions, setTransactions] = useState<TransactionModel[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    if (loading && !summary) return <div style={{ textAlign: 'center', padding: '4rem' }}>Carregando finanças...</div>;

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

            {/* Filter Bar */}
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '350px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Buscar por mentor ou evento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {['all', 'pending', 'completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
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
                            {filteredTransactions.map(tx => (
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
