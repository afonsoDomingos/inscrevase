"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vacancyService, Vacancy, Question } from '@/lib/vacancyService';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Upload, Send, CheckCircle, FileText, Globe, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function VacancyDetailsPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const { slug } = params;
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        cvFile: null as File | null,
        cvUrl: '',
        motivationLetter: '',
    });
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadVacancy = async () => {
            try {
                const data = await vacancyService.getVacancyBySlug(slug);
                setVacancy(data);
                // Pre-fill answers with empty strings for all questions
                const initialAnswers: Record<string, string> = {};
                data.questions?.forEach((q: Question) => {
                    initialAnswers[q.label] = '';
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error(error);
                router.push('/vagas');
            } finally {
                setLoading(false);
            }
        };
        loadVacancy();
    }, [slug, router]);

    const handleInputChange = (field: string, value: string | File | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAnswerChange = (label: string, value: string) => {
        setAnswers(prev => ({ ...prev, [label]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vacancy) return;

        if (!formData.cvFile) {
            toast.error('O seu currículo (CV) é obrigatório.');
            return;
        }

        setSubmitting(true);
        try {
            // 1. Upload CV
            const cvUrl = await vacancyService.uploadCV(formData.cvFile!);

            // 2. Submit all application data
            const submissionData = {
                vacancyId: vacancy._id,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                cvUrl,
                motivationLetter: formData.motivationLetter,
                answers: Object.entries(answers).map(([question, answer]) => ({ question, answer }))
            };

            const response = await vacancyService.submitApplication(submissionData);
            if (response.success) {
                setSuccess(true);
                toast.success('Candidatura enviada!');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error(response.message || 'Erro ao submeter');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro ao submeter candidatura';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <Loader2 className="animate-spin" size={48} color="#D4AF37" />
            </div>
        );
    }

    if (!vacancy) return null;

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ background: '#fff', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%', border: '1px solid #e2e8f0' }}
                >
                    <div style={{ color: '#10b981', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <CheckCircle size={84} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: '#1e293b' }}>Boa sorte!</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        A sua candidatura para a vaga de <strong>{vacancy.title}</strong> foi enviada com sucesso.
                    </p>
                    <button
                        onClick={() => router.push('/vagas')}
                        style={{ width: '100%', padding: '1.1rem', background: '#000', color: '#fff', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', border: 'none', transition: 'all 0.2s ease' }}
                        className="btn-back"
                    >
                        Voltar para Vagas
                    </button>
                </motion.div>
                <style jsx>{` .btn-back:hover { background: #222 !important; transform: translateY(-2px); } `}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '100px' }}>
            {/* Header / Banner */}
            <div style={{ background: '#000', color: '#fff', padding: '60px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                    <button onClick={() => router.push('/vagas')} style={{ background: 'none', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600, padding: 0 }}>
                        <ArrowLeft size={18} /> Voltar para lista
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ flex: '1 1 500px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#FFD700', letterSpacing: '2px', marginBottom: '0.8rem' }}>
                                Oportunidade | {vacancy.category}
                            </div>
                            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, marginBottom: '1.2rem', fontFamily: 'var(--font-playfair)', lineHeight: 1.1 }}>
                                {vacancy.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                                    <MapPin size={16} /> {vacancy.location}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                                    <Briefcase size={16} /> {vacancy.type}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '-40px auto 0', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2.5rem', alignItems: 'start' }} className="grid-mobile">
                    {/* Vacancy Info */}
                    <div style={{ background: '#fff', padding: '3rem', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1e293b', borderLeft: '4px solid #FFD700', paddingLeft: '15px' }}>Descrição da Função</h2>
                        <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap', marginBottom: '3rem' }}>
                            {vacancy.description}
                        </div>

                        {vacancy.requirements && vacancy.requirements.length > 0 && (
                            <>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1e293b', borderLeft: '4px solid #10b981', paddingLeft: '15px' }}>Requisitos</h2>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '12px' }}>
                                    {vacancy.requirements.map((req, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '1.05rem' }}>
                                            <div style={{ width: '20px', height: '20px', background: '#10b98115', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0 }}>
                                                <div style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
                                            </div>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    {/* Application Form */}
                    <div id="apply-form" style={{ background: '#fff', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #000', position: 'sticky', top: '40px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', color: '#000', textAlign: 'center' }}>Enviar Candidatura</h3>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Nome Completo *</label>
                                <input required type="text" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem' }} placeholder="O seu nome completo" />
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Email *</label>
                                <input required type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem' }} placeholder="seu@email.com" />
                            </div>

                            <div className="grid-2">
                                <div className="input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Telefone *</label>
                                    <input required type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem' }} placeholder="9XX XXX XXX" />
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Cidade *</label>
                                    <input required type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem' }} placeholder="Ex: Luanda" />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Carregar CV (PDF) *</label>
                                <div style={{ position: 'relative' }}>
                                    <input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleInputChange('cvFile', e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', border: '1px dashed #000', background: formData.cvFile ? '#f0fdf4' : '#fcfcfc', color: formData.cvFile ? '#10b981' : '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {formData.cvFile ? <><CheckCircle size={18} /> {formData.cvFile.name}</> : <><Upload size={18} /> Selecionar Arquivo</>}
                                    </div>
                                </div>
                            </div>

                            {/* Dynamically generate custom questions */}
                            {vacancy.questions?.map((q, i) => (
                                <div key={i} className="input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>{q.label} {q.required ? '*' : ''}</label>
                                    {q.type === 'textarea' ? (
                                        <textarea required={q.required} value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem', minHeight: '80px' }} placeholder="Escreva aqui..." />
                                    ) : q.type === 'select' ? (
                                        <select required={q.required} value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem' }}>
                                            <option value="">Selecione...</option>
                                            {q.options?.map((opt, j) => <option key={j} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input required={q.required} type="text" value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem' }} placeholder="..." />
                                    )}
                                </div>
                            ))}

                            <div className="input-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Carta de Motivação (Opcional)</label>
                                <textarea value={formData.motivationLetter} onChange={(e) => handleInputChange('motivationLetter', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem', minHeight: '100px' }} placeholder="Conte-nos um pouco sobre por que quer esta vaga..." />
                            </div>

                            <button
                                disabled={submitting}
                                type="submit"
                                style={{ width: '100%', padding: '1.2rem', background: '#000', color: '#fff', borderRadius: '16px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s ease', marginTop: '1rem' }}
                                className="submit-btn"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} /> Enviar Candidatura</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                @media (max-width: 800px) {
                    .grid-mobile { grid-template-columns: 1fr !important; }
                    .grid-2 { grid-template-columns: 1fr; }
                    #apply-form { position: static !important; margin-top: 2rem; }
                }
                .submit-btn:hover { background: #222 !important; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                input:focus, textarea:focus, select:focus { border-color: #000 !important; outline: none !important; }
            `}</style>
        </div>
    );
}
