"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowRight, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccess() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [submissionId, setSubmissionId] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/payment/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setSubmissionId(data.submission);
                    toast.success('Pagamento confirmado com sucesso!');
                } else {
                    console.error('Verification failed:', data.message);
                    setStatus('error');
                }
            } catch (err) {
                console.error('Error verifying payment:', err);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [sessionId]);

    if (status === 'loading') {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
                <p style={{ marginTop: '1.5rem', color: '#888', fontWeight: 500 }}>Confirmando seu pagamento...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff', textAlign: 'center', padding: '20px' }}>
                <div style={{ background: 'rgba(255, 0, 0, 0.1)', padding: '2rem', borderRadius: '30px', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Ops! Algo deu errado</h2>
                    <p style={{ color: '#aaa', marginBottom: '2rem' }}>Não conseguimos verificar seu pagamento automaticamente. Por favor, entre em contato com o suporte.</p>
                    <button onClick={() => router.push('/')} className="btn-primary" style={{ padding: '0.8rem 2rem', background: '#FFD700', color: '#000', borderRadius: '12px', fontWeight: 700 }}>
                        Voltar para o Início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff', textAlign: 'center', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ maxWidth: '500px', width: '100%', background: 'rgba(255, 215, 0, 0.05)', padding: '3rem', borderRadius: '40px', border: '1px solid rgba(255, 215, 0, 0.1)' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    style={{ color: '#FFD700', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}
                >
                    <CheckCircle size={80} />
                </motion.div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(to bottom, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Inscrição Confirmada!
                </h1>

                <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    Seu pagamento foi aprovado e sua vaga está garantida. Enviamos os detalhes para o seu e-mail.
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{
                            padding: '1.2rem',
                            background: '#FFD700',
                            color: '#000',
                            borderRadius: '16px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        PÁGINA INICIAL <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
