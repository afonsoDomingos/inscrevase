"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, ShieldCheck, Crown, Loader2, Info, Clock } from "lucide-react";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { useEffect, useState } from "react";
import { authService, UserData } from "@/lib/authService";
import { toast } from "sonner";
import PlanUpgradeModal from "@/components/PlanUpgradeModal";
import { useTranslate } from "@/context/LanguageContext";
import PaypalButton from "./PaypalButton";

export default function PlansSection({ showTitle = true }: { showTitle?: boolean }) {
    const { t } = useTranslate();
    const { currency, setCurrency, formatPrice, getPlanPrice, getPlanConfig } = useCurrency();
    const [user, setUser] = useState<UserData | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [selectedManualPlan, setSelectedManualPlan] = useState<{ id: string, amount: number } | null>(null);
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
        if (!user) {
            window.location.href = `/cadastro?plan=${plan.toLowerCase()}`;
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
            {showTitle && (
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

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setCurrency('USD')}
                            style={{
                                padding: '8px 25px',
                                borderRadius: '50px',
                                border: currency === 'USD' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: currency === 'USD' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                color: currency === 'USD' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            USD
                        </button>
                        <button
                            onClick={() => setCurrency('EUR')}
                            style={{
                                padding: '8px 25px',
                                borderRadius: '50px',
                                border: currency === 'EUR' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: currency === 'EUR' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                color: currency === 'EUR' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            EUR
                        </button>
                        <select
                            value={['MZN', 'AOA', 'CVE', 'XOF'].includes(currency) ? currency : ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                const PALOP = ['MZN', 'AOA', 'CVE', 'XOF'];
                                if (value && PALOP.includes(value)) {
                                    setCurrency(value as Currency);
                                }
                            }}
                            style={{
                                padding: '8px 25px',
                                borderRadius: '50px',
                                border: ['MZN', 'AOA', 'CVE', 'XOF'].includes(currency) ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: ['MZN', 'AOA', 'CVE', 'XOF'].includes(currency) ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                color: ['MZN', 'AOA', 'CVE', 'XOF'].includes(currency) ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                        >
                            <option value="" disabled>{t('common.palop') || 'África (PALOP)'}</option>
                            <option value="MZN">🇲🇿 Metical (MZ)</option>
                            <option value="AOA">🇦🇴 Kwanza (AO)</option>
                            <option value="CVE">🇨🇻 Escudo (CV)</option>
                            <option value="XOF">🇬🇼 Franco CFA (GW)</option>
                        </select>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Free Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{
                    flex: '1 1 280px', maxWidth: '340px', display: 'flex', flexDirection: 'column',
                    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop")',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem 1.2rem', borderRadius: '20px', color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.2rem', fontFamily: 'var(--font-playfair)' }}>Free</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>{t('plans.free.description')}</p>
                    </div>
                    <div style={{ marginBottom: '1rem', fontSize: '2.2rem', fontWeight: 900, textAlign: 'center' }}>{t('common.free')}</div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                            <div style={{ padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><CheckCircle size={16} color="#fff" /></div>
                            {t('plans.free.fee_dynamic', { fee: ((getPlanConfig('free')?.commissionRate || 0.15) * 100).toFixed(0) })}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                            <div style={{ padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><CheckCircle size={16} color="#fff" /></div>
                            {t('plans.unlimitedForms')}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                            <div style={{ padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><CheckCircle size={16} color="#fff" /></div>
                            {t('plans.participantManagement')}
                        </li>
                    </ul>

                    <button
                        disabled={true}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 800, fontSize: '0.85rem' }}
                    >
                        {user?.plan === 'free' ? t('plans.currentPlan') : t('plans.standardPlan')}
                    </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{
                    flex: '1 1 280px', maxWidth: '340px', display: 'flex', flexDirection: 'column',
                    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop")',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '2px solid #D4AF37', padding: '1.8rem 1.2rem 1.2rem', borderRadius: '20px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 25px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#D4AF37', color: '#000', padding: '3px 10px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 900 }}>{t('common.recommended')}</div>

                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.2rem', color: '#D4AF37', fontFamily: 'var(--font-playfair)' }}>Pro</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>{t('plans.pro.description')}</p>
                    </div>

                    <div style={{ marginBottom: '1rem', fontSize: '2.4rem', fontWeight: 900, textAlign: 'center', color: '#D4AF37' }}>
                        {formatPrice(getPlanPrice('pro'), currency, currency)}<span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.7 }}>/mês</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 700 }}>
                            <div style={{ padding: '5px', background: 'rgba(212, 175, 55, 0.2)', borderRadius: '50%' }}><Zap size={18} color="#D4AF37" /></div>
                            {t('plans.pro.fee_dynamic', { fee: ((getPlanConfig('pro')?.commissionRate || 0.10) * 100).toFixed(0) })}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                            <div style={{ padding: '5px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%' }}><CheckCircle size={18} color="#D4AF37" /></div>
                            {t('dashboard.plans.f2').replace('• ', '')}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                            <div style={{ padding: '5px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%' }}><CheckCircle size={18} color="#D4AF37" /></div>
                            {t('plans.pro.f1').replace('• ', '')}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                            <div style={{ padding: '5px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%' }}><CheckCircle size={18} color="#D4AF37" /></div>
                            {t('plans.pro.f2').replace('• ', '')}
                        </li>
                    </ul>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => handleSubscribe('pro')}
                            disabled={loadingPlan === 'pro' || user?.plan === 'pro'}
                            style={{ width: '100%', padding: '0.7rem', background: '#635BFF', color: '#fff', borderRadius: '10px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {loadingPlan === 'pro' ? <Loader2 className="animate-spin" size={20} /> : (
                                user?.plan === 'pro' ? t('plans.currentPlan') : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            <svg width="20" height="13" viewBox="0 0 45 28" fill="none">
                                                <rect width="45" height="28" rx="4" fill="#fff" />
                                                <path d="M16.8 19.5l1.6-12h2.6l-1.6 12h-2.6zm-3.6-12h-2.7c-.6 0-1 .2-1.3.9L5 19.5h2.7l.6-1.8h3.4l.3 1.8h2.5l-1.8-12zm-1.5 7.2l.8-2.6.4 2.6h-1.2zm16-4.2c0-2-1.1-3-2.6-3-1.7 0-3.4 1.1-3.4 2.8 0 1.3.9 2 1.6 2.4.7.4 1 .7 1 1.2 0 .8-.8 1.2-1.6 1.2-.9 0-1.6-.3-2.2-.6l-.3 2c.6.3 1.4.6 2.4.6 1.9 0 3.6-1.1 3.6-2.9 0-1-.6-1.7-1.6-2.3-.7-.4-1.1-.7-1.1-1.1 0-.4.4-.8 1.2-.8.7 0 1.3.2 1.7.4l.4-1.9zm6.9 9h2.5l-1.6-12h-2c-.5 0-.9.3-1.1.9l-3.8 11.1h2.7l.5-1.7h3.3l.4 1.7zm-2.1-4h1.7l-.7-4.2h-.1L32.5 15.5z" fill="#1A1F71" />
                                            </svg>
                                            <svg width="20" height="13" viewBox="0 0 45 28" fill="none">
                                                <rect width="45" height="28" rx="4" fill="#fff" />
                                                <circle cx="17" cy="14" r="9" fill="#EB001B" fillOpacity="0.8" />
                                                <circle cx="28" cy="14" r="9" fill="#F79E1B" fillOpacity="0.8" />
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: '0.85rem' }}>{t('plans.payWithCard')}</span>
                                    </div>
                                )
                            )}
                        </button>

                        {user?.plan !== 'pro' && (
                            <>
                                <div style={{ background: '#FFC439', borderRadius: '10px', minHeight: '44px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, pointerEvents: 'none' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                                        <span style={{ color: '#003087', fontSize: '0.86rem', fontWeight: 800, fontStyle: 'italic' }}>PayPal</span>
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                        <PaypalButton
                                            type="subscription"
                                            planId="pro"
                                            currency={currency}
                                            onSuccess={() => {
                                                if (!user) {
                                                    window.location.href = "/cadastro?plan=pro&success=true";
                                                } else {
                                                    window.location.reload();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            window.location.href = "/cadastro?plan=pro&method=manual";
                                        } else {
                                            setSelectedManualPlan({ id: 'pro', amount: getPlanPrice('pro') });
                                            setIsUpgradeModalOpen(true);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                    {t('plans.alternativePayment')}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Enterprise Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{
                    flex: '1 1 280px', maxWidth: '340px', display: 'flex', flexDirection: 'column',
                    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop")',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '1px solid rgba(255,255,255,0.2)', padding: '1.8rem 1.2rem', borderRadius: '20px', color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.2rem', color: '#fff', fontFamily: 'var(--font-playfair)' }}>Enterprise</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>{t('plans.enterprise.description')}</p>
                    </div>

                    <div style={{ marginBottom: '1rem', fontSize: '2.4rem', fontWeight: 900, textAlign: 'center', color: '#FFD700' }}>
                        {formatPrice(getPlanPrice('enterprise'), currency, currency)}<span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.7 }}>/mês</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 900, color: '#FFD700' }}>
                            <div style={{ padding: '5px', background: 'rgba(255,215,0,0.2)', borderRadius: '50%' }}><Crown size={18} /></div>
                            {((getPlanConfig('enterprise')?.commissionRate || 0) * 100) === 0
                                ? t('plans.enterprise.fee')
                                : t('plans.enterprise.fee_dynamic', { fee: ((getPlanConfig('enterprise')?.commissionRate || 0) * 100).toFixed(0) })}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                            <div style={{ padding: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><ShieldCheck size={18} /></div>
                            {t('plans.enterprise.f1').replace('• ', '')}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                            <div style={{ padding: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><ShieldCheck size={18} /></div>
                            {t('plans.enterprise.f2').replace('• ', '')}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem' }}>
                            <div style={{ padding: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><CheckCircle size={18} /></div>
                            {t('plans.apiIntegration')}
                        </li>
                    </ul>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => handleSubscribe('enterprise')}
                            disabled={loadingPlan === 'enterprise' || user?.plan === 'enterprise'}
                            style={{ width: '100%', padding: '0.7rem', background: '#fff', color: '#000', borderRadius: '10px', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {loadingPlan === 'enterprise' ? <Loader2 className="animate-spin" size={20} /> : (
                                user?.plan === 'enterprise' ? t('plans.currentPlan') : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            <svg width="20" height="13" viewBox="0 0 45 28" fill="none">
                                                <rect width="45" height="28" rx="4" fill="#fff" />
                                                <path d="M16.8 19.5l1.6-12h2.6l-1.6 12h-2.6zm-3.6-12h-2.7c-.6 0-1 .2-1.3.9L5 19.5h2.7l.6-1.8h3.4l.3 1.8h2.5l-1.8-12zm-1.5 7.2l.8-2.6.4 2.6h-1.2zm16-4.2c0-2-1.1-3-2.6-3-1.7 0-3.4 1.1-3.4 2.8 0 1.3.9 2 1.6 2.4.7.4 1 .7 1 1.2 0 .8-.8 1.2-1.6 1.2-.9 0-1.6-.3-2.2-.6l-.3 2c.6.3 1.4.6 2.4.6 1.9 0 3.6-1.1 3.6-2.9 0-1-.6-1.7-1.6-2.3-.7-.4-1.1-.7-1.1-1.1 0-.4.4-.8 1.2-.8.7 0 1.3.2 1.7.4l.4-1.9zm6.9 9h2.5l-1.6-12h-2c-.5 0-.9.3-1.1.9l-3.8 11.1h2.7l.5-1.7h3.3l.4 1.7zm-2.1-4h1.7l-.7-4.2h-.1L32.5 15.5z" fill="#1A1F71" />
                                            </svg>
                                            <svg width="20" height="13" viewBox="0 0 45 28" fill="none">
                                                <rect width="45" height="28" rx="4" fill="#fff" />
                                                <circle cx="17" cy="14" r="9" fill="#EB001B" fillOpacity="0.8" />
                                                <circle cx="28" cy="14" r="9" fill="#F79E1B" fillOpacity="0.8" />
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: '0.85rem' }}>{t('plans.payWithCard')}</span>
                                    </div>
                                )
                            )}
                        </button>

                        {user?.plan !== 'enterprise' && (
                            <>
                                <div style={{ background: '#FFC439', borderRadius: '10px', minHeight: '44px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, pointerEvents: 'none' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                                        <span style={{ color: '#003087', fontSize: '0.86rem', fontWeight: 800, fontStyle: 'italic' }}>PayPal</span>
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                        <PaypalButton
                                            type="subscription"
                                            planId="enterprise"
                                            currency={currency}
                                            onSuccess={() => {
                                                if (!user) {
                                                    window.location.href = "/cadastro?plan=enterprise&success=true";
                                                } else {
                                                    window.location.reload();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            window.location.href = "/cadastro?plan=enterprise&method=manual";
                                        } else {
                                            setSelectedManualPlan({ id: 'enterprise', amount: getPlanPrice('enterprise') });
                                            setIsUpgradeModalOpen(true);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                    {t('plans.alternativePayment')}
                                </button>
                            </>
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
            <PlanUpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => {
                    setIsUpgradeModalOpen(false);
                    setSelectedManualPlan(null);
                }}
                initialManualPlan={selectedManualPlan}
            />
        </div>
    );
}
