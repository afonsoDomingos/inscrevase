"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, ShieldCheck, Crown, Loader2, Info } from "lucide-react";
import Image from "next/image";
import { useCurrency } from "@/context/CurrencyContext";
import { useEffect, useState } from "react";
import { authService, UserData } from "@/lib/authService";
import { toast } from "sonner";

export default function InternalPlansView() {
    const { currency, setCurrency, formatPrice } = useCurrency();
    const [user, setUser] = useState<UserData | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleSubscribe = async (plan: string) => {
        if (plan === 'enterprise') {
            toast.info('Para o plano Enterprise, entre em contato com o nosso suporte prioritário.');
            return;
        }

        setLoadingPlan(plan);
        try {
            const token = authService.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/subscription/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan: plan.toLowerCase(),
                    currency: currency
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.message || 'Erro ao iniciar assinatura');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            toast.error('Erro ao conectar com o servidor de pagamentos');
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div className="luxury-card" style={{ background: 'var(--paper)', border: 'none', marginBottom: '3rem', textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-playfair)' }}>
                    Escolha o plano ideal para seu <span className="gold-text">Crescimento</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Selecione a moeda e o nível de parceria que melhor atende às suas necessidades atuais.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {['MZN', 'USD'].map((c) => (
                        <button
                            key={c}
                            onClick={() => setCurrency(c as any)}
                            style={{
                                padding: '8px 25px',
                                borderRadius: '50px',
                                border: currency === c ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: currency === c ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                color: currency === c ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Free Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--paper)', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Free</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Para quem está começando agora.</p>
                    </div>
                    <div style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 900 }}>Gratuito</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> Taxa de 15% por venda</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> Formulários Ilimitados</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> Gestão de Participantes</li>
                    </ul>
                    <button
                        disabled={user?.plan === 'free'}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--muted)', color: 'var(--text-muted)', border: 'none', fontWeight: 700 }}
                    >
                        {user?.plan === 'free' ? 'Plano Atual' : 'Plano Padrão'}
                    </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--primary)', background: 'var(--paper)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--gold-gradient)', color: '#000', padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 900 }}>RECOMENDADO</div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pro</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aumente seus lucros e visibilidade.</p>
                    </div>
                    <div style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 900 }}>
                        {formatPrice(499, 7.99)}<span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.6 }}>/mês</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700 }}><Zap size={18} color="#B8860B" /> Taxa reduzida de 10%</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> Selo de Verificado</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> Analytics Detalhado</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> Marketing Automático</li>
                    </ul>
                    <button
                        onClick={() => handleSubscribe('pro')}
                        disabled={loadingPlan === 'pro' || user?.plan === 'pro'}
                        className="btn-primary"
                        style={{ width: '100%', borderRadius: '12px' }}
                    >
                        {loadingPlan === 'pro' ? <Loader2 className="animate-spin" size={20} /> : (user?.plan === 'pro' ? 'Plano Atual' : 'Atualizar para Pro')}
                    </button>
                </motion.div>

                {/* Enterprise Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--secondary)', color: 'var(--paper)', border: 'none' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--paper)' }}>Enterprise</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>O máximo de performance.</p>
                    </div>
                    <div style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 900, color: '#FFD700' }}>
                        {formatPrice(4990, 79.90)}<span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.6, color: 'var(--paper)' }}>/mês</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 900, color: '#FFD700' }}><Crown size={18} /> TAXA 0% (Isenção Total)</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><ShieldCheck size={18} /> Suporte VIP 24/7</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><ShieldCheck size={18} /> Branding Customizado</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} /> API de Integração</li>
                    </ul>
                    <button
                        onClick={() => handleSubscribe('enterprise')}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--paper)', color: 'var(--secondary)', border: 'none', fontWeight: 900, cursor: 'pointer' }}
                    >
                        Contactar Consultor
                    </button>
                </motion.div>
            </div>

            <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '20px', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid var(--border)' }}>
                <Info size={32} color="var(--primary)" />
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Todos os planos incluem acesso a ferramentas de gestão financeira e suporte básico. As taxas de plataforma são aplicadas apenas sobre o valor líquido das inscrições processadas. O upgrade é imediato e a cobrança é pro-rata.
                </p>
            </div>
        </div>
    );
}
