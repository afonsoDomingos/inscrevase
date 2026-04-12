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
    const [appSearchTerm, setAppSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                marginBottom: '2rem',
                gap: '1.5rem'
            }}>
                <div>
                    <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#000', margin: 0, fontFamily: 'var(--font-playfair)' }}>Gestão de <span className="gold-text">Vagas</span></h2>
                    <p style={{ color: '#666', margin: 0, fontSize: isMobile ? '0.85rem' : '1rem' }}>Publique oportunidades e gira candidaturas da Inscreva-se.</p>
                </div>
                <div style={{ 
                    display: 'flex', 
                    gap: isMobile ? '0.5rem' : '1rem',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <button 
                        onClick={() => setView(view === 'list' ? 'applications' : 'list')}
                        style={{ 
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '10px' : '12px 20px', 
                            borderRadius: '12px', 
                            border: '1px solid #ddd', 
                            background: '#fff', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: isMobile ? '0.8rem' : '1rem'
                        }}
                    >
                        {view === 'list' ? <><Users size={18} /> {isMobile ? "Candidatos" : "Ver Candidatos"}</> : <><Layout size={18} /> {isMobile ? "Vagas" : "Ver Vagas"}</>}
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
                        style={{ 
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '10px' : '12px 24px', 
                            borderRadius: '12px', 
                            border: 'none', 
                            background: 'var(--gold-gradient)', 
                            color: '#000', 
                            fontWeight: 800, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '8px', 
                            boxShadow: '0 4px 15px rgba(212,175,55,0.2)',
                            fontSize: isMobile ? '0.8rem' : '1rem'
                        }}
                    >
                        <Plus size={isMobile ? 18 : 20} /> {isMobile ? "Nova Vaga" : "Nova Vaga"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="#D4AF37" /></div>
            ) : view === 'list' ? (
                /* Vacancy List */
                <div style={{ background: isMobile ? 'transparent' : '#fff', borderRadius: '24px', border: isMobile ? 'none' : '1px solid #eee', overflow: 'hidden' }}>
                    <div style={{ padding: isMobile ? '0 0 1rem' : '1.5rem', borderBottom: isMobile ? 'none' : '1px solid #eee', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={18} />
                            <input 
                                type="text" 
                                placeholder="Procurar vagas..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    {!isMobile ? (
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
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {filteredVacancies.map(v => (
                                <div key={v._id} style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#000', fontSize: '1rem' }}>{v.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{v.category}</div>
                                        </div>
                                        <span style={{ padding: '4px 10px', borderRadius: '50px', background: v.active ? '#e6fadf' : '#fee2e2', color: v.active ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {v.active ? 'Ativa' : 'Pausada'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14} /> {v.location}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Briefcase size={14} /> {v.type}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => {
                                                const url = `${window.location.origin}/vagas/${v.slug}`;
                                                window.open(url, '_blank');
                                            }}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #eee', background: '#f9f9f9', color: '#000', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                        >
                                            <Eye size={16} /> Ver
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSelectedVacancy(v);
                                                setFormData({ ...v });
                                                setIsModalOpen(true);
                                            }}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #eee', background: '#f9f9f9', color: '#3182ce', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                        >
                                            <Edit size={16} /> Editar
                                        </button>
                                        <button onClick={() => handleDelete(v._id)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fff', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Applications List */
                <div style={{ background: isMobile ? 'transparent' : '#fff', borderRadius: '24px', border: isMobile ? 'none' : '1px solid #eee', overflow: 'hidden' }}>
                    <div style={{ padding: isMobile ? '0 0 1rem' : '1.5rem', borderBottom: isMobile ? 'none' : '1px solid #eee', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={18} />
                            <input 
                                type="text" 
                                placeholder="Procurar candidato ou vaga..." 
                                value={appSearchTerm}
                                onChange={(e) => setAppSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    {!isMobile ? (
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f0f0f0', overflow: 'hidden', border: '2px solid #eee', flexShrink: 0, position: 'relative' }}>
                                                    {app.photoUrl ? (
                                                        <Image src={app.photoUrl} alt={app.fullName} fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}><Users size={20} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800 }}>{app.fullName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{app.email} | {app.phone}</div>
                                                </div>
                                            </div>
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
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {filteredApplications.map(app => (
                                <div key={app._id} style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0f0f0', overflow: 'hidden', border: '2px solid #eee', flexShrink: 0, position: 'relative' }}>
                                            {app.photoUrl ? (
                                                <Image src={app.photoUrl} alt={app.fullName} fill style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}><Users size={20} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{app.fullName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{typeof app.vacancyId === 'object' ? app.vacancyId.title : '---'}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.25rem', borderTop: '1px solid #f9f9f9', paddingTop: '0.75rem' }}>
                                        <div>{app.email}</div>
                                        <div>{app.phone}</div>
                                        <div style={{ marginTop: '5px', color: '#888' }}>Candidatou-se em: {new Date(app.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <a href={app.cvUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#000', color: '#fff', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            <FileDown size={14} /> Descarregar CV
                                        </a>
                                        <button 
                                            onClick={() => { setSelectedApplication(app); setIsAppModalOpen(true); }}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #eee', background: '#fff', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}
                                        >
                                            <Eye size={16} /> Ver Tudo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                                                 <div style={{ padding: isMobile ? '1.25rem' : '2.5rem', overflowY: 'auto', flex: 1, display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Título da Vaga</label>
                                        <input type="text" placeholder="Ex: Desenvolvedor Senior" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 700 }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Categoria</label>
                                        <input type="text" placeholder="Ex: Design" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', fontWeight: 700 }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
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
                                        <div style={{ width: '80px', height: '50px', borderRadius: '12px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #eee', position: 'relative', flexShrink: 0 }}>
                                            {formData.image ? <Image src={formData.image} alt="Vaga" fill style={{ objectFit: 'cover' }} /> : <ImageIcon size={20} color="#ccc" />}
                                        </div>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} 
                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                            />
                                            <div style={{ padding: '10px 15px', borderRadius: '10px', border: '1px dashed #000', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#666', background: '#fcfcfc' }}>
                                                {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Alterar Imagem'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Estado da Vaga</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            onClick={() => setFormData({...formData, active: true})}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: formData.active ? '2px solid #22c55e' : '1px solid #eee', background: formData.active ? '#f0fdf4' : '#fff', color: formData.active ? '#10b981' : '#666', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                        >Ativa</button>
                                        <button 
                                            onClick={() => setFormData({...formData, active: false})}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: !formData.active ? '2px solid #ef4444' : '1px solid #eee', background: !formData.active ? '#fef2f2' : '#fff', color: !formData.active ? '#ef4444' : '#666', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                        >Pausada</button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Descrição da Vaga</label>
                                    <textarea placeholder="Fale sobre a função, desafios e benefícios..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', minHeight: '120px', fontWeight: 600, fontSize: '0.9rem' }} />
                                </div>

                                {/* Custom Questions */}
                                <div>
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '1rem', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#888' }}>Questões Personalizadas</label>
                                        <button 
                                            onClick={() => setFormData({...formData, questions: [...(formData.questions || []), { label: '', required: true, type: 'text' }]})}
                                            style={{ background: 'none', border: '1px solid #eee', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '5px 12px', borderRadius: '8px', cursor: 'pointer' }}
                                        >
                                            + Adicionar Pergunta
                                        </button>
                                    </div>
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
                            style={{ background: '#fff', width: isMobile ? '95%' : '100%', maxWidth: '700px', borderRadius: isMobile ? '30px' : '40px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
                        >
                            <div style={{ padding: isMobile ? '2.5rem 1.5rem 1.5rem' : '2rem 3rem', background: 'linear-gradient(135deg, #000 0%, #333 100%)', color: '#fff', position: 'relative', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'center', gap: isMobile ? '1rem' : '2rem', textAlign: isMobile ? 'center' : 'left' }}>
                                <div style={{ width: isMobile ? '100px' : '120px', height: isMobile ? '100px' : '120px', borderRadius: '30px', background: '#fff', border: '4px solid rgba(255,255,255,0.2)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                    {selectedApplication.photoUrl ? (
                                        <Image src={selectedApplication.photoUrl} alt={selectedApplication.fullName} fill style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}><Users size={50} /></div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#FFD700', marginBottom: '0.5rem' }}>Perfil do Candidato</div>
                                    <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-playfair)' }}>{selectedApplication.fullName}</h3>
                                    <div style={{ fontSize: isMobile ? '0.85rem' : '1rem', opacity: 0.8, marginTop: '5px' }}>
                                        Candidatura para: <strong style={{color: '#FFD700'}}>{typeof selectedApplication.vacancyId === 'object' ? selectedApplication.vacancyId.title : 'Vaga'}</strong>
                                    </div>
                                </div>
                                <button onClick={() => setIsAppModalOpen(false)} style={{ position: 'absolute', top: isMobile ? '1rem' : '2rem', right: isMobile ? '1rem' : '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>

                            <div style={{ padding: isMobile ? '1.5rem' : '3rem', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '2rem', background: '#f8fafc', padding: isMobile ? '1.25rem' : '1.5rem', borderRadius: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
                                        <div style={{ fontWeight: 700 }}>{selectedApplication.email}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Telefone</div>
                                        <div style={{ fontWeight: 700 }}>{selectedApplication.phone}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Idade</div>
                                        <div style={{ fontWeight: 700 }}>{selectedApplication.age || '---'} anos</div>
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
