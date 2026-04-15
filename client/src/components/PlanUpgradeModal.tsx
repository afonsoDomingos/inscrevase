'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Crown, Sparkles, Loader2, Upload, ChevronDown, Globe, AlertCircle, Copy, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslate } from '@/context/LanguageContext';
import { formService } from '@/lib/formService';
import { toast } from 'sonner';
import { logService } from '@/lib/logService';
import PaypalButton, { PaypalSuccessDetails } from './common/PaypalButton';
import Image from 'next/image';
import PlanCard from './common/PlanCard';

interface ManualPaymentMethod {
    id: string;
    country: string;
    countryLabel: string;
    label: string;
    icon: string;
    details: string;
    active: boolean;
}

interface CountryGroup {
    code: string;
    label: string;
    flag: string;
    methods: ManualPaymentMethod[];
}

export default function PlanUpgradeModal({ isOpen, onClose, initialManualPlan }: {
    isOpen: boolean,
    onClose: () => void,
    initialManualPlan?: { id: string, amount: number } | null
}) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [manualPlan, setManualPlan] = useState<{ id: string, amount: number } | null>(initialManualPlan || null);
    const [uploading, setUploading] = useState(false);
    const [manualMethods, setManualMethods] = useState<ManualPaymentMethod[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [loadingMethods, setLoadingMethods] = useState(false);
    const { currency, setCurrency, formatPrice, getPlanPrice } = useCurrency();
    const { t } = useTranslate();

    useEffect(() => {
        if (initialManualPlan) setManualPlan(initialManualPlan);
    }, [initialManualPlan]);

    // Fetch dynamic manual payment methods
    useEffect(() => {
        const fetchMethods = async () => {
            setLoadingMethods(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/manual-methods`);
                if (res.ok) {
                    const data = await res.json();
                    setManualMethods(data.filter((m: ManualPaymentMethod) => m.active));
                }
            } catch {
                // Fallback defaults handled by server
            } finally {
                setLoadingMethods(false);
            }
        };
        if (isOpen) fetchMethods();
    }, [isOpen]);

    const proPrice = getPlanPrice('pro');
    const enterprisePrice = getPlanPrice('enterprise');

    // Group methods by country
    const countryGroups: CountryGroup[] = manualMethods.reduce((acc: CountryGroup[], method) => {
        const existing = acc.find(g => g.code === method.country);
        if (existing) {
            existing.methods.push(method);
        } else {
            const flagMap: Record<string, string> = {
                MZ: '🇲🇿', AO: '🇦🇴', GW: '🇬🇼', CV: '🇨🇻', ST: '🇸🇹', INT: '🌍'
            };
            acc.push({
                code: method.country,
                label: method.countryLabel,
                flag: flagMap[method.country] || '🌍',
                methods: [method]
            });
        }
        return acc;
    }, []);

    const filteredMethods = !selectedCountry || selectedCountry === 'ALL'
        ? []
        : manualMethods.filter(m => m.country === selectedCountry);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
    }, []);

    const handleUpgradeStripe = async (plan: string, trial: boolean = false) => {
        try {
            setLoading(trial ? `${plan}-trial` : plan);
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/subscription/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ plan, currency, trial })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.message || 'Erro ao iniciar assinatura');
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            setLoading(null);
            toast.error(t('plans.manualUpgrade.stripeError'));
        } finally {
            setLoading(null);
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ plan: manualPlan.id, amount: manualPlan.amount, proofUrl, currency })
            });
            if (!response.ok) throw new Error();
            toast.success(t('plans.manualUpgrade.uploadSuccess'));
            setManualPlan(null);
            onClose();
        } catch {
            toast.error(t('plans.manualUpgrade.uploadError'));
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ background: '#fff', borderRadius: '28px', maxWidth: '940px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.35)' }}
            >
                {/* Header */}
                <div style={{ padding: '32px 36px 20px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10, backdropFilter: 'blur(10px)' }}>
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#f5f5f5', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <X size={18} />
                    </button>
                    <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900, marginBottom: '4px', fontFamily: 'var(--font-playfair)' }}>
                        {manualPlan ? t('plans.manualUpgrade.headerTitleManual') : t('plans.manualUpgrade.headerTitlePlans')}
                    </h2>
                    <p style={{ color: '#777', fontSize: '0.9rem' }}>
                        {manualPlan ? t('plans.manualUpgrade.selectedPlan').replace('{plan}', manualPlan.id.toUpperCase()) : t('dashboard.plans.boostReach')}
                    </p>
                </div>

                <div style={{ padding: '28px 36px 36px' }}>
                    <AnimatePresence mode='wait'>
                        {!manualPlan ? (
                            <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {/* Currency selector */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
                                    {['MZN', 'USD', 'EUR'].map((c) => (
                                        <button key={c} onClick={() => setCurrency(c as 'MZN' | 'USD' | 'EUR')}
                                            style={{ padding: '7px 20px', borderRadius: '30px', border: '1.5px solid ' + (currency === c ? '#000' : '#e8e8e8'), background: currency === c ? '#000' : '#fff', color: currency === c ? '#fff' : '#666', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                                            {c === 'MZN' ? '🇲🇿 MT' : c === 'EUR' ? '🇪🇺 EUR' : '🌍 USD'}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                    <PlanCard
                                        id="pro"
                                        name="Pro"
                                        description={t('plans.pro.description')}
                                        amount={proPrice}
                                        price={formatPrice(proPrice, currency, currency)}
                                        currency={currency}
                                        bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
                                        recommended={true}
                                        canUseTrial={user?.hasUsedTrial !== true}
                                        features={[t('dashboard.plans.f1'), t('dashboard.plans.f2'), t('dashboard.plans.f3')]}
                                        onManualSelect={() => setManualPlan({ id: 'pro', amount: proPrice })}
                                        onSuccess={() => { onClose(); router.push('/dashboard/mentor?subscription=success&plan=pro'); }}
                                        t={t}
                                    />
                                    <PlanCard
                                        id="enterprise"
                                        name="Enterprise"
                                        description={t('plans.enterprise.description')}
                                        amount={enterprisePrice}
                                        price={formatPrice(enterprisePrice, currency, currency)}
                                        currency={currency}
                                        isEnterprise={true}
                                        bgImage="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop"
                                        features={[t('dashboard.plans.f4'), t('dashboard.plans.f5'), t('dashboard.plans.f6')]}
                                        onManualSelect={() => setManualPlan({ id: 'enterprise', amount: enterprisePrice })}
                                        onSuccess={() => { onClose(); router.push('/dashboard/mentor?subscription=success&plan=enterprise'); }}
                                        t={t}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="manual" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                                {/* Automatic payment section */}
                                <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '1px solid #bae6fd', borderRadius: '18px', padding: '22px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                        <span style={{ fontSize: '1.1rem' }}>⚡</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('plans.manualUpgrade.automaticPayment')}</span>
                                    </div>
                                    {/* PayPal automatic */}
                                    <div style={{ background: '#FFC439', borderRadius: '12px', padding: '0', border: '1px solid #e0f2fe', overflow: 'hidden', height: '45px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, pointerEvents: 'none' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                                        </div>
                                        <div style={{ position: 'relative', zIndex: 2 }}>
                                            <PaypalButton 
                                               type="subscription" 
                                               planId={manualPlan.id} 
                                               currency={currency} 
                                               trial={manualPlan.id === 'pro' && user?.hasUsedTrial !== true}
                                               onSuccess={() => { onClose(); router.push(`/dashboard/mentor?subscription=success&plan=${manualPlan.id}`); }} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9ca3af', background: '#fff', padding: '0 12px', textAlign: 'center', letterSpacing: '0.05em', lineHeight: 1.4 }}>{t('plans.manualUpgrade.manualTransferTitle')}</span>
                                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                </div>

                                {/* Country selector */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                                        <Globe size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                                        {t('plans.manualUpgrade.selectRegion')}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={selectedCountry}
                                            onChange={(e) => setSelectedCountry(e.target.value)}
                                            style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontWeight: 600, background: '#fff', cursor: 'pointer', appearance: 'none', color: '#111', transition: 'all 0.2s' }}
                                            onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        >
                                            <option value="" disabled>{t('plans.manualUpgrade.selectRegion')}</option>
                                            {countryGroups.map(g => (
                                                <option key={g.code} value={g.code}>{g.flag} {g.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                                    </div>
                                </div>

                                {/* Payment methods */}
                                {loadingMethods ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                                        <Loader2 className="animate-spin" size={28} color="#D4AF37" />
                                    </div>
                                ) : filteredMethods.length > 0 ? (
                                    <div style={{ background: '#fafafa', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '20px' }}>
                                        {filteredMethods.map((method, i) => {
                                            const logoMap: Record<string, string> = {
                                                'mpesa': '/payments/mpesa.png',
                                                'm-pesa': '/payments/mpesa.png',
                                                'emola': '/payments/emola.png',
                                                'e-mola': '/payments/emola.png',
                                                'unitel': '/payments/Unitel-Money.jpeg',
                                                'visa': '/payments/visa.jpg',
                                                'mastercard': '/payments/mastercard.png',
                                                'paypal': '/payments/paypal.png',
                                                'stripe': '/payments/stripe.png',
                                            };
                                            const logo = Object.entries(logoMap).find(([key]) =>
                                                method.label.toLowerCase().includes(key)
                                            )?.[1] ?? null;

                                            return (
                                                <div key={method.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#fff', borderBottom: i < filteredMethods.length - 1 ? '1px solid #f0f0f0' : 'none', flexWrap: 'wrap', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '140px' }}>
                                                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', overflow: 'hidden', border: '1px solid #eee', flexShrink: 0 }}>
                                                            {logo
                                                                ? <Image src={logo} alt={method.label} width={42} height={42} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                                                                : method.icon
                                                            }
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#111', marginBottom: '2px' }}>{method.label}</p>
                                                            <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>{method.countryLabel}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end', minWidth: '150px' }}>
                                                        <p style={{ fontWeight: 700, fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', color: '#111', fontFamily: 'monospace', margin: 0, letterSpacing: '0.5px', wordBreak: 'break-all' }}>{method.details}</p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const numberToCopy = method.details.split('(')[0].trim();
                                                                navigator.clipboard.writeText(numberToCopy);
                                                                toast.success(t('plans.manualUpgrade.copySuccess'));
                                                            }}
                                                            style={{ background: '#f3f4f6', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'all 0.2s' }}
                                                            title="Copiar"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    </div>
                                ) : selectedCountry && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
                                        <AlertCircle size={18} color="#854d0e" />
                                        <p style={{ fontSize: '0.85rem', color: '#854d0e', fontWeight: 600 }}>{t('plans.manualUpgrade.noMethods')}</p>
                                    </div>
                                )}

                                {/* Upload proof */}
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px', background: '#fff', borderRadius: '16px', border: '2px dashed #D4AF37', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#fffbeb'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#fff'}>
                                    {uploading ? <Loader2 className="animate-spin" size={30} color="#D4AF37" /> : <Upload size={30} color="#D4AF37" />}
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontWeight: 800, color: '#111', display: 'block', fontSize: '0.95rem' }}>{t('plans.manualUpgrade.uploadLabel')}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{t('plans.manualUpgrade.uploadHint')}</span>
                                    </div>
                                    <input type="file" hidden accept="image/*,application/pdf" onChange={handleManualUpload} disabled={uploading} />
                                </label>

                                <button
                                    onClick={() => setManualPlan(null)}
                                    style={{ width: '100%', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', padding: '8px', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#6b7280'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                                >
                                    ← {t('plans.manualUpgrade.backToPlans')}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
