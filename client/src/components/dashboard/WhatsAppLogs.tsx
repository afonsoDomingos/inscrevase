import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface WaLog {
    _id: string;
    to: string;
    message: string;
    status: 'success' | 'error';
    errorReason: string | null;
    type: string;
    createdAt: string;
}

export default function WhatsAppLogs() {
    const [logs, setLogs] = useState<WaLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/whatsapp/logs?page=${page}&limit=15`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
        } catch (error) {
            console.error('Falha ao carregar logs do WhatsApp', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    return (
        <div style={{ marginTop: '2rem', background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={20} /> Histórico de Disparos
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>Auditoria em tempo real de mensagens enviadas.</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'A carregar...' : 'Actualizar'}
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '12px 1.5rem', color: '#555', fontWeight: 600 }}>Data / Hora</th>
                            <th style={{ padding: '12px 1.5rem', color: '#555', fontWeight: 600 }}>Destino</th>
                            <th style={{ padding: '12px 1.5rem', color: '#555', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '12px 1.5rem', color: '#555', fontWeight: 600 }}>Mensagem / Erro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                                    Nenhum registo de mensagem encontrado.
                                </td>
                            </tr>
                        )}
                        {logs.map((log) => (
                            <tr key={log._id} style={{ borderBottom: '1px solid #eaeaea', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#555', fontSize: '0.85rem' }}>
                                    {new Date(log.createdAt).toLocaleString('pt-PT')}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#111' }}>
                                    +{log.to}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {log.status === 'success' ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            <CheckCircle size={12} /> Sucesso
                                        </span>
                                    ) : (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            <XCircle size={12} /> Falha
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', maxWidth: '300px' }}>
                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#444' }} title={log.message}>
                                        {log.message.replace(/\n/g, ' ')}
                                    </div>
                                    {log.status === 'error' && log.errorReason && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.75rem', color: '#d97706', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px' }}>
                                            <AlertTriangle size={12} /> {log.errorReason}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ padding: '1rem', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', background: page === 1 ? '#f5f5f5' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                    >
                        Anterior
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#666', padding: '6px 12px' }}>Página {page} de {totalPages}</span>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', background: page === totalPages ? '#f5f5f5' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                    >
                        Seguinte
                    </button>
                </div>
            )}
        </div>
    );
}
