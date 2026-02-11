"use client";

import { useState, useEffect } from 'react';
import { formService, FormModel } from '@/lib/formService';
import { authService, UserData } from '@/lib/authService';
import { Trash2, ExternalLink, Eye, EyeOff, Search, FileText, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FormList() {
    const [forms, setForms] = useState<FormModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    useEffect(() => {
        const loggedUser = authService.getCurrentUser();
        setCurrentUser(loggedUser);
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            const data = await formService.getAllFormsAdmin();
            setForms(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (form: FormModel) => {
        try {
            await formService.toggleFormStatus(form._id, !form.active);
            loadForms();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao atualizar status do formulário');
        }
    };

    const handleToggleSponsor = async (form: FormModel) => {
        // Limit promoted events for non-SuperAdmins
        if (currentUser?.role !== 'SuperAdmin' && !form.isSponsored) {
            const sponsoredCount = forms.filter(f => f.isSponsored).length;
            if (sponsoredCount >= 4) {
                alert('Limite atingido! Administradores podem promover no máximo 4 eventos simultaneamente. Remova o destaque de outro evento para continuar.');
                return;
            }
        }

        try {
            await formService.toggleSponsorship(form._id);
            loadForms();
        } catch (error) {
            console.error(error);
            alert('Erro ao promover evento');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este formulário? Todos os dados vinculados serão perdidos.')) return;
        try {
            await formService.deleteForm(id);
            loadForms();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao excluir formulário');
        }
    };

    const filteredForms = forms.filter(f =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.creator?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentForms = filteredForms.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando formulários...</div>;

    return (
        <div className="luxury-card" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gestão de Formulários</h3>
                <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Buscar por título ou mentor..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                        style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>Título do Evento</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>Criador (Mentor)</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>Status</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>Data</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800, textAlign: 'center' }}>Visitas</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800, textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentForms.map((form) => (
                            <motion.tr
                                layout
                                key={form._id}
                                style={{ borderBottom: '1px solid #f9f9f9' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ fontWeight: 600 }}>{form.title}</div>
                                        {form.isSponsored && (
                                            <span style={{ background: '#FFD700', color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>PATROCINADO</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>/{form.slug}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{form.creator?.name || '---'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{form.creator?.businessName || 'Sem Empresa'}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: form.active ? '#38a16915' : '#e53e3e15',
                                        color: form.active ? '#38a169' : '#e53e3e',
                                        textTransform: 'uppercase'
                                    }}>
                                        {form.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>
                                    {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>
                                        <Eye size={14} /> {form.visits || 0}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <a
                                            href={`/f/${form.slug}`}
                                            target="_blank"
                                            style={{ color: '#3182ce' }}
                                            title="Visualizar Público"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => handleToggleSponsor(form)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.isSponsored ? '#FFA500' : '#888' }}
                                            title={form.isSponsored ? 'Remover Destaque' : 'Promover Evento'}
                                        >
                                            <Zap size={18} fill={form.isSponsored ? '#FFA500' : 'none'} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(form)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.active ? '#888' : '#38a169' }}
                                            title={form.active ? 'Desativar' : 'Ativar'}
                                        >
                                            {form.active ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(form._id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {filteredForms.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <FileText size={40} style={{ color: '#eee', marginBottom: '1rem' }} />
                        <p style={{ color: '#999' }}>Nenhum formulário encontrado.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {filteredForms.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                    <div>
                        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredForms.length)} de {filteredForms.length} formulários
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
                            Anterior
                        </button>
                        {Array.from({ length: Math.ceil(filteredForms.length / itemsPerPage) }, (_, i) => (
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
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredForms.length / itemsPerPage)))}
                            disabled={indexOfLastItem >= filteredForms.length}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                background: indexOfLastItem >= filteredForms.length ? '#f5f5f5' : '#fff',
                                color: indexOfLastItem >= filteredForms.length ? '#aaa' : '#333',
                                cursor: indexOfLastItem >= filteredForms.length ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
