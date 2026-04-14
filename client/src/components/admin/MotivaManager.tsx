import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Check, X, Play, Clock, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface MotivaEntry {
    _id: string;
    user: { name: string; email: string };
    title: string;
    videoUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    phase: number;
    likeCount: number;
    contactName?: string;
    contactWhatsApp?: string;
    contactEmail?: string;
    createdAt: string;
}

export default function MotivaManager() {
    const [entries, setEntries] = useState<MotivaEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
    
    // Phase Management State
    const [showNewPhaseModal, setShowNewPhaseModal] = useState(false);
    const [phaseForm, setPhaseForm] = useState({
        phase: 1,
        rewardTitle: '',
        rewardValue: '',
        endDate: '',
        maxUploads: 10
    });

    const fetchAllEntries = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${API_URL}/motiva/admin/entries`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setEntries(data);
        } catch {
            toast.error('Erro ao carregar entradas do concurso.');
        } finally {
            setLoading(false);
        }
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    useEffect(() => {
        fetchAllEntries();
    }, []);

    const handleUpdateStatus = async (entryId: string, status: 'approved' | 'rejected') => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${API_URL}/motiva/admin/entry/${entryId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                toast.success(status === 'approved' ? 'Vídeo aprovado e listado!' : 'Vídeo rejeitado.');
                setEntries(prev => prev.map(e => e._id === entryId ? { ...e, status } : e));
            }
        } catch {
            toast.error('Erro ao atualizar estado.');
        }
    };

    const handleCreatePhase = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${API_URL}/motiva/admin/phase`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(phaseForm)
            });

            if (response.ok) {
                toast.success(`Fase ${phaseForm.phase} iniciada com sucesso!`);
                setShowNewPhaseModal(false);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message);
            }
        } catch {
            toast.error('Erro ao criar nova fase.');
        }
    };

    const handleBulkApprove = async () => {
        if (selectedEntries.length === 0) return;
        const confirmMsg = `Deseja aprovar ${selectedEntries.length} vídeos de uma vez?`;
        if (!window.confirm(confirmMsg)) return;

        setIsBulkLoading(true);
        try {
            const token = Cookies.get('token');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            
            for (const id of selectedEntries) {
                await fetch(`${baseUrl}/motiva/admin/entry/${id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ status: 'approved' })
                });
            }
            
            toast.success(`${selectedEntries.length} vídeos aprovados com sucesso!`);
            setSelectedEntries([]);
            fetchAllEntries();
        } catch {
            toast.error('Erro na aprovação em massa.');
        } finally {
            setIsBulkLoading(false);
        }
    };

    const toggleSelectEntry = (id: string) => {
        setSelectedEntries(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedEntries.length === filteredEntries.length && filteredEntries.length > 0) {
            setSelectedEntries([]);
        } else {
            setSelectedEntries(filteredEntries.map(e => e._id));
        }
    };

    const filteredEntries = entries.filter(e => {
        const matchesSearch = 
            (e.contactName || e.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.contactEmail || e.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        return e.status === filter && matchesSearch;
    });

    return (
        <div style={{ color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px' }}>Gestão Prémio MOTIVA</h2>
                    <p style={{ color: '#888' }}>Controle as submissões, aprove vídeos e gerencie as fases do concurso.</p>
                </div>
                <button 
                    onClick={() => setShowNewPhaseModal(true)}
                    style={{ background: '#FFD700', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Trophy size={18} /> Iniciar / Editar Fase
                </button>
            </div>

            {/* Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { label: 'Pendentes', count: entries.filter(e => e.status === 'pending').length, color: '#FFA500', icon: Clock },
                    { label: 'Aprovados', count: entries.filter(e => e.status === 'approved').length, color: '#2ecc71', icon: ShieldCheck },
                    { label: 'Rejeitados', count: entries.filter(e => e.status === 'rejected').length, color: '#e74c3c', icon: AlertCircle },
                    { label: 'Total', count: entries.length, color: '#fff', icon: Eye }
                ].map((stat, i) => (
                    <div key={i} style={{ background: '#111', padding: '20px', borderRadius: '16px', border: '1px solid #222' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <stat.icon size={20} color={stat.color} />
                            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.count}</span>
                        </div>
                        <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Filters, Search and Bulk Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px', flexWrap: 'wrap', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                        <button 
                            key={f}
                            onClick={() => { setFilter(f); setSelectedEntries([]); }}
                            style={{
                                padding: '8px 20px',
                                background: filter === f ? 'rgba(255,215,0,0.1)' : 'transparent',
                                color: filter === f ? '#FFD700' : '#888',
                                border: filter === f ? '1px solid #FFD700' : '1px solid #333',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: 600
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '15px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>🔍</span>
                        <input 
                            type="text" 
                            placeholder="Procurar por nome ou email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', background: '#000', border: '1px solid #333', color: '#fff', fontSize: '0.9rem' }}
                        />
                    </div>

                    {selectedEntries.length > 0 && filter === 'pending' && (
                        <button 
                            onClick={handleBulkApprove}
                            disabled={isBulkLoading}
                            style={{ 
                                padding: '10px 20px', 
                                background: '#2ecc71', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isBulkLoading ? 'A processar...' : <><Check size={18} /> Aprovar ({selectedEntries.length})</>}
                        </button>
                    )}
                </div>
            </div>

            {/* Entries Table */}
            <div style={{ background: '#111', borderRadius: '20px', border: '1px solid #222', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #222', textAlign: 'left', background: '#0a0a0a' }}>
                            <th style={{ padding: '20px', width: '40px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0} 
                                    onChange={handleSelectAll}
                                    style={{ cursor: 'pointer' }}
                                />
                            </th>
                            <th style={{ padding: '20px' }}>Autor</th>
                            <th style={{ padding: '20px' }}>Título / Vídeo</th>
                            <th style={{ padding: '20px' }}>Fase</th>
                            <th style={{ padding: '20px' }}>Votos</th>
                            <th style={{ padding: '20px' }}>Estado</th>
                            <th style={{ padding: '20px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Carregando submissões...</td></tr>
                        ) : filteredEntries.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Nenhuma entrada encontrada nesta categoria.</td></tr>
                        ) : filteredEntries.map((entry) => (
                            <tr key={entry._id} style={{ borderBottom: '1px solid #1a1a1a', background: selectedEntries.includes(entry._id) ? 'rgba(255,215,0,0.05)' : 'transparent' }}>
                                <td style={{ padding: '20px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedEntries.includes(entry._id)} 
                                        onChange={() => toggleSelectEntry(entry._id)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ fontWeight: 700 }}>{entry.contactName || entry.user?.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>📧 {entry.contactEmail || entry.user?.email}</div>
                                    {entry.contactWhatsApp && (
                                        <div style={{ fontSize: '0.8rem', color: '#25D366', fontWeight: 600 }}>📱 {entry.contactWhatsApp}</div>
                                    )}
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <button 
                                        onClick={() => setSelectedVideoUrl(entry.videoUrl)}
                                        style={{ background: 'transparent', border: 'none', color: '#FFD700', textDecoration: 'underline', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, fontWeight: 600 }}
                                    >
                                        <Play size={14} /> {entry.title}
                                    </button>
                                </td>
                                <td style={{ padding: '20px' }}>Fase {entry.phase}</td>
                                <td style={{ padding: '20px' }}>{entry.likeCount} likes</td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{ 
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                        background: entry.status === 'approved' ? 'rgba(46, 204, 113, 0.1)' : entry.status === 'rejected' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                                        color: entry.status === 'approved' ? '#2ecc71' : entry.status === 'rejected' ? '#e74c3c' : '#ffa500'
                                    }}>
                                        {entry.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {entry.status !== 'approved' && (
                                            <button onClick={() => handleUpdateStatus(entry._id, 'approved')} title="Aprovar" style={{ background: '#2ecc71', border: 'none', color: '#000', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Check size={16} /></button>
                                        )}
                                        {entry.status !== 'rejected' && (
                                            <button onClick={() => handleUpdateStatus(entry._id, 'rejected')} title="Rejeitar" style={{ background: '#e74c3c', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><X size={16} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* New Phase Modal */}
            {showNewPhaseModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="overlay" onClick={() => setShowNewPhaseModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)' }} />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#111', width: '100%', maxWidth: '500px', borderRadius: '20px', border: '1px solid #333', position: 'relative', padding: '40px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' }}>Iniciar ou Editar Fase</h3>
                        <p style={{ color: '#888', marginBottom: '30px' }}>Para editar uma fase já existente, basta introduzir o mesmo Número da Fase. Ao criar uma nova fase, a anterior será desativada.</p>
                        
                        <form onSubmit={handleCreatePhase} style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#888' }}>Número da Fase</label>
                                <input type="number" required value={phaseForm.phase} onChange={e => setPhaseForm({...phaseForm, phase: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#888' }}>Título do Prémio (Ex: iPhone 15)</label>
                                <input type="text" required value={phaseForm.rewardTitle} onChange={e => setPhaseForm({...phaseForm, rewardTitle: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#888' }}>Valor/Descrição Extra do Prémio</label>
                                <input type="text" required value={phaseForm.rewardValue} onChange={e => setPhaseForm({...phaseForm, rewardValue: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#888' }}>Data Final da Fase</label>
                                <input type="date" required value={phaseForm.endDate} onChange={e => setPhaseForm({...phaseForm, endDate: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowNewPhaseModal(false)} style={{ flex: 1, padding: '12px', background: '#222', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#FFD700', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Guardar Fase</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Video Preview Modal */}
            <AnimatePresence>
                {selectedVideoUrl && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div onClick={() => setSelectedVideoUrl(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }} />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '80vh', background: '#000', borderRadius: '24px', overflow: 'hidden', border: '1px solid #333' }}
                        >
                            <button 
                                onClick={() => setSelectedVideoUrl(null)}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', zIndex: 10, cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                            <video src={selectedVideoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
