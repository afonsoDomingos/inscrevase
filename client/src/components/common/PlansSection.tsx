"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, ShieldCheck, Crown, Info, Clock, Lock } from "lucide-react";
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



    return (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            {showTitle && (
                <div className="luxury-card" style={{ background: 'var(--paper)', border: 'none', marginBottom: '2rem', textAlign: 'center', padding: '2rem' }}>
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
                    border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem 1rem 1rem', borderRadius: '20px', color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.2rem', fontFamily: 'var(--font-playfair)' }}>Free</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>{t('plans.free.description')}</p>
                    </div>
                    <div style={{ marginBottom: '1rem', fontSize: '2.2rem', fontWeight: 900, textAlign: 'center' }}>{t('common.free')}</div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    border: '2px solid #D4AF37', padding: '1.4rem 1rem 1rem', borderRadius: '20px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 25px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#D4AF37', color: '#000', padding: '3px 10px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 900 }}>{t('common.recommended')}</div>

                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.2rem', color: '#D4AF37', fontFamily: 'var(--font-playfair)' }}>Pro</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>{t('plans.pro.description')}</p>
                    </div>

                    <div style={{ marginBottom: '1rem', fontSize: '2.4rem', fontWeight: 900, textAlign: 'center', color: '#D4AF37' }}>
                        {formatPrice(getPlanPrice('pro'), currency, currency)}<span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.7 }}>/mês</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                            onClick={() => toast.info("Checkout via Stripe temporariamente indisponível. Por favor, use o botão PayPal abaixo para pagar com seu cartão VISA ou MASTERCARD – é 100% seguro, instantâneo e não precisa ter conta no PayPal!")}
                            style={{ 
                                width: '100%', height: '45px', 
                                background: 'rgba(255,255,255,0.05)', 
                                color: '#999', borderRadius: '10px', 
                                fontWeight: 800, border: '1px dashed rgba(255,255,255,0.2)', 
                                cursor: 'help', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', 
                                gap: '10px', padding: 0,
                                position: 'relative'
                            }}
                        >
                            <div style={{ position: 'absolute', top: '5px', right: '10px', opacity: 0.3 }}>
                                <Lock size={12} />
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', opacity: 0.5 }}>
                                <svg width="42" height="13" viewBox="0 0 24 8" fill="#fff"><path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z" transform="translate(0, -7.5)" /></svg>
                                <svg width="22" height="14" viewBox="0 0 45 28" fill="none"><circle cx="17" cy="14" r="9" fill="#EB001B" fillOpacity="0.85" /><circle cx="28" cy="14" r="9" fill="#F79E1B" fillOpacity="0.85" /></svg>
                            </div>
                        </button>

                        {user?.plan !== 'pro' && (
                            <>
                                <div style={{ background: '#FFC439', borderRadius: '10px', height: '45px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, pointerEvents: 'none' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                        <PaypalButton
                                            type="subscription"
                                            planId="pro"
                                            currency={currency}
                                            onSuccess={() => {
                                                if (!user) {
                                                    window.location.href = `/entrar?redirect=${encodeURIComponent(window.location.pathname)}&plan=pro&success=true`;
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
                                            window.location.href = `/entrar?redirect=${encodeURIComponent(window.location.pathname)}&plan=pro&method=manual`;
                                        } else {
                                            setSelectedManualPlan({ id: 'pro', amount: getPlanPrice('pro') });
                                            setIsUpgradeModalOpen(true);
                                        }
                                    }}
                                    style={{ width: '100%', height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                    border: '1px solid rgba(255,255,255,0.2)', padding: '1.4rem 1rem 1rem', borderRadius: '20px', color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.2rem', color: '#fff', fontFamily: 'var(--font-playfair)' }}>Enterprise</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>{t('plans.enterprise.description')}</p>
                    </div>

                    <div style={{ marginBottom: '1rem', fontSize: '2.4rem', fontWeight: 900, textAlign: 'center', color: '#FFD700' }}>
                        {formatPrice(getPlanPrice('enterprise'), currency, currency)}<span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.7 }}>/mês</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                            onClick={() => toast.info("Checkout via Stripe temporariamente indisponível. Por favor, use o botão PayPal abaixo para pagar com seu cartão VISA ou MASTERCARD – é 100% seguro, instantâneo e não precisa ter conta no PayPal!")}
                            style={{ 
                                width: '100%', height: '45px', 
                                background: 'rgba(255,255,255,0.05)', 
                                color: '#999', borderRadius: '10px', 
                                fontWeight: 800, border: '1px dashed rgba(255,255,255,0.2)', 
                                cursor: 'help', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', 
                                gap: '10px', padding: 0,
                                position: 'relative'
                            }}
                        >
                            <div style={{ position: 'absolute', top: '5px', right: '10px', opacity: 0.3 }}>
                                <Lock size={12} />
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', opacity: 0.5 }}>
                                <svg width="42" height="13" viewBox="0 0 24 8" fill="#fff"><path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z" transform="translate(0, -7.5)" /></svg>
                                <svg width="22" height="14" viewBox="0 0 45 28" fill="none"><circle cx="17" cy="14" r="9" fill="#EB001B" fillOpacity="0.85" /><circle cx="28" cy="14" r="9" fill="#F79E1B" fillOpacity="0.85" /></svg>
                            </div>
                        </button>

                        {user?.plan !== 'enterprise' && (
                            <>
                                <div style={{ background: '#FFC439', borderRadius: '10px', height: '45px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, pointerEvents: 'none' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                        <PaypalButton
                                            type="subscription"
                                            planId="enterprise"
                                            currency={currency}
                                            onSuccess={() => {
                                                if (!user) {
                                                    window.location.href = `/entrar?redirect=${encodeURIComponent(window.location.pathname)}&plan=enterprise&success=true`;
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
                                            window.location.href = `/entrar?redirect=${encodeURIComponent(window.location.pathname)}&plan=enterprise&method=manual`;
                                        } else {
                                            setSelectedManualPlan({ id: 'enterprise', amount: getPlanPrice('enterprise') });
                                            setIsUpgradeModalOpen(true);
                                        }
                                    }}
                                    style={{ width: '100%', height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
