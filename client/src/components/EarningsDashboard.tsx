'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Wallet, PieChart, ArrowUpRight, Clock, ChevronRight } from 'lucide-react';

export default function EarningsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEarnings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/earnings`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error loading earnings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadEarnings();
    }, []);

    if (loading) return <div>Carregando estatísticas financeiras...</div>;

    const summary = data?.summary || { totalRevenue: 0, totalEarnings: 0, totalFees: 0 };
    const transactions = data?.transactions || [];

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <FinanceCard
                    title="Receita Total"
                    value={`${summary.totalRevenue.toFixed(2)}`}
                    icon={<TrendingUp size={24} />}
                    color="#D4AF37"
                />
                <FinanceCard
                    title="Seus Ganhos"
                    value={`${summary.totalEarnings.toFixed(2)}`}
                    icon={<Wallet size={24} />}
                    color="#10b981"
                />
                <FinanceCard
                    title="Taxas da Plataforma"
                    value={`${summary.totalFees.toFixed(2)}`}
                    icon={<DollarSign size={24} />}
                    color="#666"
                />
            </div>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={20} color="#D4AF37" /> Transações Recentes
                </h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {transactions.length === 0 ? (
                        <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Nenhuma transação encontrada ainda.</p>
                    ) : (
                        transactions.map((tx: any) => (
                            <div key={tx._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{tx.form?.title || 'Evento'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: '#10b981' }}>+ {tx.amount} {tx.currency}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Líquido: {tx.mentorEarnings}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function FinanceCard({ title, value, icon, color }: any) {
    return (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{title}</span>
                {icon}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value} <span style={{ fontSize: '0.8rem', color: '#999' }}>MT</span></div>
        </div>
    );
}
