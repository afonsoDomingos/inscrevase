'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Settings, XCircle, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { subscriptionService } from '@/lib/subscriptionService';
import { toast } from 'sonner';
import { UserData } from '@/lib/authService';

interface SubscriptionStatusProps {
    user: UserData;
}

export default function SubscriptionStatus({ user }: SubscriptionStatusProps) {
    const [loading, setLoading] = useState(false);

    const handleManageStripe = async () => {
        setLoading(true);
        try {
            const url = await subscriptionService.getStripePortal();
            window.location.href = url;
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPaypal = async () => {
        // Find subscription ID from user meta or similar. 
        // In this implementation, we can try to get it if user has it stored, or ask user.
        // Usually recurring PayPal users have a subscriptionId in their metadata after success.
        const u = user as any;
        const subId = u.paymentMetadata?.subscriptionId || u.paypalSubscriptionId;

        if (!subId) {
            toast.info("Para cancelar no PayPal, aceda ao seu painel PayPal em 'Pagamentos Automáticos'.");
            window.open('https://www.paypal.com/myaccount/autopay/', '_blank');
            return;
        }

        if (confirm("Tem a certeza que deseja cancelar a renovação automática da sua assinatura? Manterá o acesso até ao fim do período pago.")) {
            setLoading(true);
            try {
                await subscriptionService.cancelPaypal(subId);
                toast.success("Renovação automática cancelada com sucesso.");
                window.location.reload();
            } catch (error: unknown) {
                const err = error as Error;
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    if (user.plan === 'free') return null;

    const isStripe = user.paymentMethod === 'stripe';
    const isPaypal = user.paymentMethod === 'paypal';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxury-card"
            style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '20px',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: 'rgba(255, 215, 0, 0.1)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <Crown size={22} color="#FFD700" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                            Plano {user.plan.toUpperCase()}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                            Status: <span style={{ color: user.subscriptionStatus === 'active' ? '#4ade80' : '#fbbf24' }}>
                                {user.subscriptionStatus === 'active' ? 'Ativa' : 'Pendente / Cancelada'}
                            </span>
                        </p>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Expira em</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FFD700' }}>
                        {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,215,0,0.1)' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {isStripe && (
                    <button
                        onClick={handleManageStripe}
                        disabled={loading}
                        style={{
                            flex: 1, height: '45px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                        Gerir Faturação (Stripe)
                    </button>
                )}

                {isPaypal && (
                    <button
                        onClick={handleCancelPaypal}
                        disabled={loading}
                        style={{
                            flex: 1, height: '45px', borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                        Cancelar Renovação (PayPal)
                    </button>
                )}

                {!isStripe && !isPaypal && user.plan !== 'free' && (
                    <div style={{ 
                        flex: 1, padding: '10px', borderRadius: '10px', 
                        background: 'rgba(255, 215, 0, 0.05)', border: '1px dashed rgba(255, 215, 0, 0.2)',
                        display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 215, 0, 0.8)',
                        fontSize: '0.85rem'
                    }}>
                        <ShieldCheck size={18} />
                        Assinatura via Transferência Manual
                    </div>
                )}
            </div>

            {user.subscriptionStatus === 'cancelled' && (
                <div style={{ 
                    marginTop: '0.5rem', padding: '12px', borderRadius: '10px', 
                    background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)',
                    display: 'flex', alignItems: 'flex-start', gap: '10px'
                }}>
                    <AlertCircle size={18} color="#fbbf24" style={{ marginTop: '2px' }} />
                    <p style={{ fontSize: '0.8rem', color: '#fbbf24', lineHeight: 1.4 }}>
                        A sua renovação automática foi cancelada. O seu acesso Premium terminará a <strong>{user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString() : 'breve'}</strong>.
                    </p>
                </div>
            )}
        </motion.div>
    );
}
