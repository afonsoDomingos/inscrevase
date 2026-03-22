'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, Lock, AlertCircle } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

interface StripeCheckoutProps {
    formId: string;
    formData: Record<string, string | number | boolean | null>;
    eventTitle?: string;
    price: number;
    currency: string;
    onClose?: () => void;
    onSuccess?: () => void;
    isOpen?: boolean;
    asButton?: boolean;
}

export default function StripeCheckout({
    formId,
    formData,
    eventTitle = 'Inscrição em Evento',
    price,
    currency,
    onClose,
    isOpen = false,
    asButton = true
}: StripeCheckoutProps) {
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslate();

    const showModal = isOpen || isInternalOpen;

    const handlePayment = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/checkout/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formId, submissionData: formData })
            });

            const result = await response.json();

            // Meta Pixel Tracking
            if (typeof window !== 'undefined' && (window as unknown as { fbq: (t: string, e: string, p: Record<string, unknown>) => void }).fbq) {
                (window as unknown as { fbq: (t: string, e: string, p: Record<string, unknown>) => void }).fbq('track', 'InitiateCheckout', {
                    content_name: eventTitle as string,
                    content_ids: [formId],
                    content_type: 'product',
                    value: price,
                    currency: currency
                });
            }

            if (!response.ok) {
                if (result.message?.includes('not ready')) {
                    alert('Este mentor ainda não configurou completamente os pagamentos via Stripe. Por favor, utilize o método "Manual" para enviar seu comprovativo.');
                } else {
                    alert(result.message || 'Erro ao iniciar checkout');
                }
                setLoading(false);
                return;
            }

            if (result.url) {
                window.location.href = result.url;
            } else {
                alert('Erro: URL de pagamento não recebida.');
                setLoading(false);
            }
        } catch (err: unknown) {
            console.error('Payment Error:', err);
            alert('Falha na conexão com o sistema de pagamentos.');
            setLoading(false);
        }
    };

    const modalClose = () => {
        setIsInternalOpen(false);
        if (onClose) onClose();
    };

    if (asButton && !showModal) {
        return (
            <motion.div
                style={{
                    width: '100%', padding: '1.2rem', 
                    background: 'rgba(255,255,255,0.05)',
                    color: '#888', border: '1px dashed rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '0.95rem', fontWeight: 600, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    position: 'relative', overflow: 'hidden', cursor: 'pointer'
                }}
                whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.08)' }}
                onClick={() => setIsInternalOpen(true)}
            >
                <div style={{ position: 'absolute', top: '5px', right: '10px', opacity: 0.3 }}>
                    <Lock size={12} />
                </div>
                <CreditCard size={18} opacity={0.5} />
                <span>{t('payWithCardStripe')} (Cartão)</span>
            </motion.div>
        );
    }

    if (!showModal) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} style={{ background: '#fff', borderRadius: '32px', maxWidth: '500px', width: '100%', overflow: 'hidden' }}>
                <div style={{ padding: '30px', background: '#1a1a1a', color: '#fff', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Pagamento Seguro</h2>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Powered by Stripe</p>
                </div>
                <div style={{ padding: '30px' }}>
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #eee' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Evento</div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#000', marginBottom: '12px' }}>{eventTitle}</div>
                        <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px dashed #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#444', fontWeight: 600 }}>Total a pagar</span>
                            <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#000' }}>{price} {currency}</span>
                        </div>
                    </div>
                    <div style={{ 
                        background: '#fff9e6', border: '1px solid #ffeeba', 
                        padding: '1.2rem', borderRadius: '16px', marginBottom: '20px',
                        display: 'flex', gap: '12px', alignItems: 'flex-start'
                    }}>
                        <AlertCircle size={24} style={{ color: '#856404', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: 800, color: '#856404', fontSize: '0.9rem', marginBottom: '4px' }}>Checkout Global em Ativação</div>
                            <p style={{ fontSize: '0.8rem', color: '#856404', margin: 0, lineHeight: 1.4 }}>
                                O pagamento direto com cartão (Stripe) está em manutenção regulatória. 
                                <strong> Por favor, utilize o botão "PayPal" na página anterior</strong> – ele também aceita o seu cartão de débito/crédito de forma instantânea e segura!
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={modalClose}
                        style={{ width: '100%', padding: '1rem', background: '#f0f0f0', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: '#666' }}
                    >
                        Entendi, vou usar PayPal
                    </button>
                    <button onClick={modalClose} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>Cancelar</button>
                </div>
            </motion.div>
        </div>
    );
}
