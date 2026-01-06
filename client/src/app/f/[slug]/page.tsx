"use client";

import { useState, useEffect, use } from 'react';
import { formService, FormModel } from '@/lib/formService';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Upload, ShieldCheck, MessageCircle, ArrowRight, Loader2, Calendar, MapPin, Award } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function PublicForm({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const [form, setForm] = useState<FormModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    useEffect(() => {
        const loadForm = async () => {
            try {
                const data = await formService.getFormBySlug(resolvedParams.slug);
                setForm(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadForm();
    }, [resolvedParams.slug]);

    const handleInputChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setFilePreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        setSubmitting(true);

        try {
            let paymentProofUrl = '';
            if (file) {
                paymentProofUrl = await formService.uploadFile(file);
            }

            await formService.submitForm({
                formId: form._id,
                data: formData,
                paymentProof: paymentProofUrl
            });

            setSuccess(true);

            // Auto redirect to WhatsApp after 3 seconds
            if (form.whatsappConfig?.phoneNumber) {
                setTimeout(() => {
                    const message = encodeURIComponent(form.whatsappConfig?.message || 'Olá, acabei de me inscrever!');
                    window.location.href = `https://wa.me/${form.whatsappConfig?.phoneNumber}?text=${message}`;
                }, 3000);
            }
        } catch (err: any) {
            alert(err.message || 'Erro ao enviar inscrição');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        );
    }

    if (!form) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>404</h1>
                <p style={{ color: '#888' }}>Formulário não encontrado ou inativo.</p>
                <a href="/" className="btn-primary" style={{ marginTop: '2rem', padding: '0.8rem 2rem' }}>Voltar ao Início</a>
            </div>
        );
    }

    return (
        <main style={{ background: '#050505', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            <AnimatePresence>
                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="container"
                        style={{ maxWidth: '600px', margin: '150px auto', textAlign: 'center', padding: '3rem' }}
                    >
                        <div style={{ background: '#38a16915', padding: '3rem', borderRadius: '30px', border: '1px solid #38a16930' }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 10 }}
                                style={{ color: '#31c48d', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}
                            >
                                <CheckCircle size={80} />
                            </motion.div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Inscrição Confirmada!</h2>
                            <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                                Seus dados foram enviados com sucesso. Você será redirecionado para o WhatsApp do mentor em instantes...
                            </p>

                            <button
                                onClick={() => {
                                    const message = encodeURIComponent(form.whatsappConfig?.message || 'Olá!');
                                    window.location.href = `https://wa.me/${form.whatsappConfig?.phoneNumber}?text=${message}`;
                                }}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                <MessageCircle size={20} /> Falar com Mentor no WhatsApp
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '100px', paddingBottom: '100px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

                            {/* Left Side: Info */}
                            <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {form.coverImage && (
                                    <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '24px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid #333' }}>
                                        <Image src={form.coverImage} alt={form.title} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                )}

                                <span style={{ color: '#FFD700', fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Inscrições Abertas</span>
                                <h1 style={{ fontSize: '3rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                                    {form.title}
                                </h1>

                                <div style={{ color: '#888', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                                    {form.description}
                                </div>

                                <div style={{ display: 'grid', gap: '1.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#111', padding: '1rem', borderRadius: '15px' }}>
                                        <div style={{ color: '#FFD700' }}><Award size={24} /></div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Mentor Responsável</div>
                                            <div style={{ fontWeight: 600 }}>{form.creator.name}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#111', padding: '1rem', borderRadius: '15px' }}>
                                        <div style={{ color: '#FFD700' }}><ShieldCheck size={24} /></div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Pagamento Seguro</div>
                                            <div style={{ fontWeight: 600 }}>Via Comprovativo Digital</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Side: Form */}
                            <motion.div
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="luxury-card"
                                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', borderRadius: '30px' }}
                            >
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Preencha seus dados</h3>

                                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                    {form.fields.map((field) => (
                                        <div key={field.id}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#aaa', marginBottom: '0.6rem' }}>
                                                {field.label} {field.required && <span style={{ color: '#FFD700' }}>*</span>}
                                            </label>

                                            {field.type === 'select' ? (
                                                <select
                                                    required={field.required}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    required={field.required}
                                                    placeholder={`Seu ${field.label.toLowerCase()}...`}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#aaa', marginBottom: '0.8rem' }}>
                                            Anexar Comprovativo de Pagamento <span style={{ color: '#FFD700' }}>*</span>
                                        </label>

                                        <label style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            background: 'rgba(255,215,0,0.03)',
                                            border: '2px dashed rgba(255,215,0,0.2)',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}>
                                            <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} required />
                                            {filePreview ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <Image src={filePreview} alt="Comprovativo" width={100} height={100} style={{ borderRadius: '10px', marginBottom: '10px' }} />
                                                    <div style={{ color: '#FFD700', fontSize: '0.8rem' }}>{file?.name}</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload size={32} color="#FFD700" style={{ marginBottom: '0.5rem' }} />
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Clique para enviar imagem ou PDF</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>Tamanho máx: 5MB</div>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary"
                                        style={{ marginTop: '1.5rem', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem' }}
                                    >
                                        {submitting ? (
                                            <><Loader2 className="animate-spin" size={20} /> Processando...</>
                                        ) : (
                                            <>Finalizar Inscrição <ArrowRight size={20} /></>
                                        )}
                                    </button>

                                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#555' }}>
                                        Ao clicar em finalizar, você concorda com nossos termos de privacidade.
                                    </p>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <footer style={{ textAlign: 'center', padding: '3rem', color: '#333', fontSize: '0.8rem', borderTop: '1px solid #111' }}>
                Powered by <strong>Inscreva-se</strong> &copy; 2026. Todos os direitos reservados.
            </footer>
        </main>
    );
}
