"use client";

import { motion } from "framer-motion";
import { Info, Clock } from "lucide-react";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { useEffect, useState } from "react";
import { authService, UserData } from "@/lib/authService";
import PlanUpgradeModal from "@/components/PlanUpgradeModal";
import { useTranslate } from "@/context/LanguageContext";
import PlanCard from "./PlanCard";

export default function PlansSection({ showTitle = true }: { showTitle?: boolean }) {
    const { t } = useTranslate();
    const { currency, setCurrency, getPlanPrice, getPlanConfig } = useCurrency();
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

    const handleSuccess = () => {
        if (!user) {
            window.location.href = `/entrar?redirect=${encodeURIComponent(window.location.pathname)}&success=true`;
        } else {
            window.location.reload();
        }
    };

    const handleManualSelect = (id: string) => {
        if (!user) {
            window.location.href = `/entrar?redirect=${encodeURIComponent(window.location.pathname)}&plan=${id}&method=manual`;
        } else {
            setSelectedManualPlan({ id, amount: getPlanPrice(id as 'pro' | 'enterprise') });
            setIsUpgradeModalOpen(true);
        }
    };

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
                        {['MZN', 'USD', 'EUR'].map(c => (
                            <button
                                key={c}
                                onClick={() => setCurrency(c as Currency)}
                                style={{
                                    padding: '8px 25px',
                                    borderRadius: '50px',
                                    border: currency === c ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: currency === c ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                    color: currency === c ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {c === 'MZN' ? '🇲🇿 MZN' : c === 'EUR' ? '🇪🇺 EUR' : '🌍 USD'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <PlanCard 
                    id="free"
                    name="Free"
                    description={t('plans.free.description')}
                    price={t('common.free')}
                    amount={0}
                    currency={currency}
                    bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
                    features={[
                        t('plans.free.fee_dynamic', { fee: ((getPlanConfig('free')?.commissionRate || 0.15) * 100).toFixed(0) }),
                        t('plans.unlimitedForms'),
                        t('plans.participantManagement')
                    ]}
                    onManualSelect={() => {}}
                    onSuccess={() => {}}
                    isCurrentPlan={user?.plan === 'free' || (!user?.plan && id === 'free')}
                    t={t}
                />

                <PlanCard 
                    id="pro"
                    name="Pro"
                    description={t('plans.pro.description')}
                    price={getPlanPrice('pro')}
                    amount={getPlanPrice('pro')}
                    currency={currency}
                    recommended={true}
                    canUseTrial={user?.hasUsedTrial !== true}
                    bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
                    features={[
                        t('plans.pro.fee_dynamic', { fee: ((getPlanConfig('pro')?.commissionRate || 0.10) * 100).toFixed(0) }),
                        t('dashboard.plans.f2').replace('• ', ''),
                        t('plans.pro.f1').replace('• ', ''),
                        t('plans.pro.f2').replace('• ', '')
                    ]}
                    onManualSelect={() => handleManualSelect('pro')}
                    onSuccess={handleSuccess}
                    isCurrentPlan={user?.plan === 'pro'}
                    t={t}
                />

                <PlanCard 
                    id="enterprise"
                    name="Enterprise"
                    description={t('plans.enterprise.description')}
                    price={getPlanPrice('enterprise')}
                    amount={getPlanPrice('enterprise')}
                    currency={currency}
                    isEnterprise={true}
                    bgImage="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop"
                    features={[
                        t('plans.enterprise.fee'),
                        t('plans.enterprise.f1').replace('• ', ''),
                        t('plans.enterprise.f2').replace('• ', ''),
                        t('plans.apiIntegration')
                    ]}
                    onManualSelect={() => handleManualSelect('enterprise')}
                    onSuccess={handleSuccess}
                    isCurrentPlan={user?.plan === 'enterprise'}
                    t={t}
                />
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
