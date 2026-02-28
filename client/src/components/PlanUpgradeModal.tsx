'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Crown, Sparkles, Loader2, Upload } from 'lucide-react';
import Cookies from 'js-cookie';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslate } from '@/context/LanguageContext';
import { formService } from '@/lib/formService';
import { toast } from 'sonner';
import PaypalButton, { PaypalSuccessDetails } from './common/PaypalButton';
export default function PlanUpgradeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [manualPlan, setManualPlan] = useState<{ id: string, amount: number } | null>(null);
    const [uploading, setUploading] = useState(false);
    const { currency, setCurrency, formatPrice, getPlanPrice } = useCurrency();
    const { t } = useTranslate();

    const proPrice = getPlanPrice('pro');
    const enterprisePrice = getPlanPrice('enterprise');

    const handleUpgradeStripe = async (plan: string) => {
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
            toast.error(t('plans.manualUpgrade.stripeError'));
        }
    };

    const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !manualPlan) return;
        setUploading(true);
        try {
            const proofUrl = await formService.uploadFile(e.target.files[0], 'subscriptions');
            const token = Cookies.get('token');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/subscription/manual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan: manualPlan.id,
                    amount: manualPlan.amount,
                    proofUrl,
                    currency
                })
            });

            if (!response.ok) throw new Error(t('common.toasts.saveError'));

            toast.success(t('plans.manualUpgrade.uploadSuccess'));
            setManualPlan(null);
            onClose();
        } catch (error) {
            console.error('Manual upload error:', error);
            toast.error(t('plans.manualUpgrade.uploadError'));
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#fff', borderRadius: '40px', maxWidth: '900px', width: '100%', padding: '40px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', border: 'none', background: '#f0f0f0', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: manualPlan ? '20px' : '40px' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-playfair)' }}>
                        {manualPlan ? t('plans.manualUpgrade.title') : t('dashboard.plans.choosePlan')}
                    </h2>
                    <p style={{ color: '#666' }}>{manualPlan ? t('plans.manualUpgrade.selectedPlan', { plan: manualPlan.id.toUpperCase() }) : t('dashboard.plans.boostReach')}</p>

                    {!manualPlan && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                            {['USD', 'MZN'].map((c) => (
                                <button key={c} onClick={() => setCurrency(c as 'MZN' | 'USD')} style={{ padding: '8px 24px', borderRadius: '30px', border: '1px solid #eee', background: currency === c ? '#000' : '#fff', color: currency === c ? '#fff' : '#000', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s' }}>{c === 'MZN' ? 'MT' : 'USD'}</button>
                            ))}
                        </div>
                    )}
                </div>

                <AnimatePresence mode='wait'>
                    {!manualPlan ? (
                        <motion.div
                            key="plans"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <PlanCard
                                id="pro"
                                name="Pro"
                                amount={proPrice}
                                price={formatPrice(proPrice, currency, currency)}
                                color="#D4AF37"
                                icon={<Sparkles size={24} />}
                                features={[t('dashboard.plans.f1'), t('dashboard.plans.f2'), t('dashboard.plans.f3')]}
                                onSelect={() => handleUpgradeStripe('pro')}
                                onManual={() => setManualPlan({ id: 'pro', amount: proPrice })}
                                onPaypalSuccess={() => {
                                    onClose();
                                    window.location.reload();
                                }}
                                loading={loading === 'pro'}
                                currency={currency}
                                t={t}
                            />
                            <PlanCard
                                id="enterprise"
                                name="Enterprise"
                                amount={enterprisePrice}
                                price={formatPrice(enterprisePrice, currency, currency)}
                                color="#000"
                                icon={<Crown size={24} />}
                                features={[t('dashboard.plans.f4'), t('dashboard.plans.f5'), t('dashboard.plans.f6')]}
                                onSelect={() => handleUpgradeStripe('enterprise')}
                                onManual={() => setManualPlan({ id: 'enterprise', amount: enterprisePrice })}
                                onPaypalSuccess={() => {
                                    onClose();
                                    window.location.reload();
                                }}
                                loading={loading === 'enterprise'}
                                currency={currency}
                                t={t}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="manual"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ maxWidth: '500px', margin: '0 auto', background: '#f8f9fa', padding: '30px', borderRadius: '24px', border: '1px dashed #ddd' }}>

                            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '15px', color: '#000' }}>
                                        ⚡ PAGAMENTO AUTOMÁTICO (INSTANTÂNEO)
                                    </p>
                                    <PaypalButton
                                        type="subscription"
                                        planId={manualPlan.id}
                                        currency={currency}
                                        onSuccess={() => {
                                            onClose();
                                            window.location.reload();
                                        }}
                                    />
                                </div>

                                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '15px', fontWeight: 600 }}>
                                    OU TRANSFERÊNCIA MANUAL (VALIDAÇÃO EM 24H)
                                </p>
                                <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', textAlign: 'left', fontSize: '0.85rem' }}>
                                    <div style={{ marginBottom: '8px' }}>🇲🇿 <b>M-Pesa:</b> 856079576 (Afonso Domingos)</div>
                                    <div style={{ marginBottom: '8px' }}>🇲🇿 <b>e-Mola:</b> 879642412 (Afonso Domingos)</div>
                                    <div style={{ marginBottom: '8px' }}>🌍 <b>PayPal (Manual):</b> karinganastudio23@gmail.com</div>
                                    <div>🏦 <b>NIB:</b> 000100000074301049557</div>
                                </div>
                            </div>

                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
                                padding: '30px', background: '#fff', borderRadius: '16px', border: '2px solid #D4AF37',
                                cursor: 'pointer', transition: 'all 0.3s'
                            }}>
                                {uploading ? <Loader2 className="animate-spin" size={32} color="#D4AF37" /> : <Upload size={32} color="#D4AF37" />}
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontWeight: 800, color: '#000', display: 'block' }}>{t('plans.manualUpgrade.uploadLabel')}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#999' }}>{t('plans.manualUpgrade.uploadHint')}</span>
                                </div>
                                <input type="file" hidden accept="image/*,application/pdf" onChange={handleManualUpload} disabled={uploading} />
                            </label>

                            <button onClick={() => setManualPlan(null)} style={{ width: '100%', marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontWeight: 600 }}>{t('plans.manualUpgrade.backToPlans')}</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

interface PlanCardProps {
    id: string;
    name: string;
    price: string;
    amount: number;
    color: string;
    icon: React.ReactNode;
    features: string[];
    onSelect: () => void;
    onManual: () => void;
    onPaypalSuccess: (data: PaypalSuccessDetails) => void;
    loading: boolean;
    currency: string;
    t: (key: string) => string;
}

function PlanCard({ id, name, price, color, icon, features, onSelect, onManual, onPaypalSuccess, loading, currency, t }: PlanCardProps) {
    return (
        <div style={{ border: `2px solid ${color}15`, background: name === 'Enterprise' ? '#fafafa' : '#fff', padding: '35px', borderRadius: '32px', textAlign: 'center', transition: 'transform 0.3s ease', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ background: `${color}10`, color: color, padding: '15px', borderRadius: '24px', width: 'fit-content', margin: '0 auto 20px' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '10px', color: '#000' }}>{name}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '25px', color: '#000' }}>{price} <span style={{ fontSize: '0.9rem', color: '#999', fontWeight: 500 }}>{t('dashboard.plans.perMonth')}</span></div>

            <div style={{ textAlign: 'left', marginBottom: '30px', padding: '0 10px' }}>
                {features.map((f: string) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', fontSize: '0.9rem', color: '#444' }}>
                        <div style={{ minWidth: '20px', height: '20px', borderRadius: '50%', background: '#10b98115', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={12} color="#10b981" strokeWidth={3} />
                        </div>
                        {f}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                    onClick={onSelect}
                    disabled={loading}
                    style={{ width: '100%', padding: '0.8rem', background: '#635BFF', color: '#fff', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(99, 91, 255, 0.2)', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.95rem' }}>{t('plans.manualUpgrade.payWithCard')}</span>
                            <div style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                                <svg width="35" height="15" viewBox="0 0 40 17" fill="#635BFF">
                                    <path d="M39.06 8.35c0-3.08-2.2-4.32-4.52-4.32-2.82 0-4.8 1.85-4.8 4.73 0 3.76 2.62 4.67 5.23 4.67 1.17 0 2.1-.23 2.76-.56V11.1c-.69.34-1.58.55-2.58.55-1.78 0-3.32-.42-3.32-2.54h7.93c.06-.35.3-.77.3-1.26zm-7.14-1c0-1.4 1-2 2.33-2 1.14 0 2 0.5 2 2h-4.33zM25.7 4.19c-1.34 0-2.22 0.53-2.73 1.1V4.32h-2.15v11.72h2.24V11.7c0-1.78 1.3-2.67 2.61-2.67.5 0 .93.08 1.18.17l.32-2.17c-.36-.08-1-.13-1.47-.13zM18.8 11.45l-1.92-7.13h-2.53l3.25 9.77-1.3 3.42 2.4 0 4.1-10.43-2.5 0-1.5 4.37zM11.66 4.12c-.93 0-1.6 0.44-2 0.96V4.32H7.5v11.72h2.24V9.6c0-2 1.6-2.61 2.92-2.61.5 0 0.93.08 1.18.17l.32-2.17c-.36-.08-.94-.13-1.5-.13zM4.1 2.37c-.6 0-1.05.15-1.36.32l.2 1.88c.34-.14.73-.24 1.17-.24.78 0 1.1.28 1.1.86v1.17H4.07c-1.6 0-2.63.74-2.63 1.94 0 1.25.98 1.8 2.08 1.8.84 0 1.5-.32 1.95-.76l.16 0.6h2V6.62C7.63 4.1 5.92 2.37 4.1 2.37zm1.6 5.25c0 .66-.67 1.05-1.3 1.05-.56 0-.82-.24-.82-.67 0-.39.42-.64 1.07-.64h1.05z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </button>

                <div style={{ background: '#FFC43915', padding: '10px', borderRadius: '12px', border: '1px solid #FFC43933' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#003087' }}>{t('plans.manualUpgrade.payWithPaypal')}</span>
                    </div>
                    <PaypalButton
                        type="subscription"
                        planId={id}
                        currency={currency}
                        onSuccess={onPaypalSuccess}
                    />
                </div>

                <button
                    onClick={onManual}
                    style={{ width: '100%', padding: '0.9rem', background: '#f8f9fa', color: '#666', borderRadius: '12px', fontWeight: 700, border: '1px solid #eee', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    {t('plans.manualUpgrade.mpesaTransfer')}
                </button>
            </div>
        </div>
    );
}
