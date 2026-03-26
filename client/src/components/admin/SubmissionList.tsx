"use client";

import { useState, useEffect } from 'react';
import { submissionAdminService, SubmissionModel } from '@/lib/submissionAdminService';
import { CheckCircle, XCircle, Clock, Search, Image as ImageIcon, X, MessageCircle, Copy, ExternalLink, Eye, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import TableScrollWrapper from '../common/TableScrollWrapper';
import Tooltip from '../common/Tooltip';
import { useTranslate } from '@/context/LanguageContext';

export default function SubmissionList() {
    const { t } = useTranslate();
    const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionModel | null>(null);
    const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        try {
            const data = await submissionAdminService.getAllSubmissions();
            setSubmissions(data);
        } catch (error: unknown) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await submissionAdminService.updateStatus(id, status);
            loadSubmissions();
        } catch (error: unknown) {
            console.error(error);
            alert(t('dashboard.usersList.messages.statusError'));
        }
    };

    const filteredSubmissions = submissions.filter(s =>
        (s.form?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (JSON.stringify(s.data || {})).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubmissions = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);

    // Selection handlers
    const handleSelectSubmission = (subId: string) => {
        setSelectedSubmissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subId)) {
                newSet.delete(subId);
            } else {
                newSet.add(subId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allCurrentSelected = currentSubmissions.length > 0 && currentSubmissions.every(s => selectedSubmissions.has(s._id));

        if (allCurrentSelected) {
            const newSelected = new Set(selectedSubmissions);
            currentSubmissions.forEach(s => newSelected.delete(s._id));
            setSelectedSubmissions(newSelected);
        } else {
            const newSelected = new Set(selectedSubmissions);
            currentSubmissions.forEach(s => newSelected.add(s._id));
            setSelectedSubmissions(newSelected);
        }
    };

    const isAllSelected = currentSubmissions.length > 0 && currentSubmissions.every(s => selectedSubmissions.has(s._id));

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('dashboard.adminSubmissions.messages.loading')}</div>;

    return (
        <div className="luxury-card" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {t('dashboard.adminSubmissions.title')}
                    <span style={{ fontSize: '0.8rem', background: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: '20px', color: '#666' }}>
                        {filteredSubmissions.length} {filteredSubmissions.length === 1 ? t('dashboard.adminSubmissions.result', { count: filteredSubmissions.length }) : t('dashboard.adminSubmissions.results', { count: filteredSubmissions.length })}
                    </span>
                </h3>
                <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder={t('dashboard.adminSubmissions.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                        style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            <TableScrollWrapper>
                <table style={{ minWidth: '1000px', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1rem', width: '40px' }}>
                                <Tooltip content={isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}>
                                    <button
                                        onClick={handleSelectAll}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#FFD700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {isAllSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </button>
                                </Tooltip>
                            </th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminSubmissions.table.registrant')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminSubmissions.table.event')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminSubmissions.table.dateTime')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminSubmissions.table.payment')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminSubmissions.table.status')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800, textAlign: 'center' }}>{t('dashboard.adminSubmissions.table.details')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800, textAlign: 'right' }}>{t('dashboard.adminSubmissions.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSubmissions.map((sub) => (
                            <motion.tr
                                layout
                                key={sub._id}
                                style={{
                                    borderBottom: '1px solid #f9f9f9',
                                    background: selectedSubmissions.has(sub._id)
                                        ? 'rgba(255, 215, 0, 0.08)'
                                        : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td style={{ padding: '1rem', width: '40px' }}>
                                    <Tooltip content={selectedSubmissions.has(sub._id) ? 'Desmarcar' : 'Selecionar'}>
                                        <button
                                            onClick={() => handleSelectSubmission(sub._id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: selectedSubmissions.has(sub._id) ? '#FFD700' : '#ddd',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'color 0.2s'
                                            }}
                                        >
                                            {selectedSubmissions.has(sub._id)
                                                ? <CheckSquare size={20} />
                                                : <Square size={20} />}
                                        </button>
                                    </Tooltip>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>
                                        {(() => {
                                            const keys = Object.keys(sub.data || {});
                                            const nameKey = keys.find(k => k.toLowerCase().includes('nome') || k.toLowerCase().includes('name'));
                                            return nameKey ? String(sub.data[nameKey]) : (keys[0] ? String(sub.data[keys[0]]) : 'Sem Nome');
                                        })()}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                        {(() => {
                                            const keys = Object.keys(sub.data || {});
                                            const emailKey = keys.find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'));
                                            return emailKey ? String(sub.data[emailKey]) : 'Sem Email';
                                        })()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{sub.form?.title || 'Form Removido'}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{formatDate(sub.submittedAt)}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {sub.paymentProof ? (
                                        <a href={sub.paymentProof} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <ImageIcon size={14} /> {t('dashboard.adminSubmissions.viewProof')}
                                        </a>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{t('dashboard.adminSubmissions.noProof')}</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: sub.status === 'approved' ? '#38a16915' : (sub.status === 'rejected' ? '#e53e3e15' : '#ecc94b15'),
                                        color: sub.status === 'approved' ? '#38a169' : (sub.status === 'rejected' ? '#e53e3e' : '#b7791f')
                                    }}>
                                        {sub.status === 'approved' && <CheckCircle size={12} />}
                                        {sub.status === 'rejected' && <XCircle size={12} />}
                                        {sub.status === 'pending' && <Clock size={12} />}
                                        {sub.status.toUpperCase()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => setSelectedSubmission(sub)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                padding: '0.4rem 0.8rem', borderRadius: '8px',
                                                border: 'none', background: '#f4f4f4',
                                                color: '#000', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800
                                            }}
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <a
                                            href={`/hub/${sub._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                padding: '0.4rem 0.8rem', borderRadius: '8px',
                                                border: 'none', background: '#000',
                                                color: '#FFD700', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800,
                                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <ExternalLink size={14} /> {t('dashboard.adminSubmissions.hub')}
                                        </a>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        {sub.status !== 'approved' && (
                                            <Tooltip content={t('dashboard.adminSubmissions.actions.approve')}>
                                                <button
                                                    onClick={() => handleUpdateStatus(sub._id, 'approved')}
                                                    style={{ background: '#38a169', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            </Tooltip>
                                        )}
                                        {sub.status !== 'rejected' && (
                                            <Tooltip content={t('dashboard.adminSubmissions.actions.reject')}>
                                                <button
                                                    onClick={() => handleUpdateStatus(sub._id, 'rejected')}
                                                    style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </TableScrollWrapper>

            {/* Pagination Controls */}
            {filteredSubmissions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                    <div>
                        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredSubmissions.length)} de {filteredSubmissions.length} inscrições
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                background: currentPage === 1 ? '#f5f5f5' : '#fff',
                                color: currentPage === 1 ? '#aaa' : '#333',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {t('common.previous')}
                        </button>
                        {Array.from({ length: Math.ceil(filteredSubmissions.length / itemsPerPage) }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: currentPage === i + 1 ? 'none' : '1px solid #ddd',
                                    borderRadius: '6px',
                                    background: currentPage === i + 1 ? '#FFD700' : '#fff',
                                    color: currentPage === i + 1 ? '#000' : '#333',
                                    fontWeight: currentPage === i + 1 ? 700 : 400,
                                    cursor: 'pointer'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredSubmissions.length / itemsPerPage)))}
                            disabled={indexOfLastItem >= filteredSubmissions.length}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                background: indexOfLastItem >= filteredSubmissions.length ? '#f5f5f5' : '#fff',
                                color: indexOfLastItem >= filteredSubmissions.length ? '#aaa' : '#333',
                                cursor: indexOfLastItem >= filteredSubmissions.length ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {t('common.next')}
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedSubmission && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedSubmission(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{
                                position: 'relative', width: '100%', maxWidth: '600px',
                                maxHeight: '90vh', background: '#fff', borderRadius: '24px',
                                overflow: 'hidden', display: 'flex', flexDirection: 'column'
                            }}
                        >
                            <div style={{ padding: '1.5rem 2rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('dashboard.adminSubmissions.modal.title')}</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 600 }}>{selectedSubmission.form?.title}</p>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t('dashboard.adminSubmissions.modal.submittedOn', { date: formatDate(selectedSubmission.submittedAt) })}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => {
                                            const text = Object.entries(selectedSubmission.data || {})
                                                .map(([k, v]) => `${k}: ${v}`).join('\n');
                                            navigator.clipboard.writeText(text);
                                            toast.success(t('dashboard.adminSubmissions.messages.copySuccess'));
                                        }}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFD700', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 700 }}
                                    >
                                        <Copy size={14} /> {t('dashboard.adminSubmissions.modal.copy')}
                                    </button>
                                    <button onClick={() => setSelectedSubmission(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {Object.entries(selectedSubmission.data || {}).map(([key, value]) => (
                                        <div key={key} style={{ padding: '1.2rem', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #eee' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: '#999', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                                                        {t(key)}
                                                    </label>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#000', wordBreak: 'break-word' }}>
                                                        {String(value)}
                                                    </div>
                                                </div>

                                                {(key.toLowerCase().includes('tel') || key.toLowerCase().includes('cel') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('zap') || key.toLowerCase().includes('contato')) && (
                                                    <Tooltip content="Chamar no WhatsApp">
                                                        <a
                                                            href={`https://wa.me/${String(value).replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ background: '#25D366', color: '#fff', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <MessageCircle size={18} />
                                                        </a>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', background: '#f8f9fa', borderTop: '1px solid #eee', display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => { handleUpdateStatus(selectedSubmission._id, 'approved'); setSelectedSubmission(null); }}
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: '#38a169', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    {t('dashboard.adminSubmissions.actions.approve')}
                                </button>
                                <button
                                    onClick={() => { handleUpdateStatus(selectedSubmission._id, 'rejected'); setSelectedSubmission(null); }}
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    {t('dashboard.adminSubmissions.actions.reject')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
