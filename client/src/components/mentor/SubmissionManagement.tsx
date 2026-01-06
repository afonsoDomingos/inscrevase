/* eslint-disable */
"use client";

import { useEffect, useState } from 'react';
import { submissionService, SubmissionModel } from '@/lib/submissionService';
import { CheckCircle, XCircle, Eye, FileText, Download, Calendar, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SubmissionManagementProps {
    formId?: string | null;
}

export default function SubmissionManagement({ formId }: SubmissionManagementProps) {
    const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        try {
            const data = await submissionService.getMySubmissions();
            setSubmissions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await submissionService.updateStatus(id, status);
            // Optimistic update
            setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
        } catch (error) {
            alert('Erro ao atualizar status');
        }
    };

    const getMainIdentifier = (data: Record<string, any>) => {
        // Try to find a name field, otherwise first value
        const keys = Object.keys(data);
        const nameKey = keys.find(k => k.toLowerCase().includes('nome') || k.toLowerCase().includes('name'));
        if (nameKey) return data[nameKey];
        return data[keys[0]] || 'Sem identificação'; // Fallback
    };

    const getEmailIdentifier = (data: Record<string, any>) => {
        const keys = Object.keys(data);
        const emailKey = keys.find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'));
        return emailKey ? data[emailKey] : null;
    };

    // Formatting date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredSubmissions = submissions.filter(s => {
        const matchesForm = formId ? s.form._id === formId : true;
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        const identifier = String(getMainIdentifier(s.data)).toLowerCase();
        const matchesSearch = identifier.includes(searchTerm.toLowerCase()) || s.form.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesForm && matchesStatus && matchesSearch;
    });

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando inscrições...</div>;

    return (
        <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou evento..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-luxury"
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                border: '1px solid #eee',
                                background: filterStatus === status ? '#000' : '#fff',
                                color: filterStatus === status ? '#FFD700' : '#666',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}
                        >
                            {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Aprovados' : 'Rejeitados'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="luxury-card" style={{ background: '#fff', border: 'none', padding: 0, overflow: 'hidden' }}>
                {filteredSubmissions.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>
                        <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>Nenhuma inscrição encontrada.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left', fontSize: '0.85rem', color: '#666' }}>
                                <th style={{ padding: '1rem' }}>Inscrito</th>
                                <th style={{ padding: '1rem' }}>Evento</th>
                                <th style={{ padding: '1rem' }}>Data</th>
                                <th style={{ padding: '1rem' }}>Comprovativo</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubmissions.map(submission => (
                                <tr key={submission._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 700 }}>{getMainIdentifier(submission.data)}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{getEmailIdentifier(submission.data)}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{submission.form.title}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> {formatDate(submission.submittedAt)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {submission.paymentProof ? (
                                            <button
                                                onClick={() => setSelectedProof(submission.paymentProof!)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                <Eye size={14} /> Ver
                                            </button>
                                        ) : (
                                            <span style={{ color: '#999', fontSize: '0.8rem' }}>Sem anexo</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: submission.status === 'approved' ? '#38a16915' : submission.status === 'rejected' ? '#e53e3e15' : '#d69e2e15',
                                            color: submission.status === 'approved' ? '#38a169' : submission.status === 'rejected' ? '#e53e3e' : '#d69e2e'
                                        }}>
                                            {submission.status === 'approved' ? 'APROVADO' : submission.status === 'rejected' ? 'REJEITADO' : 'PENDENTE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                onClick={() => handleUpdateStatus(submission._id, 'approved')}
                                                title="Aprovar"
                                                disabled={submission.status === 'approved'}
                                                style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: submission.status === 'approved' ? '#eee' : '#38a169', color: '#fff', cursor: submission.status === 'approved' ? 'default' : 'pointer' }}
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(submission._id, 'rejected')}
                                                title="Rejeitar"
                                                disabled={submission.status === 'rejected'}
                                                style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: submission.status === 'rejected' ? '#eee' : '#e53e3e', color: '#fff', cursor: submission.status === 'rejected' ? 'default' : 'pointer' }}
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Payment Proof Modal */}
            <AnimatePresence>
                {selectedProof && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedProof(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(5px)' }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ position: 'relative', width: '100%', maxWidth: '800px', maxHeight: '90vh', background: '#fff', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Comprovativo de Pagamento</h3>
                                <button onClick={() => setSelectedProof(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} /></button>
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', background: '#f0f0f0', borderRadius: '8px' }}>
                                {selectedProof.toLowerCase().endsWith('.pdf') ? (
                                    <iframe src={selectedProof} style={{ width: '100%', height: '600px', border: 'none' }} title="PDF Viewer" />
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
                                        <Image src={selectedProof} alt="Comprovativo" fill style={{ objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <a href={selectedProof} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                    <Download size={16} /> Baixar Original
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
