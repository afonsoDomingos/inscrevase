"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, DollarSign, Percent, TrendingUp, Globe, Shield, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface PlanConfig {
    name: string;
    commissionRate: number;
    prices: {
        MZN: number;
        USD: number;
    };
    interval: string;
}

interface SystemSettingsData {
    plans: {
        free: PlanConfig;
        pro: PlanConfig;
        enterprise: PlanConfig;
    };
    exchangeRate: number;
}

export default function SystemSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SystemSettingsData | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSettings({
                    plans: data.plans,
                    exchangeRate: data.rate
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (plan: 'free' | 'pro' | 'enterprise', currency: 'MZN' | 'USD', value: string) => {
        if (!settings) return;
        const newSettings = { ...settings };
        newSettings.plans[plan].prices[currency] = Number(value) * 100; // Convert to cents
        setSettings(newSettings);
    };

    const handleCommissionChange = (plan: 'free' | 'pro' | 'enterprise', value: string) => {
        if (!settings) return;
        const newSettings = { ...settings };
        newSettings.plans[plan].commissionRate = Number(value) / 100; // Convert percentage to decimal
        setSettings(newSettings);
    };

    const handleSavePlans = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/plans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ plans: settings.plans })
            });

            if (response.ok) {
                toast.success('Configurações de planos atualizadas!');
            } else {
                throw new Error('Erro ao salvar');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 className="animate-spin" size={32} color="#D4AF37" />
        </div>
    );

    if (!settings) return <div>Erro ao carregar dados.</div>;

    const planKeys: ('free' | 'pro' | 'enterprise')[] = ['free', 'pro', 'enterprise'];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>Gestão de <span className="gold-text">Planos e Taxas</span></h2>
                    <p style={{ color: '#666' }}>Configure os preços das assinaturas e as comissões da plataforma.</p>
                </div>
                <button
                    onClick={handleSavePlans}
                    disabled={saving}
                    style={{
                        padding: '0.8rem 1.8rem',
                        background: 'var(--gold-gradient)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Salvar Alterações
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {planKeys.map((key) => {
                    const plan = settings.plans[key];
                    const Icon = key === 'enterprise' ? Crown : (key === 'pro' ? Zap : Shield);
                    const color = key === 'enterprise' ? '#000' : (key === 'pro' ? '#D4AF37' : '#666');

                    return (
                        <motion.div
                            key={key}
                            whileHover={{ y: -5 }}
                            style={{
                                background: '#fff',
                                padding: '2rem',
                                borderRadius: '24px',
                                border: `1px solid ${color}20`,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <div style={{ background: `${color}10`, color, padding: '10px', borderRadius: '12px' }}>
                                    <Icon size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'capitalize' }}>{plan.name}</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        <Percent size={14} /> Comissão da Plataforma (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={plan.commissionRate * 100}
                                        onChange={(e) => handleCommissionChange(key, e.target.value)}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 600 }}
                                    />
                                </div>

                                {key !== 'free' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                                                <div style={{ fontSize: '14px' }}>MT</div> Preço em Meticais (MZN)
                                            </label>
                                            <input
                                                type="number"
                                                value={plan.prices.MZN / 100}
                                                onChange={(e) => handlePriceChange(key, 'MZN', e.target.value)}
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 600 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                                                <DollarSign size={14} /> Preço em Dólares (USD)
                                            </label>
                                            <input
                                                type="number"
                                                value={plan.prices.USD / 100}
                                                onChange={(e) => handlePriceChange(key, 'USD', e.target.value)}
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 600 }}
                                            />
                                        </div>
                                    </>
                                )}

                                {key === 'free' && (
                                    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', fontSize: '0.85rem', color: '#666', border: '1px dashed #ddd' }}>
                                        O plano gratuito não possui mensalidade. Apenas a taxa de comissão sobre vendas é aplicada.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ marginTop: '3rem', padding: '2rem', background: '#f8f9fa', borderRadius: '24px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#3182ce15', color: '#3182ce', padding: '12px', borderRadius: '15px' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, margin: 0 }}>Parâmetros da Rede</h4>
                        <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>A taxa de câmbio é atualizada automaticamente a cada 24h via API.</p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 800, textTransform: 'uppercase' }}>Taxa Atual (USD / MZN)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>1.00 USD = {settings.exchangeRate.toFixed(2)} MT</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
