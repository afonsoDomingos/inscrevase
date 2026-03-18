"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, CheckCircle, XCircle, Clock, ExternalLink,
    CreditCard, Trash2, PowerOff,
    Eye, MousePointer2, AlertCircle, Calendar,
    User, Activity
} from 'lucide-react';
import { adService, AdRequestModel } from '@/lib/adService';
import { useCurrency } from '@/context/CurrencyContext';
import Image from 'next/image';
import { toast } from 'sonner';
import Tooltip from '../common/Tooltip';


const cardStyles = `
    .ad-card-container {
        display: flex;
        flex-direction: row;
        background: #fff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
        border: 1px solid #f1f5f9;
        transition: all 0.3s ease;
    }
    .ad-card-preview {
        width: 320px;
        min-height: 200px;
        background: #f8fafc;
        position: relative;
        flex-shrink: 0;
    }
    .ad-card-content {
        flex: 1;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    .ad-metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }
    .ad-user-info {
        grid-column: span 2;
    }
    
    @media (max-width: 1024px) {
        .ad-card-container {
            flex-direction: column;
        }
        .ad-card-preview {
            width: 100%;
            height: 250px;
        }
    }
    
    @media (max-width: 640px) {
        .ad-card-content {
            padding: 1.25rem;
        }
        .ad-metrics-grid {
            grid-template-columns: 1fr 1fr;
        }
        .ad-user-info {
            grid-column: span 2;
        }
        .ad-header-stats {
            display: none !important;
        }
        .ad-action-bar {
            flex-direction: column;
            align-items: stretch !important;
        }
        .ad-action-buttons {
            flex-direction: column;
        }
    }
`;

export default function AdRequestList() {
    const [requests, setRequests] = useState<AdRequestModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all');
    const { formatPrice } = useCurrency();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await adService.getAllAdRequestsAdmin();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading ads:', error);
            setRequests([]);
            toast.error('Erro ao carregar anúncios');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'suspended') => {
        const loadingToast = toast.loading('Atualizando status...');
        try {
            await adService.updateAdRequestStatus(id, status);
            const msg = status === 'approved' ? 'aprovado' : status === 'rejected' ? 'rejeitado' : 'suspenso';
            toast.success(`Anúncio ${msg} com sucesso`, { id: loadingToast });
            loadRequests();
        } catch (err) {
            console.error('Error updating ad status:', err);
            toast.error('Erro ao atualizar status do anúncio', { id: loadingToast });
        }
    };

    const handleToggleActive = async (id: string, current: boolean | undefined) => {
        const loadingToast = toast.loading(current ? 'Pausando...' : 'Ativando...');
        try {
            await adService.toggleAdStatus(id, !current);
            toast.success(`Anúncio ${!current ? 'ativado' : 'pausado'} com sucesso`, { id: loadingToast });
            loadRequests();
        } catch (err) {
            console.error('Error toggling ad status:', err);
            toast.error('Erro ao alternar status do anúncio', { id: loadingToast });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja realmente excluir este anúncio permanentemente?')) {
            const loadingToast = toast.loading('Excluindo...');
            try {
                await adService.deleteAdRequest(id);
                toast.success('Anúncio excluído', { id: loadingToast });
                loadRequests();
            } catch (err) {
                console.error('Error deleting ad:', err);
                toast.error('Erro ao excluir anúncio', { id: loadingToast });
            }
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1.5rem' }}>
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ color: '#FFD700' }}
            >
                <Megaphone size={60} />
            </motion.div>
            <p style={{ color: '#666', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }} className="animate-pulse">
                Sincronizando Publicidade Global...
            </p>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '4rem' }}>
            <style>{cardStyles}</style>
            {/* Premium Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: '#fff',
                    padding: '2.5rem',
                    borderRadius: '32px',
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #f1f5f9'
                }}
            >
                {/* Decorative background elements removed for cleaner look */}

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '20px',
                            background: '#f8fafc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid #e2e8f0',
                        }}>
                            <Megaphone className="text-black" size={36} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000', margin: 0, letterSpacing: '-0.5px' }}>
                                Gestão de <span style={{ color: '#000' }}>Anúncios</span>
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '4px', fontWeight: 500 }}>
                                Controle total da publicidade e faturamento da plataforma.
                            </p>
                        </div>
                    </div>

                    <div className="ad-header-stats" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '18px',
                            border: '1px solid #e2e8f0', minWidth: '100px'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Total</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#000' }}>{requests.length}</div>
                        </div>
                        <div style={{
                            background: '#eff6ff', padding: '1rem 1.5rem', borderRadius: '18px',
                            border: '1px solid #dbeafe', minWidth: '100px'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Pendentes</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1d4ed8' }}>{requests.filter(r => r.status === 'pending').length}</div>
                        </div>
                        <div style={{
                            background: '#f0fdf4', padding: '1rem 1.5rem', borderRadius: '18px',
                            border: '1px solid #dcfce7', minWidth: '100px'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Ativos</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>{requests.filter(r => r.isActive).length}</div>
                        </div>
                    </div>
                </div>

                {/* Glass Tabs */}
                <div style={{
                    marginTop: '2.5rem', display: 'flex', gap: '0.75rem',
                    padding: '6px', background: '#f8fafc', borderRadius: '16px',
                    width: 'fit-content', border: '1px solid #e2e8f0',
                    maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch'
                }}>
                    {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: filter === f ? '#FFD700' : 'transparent',
                                color: filter === f ? '#000' : '#64748b',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {f === 'pending' && <Clock size={14} />}
                            {f === 'approved' && <CheckCircle size={14} />}
                            {f === 'rejected' && <XCircle size={14} />}
                            {f === 'suspended' && <PowerOff size={14} />}
                            {f === 'all' ? 'Ver Todos' : f === 'pending' ? 'Solicitações' : f === 'approved' ? 'Em Exibição' : f === 'rejected' ? 'Reprovados' : 'Suspensos'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Content List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <AnimatePresence mode='popLayout'>
                    {filteredRequests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: '#fff', padding: '5rem', borderRadius: '32px',
                                border: '2px dashed #e2e8f0', textAlign: 'center',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
                            }}
                        >
                            <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                <AlertCircle size={48} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Nenhum anúncio encontrado</h3>
                                <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>
                                    Não existem registros correspondentes ao filtro &quot;{filter}&quot; no momento.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        filteredRequests.map((req, idx) => (
                            <motion.div
                                key={req._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="ad-card-container"
                            >
                                <div style={{ display: 'flex', flexDirection: 'inherit', width: '100%' }}>
                                    {/* Preview Container */}
                                    <div className="ad-card-preview">
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            background: req.mediaUrl ? '#f8fafc' : 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {req.mediaUrl ? (
                                                req.mediaType === 'video' ? (
                                                    <video
                                                        src={req.mediaUrl}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        autoPlay muted loop
                                                    />
                                                ) : (
                                                    <Image src={req.mediaUrl} alt={req.title} fill style={{ objectFit: 'cover' }} />
                                                )
                                            ) : (
                                                <div style={{ position: 'relative', width: '40%', height: '40%', opacity: 0.1, filter: 'grayscale(1)' }}>
                                                    <Image src="/logo.png" alt="Logo" fill style={{ objectFit: 'contain' }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Dynamic Status Badges */}
                                        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                                            <div style={{
                                                padding: '6px 12px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 900,
                                                textTransform: 'uppercase', backdropFilter: 'blur(10px)', color: '#fff',
                                                background: req.status === 'approved' ? 'rgba(34, 197, 94, 0.85)' :
                                                    req.status === 'pending' ? 'rgba(59, 130, 246, 0.85)' :
                                                        req.status === 'suspended' ? 'rgba(217, 119, 6, 0.85)' : 'rgba(239, 68, 68, 0.85)'
                                            }}>
                                                {req.status === 'approved' ? 'Publicado' : req.status === 'pending' ? 'Pendente' : req.status === 'suspended' ? 'Suspenso' : 'Reprovado'}
                                            </div>
                                            {req.isActive && req.status === 'approved' && (
                                                <div style={{
                                                    padding: '6px 12px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 900,
                                                    textTransform: 'uppercase', background: 'rgba(255, 215, 0, 0.95)', color: '#000',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                                }}>
                                                    🟢 Ativo
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="ad-card-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                                            <div style={{ flex: 1, minWidth: '300px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                    <span style={{
                                                        background: '#f1f5f9', color: '#475569', padding: '4px 10px',
                                                        borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
                                                    }}>
                                                        {req.category}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Calendar size={12} /> {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.2 }}>
                                                    {req.title}
                                                </h3>
                                                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                                    {req.description}
                                                </p>
                                            </div>

                                            <div style={{
                                                background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '20px',
                                                padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Investimento</div>
                                                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#059669' }}>{formatPrice(req.priceTotal, req.currency || 'USD')}</div>
                                                </div>
                                                <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }} />
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Duração</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{req.durationWeeks} Semanas</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metrics & Advertiser */}
                                        <div className="ad-metrics-grid">
                                            <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    <Eye size={14} /> Views
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e3a8a' }}>{req.views || 0}</div>
                                            </div>
                                            <div style={{ background: 'rgba(147, 51, 234, 0.03)', border: '1px solid rgba(147, 51, 234, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9333ea', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    <MousePointer2 size={14} /> Clicks
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#581c87' }}>{req.clicks || 0}</div>
                                            </div>
                                            <div style={{ background: 'rgba(234, 179, 8, 0.03)', border: '1px solid rgba(234, 179, 8, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ca8a04', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    <Activity size={14} /> CTR
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#854d0e' }}>
                                                    {req.views && req.views > 0 ? ((req.clicks || 0) / req.views * 100).toFixed(2) : '0.00'}%
                                                </div>
                                            </div>
                                            <div className="ad-user-info" style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                                                            {(typeof req.userId === 'object' && req.userId !== null) ? req.userId.name : 'Vendedor/Mentor'}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                            {(typeof req.userId === 'object' && req.userId !== null) ? req.userId.email : 'Proprietário do anúncio'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Pagamento</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: req.paymentMethod === 'stripe' ? '#4f46e5' : '#ea580c' }}>
                                                            {req.paymentMethod?.toUpperCase() || 'MANUAL'}
                                                        </span>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            background: req.paymentStatus === 'paid' ? '#dcfce7' : '#f1f5f9',
                                                            padding: '2px 8px', borderRadius: '10px',
                                                            border: `1px solid ${req.paymentStatus === 'paid' ? '#bbf7d0' : '#e2e8f0'}`
                                                        }}>
                                                            <div style={{
                                                                width: '6px', height: '6px', borderRadius: '50%',
                                                                background: req.paymentStatus === 'paid' ? '#22c55e' : '#94a3b8'
                                                            }} />
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: req.paymentStatus === 'paid' ? '#166534' : '#64748b', textTransform: 'uppercase' }}>
                                                                {req.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="ad-action-bar" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div className="ad-action-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {req.paymentProofUrl && (
                                                    <Tooltip content="Ver comprovativo de pagamento">
                                                        <a href={req.paymentProofUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                            <div style={{
                                                                padding: '8px 16px', background: '#f1f5f9', color: '#475569',
                                                                borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800,
                                                                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}>
                                                                <CreditCard size={16} /> Comprovativo
                                                            </div>
                                                        </a>
                                                    </Tooltip>
                                                )}

                                                {req.targetUrl && (
                                                    <Tooltip content="Visitar link de destino do anúncio">
                                                        <a href={req.targetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                            <div style={{
                                                                padding: '8px 16px', background: '#f1f5f9', color: '#475569',
                                                                borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800,
                                                                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}>
                                                                <ExternalLink size={16} /> Link Destino
                                                            </div>
                                                        </a>
                                                    </Tooltip>
                                                )}

                                            </div>

                                            <div className="ad-action-buttons" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <Tooltip content="Recusar este anúncio">
                                                            <button
                                                                onClick={() => req._id && handleUpdateStatus(req._id, 'rejected')}
                                                                style={{
                                                                    padding: '10px 20px', background: 'transparent', color: '#ef4444',
                                                                    border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px',
                                                                    fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer'
                                                                }}
                                                            >
                                                                Recusar
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip content="Aprovar e publicar anúncio imediatamente">
                                                            <button
                                                                onClick={() => req._id && handleUpdateStatus(req._id, 'approved')}
                                                                style={{
                                                                    padding: '10px 24px', background: '#000', color: '#FFD700',
                                                                    border: 'none', borderRadius: '12px',
                                                                    fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                                                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                                                }}
                                                            >
                                                                Aprovar & Publicar
                                                            </button>
                                                        </Tooltip>
                                                    </>
                                                )}


                                                {(req.status === 'approved' || req.status === 'suspended') && (
                                                    <>
                                                        <Tooltip content={req.status === 'suspended' ? 'Reativar anúncio suspenso' : 'Suspender anúncio temporariamente'}>
                                                            <button
                                                                onClick={() => req._id && handleUpdateStatus(req._id, req.status === 'suspended' ? 'approved' : 'suspended')}
                                                                style={{
                                                                    padding: '10px 20px',
                                                                    background: req.status === 'suspended' ? '#ecfdf5' : '#fff7ed',
                                                                    color: req.status === 'suspended' ? '#059669' : '#d97706',
                                                                    border: req.status === 'suspended' ? '1px solid #a7f3d0' : '1px solid #ffedd5',
                                                                    borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer'
                                                                }}
                                                            >
                                                                {req.status === 'suspended' ? 'Reativar' : 'Suspender'}
                                                            </button>
                                                        </Tooltip>
                                                        {req.status === 'approved' && (
                                                            <Tooltip content={req.isActive ? 'Pausar exibição do anúncio' : 'Retomar exibição do anúncio'}>
                                                                <button
                                                                    onClick={() => req._id && handleToggleActive(req._id, req.isActive)}
                                                                    style={{
                                                                        padding: '10px 20px',
                                                                        background: req.isActive ? '#f8fafc' : '#eff6ff',
                                                                        color: req.isActive ? '#64748b' : '#2563eb',
                                                                        border: req.isActive ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                                                                        borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    {req.isActive ? 'Pausar Exibição' : 'Retomar Exibição'}
                                                                </button>
                                                            </Tooltip>
                                                        )}
                                                    </>
                                                )}


                                                <Tooltip content="Excluir anúncio permanentemente">
                                                    <button
                                                        onClick={() => req._id && handleDelete(req._id)}
                                                        style={{
                                                            padding: '10px', background: 'transparent', color: '#cbd5e1',
                                                            border: 'none', cursor: 'pointer', transition: 'color 0.2s'
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                                                        onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </Tooltip>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}


