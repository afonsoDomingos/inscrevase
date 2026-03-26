"use client";

import { useEffect, useState } from 'react';
import { marketingService, MarketingRequest } from '@/lib/marketingService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XCircle,
    Phone,
    Mail,
    Search,
    Loader2,
    Zap,
    Save
} from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { useTranslate } from '@/context/LanguageContext';


export default function MarketingRequestList() {
    const [requests, setRequests] = useState<MarketingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<MarketingRequest | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const { t } = useTranslate();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await marketingService.getAllRequests();
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProgress = async (requestId: string) => {
        setIsUpdating(true);
        try {
            await marketingService.updateStatus(requestId, newStatus, adminNotes);
            toast.success(t('dashboard.adminMarketing.messages.success'));
            loadRequests();
            setSelectedRequest(null);
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || t('dashboard.adminMarketing.messages.error'));
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            req.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.whatsapp.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return { bg: 'rgba(212,175,55,0.1)', color: '#D4AF37', label: t('dashboard.adminMarketing.status.pending') };
            case 'contacted': return { bg: 'rgba(37,99,235,0.1)', color: '#3b82f6', label: t('dashboard.adminMarketing.status.contacted') };
            case 'in_progress': return { bg: 'rgba(168,85,247,0.1)', color: '#a855f7', label: t('dashboard.adminMarketing.status.in_progress') };
            case 'completed': return { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', label: t('dashboard.adminMarketing.status.completed') };
            case 'cancelled': return { bg: 'rgba(229,62,62,0.1)', color: '#e53e3e', label: t('dashboard.adminMarketing.status.cancelled') };
            default: return { bg: '#eee', color: '#666', label: status };
        }
    };

    const getServiceLabel = (type: string) => {
        switch (type) {
            case 'boost_social': return 'Boost Social';
            case 'meta_ads': return 'Aceleração Meta Ads';
            case 'gestion_360': return 'Gestão 360º';
            default: return type;
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="#D4AF37" />
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', color: '#1a1a1a' }}>
                    {t('dashboard.adminMarketing.title').split('&')[0]}<span className="gold-text">& {t('dashboard.adminMarketing.title').split('&')[1]}</span>
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder={t('dashboard.adminMarketing.searchPlaceholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid #ddd', minWidth: '300px' }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ddd', background: '#fff' }}
                    >
                        <option value="all">{t('dashboard.adminMarketing.statusFilter')}</option>
                        <option value="pending">{t('dashboard.adminMarketing.status.pending')}s</option>
                        <option value="contacted">{t('dashboard.adminMarketing.status.contacted')}s</option>
                        <option value="in_progress">{t('dashboard.adminMarketing.status.in_progress')}</option>
                        <option value="completed">{t('dashboard.adminMarketing.status.completed')}s</option>
                    </select>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1.2rem', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800 }}>{t('dashboard.adminMarketing.table.mentor')}</th>
                            <th style={{ padding: '1.2rem', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800 }}>{t('dashboard.adminMarketing.table.contact')}</th>
                            <th style={{ padding: '1.2rem', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800 }}>{t('dashboard.adminMarketing.table.service')}</th>
                            <th style={{ padding: '1.2rem', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800 }}>{t('dashboard.adminMarketing.table.date')}</th>
                            <th style={{ padding: '1.2rem', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800 }}>{t('dashboard.adminMarketing.table.status')}</th>
                            <th style={{ padding: '1.2rem', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800 }}>{t('dashboard.adminMarketing.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map((req) => {
                            const statusStyle = getStatusStyle(req.status);
                            return (
                                <tr key={req._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'var(--gold-gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900 }}>
                                                {req.contactName.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#1a1a1a' }}>{req.contactName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>{req.companyName || 'Indivíduo'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <Tooltip content="Abrir conversa no WhatsApp">
                                                <a href={`https://wa.me/${req.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, textDecoration: 'none' }}>
                                                    <Phone size={14} /> {req.whatsapp}
                                                </a>
                                            </Tooltip>
                                            <Tooltip content="Enviar email para o mentor">
                                                <a href={`mailto:${req.email}`} style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                                                    <Mail size={14} /> {req.email}
                                                </a>
                                            </Tooltip>
                                        </div>

                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Zap size={16} color="#D4AF37" />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{getServiceLabel(req.serviceType)}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', color: '#888', fontSize: '0.85rem' }}>
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            background: statusStyle.bg,
                                            color: statusStyle.color,
                                            textTransform: 'uppercase'
                                        }}>
                                            {statusStyle.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setAdminNotes(req.adminNotes || '');
                                                setNewStatus(req.status);
                                            }}
                                            style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            {t('dashboard.adminMarketing.buttonManage')}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredRequests.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
                        {t('dashboard.adminMarketing.status.pending')}...
                    </div>
                )}
            </div>

            {/* Management Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ position: 'relative', width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                            <div style={{ padding: '1.5rem', background: '#000', color: '#FFD700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{t('dashboard.adminMarketing.modal.title', { name: selectedRequest.contactName })}</h3>
                                <Tooltip content={t('common.close')}>
                                    <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                        <XCircle size={24} />
                                    </button>
                                </Tooltip>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <div style={{ marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '12px', border: '1px solid #eee' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase' }}>{t('dashboard.adminMarketing.modal.details')}</h4>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#1a1a1a', lineHeight: 1.6 }}>{selectedRequest.details}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('dashboard.adminMarketing.modal.currentStatus')}</label>
                                        <select
                                            value={newStatus}
                                            onChange={e => setNewStatus(e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd' }}
                                        >
                                            <option value="pending">{t('dashboard.adminMarketing.status.pending')}</option>
                                            <option value="contacted">{t('dashboard.adminMarketing.status.contacted')}</option>
                                            <option value="in_progress">{t('dashboard.adminMarketing.status.in_progress')}</option>
                                            <option value="completed">{t('dashboard.adminMarketing.status.completed')}</option>
                                            <option value="cancelled">{t('dashboard.adminMarketing.status.cancelled')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('dashboard.adminMarketing.modal.quickActions')}</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Tooltip content={t('dashboard.adminMarketing.modal.quickActions')}>
                                                <a href={`https://wa.me/${selectedRequest.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.8rem', background: '#16a34a', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                                                    <Phone size={16} /> WhatsApp
                                                </a>
                                            </Tooltip>
                                            <Tooltip content={t('dashboard.usersList.actions.sendEmail')}>
                                                <a href={`mailto:${selectedRequest.email}`} style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                                                    <Mail size={16} /> Email
                                                </a>
                                            </Tooltip>
                                        </div>

                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('dashboard.adminMarketing.modal.internalNotes')}</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={e => setAdminNotes(e.target.value)}
                                        placeholder="Ex: Já contactamos para agendar zoom... ou O anúncio correu bem, +200 leads."
                                        rows={3}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', resize: 'none' }}
                                    />
                                </div>

                                <button
                                    onClick={() => handleUpdateProgress(selectedRequest._id)}
                                    disabled={isUpdating}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--gold-gradient)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {t('dashboard.adminMarketing.modal.save')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
