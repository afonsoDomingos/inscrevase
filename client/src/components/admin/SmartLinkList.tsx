"use client";

import { useState, useEffect, useCallback } from 'react';
import { smartLinkService, SmartLinkModel } from '@/lib/smartLinkService';
import { Trash2, ExternalLink, ShieldAlert, ShieldCheck, Search, Link as LinkIcon, User, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import TableScrollWrapper from '../common/TableScrollWrapper';
import { toast } from 'sonner';

interface SmartLinkListProps {
    onEmailMentor?: (mentorId: string, mentorName: string) => void;
}

export default function SmartLinkList({ onEmailMentor }: SmartLinkListProps) {
    const [links, setLinks] = useState<SmartLinkModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const loadLinks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await smartLinkService.getAllAdminLinks(searchTerm, statusFilter);
            setLinks(data);
        } catch (err) {
            console.error(err);
            toast.error('Erro ao carregar SmartLinks');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        loadLinks();
    }, [loadLinks]);

    const handleAudit = async (id: string) => {
        try {
            const result = await smartLinkService.auditLink(id);
            toast.success(result.message);
            loadLinks();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro na auditoria';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este SmartLink permanentemente?')) return;
        try {
            await smartLinkService.deleteLink(id);
            toast.success('Link excluído');
            loadLinks();
        } catch {
            toast.error('Erro ao excluir link');
        }
    };

    if (loading && links.length === 0) return <div style={{ textAlign: 'center', padding: '5rem' }}>Carregando auditoria de SmartLinks...</div>;

    return (
        <div className="luxury-card" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Gestão de SmartLinks</h3>
                    <p style={{ color: '#666', fontSize: '0.85rem' }}>Auditoria e controle de conformidade de links bio e redirecionamentos.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none' }}
                    >
                        <option value="">Todos Status</option>
                        <option value="active">Ativos</option>
                        <option value="banned">Suspensos</option>
                        <option value="paused">Pausados</option>
                    </select>

                    <div style={{ position: 'relative', width: '250px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Buscar slug ou título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none' }}
                        />
                    </div>
                </div>
            </div>

            <TableScrollWrapper>
                <table style={{ minWidth: '1000px', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
                            <th style={{ padding: '1.2rem 1rem', color: '#1a1a1a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>SmartLink</th>
                            <th style={{ padding: '1.2rem 1rem', color: '#1a1a1a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>Dono / Mentor</th>
                            <th style={{ padding: '1.2rem 1rem', color: '#1a1a1a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>Tipo</th>
                            <th style={{ padding: '1.2rem 1rem', color: '#1a1a1a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1.2rem 1rem', color: '#1a1a1a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Cliques</th>
                            <th style={{ padding: '1.2rem 1rem', color: '#1a1a1a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Ações de Auditoria</th>
                        </tr>
                    </thead>
                    <tbody>
                        {links.map((link) => (
                            <motion.tr
                                layout
                                key={link._id}
                                style={{ borderBottom: '1px solid #f8f8f8', transition: 'background 0.2s' }}
                                whileHover={{ background: '#fafafa' }}
                            >
                                <td style={{ padding: '1.2rem 1rem' }}>
                                    <div style={{ fontWeight: 700, color: '#000' }}>{link.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#3182ce', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <LinkIcon size={12} /> inscrevase.com/l/{link.slug}
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={16} color="#666" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                {link.userId && typeof link.userId === 'object' ? link.userId.name : '---'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                                {link.userId && typeof link.userId === 'object' ? link.userId.email : ''}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem 1rem' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800,
                                        background: link.type === 'bio' ? '#805ad515' : '#3182ce15',
                                        color: link.type === 'bio' ? '#805ad5' : '#3182ce',
                                        textTransform: 'uppercase'
                                    }}>
                                        {link.type === 'bio' ? 'Página Bio' : 'Redirecionamento'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem 1rem' }}>
                                    <span style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        background:
                                            link.status === 'active' ? '#38a16915' :
                                                link.status === 'banned' ? '#e53e3e15' : '#71809615',
                                        color:
                                            link.status === 'active' ? '#38a169' :
                                                link.status === 'banned' ? '#e53e3e' : '#718096',
                                        textTransform: 'uppercase'
                                    }}>
                                        {link.status === 'active' ? 'Ativo' :
                                            link.status === 'banned' ? 'SUSPENSO' : link.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>{link.totalClicks || 0}</div>
                                </td>
                                <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <a
                                            href={link.type === 'bio' ? `/l/${link.slug}/bio` : `/l/${link.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#3182ce', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            title="Ver Link"
                                        >
                                            <ExternalLink size={18} />
                                        </a>

                                        {(() => {
                                            const mentor = link.userId && typeof link.userId === 'object' ? link.userId : null;
                                            if (onEmailMentor && mentor) {
                                                return (
                                                    <button
                                                        onClick={() => onEmailMentor(mentor._id, mentor.name)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B8860B' }}
                                                        title="Contactar Mentor"
                                                    >
                                                        <Mail size={18} />
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {link._id && (
                                            <button
                                                onClick={() => handleAudit(link._id!)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: link.status === 'banned' ? '#38a169' : '#e53e3e'
                                                }}
                                                title={link.status === 'banned' ? 'Reativar' : 'Banir / Suspender'}
                                            >
                                                {link.status === 'banned' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => { if (link._id) handleDelete(link._id); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                                            title="Excluir Definitivamente"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {!loading && links.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <LinkIcon size={48} style={{ color: '#eee', marginBottom: '1rem' }} />
                        <p style={{ color: '#999', fontWeight: 600 }}>Nenhum SmartLink encontrado para auditoria.</p>
                    </div>
                )}
            </TableScrollWrapper>
        </div>
    );
}
