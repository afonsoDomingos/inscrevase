"use client";

import { useState, useEffect } from 'react';
import { submissionAdminService, SubmissionModel } from '@/lib/submissionAdminService';
import { CheckCircle, XCircle, Clock, Search, Image as ImageIcon, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmissionList() {
    const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionModel | null>(null);

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
            alert('Erro ao atualizar status');
        }
    };

    const filteredSubmissions = submissions.filter(s =>
        (s.form?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(s.data).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando inscrições...</div>;

    return (
        <div className="luxury-card" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gestão de Inscrições</h3>
                <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Buscar por evento ou dados..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1rem', color: '#666' }}>Inscrito / Dados</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Evento</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Pagamento</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Status</th>
                            <th style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>Detalhes</th>
                            <th style={{ padding: '1rem', color: '#666', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubmissions.map((sub) => (
                            <motion.tr
                                layout
                                key={sub._id}
                                style={{ borderBottom: '1px solid #f9f9f9' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
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
                                    {sub.paymentProof ? (
                                        <a href={sub.paymentProof} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <ImageIcon size={14} /> Ver Prova
                                        </a>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>Sem Prova</span>
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
                                    <button
                                        onClick={() => setSelectedSubmission(sub)}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            padding: '0.4rem 0.8rem', borderRadius: '6px',
                                            border: '1px solid #FFD700', background: 'rgba(255,215,0,0.05)',
                                            color: '#B8860B', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                        }}
                                    >
                                        <FileText size={14} /> Ver Dados
                                    </button>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        {sub.status !== 'approved' && (
                                            <button
                                                onClick={() => handleUpdateStatus(sub._id, 'approved')}
                                                style={{ background: '#38a169', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                                title="Aprovar"
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                        {sub.status !== 'rejected' && (
                                            <button
                                                onClick={() => handleUpdateStatus(sub._id, 'rejected')}
                                                style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                                title="Rejeitar"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Dados de Inscrição</h3>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Admin Review Mode</p>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {Object.entries(selectedSubmission.data || {}).map(([key, value]) => (
                                        <div key={key} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: '#999', marginBottom: '0.3rem' }}>{key}</label>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#333' }}>{String(value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', background: '#f8f9fa', borderTop: '1px solid #eee', display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => { handleUpdateStatus(selectedSubmission._id, 'approved'); setSelectedSubmission(null); }}
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: '#38a169', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Aprovar
                                </button>
                                <button
                                    onClick={() => { handleUpdateStatus(selectedSubmission._id, 'rejected'); setSelectedSubmission(null); }}
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Rejeitar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
