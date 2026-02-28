"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, ShieldCheck, Crown, Loader2, Info, Clock } from "lucide-react";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { useEffect, useState } from "react";
import { authService, UserData } from "@/lib/authService";
import { toast } from "sonner";
import PlanUpgradeModal from "@/components/PlanUpgradeModal";
import { useTranslate } from "@/context/LanguageContext";
import PaypalButton from "./common/PaypalButton";

export default function InternalPlansView() {
    const { t } = useTranslate();
    const { currency, setCurrency, formatPrice, getPlanPrice, getPlanConfig } = useCurrency();
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

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Free Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{
                    flex: '1 1 300px', maxWidth: '380px', display: 'flex', flexDirection: 'column',
                    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop")',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '3rem 2rem', borderRadius: '32px', color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-playfair)' }}>Free</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>{t('plans.free.description')}</p>
                    </div>
                    <div style={{ marginBottom: '2rem', fontSize: '3rem', fontWeight: 900, textAlign: 'center' }}>{t('common.free')}</div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                        style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 800, fontSize: '1rem' }}
                    >
                        {user?.plan === 'free' ? t('plans.currentPlan') : t('plans.standardPlan')}
                    </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{
                    flex: '1 1 300px', maxWidth: '380px', display: 'flex', flexDirection: 'column',
                    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop")',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '2px solid #D4AF37', padding: '3.5rem 2rem 3rem', borderRadius: '32px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#D4AF37', color: '#000', padding: '6px 16px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900, boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' }}>{t('common.recommended')}</div>

                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#D4AF37', fontFamily: 'var(--font-playfair)' }}>Pro</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>{t('plans.pro.description')}</p>
                    </div>

                    <div style={{ marginBottom: '2.5rem', fontSize: '3.2rem', fontWeight: 900, textAlign: 'center', color: '#D4AF37' }}>
                        {formatPrice(getPlanPrice('pro'), currency, currency)}<span style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.7 }}>{t('plans.perMonth')}</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                            style={{ width: '100%', padding: '0.8rem', background: '#635BFF', color: '#fff', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {loadingPlan === 'pro' ? <Loader2 className="animate-spin" size={20} /> : (
                                user?.plan === 'pro' ? t('plans.currentPlan') : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{t('plans.payWithCard')}</span>
                                        <div style={{ background: '#fff', padding: '3px 6px', borderRadius: '3px', display: 'flex' }}>
                                            <svg width="30" height="12" viewBox="0 0 40 17" fill="#635BFF">
                                                <path d="M39.06 8.35c0-3.08-2.2-4.32-4.52-4.32-2.82 0-4.8 1.85-4.8 4.73 0 3.76 2.62 4.67 5.23 4.67 1.17 0 2.1-.23 2.76-.56V11.1c-.69.34-1.58.55-2.58.55-1.78 0-3.32-.42-3.32-2.54h7.93c.06-.35.3-.77.3-1.26zm-7.14-1c0-1.4 1-2 2.33-2 1.14 0 2 0.5 2 2h-4.33zM25.7 4.19c-1.34 0-2.22 0.53-2.73 1.1V4.32h-2.15v11.72h2.24V11.7c0-1.78 1.3-2.67 2.61-2.67.5 0 .93.08 1.18.17l.32-2.17c-.36-.08-1-.13-1.47-.13zM18.8 11.45l-1.92-7.13h-2.53l3.25 9.77-1.3 3.42 2.4 0 4.1-10.43-2.5 0-1.5 4.37zM11.66 4.12c-.93 0-1.6 0.44-2 0.96V4.32H7.5v11.72h2.24V9.6c0-2 1.6-2.61 2.92-2.61.5 0 0.93.08 1.18.17l.32-2.17c-.36-.08-.94-.13-1.5-.13zM4.1 2.37c-.6 0-1.05.15-1.36.32l.2 1.88c.34-.14.73-.24 1.17-.24.78 0 1.1.28 1.1.86v1.17H4.07c-1.6 0-2.63.74-2.63 1.94 0 1.25.98 1.8 2.08 1.8.84 0 1.5-.32 1.95-.76l.16 0.6h2V6.62C7.63 4.1 5.92 2.37 4.1 2.37zm1.6 5.25c0 .66-.67 1.05-1.3 1.05-.56 0-.82-.24-.82-.67 0-.39.42-.64 1.07-.64h1.05z" />
                                            </svg>
                                        </div>
                                    </div>
                                )
                            )}
                        </button>

                        {user?.plan !== 'pro' && (
                            <>
                                <div style={{ background: '#FFC43915', padding: '8px', borderRadius: '12px', border: '1px solid #FFC43933' }}>
                                    <PaypalButton
                                        type="subscription"
                                        planId="pro"
                                        currency={currency}
                                        onSuccess={() => window.location.reload()}
                                    />
                                </div>
                                <button
                                    onClick={() => setIsUpgradeModalOpen(true)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    {t('plans.alternativePayment')}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Enterprise Plan */}
                <motion.div whileHover={{ y: -10 }} className="luxury-card" style={{
                    flex: '1 1 300px', maxWidth: '380px', display: 'flex', flexDirection: 'column',
                    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop")',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '1px solid rgba(255,255,255,0.2)', padding: '3.5rem 2rem 3rem', borderRadius: '32px', color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff', fontFamily: 'var(--font-playfair)' }}>Enterprise</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>{t('plans.enterprise.description')}</p>
                    </div>

                    <div style={{ marginBottom: '2.5rem', fontSize: '3.2rem', fontWeight: 900, textAlign: 'center', color: '#FFD700' }}>
                        {formatPrice(getPlanPrice('enterprise'), currency, currency)}<span style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.7 }}>{t('plans.perMonth')}</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                            style={{ width: '100%', padding: '0.8rem', background: '#fff', color: '#000', borderRadius: '12px', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {loadingPlan === 'enterprise' ? <Loader2 className="animate-spin" size={20} /> : (
                                user?.plan === 'enterprise' ? t('plans.currentPlan') : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{t('plans.payWithCard')}</span>
                                        <div style={{ background: '#635BFF', padding: '3px 6px', borderRadius: '3px', display: 'flex' }}>
                                            <svg width="30" height="12" viewBox="0 0 40 17" fill="#fff">
                                                <path d="M39.06 8.35c0-3.08-2.2-4.32-4.52-4.32-2.82 0-4.8 1.85-4.8 4.73 0 3.76 2.62 4.67 5.23 4.67 1.17 0 2.1-.23 2.76-.56V11.1c-.69.34-1.58.55-2.58.55-1.78 0-3.32-.42-3.32-2.54h7.93c.06-.35.3-.77.3-1.26zm-7.14-1c0-1.4 1-2 2.33-2 1.14 0 2 0.5 2 2h-4.33zM25.7 4.19c-1.34 0-2.22 0.53-2.73 1.1V4.32h-2.15v11.72h2.24V11.7c0-1.78 1.3-2.67 2.61-2.67.5 0 .93.08 1.18.17l.32-2.17c-.36-.08-1-.13-1.47-.13zM18.8 11.45l-1.92-7.13h-2.53l3.25 9.77-1.3 3.42 2.4 0 4.1-10.43-2.5 0-1.5 4.37zM11.66 4.12c-.93 0-1.6 0.44-2 0.96V4.32H7.5v11.72h2.24V9.6c0-2 1.6-2.61 2.92-2.61.5 0 0.93.08 1.18.17l.32-2.17c-.36-.08-.94-.13-1.5-.13zM4.1 2.37c-.6 0-1.05.15-1.36.32l.2 1.88c.34-.14.73-.24 1.17-.24.78 0 1.1.28 1.1.86v1.17H4.07c-1.6 0-2.63.74-2.63 1.94 0 1.25.98 1.8 2.08 1.8.84 0 1.5-.32 1.95-.76l.16 0.6h2V6.62C7.63 4.1 5.92 2.37 4.1 2.37zm1.6 5.25c0 .66-.67 1.05-1.3 1.05-.56 0-.82-.24-.82-.67 0-.39.42-.64 1.07-.64h1.05z" />
                                            </svg>
                                        </div>
                                    </div>
                                )
                            )}
                        </button>

                        {user?.plan !== 'enterprise' && (
                            <>
                                <div style={{ background: '#FFC43915', padding: '8px', borderRadius: '12px', border: '1px solid #FFC43933' }}>
                                    <PaypalButton
                                        type="subscription"
                                        planId="enterprise"
                                        currency={currency}
                                        onSuccess={() => window.location.reload()}
                                    />
                                </div>
                                <button
                                    onClick={() => setIsUpgradeModalOpen(true)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
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
            <PlanUpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
}
