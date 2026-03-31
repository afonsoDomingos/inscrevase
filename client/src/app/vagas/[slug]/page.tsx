"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    const [isApplying, setIsApplying] = useState(false);
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
            let cvUrl = '';
            if (formData.cvFile) {
                cvUrl = await vacancyService.uploadCV(formData.cvFile);
            }

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
            { title: 'Qual é o seu nome?', fields: ['fullName'] },
            { title: 'Como podemos contactá-lo?', fields: ['email', 'phone'] },
            { title: 'Onde reside?', fields: ['city'] },
            { title: 'Fale-nos um pouco sobre si', fields: ['cvFile', 'motivationLetter'] }
        ];

        const questions = vacancy?.questions || [];
        for (let i = 0; i < questions.length; i += 1) {
            const q = questions[i];
            groups.push({
                title: q.label,
                fields: [`q_${q.label}`]
            });
        }
        
        return groups;
    };

    const formGroups = getFormGroups();
    const totalSteps = formGroups.length;
    const progress = ((currentStep) / totalSteps) * 100;

    const nextStep = () => {
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
                    toast.error(`Esta pergunta é obrigatória`);
                    return;
                }
            }
        }
        
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <Loader2 className="animate-spin" size={48} color="#D4AF37" />
            </div>
        );
    }

    if (!vacancy) return null;

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '100vh', background: '#fff', color: '#1a1a1a', overflowX: 'hidden' }}>
                {/* Immersive Header */}
                <div style={{ position: 'relative', height: '60vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
                        {vacancy?.image ? (
                            <Image src={vacancy.image} alt={vacancy.title} fill style={{ objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)' }} />
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #000)' }} />
                    </div>
                    
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        style={{ position: 'relative', zIndex: 1, maxWidth: '900px', padding: '0 20px' }}
                    >
                        <span style={{ color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.8rem', display: 'block', marginBottom: '1rem' }}>Recrutamento Ativo</span>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-2px', fontFamily: 'var(--font-playfair)' }}>
                            {vacancy?.title}
                        </h1>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} /> {vacancy?.location}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} /> {vacancy?.type}</div>
                        </div>
                    </motion.div>
                </div>

                {/* Content Area */}
                <div style={{ maxWidth: '1000px', margin: '-80px auto 100px', position: 'relative', zIndex: 2, padding: '0 20px' }}>
                    <div style={{ background: '#fff', borderRadius: '40px', padding: '60px', boxShadow: '0 30px 100px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 350px', gap: '4rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#000', marginBottom: '2rem', letterSpacing: '-0.5px' }}>Sobre a Oportunidade</h2>
                                <div style={{ color: '#444', lineHeight: 1.8, fontSize: '1.1rem', whiteSpace: 'pre-wrap', marginBottom: '3rem' }}>
                                    {vacancy?.description}
                                </div>

                                {vacancy?.requirements && vacancy.requirements.length > 0 && (
                                    <>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#000', marginBottom: '1.5rem' }}>O que procuramos</h2>
                                        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                                            {vacancy.requirements.map((req: string, i: number) => (
                                                <li key={i} style={{ display: 'flex', gap: '15px' }}>
                                                    <div style={{ width: '24px', height: '24px', background: '#D4AF3715', color: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                                        <CheckCircle size={14} />
                                                    </div>
                                                    <span style={{ fontSize: '1.05rem', color: '#444' }}>{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>

                            <div style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
                                <div style={{ background: '#fcfcfc', border: '1px solid #eee', borderRadius: '32px', padding: '40px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem' }}>Interessado na vaga?</h3>
                                    <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                                        Junte-se à equipa que está a transformar o mercado de eventos.
                                    </p>
                                    <button 
                                        onClick={() => setIsApplying(true)}
                                        style={{ ...primaryButtonStyle, width: '100%', padding: '20px' }}
                                    >
                                        Candidatar-se Agora <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Immersive Full-Screen Form Overlay */}
            <AnimatePresence>
                {isApplying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed', 
                            inset: 0, 
                            zIndex: 1000, 
                            background: '#fff', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}
                    >
                        {/* Progress Header */}
                        <div style={{ padding: '30px 40px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: 1 }}>
                                <button onClick={() => setIsApplying(false)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                                    <ArrowLeft size={20} /> Sair
                                </button>
                                <div style={{ height: '4px', background: '#f0f0f0', flex: 1, borderRadius: '10px', position: 'relative', overflow: 'hidden', maxWidth: '400px' }}>
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${progress}%` }} 
                                        style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#D4AF37' }} 
                                    />
                                </div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#888' }}>
                                {Math.round(progress)}% COMPLETO
                            </div>
                        </div>

                        {/* Immersive Form Body */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                            <div style={{ maxWidth: '700px', width: '100%' }}>
                                {!success ? (
                                    <form onSubmit={(e) => { e.preventDefault(); if (currentStep < totalSteps) nextStep(); else handleSubmit(e); }}>
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentStep}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -30 }}
                                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div style={{ marginBottom: '3rem' }}>
                                                    <span style={{ color: '#D4AF37', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>
                                                        PASSO {currentStep + 1}
                                                    </span>
                                                    <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, color: '#000', marginTop: '10px', letterSpacing: '-1.5px' }}>
                                                        {currentStep < totalSteps ? formGroups[currentStep].title : 'Tudo pronto! 🚀'}
                                                    </h2>
                                                </div>

                                                <div style={{ display: 'grid', gap: '2.5rem' }}>
                                                    {currentStep < totalSteps ? (
                                                        formGroups[currentStep].fields.map((field) => {
                                                            if (field === 'fullName') return (
                                                                <div key={field}>
                                                                    <label style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'block' }}>Nome Completo</label>
                                                                    <input autoFocus required type="text" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} style={{ ...immersiveInputStyle }} placeholder="Digite o seu nome..." />
                                                                </div>
                                                            );
                                                            if (field === 'email') return (
                                                                <div key={field}>
                                                                    <label style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'block' }}>Endereço de Email</label>
                                                                    <input required type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} style={{ ...immersiveInputStyle }} placeholder="seu@email.com" />
                                                                </div>
                                                            );
                                                            if (field === 'phone') return (
                                                                <div key={field}>
                                                                    <label style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'block' }}>Telemóvel</label>
                                                                    <input required type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} style={{ ...immersiveInputStyle }} placeholder="+244..." />
                                                                </div>
                                                            );
                                                            if (field === 'city') return (
                                                                <div key={field}>
                                                                    <label style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'block' }}>Localização</label>
                                                                    <input required type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} style={{ ...immersiveInputStyle }} placeholder="Ex: Luanda, Talatona" />
                                                                </div>
                                                            );
                                                            if (field === 'cvFile') return (
                                                                <div key={field}>
                                                                    <label style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'block' }}>Currículo</label>
                                                                    <div style={{ position: 'relative' }}>
                                                                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleInputChange('cvFile', e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }} />
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', borderRadius: '30px', border: '2px dashed #eee', background: formData.cvFile ? '#f0fdf4' : '#fff', transition: 'all 0.3s ease' }}>
                                                                            <div style={{ width: '60px', height: '60px', background: '#D4AF37', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                                                <Upload size={28} />
                                                                            </div>
                                                                            <div>
                                                                                <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem' }}>{formData.cvFile ? formData.cvFile.name : 'Submeta o seu CV (Opcional)'}</p>
                                                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>PDF, Word ou Imagem até 5MB</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                            if (field === 'motivationLetter') return (
                                                                <div key={field}>
                                                                    <label style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'block' }}>Carta de Motivação</label>
                                                                    <textarea value={formData.motivationLetter} onChange={(e) => handleInputChange('motivationLetter', e.target.value)} style={{ ...immersiveInputStyle, minHeight: '180px', borderRadius: '30px', padding: '30px' }} placeholder="Fale um pouco sobre si e as suas motivações..." />
                                                                </div>
                                                            );
                                                            if (field.startsWith('q_')) {
                                                                const label = field.replace('q_', '');
                                                                const q = vacancy?.questions?.find((q: Question) => q.label === label);
                                                                if (!q) return null;
                                                                return (
                                                                    <div key={label}>
                                                                        <label style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '20px', display: 'block' }}>{q.label} {q.required ? '*' : ''}</label>
                                                                        {q.type === 'textarea' ? (
                                                                            <textarea required={q.required} value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={{ ...immersiveInputStyle, minHeight: '160px', borderRadius: '30px', padding: '30px' }} placeholder="A sua resposta..." />
                                                                        ) : q.type === 'select' ? (
                                                                            <select required={q.required} value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={{ ...immersiveInputStyle, appearance: 'none' }}>
                                                                                <option value="">Escolha uma opção...</option>
                                                                                {q.options?.map((opt: string, j: number) => <option key={j} value={opt}>{opt}</option>)}
                                                                            </select>
                                                                        ) : (
                                                                            <input required={q.required} type="text" value={answers[q.label] || ''} onChange={(e) => handleAnswerChange(q.label, e.target.value)} style={immersiveInputStyle} placeholder="..." />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                                            <div style={{ width: '100px', height: '100px', background: '#D4AF3715', color: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                                                <CheckCircle size={50} />
                                                            </div>
                                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Resumo da sua candidatura</h3>
                                                            <div style={{ display: 'grid', gap: '15px', color: '#666', fontSize: '1.1rem' }}>
                                                                <p>Candidato: <strong>{formData.fullName}</strong></p>
                                                                <p>Email: <strong>{formData.email}</strong></p>
                                                                <p>Vaga: <strong>{vacancy?.title}</strong></p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ marginTop: '5rem', display: 'flex', gap: '20px' }}>
                                                    {currentStep > 0 && (
                                                        <button type="button" onClick={prevStep} style={{ padding: '20px 40px', borderRadius: '20px', border: '2px solid #eee', background: 'none', fontWeight: 800, cursor: 'pointer' }}>Anterior</button>
                                                    )}
                                                    {currentStep < totalSteps ? (
                                                        <button 
                                                            type="button" 
                                                            onClick={nextStep} 
                                                            style={{ ...primaryButtonStyle, flex: 1, padding: '20px', borderRadius: '20px' }}
                                                        >
                                                            Próximo Passo <ArrowRight size={20} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            disabled={submitting} 
                                                            type="submit" 
                                                            style={{ ...primaryButtonStyle, flex: 1, padding: '20px', borderRadius: '20px' }}
                                                        >
                                                            {submitting ? <Loader2 className="animate-spin" /> : 'Submeter Candidatura'}
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </form>
                                ) : (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
                                        <div style={{ width: '140px', height: '140px', background: '#D4AF3715', color: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3rem' }}>
                                            <Send size={60} />
                                        </div>
                                        <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-2px' }}>Sucesso!</h2>
                                        <p style={{ fontSize: '1.3rem', color: '#666', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                                            A sua candidatura foi submetida com sucesso. Fique atento ao seu email para os próximos passos.
                                        </p>
                                        <button 
                                            onClick={() => { setIsApplying(false); setSuccess(false); setCurrentStep(0); }}
                                            style={{ ...primaryButtonStyle, padding: '20px 60px', borderRadius: '20px' }}
                                        >
                                            Sair e Voltar às Vagas
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                input:focus, textarea:focus, select:focus { border-color: #D4AF37 !important; outline: none !important; }
            `}</style>
        </>
    );
}

const primaryButtonStyle = {
    background: '#D4AF37',
    color: '#000',
    padding: '16px 32px',
    borderRadius: '16px',
    fontWeight: 800,
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const;

const immersiveInputStyle = {
    width: '100%',
    padding: '24px 0',
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
    fontWeight: 800,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid #eee',
    color: '#000',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
} as const;
