import React, { useState, useEffect } from 'react';
import { feedbackService, FeedbackModel } from '@/lib/feedbackService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Star,
    CheckCircle,
    Archive,
    Calendar,
    Mail,
    AlertCircle,
    Loader2,
    Inbox
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';

export default function FeedbackManagement() {
    const { t } = useTranslate();
    const [feedbacks, setFeedbacks] = useState<FeedbackModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        try {
            const data = await feedbackService.getMyFeedbacks();
            setFeedbacks(data);
        } catch (error: unknown) {
            console.error(error);
            toast.error('Erro ao carregar feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await feedbackService.updateStatus(id, status);
            setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: status as FeedbackModel['status'] } : f));
            toast.success('Status atualizado');
        } catch (error: unknown) {
            console.error(error);
            toast.error('Erro ao atualizar status');
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        if (statusFilter === 'all') return true;
        return f.status === statusFilter;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 className="animate-spin" size={32} color="#D4AF37" />
            </div>
        );
    }

    return (
        <div style={{ color: 'var(--foreground)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', margin: 0 }}>
                        {t('feedback.title')} & Sugestões
                    </h2>
                    <p style={{ color: '#666', marginTop: '4px' }}>Veja o que as pessoas estão sugerindo para você.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {['all', 'new', 'read', 'resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                background: statusFilter === status ? 'var(--gold-gradient)' : 'var(--paper)',
                                border: '1px solid #ddd',
                                color: statusFilter === status ? '#000' : 'var(--foreground)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {status === 'all' ? 'Todos' : status.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {filteredFeedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--paper)', borderRadius: '24px', border: '1px solid #eee' }}>
                    <Inbox size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Nenhum feedback encontrado</h3>
                    <p style={{ color: '#666' }}>Parece que ainda não recebeu sugestões ou críticas.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    <AnimatePresence>
                        {filteredFeedbacks.map((feedback) => (
                            <motion.div
                                key={feedback._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    background: feedback.status === 'new' ? 'rgba(212, 175, 55, 0.05)' : 'var(--paper)',
                                    padding: '2rem',
                                    borderRadius: '24px',
                                    border: '1px solid',
                                    borderColor: feedback.status === 'new' ? '#D4AF37' : '#eee',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                    position: 'relative'
                                }}
                            >
                                {feedback.status === 'new' && (
                                    <span style={{ position: 'absolute', top: '20px', right: '20px', background: '#D4AF37', color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        Novo
                                    </span>
                                )}

                                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MessageSquare color="#D4AF37" />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>{feedback.name}</h4>
                                                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#eee', borderRadius: '6px', color: '#666', fontWeight: 600 }}>
                                                        {feedback.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#888' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {feedback.email}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(feedback.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={16} fill={feedback.rating >= s ? '#D4AF37' : 'none'} color={feedback.rating >= s ? '#D4AF37' : '#ccc'} />
                                                ))}
                                            </div>
                                        </div>

                                        <p style={{ background: '#fff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #f0f0f0', margin: '1rem 0', lineHeight: 1.6, color: '#444' }}>
                                            &quot;{feedback.message}&quot;
                                        </p>

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                                            {feedback.status === 'new' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(feedback._id, 'read')}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a1a1a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    <CheckCircle size={14} /> Marcar como lido
                                                </button>
                                            )}
                                            {feedback.status !== 'resolved' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(feedback._id, 'resolved')}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#16a34a', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    <AlertCircle size={14} /> Marcar como Resolvido
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleUpdateStatus(feedback._id, 'archived')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', color: '#666', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <Archive size={14} /> Arquivar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
