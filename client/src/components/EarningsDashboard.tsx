'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import StripeConnect from './StripeConnect';
import PlanUpgradeModal from './PlanUpgradeModal';
import { UserData, authService } from '@/lib/authService';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Transaction {
    _id: string;
    form: { title: string };
    amount: number;
    currency: string;
    mentorEarnings: number;
    createdAt: string;
}

interface EarningsData {
    summary: {
        totalRevenue: number;
        totalEarnings: number;
        totalFees: number;
        pendingFees: number;
    };
    chartData: { date: string; revenue: number }[];
    transactions: Transaction[];
}

export default function EarningsDashboard() {
    const [data, setData] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    useEffect(() => {
        const loadEarnings = async () => {
            try {
                const token = Cookies.get('token');
                const [earningsRes, profile] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/earnings`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    authService.getProfile()
                ]);

                const result = await earningsRes.json();
                setData(result);
                setUser(profile);
            } catch (error) {
                console.error('Error loading earnings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadEarnings();
    }, []);

    if (loading) return <div>Carregando estatísticas financeiras...</div>;

    const summary = data?.summary || { totalRevenue: 0, totalEarnings: 0, totalFees: 0, pendingFees: 0 };
    const transactions = data?.transactions || [];

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <StripeConnect />
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
                    title="Taxas Pagas"
                    value={`${summary.totalFees.toFixed(2)}`}
                    icon={<DollarSign size={24} />}
                    color="#666"
                />
            </div>

            {/* Performance Chart */}
            <div style={{
                background: '#fff',
                padding: '2rem',
                borderRadius: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                minHeight: '400px'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a1b' }}>Desempenho de Vendas</h3>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>Volume de receita diária nos últimos 30 dias</p>
                </div>

                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.chartData || []}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#999' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#999' }}
                                tickFormatter={(value) => `${value} MT`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontWeight: 800, color: '#D4AF37' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#D4AF37"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRev)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {summary.pendingFees > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#fff7ed',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        border: '1px solid #ffedd5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#f59e0b', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '0.9rem' }}>Taxas da Plataforma Pendentes</div>
                            <div style={{ fontSize: '0.8rem', color: '#c2410c' }}>Você possui {summary.pendingFees.toFixed(2)} MT em taxas de inscrições manuais a conciliar com a administração.</div>
                        </div>
                    </div>
                </motion.div>
            )}

            {user?.plan === 'free' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#1a1a1a',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        color: '#fff'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'var(--gold-gradient)', color: '#000', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: '#FFD700', fontSize: '0.9rem' }}>Reduza suas Taxas</div>
                            <div style={{ fontSize: '0.8rem', color: '#999' }}>Sua comissão atual é de 15%. No plano PRO ela cai para 10%.</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        style={{
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            border: 'none',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        Ver Planos <ArrowUpRight size={16} />
                    </button>
                </motion.div>
            )}

            <PlanUpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
            />

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={20} color="#D4AF37" /> Transações Recentes
                </h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {transactions.length === 0 ? (
                        <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Nenhuma transação encontrada ainda.</p>
                    ) : (
                        transactions.map((tx: Transaction) => (
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

function FinanceCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
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
