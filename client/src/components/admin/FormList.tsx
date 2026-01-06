"use client";

import { useState, useEffect } from 'react';
import { formService, FormModel } from '@/lib/formService';
import { Trash2, ExternalLink, Eye, EyeOff, Search, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FormList() {
    const [forms, setForms] = useState<FormModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
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
        } catch (err) {
            alert('Erro ao atualizar status do formulário');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este formulário? Todos os dados vinculados serão perdidos.')) return;
        try {
            await formService.deleteForm(id);
            loadForms();
        } catch (err) {
            alert('Erro ao excluir formulário');
        }
    };

    const filteredForms = forms.filter(f =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.creator?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1rem', color: '#666' }}>Título do Evento</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Criador (Mentor)</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Status</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Data</th>
                            <th style={{ padding: '1rem', color: '#666', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredForms.map((form) => (
                            <motion.tr
                                layout
                                key={form._id}
                                style={{ borderBottom: '1px solid #f9f9f9' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>{form.title}</div>
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
        </div>
    );
}
