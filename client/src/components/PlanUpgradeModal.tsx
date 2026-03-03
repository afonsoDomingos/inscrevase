'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Crown, Sparkles, Loader2, Upload, ChevronDown, Globe, AlertCircle, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslate } from '@/context/LanguageContext';
import { formService } from '@/lib/formService';
import { toast } from 'sonner';
import PaypalButton, { PaypalSuccessDetails } from './common/PaypalButton';
import Image from 'next/image';

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
    const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
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

    const filteredMethods = selectedCountry === 'ALL'
        ? manualMethods
        : manualMethods.filter(m => m.country === selectedCountry);

    const handleUpgradeStripe = async (plan: string) => {
        try {
            setLoading(plan);
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/subscription/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                        {manualPlan ? '📋 Enviar Comprovativo de Pagamento' : '🚀 Escolha o seu Plano'}
                    </h2>
                    <p style={{ color: '#777', fontSize: '0.9rem' }}>
                        {manualPlan ? `Plano Selecionado: ${manualPlan.id.toUpperCase()}` : 'Escale o seu negócio com mais recursos e menor comissão'}
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
                                        id="pro" name="Pro" amount={proPrice}
                                        price={formatPrice(proPrice, currency, currency)}
                                        color="#D4AF37" icon={<Sparkles size={22} />}
                                        features={[t('dashboard.plans.f1'), t('dashboard.plans.f2'), t('dashboard.plans.f3')]}
                                        onSelect={() => handleUpgradeStripe('pro')}
                                        onManual={() => setManualPlan({ id: 'pro', amount: proPrice })}
                                        onPaypalSuccess={() => { onClose(); router.push('/dashboard/mentor?subscription=success&plan=pro'); }}
                                        loading={loading === 'pro'} currency={currency} t={t}
                                    />
                                    <PlanCard
                                        id="enterprise" name="Enterprise" amount={enterprisePrice}
                                        price={formatPrice(enterprisePrice, currency, currency)}
                                        color="#6366f1" icon={<Crown size={22} />}
                                        features={[t('dashboard.plans.f4'), t('dashboard.plans.f5'), t('dashboard.plans.f6')]}
                                        onSelect={() => handleUpgradeStripe('enterprise')}
                                        onManual={() => setManualPlan({ id: 'enterprise', amount: enterprisePrice })}
                                        onPaypalSuccess={() => { onClose(); router.push('/dashboard/mentor?subscription=success&plan=enterprise'); }}
                                        loading={loading === 'enterprise'} currency={currency} t={t}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="manual" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                                {/* Automatic payment section */}
                                <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '1px solid #bae6fd', borderRadius: '18px', padding: '22px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                        <span style={{ fontSize: '1.1rem' }}>⚡</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pagamento Automático (Instantâneo)</span>
                                    </div>
                                    {/* PayPal automatic */}
                                    <div style={{ background: '#FFC439', borderRadius: '12px', padding: '0', border: '1px solid #e0f2fe', overflow: 'hidden', height: '45px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, pointerEvents: 'none' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                                        </div>
                                        <div style={{ position: 'relative', zIndex: 2 }}>
                                            <PaypalButton type="subscription" planId={manualPlan.id} currency={currency} onSuccess={() => { onClose(); router.push(`/dashboard/mentor?subscription=success&plan=${manualPlan.id}`); }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9ca3af', background: '#fff', padding: '0 8px', whiteSpace: 'nowrap' }}>OU TRANSFERÊNCIA MANUAL (VALIDAÇÃO EM 24H)</span>
                                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                </div>

                                {/* Country selector */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                                        <Globe size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                                        Selecione o seu País / Região
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={selectedCountry}
                                            onChange={(e) => setSelectedCountry(e.target.value)}
                                            style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontWeight: 600, background: '#fff', cursor: 'pointer', appearance: 'none', color: '#111' }}
                                        >
                                            <option value="ALL">🌍 Todos os Países</option>
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
                                                <div key={method.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#fff', borderBottom: i < filteredMethods.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', overflow: 'hidden', border: '1px solid #eee' }}>
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
                                                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111', fontFamily: 'monospace', margin: 0, letterSpacing: '0.5px' }}>{method.details}</p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                navigator.clipboard.writeText(method.details);
                                                                toast.success('Copiado para a área de transferência!');
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
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
                                        <AlertCircle size={18} color="#854d0e" />
                                        <p style={{ fontSize: '0.85rem', color: '#854d0e', fontWeight: 600 }}>Nenhum método de pagamento disponível para este país ainda.</p>
                                    </div>
                                )}

                                {/* Upload proof */}
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px', background: '#fff', borderRadius: '16px', border: '2px dashed #D4AF37', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '14px' }}>
                                    {uploading ? <Loader2 className="animate-spin" size={30} color="#D4AF37" /> : <Upload size={30} color="#D4AF37" />}
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontWeight: 800, color: '#111', display: 'block', fontSize: '0.95rem' }}>{t('plans.manualUpgrade.uploadLabel')}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{t('plans.manualUpgrade.uploadHint')}</span>
                                    </div>
                                    <input type="file" hidden accept="image/*,application/pdf" onChange={handleManualUpload} disabled={uploading} />
                                </label>

                                <button
                                    onClick={() => setManualPlan(null)}
                                    style={{ width: '100%', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', padding: '8px' }}
                                >
                                    ← Voltar aos planos
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

interface PlanCardProps {
    id: string; name: string; price: string; amount: number; color: string;
    icon: React.ReactNode; features: string[]; onSelect: () => void;
    onManual: () => void; onPaypalSuccess: (data: PaypalSuccessDetails) => void;
    loading: boolean; currency: string; t: (key: string) => string;
}

function PlanCard({ id, name, price, color, icon, features, onSelect, onManual, onPaypalSuccess, loading, currency }: PlanCardProps) {
    return (
        <div style={{ border: `1.5px solid ${color}25`, background: '#fff', padding: '28px 24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', transition: 'all 0.25s', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-4px)', e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: `${color}15`, color: color, padding: '10px', borderRadius: '14px' }}>{icon}</div>
                <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111' }}>{name}</h3>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: color }}>{price} <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>/mês</span></div>
                </div>
            </div>

            <div style={{ marginBottom: '20px', flex: 1 }}>
                {features.map((f: string) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', fontSize: '0.85rem', color: '#444' }}>
                        <div style={{ minWidth: '18px', height: '18px', borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                            <Check size={11} color={color} strokeWidth={3} />
                        </div>
                        {f}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Stripe */}
                <button onClick={onSelect} disabled={loading}
                    style={{ width: '100%', height: '45px', background: '#fff', color: '#000', borderRadius: '8px', fontWeight: 800, border: '2px solid #000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', transition: 'all 0.2s', padding: 0 }}
                    onMouseOver={e => (e.currentTarget.style.background = '#000', e.currentTarget.style.color = '#fff')}
                    onMouseOut={e => (e.currentTarget.style.background = '#fff', e.currentTarget.style.color = '#000')}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <svg width="42" height="13" viewBox="0 0 24 8" fill="currentColor"><path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z" transform="translate(0, -7.5)" /></svg>
                        </div>
                    )}
                </button>

                {/* PayPal */}
                <div style={{ background: '#FFC439', borderRadius: '8px', overflow: 'hidden', height: '45px', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, pointerEvents: 'none' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                    </div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <PaypalButton type="subscription" planId={id} currency={currency} onSuccess={onPaypalSuccess} />
                    </div>
                </div>

                {/* Manual */}
                <button onClick={onManual}
                    style={{ width: '100%', height: '45px', background: '#333', color: '#fff', borderRadius: '8px', fontWeight: 800, border: '1px solid #444', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s', padding: 0 }}
                    onMouseOver={e => (e.currentTarget.style.background = '#1a1a1a')}
                    onMouseOut={e => (e.currentTarget.style.background = '#333')}>
                    M-Pesa / Transferência
                </button>
            </div>
        </div>
    );
}
