'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/lib/dashboardService';
import { toast } from 'sonner';
import { Loader2, DollarSign, ExternalLink, Mail, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import Tooltip from '../common/Tooltip';

interface Payout {
    _id: string;
    paymentMethod: string;
    createdAt: string;
    amount: number;
    mentorEarnings: number;
    currency: string;
    stripePaymentIntentId?: string;
    mentor?: { name: string; paypalEmail?: string; stripeAccountId?: string };
    form?: { title: string };
    user?: { name: string };
}

export default function PaypalPayouts() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice, currency } = useCurrency();

    useEffect(() => {
        loadPayouts();
    }, []);

    const loadPayouts = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getPayPalPayouts();
            setPayouts(data);
        } catch (error) {
            console.error('Error loading payouts:', error);
            toast.error('Erro ao carregar repasses');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 className="animate-spin" size={32} color="#FFD700" />
            </div>
        );
    }

    return (
        <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Repasses Manuais (PayPal & Stripe)</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '5px 0 0' }}>
                        Pagamentos recebidos na conta da plataforma porque o mentor não tinha conta configurada.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ background: '#003087', color: '#fff', padding: '8px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        <DollarSign size={16} />
                        <span style={{ fontWeight: 700 }}>PayPal Hub</span>
                    </div>
                    <div style={{ background: '#635bff', color: '#fff', padding: '8px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        <CreditCard size={16} />
                        <span style={{ fontWeight: 700 }}>Stripe Hub</span>
                    </div>
                </div>
            </div>

            {payouts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8f9fa', borderRadius: '15px' }}>
                    <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <h4 style={{ margin: 0, color: '#666' }}>Nenhum repasse pendente encontrado.</h4>
                </div>
            ) : (
                <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <th style={{ padding: '0 1rem' }}>Método / Data</th>
                                <th style={{ padding: '0 1rem' }}>Mentor & Destino</th>
                                <th style={{ padding: '0 1rem' }}>Evento / Aluno</th>
                                <th style={{ padding: '0 1rem' }}>Valor Líquido</th>
                                <th style={{ padding: '0 1rem' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((tx) => (
                                <tr key={tx._id} style={{ background: '#fcfcfc', border: '1px solid #efefef', transition: 'all 0.2s' }}>
                                    <td style={{ padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {tx.paymentMethod === 'paypal' ? (
                                                <Tooltip content="PayPal">
                                                    <div style={{ color: '#003087' }}><DollarSign size={20} /></div>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip content="Stripe">
                                                    <div style={{ color: '#635bff' }}><CreditCard size={20} /></div>
                                                </Tooltip>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                                                <span style={{ fontWeight: 700 }}>{tx.paymentMethod.toUpperCase()}</span>
                                                <span style={{ color: '#888' }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tx.mentor?.name || 'Mentor Desconhecido'}</span>
                                            {tx.paymentMethod === 'paypal' ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#003087', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <Mail size={12} />
                                                    {tx.mentor?.paypalEmail || <span style={{ color: '#dc2626' }}>E-mail não configurado</span>}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#635bff', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <CreditCard size={12} />
                                                    {tx.mentor?.stripeAccountId ? `Conta: ${tx.mentor.stripeAccountId}` : <span style={{ color: '#dc2626' }}>Stripe não vinculado</span>}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{tx.form?.title || 'Evento Excluído'}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>De: {tx.user?.name || 'Visitante'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                                                {formatPrice(tx.mentorEarnings, tx.currency, currency)}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                                Total: {formatPrice(tx.amount, tx.currency, currency)}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a
                                                href={tx.paymentMethod === 'paypal'
                                                    ? `https://www.paypal.com/myaccount/transfer/homepage`
                                                    : `https://dashboard.stripe.com/payments/${tx.stripePaymentIntentId || ''}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-primary"
                                                style={{
                                                    padding: '6px 14px',
                                                    fontSize: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    background: tx.paymentMethod === 'paypal' ? '#003087' : '#635bff'
                                                }}
                                            >
                                                Pagar {tx.paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'} <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff9e6', borderRadius: '15px', border: '1px solid #ffeeba' }}>
                <h5 style={{ margin: '0 0 10px', color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} /> Resumo de Operação
                </h5>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#856404' }}>
                    <li><strong>PayPal</strong>: O dinheiro está na sua conta de email principal. Envie manualmente para o email do mentor.</li>
                    <li><strong>Stripe</strong>: O pagamento foi feito para a sua conta Stripe (sem transferência). Pode fazer o payout manual via dashboard da Stripe ou transferência bancária.</li>
                    <li>Estas transações aparecem aqui porque o sistema detectou que o mentor não estava pronto para receber o pagamento direto.</li>
                </ul>
            </div>
        </div>
    );
}
