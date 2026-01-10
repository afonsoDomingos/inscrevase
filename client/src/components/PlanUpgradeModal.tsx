'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Crown, Sparkles, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useCurrency } from '@/context/CurrencyContext';

export default function PlanUpgradeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [loading, setLoading] = useState<string | null>(null);
    const { currency, setCurrency, formatPrice } = useCurrency();

    const handleUpgrade = async (plan: string) => {
        try {
            setLoading(plan);
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/subscription/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ plan, currency })
            });
            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Upgrade error:', error);
            setLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: '#fff', borderRadius: '32px', maxWidth: '900px', width: '100%', padding: '40px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Escolha seu Plano 💎</h2>
                    <p style={{ color: '#666' }}>Aumente seu alcance e reduza comissões</p>

                    {/* Currency Selector */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '1.5rem'
                    }}>
                        <button
                            onClick={() => setCurrency('MZN')}
                            style={{
                                padding: '6px 20px',
                                borderRadius: '20px',
                                border: '1px solid #eee',
                                background: currency === 'MZN' ? '#1a1a1b' : '#fff',
                                color: currency === 'MZN' ? '#fff' : '#1a1a1b',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            MT
                        </button>
                        <button
                            onClick={() => setCurrency('USD')}
                            style={{
                                padding: '6px 20px',
                                borderRadius: '20px',
                                border: '1px solid #eee',
                                background: currency === 'USD' ? '#1a1a1b' : '#fff',
                                color: currency === 'USD' ? '#fff' : '#1a1a1b',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            USD
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <PlanCard
                        name="Pro"
                        price={formatPrice(499, 7.99)}
                        color="#D4AF37"
                        icon={<Sparkles size={24} />}
                        features={['Taxa reduzida de 10%', 'Destaque no Showcase', 'Suporte Prioritário']}
                        onSelect={() => handleUpgrade('pro')}
                        loading={loading === 'pro'}
                    />
                    <PlanCard
                        name="Enterprise"
                        price={formatPrice(4990, 79.90)}
                        color="#000"
                        icon={<Crown size={24} />}
                        features={['TAXA 0% (Isenção Total)', 'Customização de Branding', 'Account Manager VIP']}
                        onSelect={() => handleUpgrade('enterprise')}
                        loading={loading === 'enterprise'}
                    />
                </div>
            </motion.div>
        </div>
    );
}

interface PlanCardProps {
    name: string;
    price: string;
    color: string;
    icon: React.ReactNode;
    features: string[];
    onSelect: () => void;
    loading: boolean;
}

function PlanCard({ name, price, color, icon, features, onSelect, loading }: PlanCardProps) {
    return (
        <div style={{ border: `2px solid ${color}20`, padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ background: `${color}10`, color: color, padding: '15px', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>{name}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>{price} <span style={{ fontSize: '1rem', color: '#999' }}>/mês</span></div>

            <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                {features.map((f: string) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.9rem' }}>
                        <Check size={16} color="#10b981" /> {f}
                    </div>
                ))}
            </div>

            <button
                onClick={onSelect}
                disabled={loading}
                style={{ width: '100%', padding: '1rem', background: color, color: color === '#000' ? '#fff' : '#000', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : `Assinar ${name}`}
            </button>
        </div>
    );
}
