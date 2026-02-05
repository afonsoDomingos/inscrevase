"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, ShieldCheck, Crown, Loader2, Info, Clock } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useEffect, useState } from "react";
import { authService, UserData } from "@/lib/authService";
import { toast } from "sonner";
import PlanUpgradeModal from "@/components/PlanUpgradeModal";
import { useTranslate } from "@/context/LanguageContext";

export default function InternalPlansView() {
    const { t } = useTranslate();
    const { currency, setCurrency, formatPrice, getPlanPrice } = useCurrency();
    const [user, setUser] = useState<UserData | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [pendingSub, setPendingSub] = useState<{ pending: boolean; plan: string | null } | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        const checkPendingSub = async () => {
            try {
                const token = authService.getToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/my-subscription-status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) setPendingSub(data);
            } catch (err) {
                console.error('Error checking pending sub:', err);
            }
        };

        checkPendingSub();
    }, []);

    const handleSubscribe = async (plan: string) => {
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
                    {t('plans.chooseIdeal')} <span className="gold-text">{t('common.growth')}</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    {t('plans.selectSubtitle')}
                </p>

                {pendingSub?.pending && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1px solid #D4AF37',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            maxWidth: '600px',
                            margin: '0 auto 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}
                    >
                        <div style={{ background: '#D4AF37', color: '#000', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                            <Clock size={20} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 800, color: '#D4AF37', fontSize: '0.9rem', marginBottom: '4px' }}>{t('plans.pendingStatus')}</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                                {t('plans.receivedProof')} <b>{pendingSub.plan?.toUpperCase()}</b>. {t('plans.validationMessage')}
                            </p>
                        </div>
                    </motion.div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {['MZN', 'USD'].map((c) => (
                        <button
                            key={c}
                            onClick={() => setCurrency(c as 'MZN' | 'USD')}
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
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('plans.free.description')}</p>
                    </div>
                    <div style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 900 }}>{t('common.free')}</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> {t('plans.free.fee').replace('• ', '')}</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> {t('plans.unlimitedForms')}</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> {t('plans.participantManagement')}</li>
                    </ul>
                    <button
                        disabled={user?.plan === 'free'}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--muted)', color: 'var(--text-muted)', border: 'none', fontWeight: 700 }}
                    >
                        {user?.plan === 'free' ? t('plans.currentPlan') : t('plans.standardPlan')}
                    </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--primary)', background: 'var(--paper)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--gold-gradient)', color: '#000', padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 900 }}>{t('common.recommended')}</div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pro</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('plans.pro.description')}</p>
                    </div>
                    <div style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 900 }}>
                        {formatPrice(getPlanPrice('pro'), currency, currency)}<span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.6 }}>{t('plans.perMonth')}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700 }}><Zap size={18} color="#B8860B" /> {t('plans.f1').replace('• ', '')}</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> {t('plans.f2').replace('• ', '')}</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> {t('plans.pro.f1').replace('• ', '')}</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#B8860B" /> {t('plans.pro.f2').replace('• ', '')}</li>
                    </ul>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            onClick={() => handleSubscribe('pro')}
                            disabled={loadingPlan === 'pro' || user?.plan === 'pro'}
                            className="btn-primary"
                            style={{ width: '100%', borderRadius: '12px' }}
                        >
                            {loadingPlan === 'pro' ? <Loader2 className="animate-spin" size={20} /> : (user?.plan === 'pro' ? t('plans.currentPlan') : t('plans.payWithCardStripe'))}
                        </button>
                        {user?.plan !== 'pro' && (
                            <button
                                onClick={() => setIsUpgradeModalOpen(true)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
                            >
                                {t('plans.alternativePayment')}
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Enterprise Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--secondary)', color: 'var(--paper)', border: 'none' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--paper)' }}>Enterprise</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{t('plans.enterprise.description')}</p>
                    </div>
                    <div style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 900, color: '#FFD700' }}>
                        {formatPrice(getPlanPrice('enterprise'), currency, currency)}<span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.6, color: 'var(--paper)' }}>{t('plans.perMonth')}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 900, color: '#FFD700' }}><Crown size={18} /> {t('plans.enterprise.fee').replace('• ', '')}</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><ShieldCheck size={18} /> {t('plans.enterprise.f1').replace('• ', '')}</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><ShieldCheck size={18} /> {t('plans.enterprise.f2').replace('• ', '')}</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} /> {t('plans.apiIntegration')}</li>
                    </ul>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            onClick={() => handleSubscribe('enterprise')}
                            disabled={loadingPlan === 'enterprise' || user?.plan === 'enterprise'}
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--paper)', color: 'var(--secondary)', border: 'none', fontWeight: 900, cursor: 'pointer' }}
                        >
                            {loadingPlan === 'enterprise' ? <Loader2 className="animate-spin" size={20} /> : (user?.plan === 'enterprise' ? t('plans.currentPlan') : t('plans.payWithCardStripe'))}
                        </button>
                        {user?.plan !== 'enterprise' && (
                            <button
                                onClick={() => setIsUpgradeModalOpen(true)}
                                style={{
                                    width: '100%', padding: '0.8rem', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                {t('plans.alternativePayment')}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>

            <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '20px', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid var(--border)' }}>
                <Info size={32} color="var(--primary)" />
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {t('plans.footerInfo')}
                </p>
            </div>
            <PlanUpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
}
