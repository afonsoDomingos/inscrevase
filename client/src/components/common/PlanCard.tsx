"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, Crown, Lock } from "lucide-react";
import PaypalButton from "./PaypalButton";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "sonner";

interface PlanCardProps {
    id: string;
    name: string;
    description: string;
    price: number | string;
    amount: number;
    currency: string;
    features: string[];
    bgImage: string;
    recommended?: boolean;
    isEnterprise?: boolean;
    canUseTrial?: boolean;
    trialPrice?: number;
    isCurrentPlan?: boolean;
    onManualSelect: () => void;
    onSuccess: () => void;
    t: (key: string) => string;
}

export default function PlanCard({
    id, name, description, price, amount, currency, features, bgImage,
    recommended, isEnterprise, canUseTrial, isCurrentPlan, onManualSelect, onSuccess, t
}: PlanCardProps) {
    const { formatPrice } = useCurrency();

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="luxury-card"
            style={{
                flex: '0 1 360px', // Prevent stretching
                minHeight: '680px', // Consistent height for all cards
                display: 'flex',
                flexDirection: 'column',
                background: `linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 100%), url("${bgImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: recommended ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                padding: '1.5rem',
                borderRadius: '24px',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: recommended ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease'
            }}
        >
            {recommended && (
                <div style={{
                    position: 'absolute', top: '15px', right: '15px',
                    background: '#D4AF37', color: '#000', padding: '4px 12px',
                    borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900,
                    textTransform: 'uppercase', zIndex: 10
                }}>
                    {t('common.recommended')}
                </div>
            )}

            {canUseTrial && id === 'pro' && (
                <div style={{
                    position: 'absolute', top: '15px', left: '15px',
                    background: '#fff', color: '#000', padding: '4px 12px',
                    borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900,
                    textTransform: 'uppercase', zIndex: 10,
                    boxShadow: '0 4px 12px rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', gap: '5px'
                }}>
                    <Zap size={10} fill="#000" />
                    {t('plans.trialBadge')}
                </div>
            )}

            {isCurrentPlan && (
                <div style={{
                    position: 'absolute', top: '15px', left: '15px',
                    background: 'rgba(52, 211, 153, 0.2)', color: '#10b981', padding: '4px 12px',
                    borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900,
                    textTransform: 'uppercase', zIndex: 10,
                    border: '1px solid #10b981',
                    display: 'flex', alignItems: 'center', gap: '5px'
                }}>
                    <CheckCircle size={10} />
                    {t('plans.currentPlan')}
                </div>
            )}

            <div style={{ marginBottom: '1.5rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                <h3 style={{
                    fontSize: isEnterprise ? '2.5rem' : '2.2rem',
                    fontWeight: 900, marginBottom: '0.2rem',
                    color: recommended ? '#D4AF37' : '#fff',
                    fontFamily: 'var(--font-playfair)'
                }}>
                    {name}
                </h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{description}</p>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                {canUseTrial && id === 'pro' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff' }}>
                            {t('common.free')}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9, background: 'rgba(212,175,55,0.2)', padding: '2px 10px', borderRadius: '4px', marginTop: '4px', color: '#D4AF37' }}>
                            {t('plans.freeFirstMonth')}
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: '8px' }}>
                            {typeof price === 'string' ? price : formatPrice(amount, currency, currency)} {t('plans.perMonthAfter')}
                        </div>
                    </div>
                ) : (
                    <div style={{ fontSize: '2.8rem', fontWeight: 900, color: recommended || isEnterprise ? '#D4AF37' : '#fff' }}>
                        {typeof price === 'string' ? price : formatPrice(amount, currency, currency)}
                        <span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.7 }}>/mês</span>
                    </div>
                )}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 2 }}>
                {features.map((f, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                        <div style={{
                            padding: '6px',
                            background: isEnterprise ? 'rgba(184, 134, 11, 0.2)' : recommended ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '50%'
                        }}>
                            {isEnterprise ? <Crown size={18} color="#D4AF37" /> : recommended ? <Zap size={18} color="#D4AF37" /> : <CheckCircle size={18} color="#fff" />}
                        </div>
                        <span style={{ fontWeight: isEnterprise && idx === 0 ? 900 : 400 }}>{f}</span>
                    </li>
                ))}
            </ul>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
                {isCurrentPlan ? (
                    <div style={{
                        width: '100%', padding: '15px',
                        borderRadius: '12px', background: 'rgba(52, 211, 153, 0.1)',
                        border: '1px solid #10b981', color: '#10b981',
                        fontWeight: 800, textAlign: 'center', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}>
                        <CheckCircle size={18} />
                        {t('plans.currentActive')}
                    </div>
                ) : (
                    <>
                        {id !== 'free' && (
                            <>
                                {/* Stripe Locked Mockup */}
                                <div
                                    onClick={() => toast.info("Checkout via Stripe temporariamente indisponível. Por favor, use o PayPal para pagar com seu cartão – é seguro e instantâneo!")}
                                    style={{
                                        width: '100%', height: '52px',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#999', borderRadius: '12px',
                                        fontWeight: 800, border: '1px dashed rgba(255,255,255,0.2)',
                                        cursor: 'help', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        gap: '10px', padding: 0
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', opacity: 0.4 }}>
                                        <Lock size={14} />
                                        <span style={{ fontSize: '0.85rem' }}>Cartão Débito/Crédito</span>
                                    </div>
                                </div>

                                {/* PayPal with Trial Logic */}
                                <div style={{ background: '#FFC439', borderRadius: '12px', height: '52px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, pointerEvents: 'none' }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                        <PaypalButton
                                            type="subscription"
                                            planId={id}
                                            currency={currency}
                                            trial={id === 'pro' && canUseTrial}
                                            onSuccess={onSuccess}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Manual Transfer Button */}
                        <button
                            onClick={onManualSelect}
                            style={{
                                width: '100%', height: '52px',
                                borderRadius: '12px', background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                                fontWeight: 700, cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        >
                            {t('plans.alternativePayment')}
                        </button>
                    </>
                )}

                {id === 'free' && !isCurrentPlan && (
                    <button
                        disabled
                        style={{
                            width: '100%', height: '52px',
                            borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)',
                            fontWeight: 700, cursor: 'default', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {t('plans.currentActive')}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
