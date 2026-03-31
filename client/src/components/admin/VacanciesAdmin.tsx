"use client";

import { useState, useEffect } from 'react';
import { vacancyService, Vacancy, JobApplication } from '@/lib/vacancyService';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, Eye, Search, FileDown, Loader2, MapPin, Briefcase, X, Layout, HelpCircle, Save, FileText, ImageIcon, Edit } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function VacanciesAdmin() {
    const [view, setView] = useState<'list' | 'applications'>('list');
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [appSearchTerm, setAppSearchTerm] = useState('');

    // Form state for NEW/EDIT vacancy
    const [formData, setFormData] = useState<Partial<Vacancy>>({
        title: '',
        description: '',
        requirements: [],
        location: 'Remoto',
        type: 'Full-time',
        category: 'Tecnologia',
        active: true,
        questions: [
            { label: 'Por que deseja trabalhar connosco?', required: true, type: 'textarea' },
            { label: 'Quais são as suas principais competências para esta vaga?', required: true, type: 'textarea' },
            { label: 'Qual é a sua disponibilidade?', required: true, type: 'text' }
        ]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vData, aData] = await Promise.all([
                vacancyService.getAdminVacancies(),
                vacancyService.getApplications()
            ]);
            setVacancies(vData);
            setApplications(aData);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        if (!formData.title || !formData.description) {
            toast.error('Título e Descrição são obrigatórios');
            return;
        }

        try {
            if (selectedVacancy) {
                await vacancyService.updateVacancy(selectedVacancy._id, formData);
                toast.success('Vaga atualizada com sucesso!');
            } else {
                await vacancyService.createVacancy(formData);
                toast.success('Vaga guardada com sucesso!');
            }
            setIsModalOpen(false);
            setSelectedVacancy(null);
            loadData();
            setFormData({
                title: '',
                description: '',
                requirements: [],
                location: 'Remoto',
                type: 'Full-time',
                category: 'Tecnologia',
                active: true,
                image: '',
                questions: [
                    { label: 'Por que deseja trabalhar connosco?', required: true, type: 'textarea' },
                    { label: 'Quais são as suas principais competências para esta vaga?', required: true, type: 'textarea' },
                    { label: 'Qual é a sua disponibilidade?', required: true, type: 'text' }
                ]
            });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao guardar vaga');
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            setUploading(true);
            const url = await vacancyService.uploadCV(file); // vacancyService.uploadCV handles generic file upload
            setFormData({ ...formData, image: url });
            toast.success('Imagem carregada!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar imagem');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem a certeza que deseja remover esta vaga?')) return;
        try {
            await vacancyService.deleteVacancy(id);
            toast.success('Vaga removida');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao remover');
        }
    };

    const filteredVacancies = vacancies.filter(v => 
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredApplications = applications.filter(a => {
        const vTitle = typeof a.vacancyId === 'object' ? a.vacancyId.title : '';
        return a.fullName.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
               vTitle.toLowerCase().includes(appSearchTerm.toLowerCase());
    });

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#000', margin: 0, fontFamily: 'var(--font-playfair)' }}>Gestão de <span className="gold-text">Vagas</span></h2>
                    <p style={{ color: '#666', margin: 0 }}>Publique oportunidades e gira candidaturas da Inscreva-se.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setView(view === 'list' ? 'applications' : 'list')}
                        style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #ddd', background: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {view === 'list' ? <><Users size={18} /> Ver Candidatos</> : <><Layout size={18} /> Ver Vagas</>}
                    </button>
                    <button 
                        onClick={() => { 
                            setSelectedVacancy(null);
                            setFormData({
                                title: '',
                                description: '',
                                requirements: [],
                                location: 'Remoto',
                                type: 'Full-time',
                                category: 'Tecnologia',
                                active: true,
                                image: '',
                                questions: [
                                    { label: 'Por que deseja trabalhar connosco?', required: true, type: 'textarea' },
                                    { label: 'Quais são as suas principais competências para esta vaga?', required: true, type: 'textarea' },
                                    { label: 'Qual é a sua disponibilidade?', required: true, type: 'text' }
                                ]
                            });
                            setIsModalOpen(true); 
                        }}
                        style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--gold-gradient)', color: '#000', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(212,175,55,0.2)' }}
                    >
                        <Plus size={20} /> Nova Vaga
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="#D4AF37" /></div>
            ) : view === 'list' ? (
                /* Vacancy List */
                <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #eee', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={18} />
                            <input 
                                type="text" 
                                placeholder="Procurar vagas..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9' }}
                            />
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fcfcfc', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>Título / Categoria</th>
                                <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>Local/Tipo</th>
                                <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>Estado</th>
                                <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVacancies.map(v => (
                                <tr key={v._id} style={{ borderBottom: '1px solid #f9f9f9', transition: 'all 0.2s' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: 800, color: '#000' }}>{v.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{v.category}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}><MapPin size={14} /> {v.location}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#888' }}><Briefcase size={14} /> {v.type}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '50px', background: v.active ? '#e6fadf' : '#fee2e2', color: v.active ? '#22c55e' : '#ef4444', fontSize: '0.75rem', fontWeight: 800 }}>
                                            {v.active ? 'Ativa' : 'Pausada'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleDelete(v._id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fff', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedVacancy(v);
                                                    setFormData({
                                                        title: v.title,
                                                        description: v.description,
                                                        requirements: v.requirements,
                                                        location: v.location,
                                                        type: v.type,
                                                        category: v.category,
                                                        active: v.active,
                                                        image: v.image,
                                                        questions: v.questions
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eee', color: '#3182ce', background: '#fff', cursor: 'pointer' }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const url = `${window.location.origin}/vagas/${v.slug}`;
                                                    window.open(url, '_blank');
                                                }}
                                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eee', color: '#888', background: '#fff', cursor: 'pointer' }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Applications List */
                <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #eee', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={18} />
                            <input 
                                type="text" 
                                placeholder="Procurar candidato ou vaga..." 
                                value={appSearchTerm}
                                onChange={(e) => setAppSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9' }}
                            />
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fcfcfc', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>Candidato</th>
                                <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>Vaga</th>
                                <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>Data</th>
                                <th style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>CV / Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map(app => (
                                <tr key={app._id} style={{ borderBottom: '1px solid #f9f9f9', transition: 'all 0.2s' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: 800 }}>{app.fullName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{app.email} | {app.phone}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem', fontSize: '0.9rem', fontWeight: 600 }}>{typeof app.vacancyId === 'object' ? app.vacancyId.title : '---'}</td>
                                    <td style={{ padding: '1.2rem', fontSize: '0.85rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a href={app.cvUrl} target="_blank" rel="noreferrer" style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #000', background: '#000', color: '#fff', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FileDown size={14} /> CV
                                            </a>
                                            <button 
                                                onClick={() => { setSelectedApplication(app); setIsAppModalOpen(true); }}
                                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 700 }}
                                            >
                                                <Eye size={16} /> Ver Tudo
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{ background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
                        >
                            <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{selectedVacancy ? 'Editar' : 'Configurar'} <span className="gold-text">Vaga</span></h3>
                                <button onClick={() => { setIsModalOpen(false); setSelectedVacancy(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={24} /></button>
                            </div>

                            <div style={{ padding: '2.5rem', overflowY: 'auto', flex: 1, display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Título da Vaga</label>
                                        <input type="text" placeholder="Ex: Desenvolvedor Senior" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 700 }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Categoria</label>
                                        <input type="text" placeholder="Ex: Design" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 700 }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Localização</label>
                                        <input type="text" placeholder="Ex: Luanda ou Remoto" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 700 }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Tipo</label>
                                        <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 700 }}>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Freelance">Freelance</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Imagem da Vaga (Opcional)</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '100px', height: '60px', borderRadius: '12px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #eee', position: 'relative' }}>
                                            {formData.image ? <Image src={formData.image} alt="Vaga" fill style={{ objectFit: 'cover' }} /> : <ImageIcon size={24} color="#ccc" />}
                                        </div>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} 
                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                            />
                                            <div style={{ padding: '10px 15px', borderRadius: '10px', border: '1px dashed #000', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#666', background: '#fcfcfc' }}>
                                                {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Alterar Imagem da Vaga'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Estado da Vaga</label>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button 
                                            onClick={() => setFormData({...formData, active: true})}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: formData.active ? '2px solid #22c55e' : '1px solid #eee', background: formData.active ? '#f0fdf4' : '#fff', color: formData.active ? '#10b981' : '#666', fontWeight: 700, cursor: 'pointer' }}
                                        >Ativa</button>
                                        <button 
                                            onClick={() => setFormData({...formData, active: false})}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: !formData.active ? '2px solid #ef4444' : '1px solid #eee', background: !formData.active ? '#fef2f2' : '#fff', color: !formData.active ? '#ef4444' : '#666', fontWeight: 700, cursor: 'pointer' }}
                                        >Pausada</button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Descrição da Vaga</label>
                                    <textarea placeholder="Fale sobre a função, desafios e benefícios..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', minHeight: '120px', fontWeight: 600 }} />
                                </div>

                                {/* Custom Questions */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888' }}>Questões Personalizadas</label>
                                        <button 
                                            onClick={() => setFormData({...formData, questions: [...(formData.questions || []), { label: '', required: true, type: 'text' }]})}
                                            style={{ background: 'none', border: '1px solid #eee', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '5px 12px', borderRadius: '8px', cursor: 'pointer' }}
                                        >
                                            + Adicionar Pergunta
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {formData.questions?.map((q, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fcfcfc', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                                                <HelpCircle size={18} color="#888" />
                                                <input 
                                                    type="text" 
                                                    placeholder="A sua pergunta aqui..." 
                                                    value={q.label} 
                                                    onChange={(e) => {
                                                        const qs = [...(formData.questions || [])];
                                                        qs[i].label = e.target.value;
                                                        setFormData({...formData, questions: qs});
                                                    }}
                                                    style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: 600 }}
                                                />
                                                <select 
                                                    value={q.type}
                                                    onChange={(e) => {
                                                        const qs = [...(formData.questions || [])];
                                                        qs[i].type = e.target.value as 'text' | 'textarea' | 'select';
                                                        setFormData({...formData, questions: qs});
                                                    }}
                                                    style={{ padding: '5px', borderRadius: '6px', border: '1px solid #eee', fontSize: '0.75rem' }}
                                                >
                                                    <option value="text">Texto Curto</option>
                                                    <option value="textarea">Texto Longo</option>
                                                    <option value="select">Seleção</option>
                                                </select>
                                                <button 
                                                    onClick={() => {
                                                        const qs = [...(formData.questions || [])];
                                                        qs.splice(i, 1);
                                                        setFormData({...formData, questions: qs});
                                                    }}
                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                ><X size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                             <div style={{ padding: '1.5rem 2.5rem', background: '#fcfcfc', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => { setIsModalOpen(false); setSelectedVacancy(null); }} style={{ padding: '12px 25px', borderRadius: '12px', border: '1px solid #eee', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                <button onClick={handleCreateOrUpdate} disabled={uploading} style={{ padding: '12px 35px', borderRadius: '12px', border: 'none', background: '#000', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: uploading ? 0.6 : 1 }}>
                                    <Save size={18} /> {selectedVacancy ? 'Guardar Alterações' : 'Publicar Vaga'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Application Details Modal */}
                {isAppModalOpen && selectedApplication && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            style={{ background: '#fff', width: '100%', maxWidth: '700px', borderRadius: '40px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
                        >
                            <div style={{ padding: '2rem 3rem', background: 'linear-gradient(135deg, #000 0%, #333 100%)', color: '#fff', position: 'relative' }}>
                                <button onClick={() => setIsAppModalOpen(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#FFD700', marginBottom: '0.5rem' }}>Perfil do Candidato</div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-playfair)' }}>{selectedApplication.fullName}</h3>
                                <div style={{ fontSize: '1rem', opacity: 0.8, marginTop: '5px' }}>
                                    Candidatura para: <strong style={{color: '#FFD700'}}>{typeof selectedApplication.vacancyId === 'object' ? selectedApplication.vacancyId.title : 'Vaga'}</strong>
                                </div>
                            </div>

                            <div style={{ padding: '3rem', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
                                        <div style={{ fontWeight: 700 }}>{selectedApplication.email}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Telefone</div>
                                        <div style={{ fontWeight: 700 }}>{selectedApplication.phone}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Localização</div>
                                        <div style={{ fontWeight: 700 }}>{selectedApplication.city}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Data de Envio</div>
                                        <div style={{ fontWeight: 700 }}>{new Date(selectedApplication.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2.5rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><HelpCircle size={18} className="gold-text" /> Respostas aos Questionários</h4>
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {selectedApplication.answers.map((ans, i) => (
                                            <div key={i} style={{ borderLeft: '3px solid #FFD700', paddingLeft: '1.5rem' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>{ans.question}</div>
                                                <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>{ans.answer || '--'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedApplication.motivationLetter && (
                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={18} className="gold-text" /> Carta de Motivação</h4>
                                        <div style={{ background: '#fdfbf6', padding: '1.5rem', borderRadius: '16px', color: '#475569', lineHeight: 1.6, border: '1px solid #fef3c7', fontStyle: 'italic' }}>
                                            &quot;{selectedApplication.motivationLetter}&quot;
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <a href={selectedApplication.cvUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '1.2rem', borderRadius: '16px', background: '#000', color: '#fff', textAlign: 'center', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <FileDown size={20} /> Descarregar Currículo (CV)
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
