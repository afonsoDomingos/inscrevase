"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vacancyService, Vacancy, Question } from '@/lib/vacancyService';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Upload, Send, CheckCircle, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function VacancyDetailsPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const { slug } = params;
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
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


        setSubmitting(true);
        try {
            // 1. Upload CV (if provided)
            let cvUrl = '';
            if (formData.cvFile) {
                cvUrl = await vacancyService.uploadCV(formData.cvFile);
            }

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

    const getFormGroups = () => {
        const groups = [
            { title: 'Identificação', fields: ['fullName', 'email'] },
            { title: 'Contacto e Localização', fields: ['phone', 'city'] },
            { title: 'Currículo e Motivação', fields: ['cvFile', 'motivationLetter'] }
        ];

        // Group custom questions by 2
        const questions = vacancy?.questions || [];
        for (let i = 0; i < questions.length; i += 2) {
            const qSet = questions.slice(i, i + 2);
            groups.push({
                title: 'Questões Adicionais',
                fields: qSet.map(q => `q_${q.label}`)
            });
        }
        
        return groups;
    };

    const formGroups = getFormGroups();
    const totalSteps = formGroups.length; // Steps from 0 to totalSteps - 1 + Review Step
    const progress = ((currentStep) / totalSteps) * 100;

    const nextStep = () => {
        // Validation for the current group
        if (currentStep < formGroups.length) {
            const group = formGroups[currentStep];
            for (const field of group.fields) {
                if (field === 'fullName' && !formData.fullName) { toast.error('O nome é obrigatório'); return; }
                if (field === 'email' && !formData.email) { toast.error('O email é obrigatório'); return; }
                if (field === 'phone' && !formData.phone) { toast.error('O telefone é obrigatório'); return; }
                if (field === 'city' && !formData.city) { toast.error('A localização é obrigatória'); return; }
                
                if (field.startsWith('q_')) {
                    const label = field.replace('q_', '');
                    const q = vacancy?.questions?.find(q => q.label === label);
                    if (q?.required && !answers[label]) {
                        toast.error(`A pergunta "${label}" é obrigatória`);
                        return;
                    }
                }
            }
        }
        
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <>
            <Navbar />
            <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', overflowX: 'hidden' }}>
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
                                    {vacancy.requirements.map((req: string, i: number) => (
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

                    {/* Application Form Card */}
                    <div id="apply-form" style={{ background: '#fff', borderRadius: '40px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        {/* Progress Bar */}
                        <div style={{ height: '6px', background: '#f1f5f9', width: '100%', position: 'relative' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)', position: 'absolute', left: 0, top: 0 }} 
                            />
                        </div>

                        <div style={{ padding: '3rem' }}>
                            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Passo {currentStep + 1} de {totalSteps + 1}
                                    </span>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#000', margin: '5px 0 0' }}>
                                        {currentStep < totalSteps ? formGroups[currentStep].title : 'Revisão Final'}
                                    </h3>
                                </div>
                                {currentStep > 0 && (
                                    <button onClick={prevStep} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <ArrowLeft size={16} /> Voltar
                                    </button>
                                )}
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); if (currentStep < totalSteps) nextStep(); else handleSubmit(e); }}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {currentStep < totalSteps && (
                                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                {formGroups[currentStep].fields.map((field) => {
                                                    if (field === 'fullName') return (
                                                        <div key={field} className="input-group">
                                                            <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Nome Completo *</label>
                                                            <input required type="text" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} style={inputStyle} placeholder="Nome e apelido" />
                                                        </div>
                                                    );
                                                    if (field === 'email') return (
                                                        <div key={field} className="input-group">
                                                            <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Email de Contacto *</label>
                                                            <input required type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} style={inputStyle} placeholder="exemplo@email.com" />
                                                        </div>
                                                    );
                                                    if (field === 'phone') return (
                                                        <div key={field} className="input-group">
                                                            <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Telefone *</label>
                                                            <input required type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} style={inputStyle} placeholder="9XX XXX XXX" />
                                                        </div>
                                                    );
                                                    if (field === 'city') return (
                                                        <div key={field} className="input-group">
                                                            <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Cidade / Localização *</label>
                                                            <input required type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} style={inputStyle} placeholder="Ex: Luanda" />
                                                        </div>
                                                    );
                                                    if (field === 'cvFile') return (
                                                        <div key={field} className="input-group">
                                                            <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Carregar Currículo (Opcional)</label>
                                                            <div style={{ position: 'relative' }}>
                                                                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleInputChange('cvFile', e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }} />
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '30px 20px', borderRadius: '24px', border: '2px dashed #D4AF37', background: formData.cvFile ? '#f0fdf4' : '#fff', color: formData.cvFile ? '#10b981' : '#64748b', transition: 'all 0.3s ease' }}>
                                                                    {formData.cvFile ? <><CheckCircle size={40} /> <span style={{ fontWeight: 800 }}>{formData.cvFile.name}</span></> : <><Upload size={40} color="#D4AF37" /> <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Adicionar CV</span></>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                    if (field === 'motivationLetter') return (
                                                        <div key={field} className="input-group">
                                                            <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '8px', display: 'block' }}>Carta de Motivação (Opcional)</label>
                                                            <textarea value={formData.motivationLetter} onChange={(e) => handleInputChange('motivationLetter', e.target.value)} style={{ ...inputStyle, minHeight: '120px' }} placeholder="Conte-nos os seus objetivos..." />
                                                        </div>
                                                    );
                                                    if (field.startsWith('q_')) {
                                                        const label = field.replace('q_', '');
                                                        const q = vacancy.questions?.find((q: any) => q.label === label);
                                                        if (!q) return null;
                                                        return (
                                                            <div key={label} className="input-group">
                                                                <label style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '12px', display: 'block', lineHeight: 1.4 }}>{q.label} {q.required ? '*' : ''}</label>
                                                                {q.type === 'textarea' ? (
                                                                    <textarea required={q.required} value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={{ ...inputStyle, minHeight: '140px' }} placeholder="A sua resposta..." />
                                                                ) : q.type === 'select' ? (
                                                                    <select required={q.required} value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={inputStyle}>
                                                                        <option value="">Selecione uma opção...</option>
                                                                        {q.options?.map((opt: string, j: number) => <option key={j} value={opt}>{opt}</option>)}
                                                                    </select>
                                                                ) : (
                                                                    <input required={q.required} type="text" value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={inputStyle} placeholder="..." />
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        )}

                                        {currentStep === totalSteps && (
                                            <div style={{ display: 'grid', gap: '2rem' }}>
                                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#64748b' }}>Resumo da Candidatura</h4>
                                                    <div style={{ display: 'grid', gap: '10px', fontSize: '0.95rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Nome:</strong> {formData.fullName}</div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Email:</strong> {formData.email}</div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>CV:</strong> {formData.cvFile?.name || 'Não enviado'}</div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', lineHeight: 1.6 }}>
                                                    Ao clicar em submeter, confirma que todas as informações fornecidas são verdadeiras e que aceita os termos de privacidade da Inscreva-se.
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                                    {currentStep < totalSteps ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            style={primaryButtonStyle}
                                            className="btn-primary"
                                        >
                                            Próximo Passo <ArrowRight size={20} />
                                        </button>
                                    ) : (
                                        <button
                                            disabled={submitting}
                                            type="submit"
                                            style={primaryButtonStyle}
                                            className="btn-primary"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} /> Finalizar Candidatura</>}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212,175,55,0.3); background: #222 !important; }
                input:focus, textarea:focus, select:focus { border-color: #D4AF37 !important; outline: none !important; box-shadow: 0 0 0 4px rgba(212,175,55,0.1); }
                @media (max-width: 800px) {
                    .grid-mobile { grid-template-columns: 1fr !important; }
                    .grid-2 { grid-template-columns: 1fr; }
                    #apply-form { position: static !important; margin-top: 2rem; }
                }
            `}</style>
            </div>
        </>
    );
}

const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    color: '#1e293b'
} as const;

const primaryButtonStyle = {
    width: '100%',
    padding: '1.2rem',
    background: '#000',
    color: '#fff',
    borderRadius: '20px',
    fontWeight: 900,
    fontSize: '1.1rem',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s ease'
} as const;
