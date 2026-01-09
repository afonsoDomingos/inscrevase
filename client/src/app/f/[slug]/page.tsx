"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formService, FormModel } from '@/lib/formService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    MessageCircle,
    Eye,
    Upload,
    Loader2,
    ShieldCheck,
    CreditCard
} from 'lucide-react';
import StripeCheckout from '@/components/StripeCheckout';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import { toast } from 'sonner';

export default function PublicForm({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const { t } = useTranslate();
    const { slug } = params;
    const [form, setForm] = useState<FormModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [paymentMode, setPaymentMode] = useState<'stripe' | 'manual' | null>(null);
    const visitRecorded = useRef(false);

    useEffect(() => {
        if (slug && !visitRecorded.current) {
            formService.recordVisit(slug);
            visitRecorded.current = true;
        }
    }, [slug]);

    useEffect(() => {
        const loadForm = async () => {
            if (!slug || slug === 'undefined') {
                setLoading(false);
                return;
            }
            try {
                const data = await formService.getFormBySlug(slug);
                setForm(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadForm();
    }, [slug]);

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

        if (form.paymentConfig?.enabled) {
            if (!paymentMode) {
                toast.error('Por favor, selecione um método de pagamento.');
                return;
            }
            if (paymentMode === 'manual' && form.paymentConfig?.requireProof && !file) {
                toast.error('Por favor, anexe o comprovativo de pagamento para continuar.');
                return;
            }
            if (paymentMode === 'stripe') return;
        }

        setSubmitting(true);

        try {
            let paymentProofUrl = '';
            if (file && paymentMode === 'manual') {
                paymentProofUrl = await formService.uploadFile(file);
            }

            const response = await formService.submitForm({
                formId: form._id,
                data: formData,
                paymentProof: paymentProofUrl
            });

            const submissionId = response.submission?._id;

            if (submissionId) {
                toast.success('Inscrição enviada com sucesso!');
                router.push(`/hub/${submissionId}`);
            } else {
                setSuccess(true);
            }
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || t('form.submitError'));
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
                <p style={{ color: '#888' }}>{t('form.notFound')}</p>
                <a href="/" className="btn-primary" style={{ marginTop: '2rem', padding: '0.8rem 2rem' }}>{t('form.backToHome')}</a>
            </div>
        );
    }

    const isLuxury = !form.theme?.style || form.theme?.style === 'luxury';
    const primaryColor = form.theme?.primaryColor || '#FFD700';
    const bgColor = form.theme?.backgroundColor || (isLuxury ? '#050505' : '#FFFFFF');
    const bgImage = form.theme?.backgroundImage ? `url(${form.theme.backgroundImage})` : 'none';
    const titleColor = form.theme?.titleColor || (isLuxury ? '#fff' : '#111');
    const inputBg = form.theme?.inputBackgroundColor || (isLuxury ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
    const placeholderColor = form.theme?.inputPlaceholderColor || (isLuxury ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)');
    const isDark = isLuxury || (bgColor.startsWith('#') && parseInt(bgColor.slice(1).length === 3 ? bgColor.slice(1).split('').map(c => c + c).join('') : bgColor.slice(1), 16) < 0x888888);
    const textColor = isDark ? '#fff' : '#111';
    const secondaryTextColor = isDark ? '#aaa' : '#666';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#eee';

    return (
        <main style={{
            backgroundColor: bgColor,
            backgroundImage: bgImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            color: textColor,
            fontFamily: form.theme?.fontFamily || 'Inter'
        }}>
            <style jsx global>{`
                input::placeholder, select::placeholder, textarea::placeholder {
                    color: ${placeholderColor} !important;
                }
                select option {
                    background: ${bgColor} !important;
                    color: ${textColor} !important;
                }
                .responsive-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 450px;
                    gap: 60px;
                    align-items: start;
                }
                @media (max-width: 992px) {
                    .responsive-form-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                }
            `}</style>

            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ maxWidth: '600px', margin: 'auto', paddingTop: '150px', textAlign: 'center', padding: '3rem' }}
                    >
                        <div style={{ background: `${primaryColor}10`, padding: '3rem', borderRadius: '30px', border: `1px solid ${primaryColor}20` }}>
                            <div style={{ color: primaryColor, marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                <CheckCircle size={80} />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>{t('form.confirmed')}</h2>
                            <p style={{ color: secondaryTextColor, fontSize: '1.1rem', marginBottom: '2rem' }}>{t('form.successMessage')}</p>
                            <button
                                onClick={() => {
                                    const message = encodeURIComponent(form.whatsappConfig?.message || 'Olá, acabei de me inscrever!');
                                    window.open(`https://wa.me/${form.whatsappConfig?.phoneNumber}?text=${message}`, '_blank');
                                }}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: primaryColor, color: isDark ? '#000' : '#fff', borderRadius: '16px', fontWeight: 800 }}
                            >
                                <MessageCircle size={20} /> {t('form.talkToMentor')}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div key="form" className="container" style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px' }}>
                        <div className="responsive-form-grid">
                            {/* Left Side: Info */}
                            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                {form.coverImage && (
                                    <div
                                        style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '24px', overflow: 'hidden', marginBottom: '2rem', border: `1px solid ${borderColor}`, cursor: 'zoom-in' }}
                                        onClick={() => setSelectedImage(form.coverImage!)}
                                    >
                                        <Image src={form.coverImage} alt={form.title} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ color: primaryColor, fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('form.registrationsOpen')}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: secondaryTextColor }}>
                                        <Eye size={14} /> {form.visits || 0} {t('common.visits')}
                                    </div>
                                </div>

                                <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900, marginTop: '0.5rem', marginBottom: '1.5rem', color: titleColor }}>{form.title}</h1>
                                <p style={{ color: secondaryTextColor, fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>{form.description}</p>

                                {form.creator && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: cardBg, padding: '1.5rem', borderRadius: '24px', border: `1px solid ${borderColor}`, margin: '2rem 0' }}>
                                        <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '18px', overflow: 'hidden', border: `2px solid ${primaryColor}` }}>
                                            {form.creator.profilePhoto ? (
                                                <Image src={form.creator.profilePhoto} alt={form.creator.name} fill style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, fontSize: '1.5rem', fontWeight: 800 }}>
                                                    {form.creator.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: primaryColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Mentor</div>
                                            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{form.creator.name}</div>
                                            {form.creator.bio && <div style={{ fontSize: '0.85rem', color: secondaryTextColor }}>{form.creator.bio}</div>}
                                        </div>
                                    </div>
                                )}

                                {form.paymentConfig?.enabled && (
                                    <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '20px', border: `1px solid ${primaryColor}40` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                            <ShieldCheck size={20} color={primaryColor} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Valor da Inscrição</span>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: primaryColor }}>
                                            {form.paymentConfig.price} <small style={{ fontSize: '1rem' }}>{form.paymentConfig.currency}</small>
                                        </div>
                                        {form.paymentConfig.instructions && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '0.9rem', color: secondaryTextColor }}>
                                                {form.paymentConfig.instructions}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>

                            {/* Right Side: Form */}
                            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                <div style={{ background: cardBg, borderRadius: '30px', border: `1px solid ${borderColor}`, padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>{t('form.fillYourData')}</h3>

                                    <form onSubmit={handleSubmit}>
                                        {form.fields.map((field) => (
                                            <div key={field.label} style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem', color: textColor }}>
                                                    {field.label} {field.required && <span style={{ color: primaryColor }}>*</span>}
                                                </label>
                                                {field.type === 'select' ? (
                                                    <select
                                                        required={field.required}
                                                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                        style={{ width: '100%', padding: '1.2rem', background: inputBg, border: `1px solid ${borderColor}`, borderRadius: '16px', color: textColor, outline: 'none', fontSize: '1rem' }}
                                                    >
                                                        <option value="">{t('form.select')}</option>
                                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        required={field.required}
                                                        placeholder={field.label}
                                                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                        style={{ width: '100%', padding: '1.2rem', background: inputBg, border: `1px solid ${borderColor}`, borderRadius: '16px', color: textColor, outline: 'none', fontSize: '1rem' }}
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        {form.paymentConfig?.enabled && (
                                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: `1px solid ${borderColor}` }}>
                                                <h4 style={{ textAlign: 'center', fontWeight: 800, marginBottom: '1.5rem' }}>Escolha o Método de Pagamento</h4>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                                    {form.paymentConfig.stripeEnabled && (
                                                        <div
                                                            onClick={() => setPaymentMode('stripe')}
                                                            style={{ padding: '1.5rem', borderRadius: '20px', background: paymentMode === 'stripe' ? `${primaryColor}20` : 'rgba(255,255,255,0.02)', border: `2px solid ${paymentMode === 'stripe' ? primaryColor : borderColor}`, cursor: 'pointer', textAlign: 'center' }}
                                                        >
                                                            <CreditCard size={24} color={paymentMode === 'stripe' ? primaryColor : '#888'} style={{ margin: '0 auto 10px' }} />
                                                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Cartão</div>
                                                            <div style={{ fontSize: '0.7rem', color: secondaryTextColor }}>Instantâneo</div>
                                                        </div>
                                                    )}
                                                    <div
                                                        onClick={() => setPaymentMode('manual')}
                                                        style={{ padding: '1.5rem', borderRadius: '20px', background: paymentMode === 'manual' ? `${primaryColor}20` : 'rgba(255,255,255,0.02)', border: `2px solid ${paymentMode === 'manual' ? primaryColor : borderColor}`, cursor: 'pointer', textAlign: 'center' }}
                                                    >
                                                        <Upload size={24} color={paymentMode === 'manual' ? primaryColor : '#888'} style={{ margin: '0 auto 10px' }} />
                                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Manual</div>
                                                        <div style={{ fontSize: '0.7rem', color: secondaryTextColor }}>Enviando Prova</div>
                                                    </div>
                                                </div>

                                                <AnimatePresence mode="wait">
                                                    {paymentMode === 'stripe' && (
                                                        <motion.div key="stripe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                            <StripeCheckout formId={form._id} formData={formData} eventTitle={form.title} price={form.paymentConfig.price || 0} currency={form.paymentConfig.currency || 'USD'} />
                                                        </motion.div>
                                                    )}
                                                    {paymentMode === 'manual' && (
                                                        <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', border: `2px dashed ${borderColor}`, borderRadius: '20px', cursor: 'pointer' }}>
                                                                    <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
                                                                    {filePreview ? (
                                                                        <div style={{ textAlign: 'center' }}>
                                                                            <Image src={filePreview} alt="Preview" width={80} height={80} style={{ borderRadius: '10px' }} />
                                                                            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: primaryColor }}>{file?.name}</div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <Upload size={32} color={primaryColor} />
                                                                            <span style={{ marginTop: '10px', fontSize: '0.9rem' }}>Anexar Comprovativo de Pagamento</span>
                                                                        </>
                                                                    )}
                                                                </label>
                                                            </div>
                                                            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', padding: '1.2rem', background: primaryColor, color: isDark ? '#000' : '#fff', borderRadius: '16px', fontWeight: 800 }}>
                                                                {submitting ? <Loader2 className="animate-spin" /> : 'FINALIZAR INSCRIÇÃO'}
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {!form.paymentConfig?.enabled && (
                                            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', padding: '1.2rem', background: primaryColor, color: isDark ? '#000' : '#fff', borderRadius: '16px', fontWeight: 800 }}>
                                                {submitting ? <Loader2 className="animate-spin" /> : t('form.submitButton')}
                                            </button>
                                        )}
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <Image src={selectedImage} alt="Large" width={1000} height={1000} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} unoptimized />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
