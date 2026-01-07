"use client";

import { useState, useEffect } from 'react';
import { formService, FormModel } from '@/lib/formService';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Upload, ShieldCheck, MessageCircle, ArrowRight, Loader2, Instagram, Linkedin, Facebook, Globe } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslate } from '@/context/LanguageContext';

export default function PublicForm({ params }: { params: { slug: string } }) {
    const { t } = useTranslate();
    const { slug } = params;
    const [form, setForm] = useState<FormModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    useEffect(() => {
        const loadForm = async () => {
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
                    window.open(`https://wa.me/${form.whatsappConfig?.phoneNumber}?text=${message}`, '_blank');
                }, 3000);
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || t('form.submitError'));
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

    // Default to luxury/dark if no theme is set (legacy compatibility)
    const isLuxury = !form.theme?.style || form.theme?.style === 'luxury';

    const primaryColor = form.theme?.primaryColor || '#FFD700';
    // Force deep black/dark for luxury to match user preference
    const bgColor = isLuxury ? '#050505' : (form.theme?.backgroundColor || '#FFFFFF');
    const isDark = isLuxury;

    const textColor = isDark ? '#fff' : '#111';
    const secondaryTextColor = isDark ? '#aaa' : '#666';
    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#eee';

    return (
        <main style={{ background: bgColor, minHeight: '100vh', color: textColor, fontFamily: form.theme?.fontFamily || 'Inter' }}>
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
                                <CheckCircle size={80} color={primaryColor} />
                            </motion.div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: textColor }}>{t('form.confirmed')}</h2>
                            <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                                {t('form.successMessage')}
                            </p>

                            <button
                                onClick={() => {
                                    const message = encodeURIComponent(form.whatsappConfig?.message || 'Olá, acabei de me inscrever!');
                                    window.open(`https://wa.me/${form.whatsappConfig?.phoneNumber}?text=${message}`, '_blank');
                                }}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: primaryColor, color: isDark ? '#000' : '#fff' }}
                            >
                                <MessageCircle size={20} /> {t('form.talkToMentor')}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '100px', paddingBottom: '100px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '4rem', alignItems: 'start' }}>

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

                                {form.logo && (
                                    <div style={{ position: 'relative', width: '150px', height: '80px', marginBottom: '1.5rem' }}>
                                        <Image src={form.logo} alt="Event Logo" fill style={{ objectFit: 'contain', objectPosition: 'left' }} />
                                    </div>
                                )}

                                <span style={{ color: primaryColor, fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('form.registrationsOpen')}</span>
                                <h1 style={{ fontSize: '3rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '1.5rem', lineHeight: '1.1', color: textColor }}>
                                    {form.title}
                                </h1>

                                <div style={{ color: '#888', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                                    {form.description}
                                </div>

                                {form.eventDate && (
                                    <div style={{ marginBottom: '2rem', padding: '1rem', background: cardBg, borderRadius: '12px', border: `1px solid ${primaryColor}40`, display: 'inline-block' }}>
                                        <div style={{ fontSize: '0.8rem', color: secondaryTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.eventDate')}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor }}>
                                            {new Date(form.eventDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gap: '1.2rem' }}>
                                    {form.creator && form.creator.name && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: cardBg, padding: '1rem', borderRadius: '15px' }}>
                                            <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${primaryColor}` }}>
                                                {form.creator.profilePhoto ? (
                                                    <Image src={form.creator.profilePhoto} alt={form.creator.name} fill style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
                                                        {form.creator.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', color: secondaryTextColor }}>{t('form.responsibleMentor')}</div>
                                                <div style={{ fontWeight: 600 }}>{form.creator.name}</div>
                                                {form.creator.bio && <div style={{ fontSize: '0.8rem', color: secondaryTextColor, marginTop: '2px' }}>{form.creator.bio}</div>}

                                                {form.creator.socialLinks && (
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                                        {form.creator.socialLinks.instagram && (
                                                            <a href={form.creator.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: secondaryTextColor, transition: 'color 0.2s' }}>
                                                                <Instagram size={16} />
                                                            </a>
                                                        )}
                                                        {form.creator.socialLinks.linkedin && (
                                                            <a href={form.creator.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: secondaryTextColor, transition: 'color 0.2s' }}>
                                                                <Linkedin size={16} />
                                                            </a>
                                                        )}
                                                        {form.creator.socialLinks.facebook && (
                                                            <a href={form.creator.socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ color: secondaryTextColor, transition: 'color 0.2s' }}>
                                                                <Facebook size={16} />
                                                            </a>
                                                        )}
                                                        {form.creator.socialLinks.website && (
                                                            <a href={form.creator.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ color: secondaryTextColor, transition: 'color 0.2s' }}>
                                                                <Globe size={16} />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {form.paymentConfig?.enabled && (
                                        <div style={{ display: 'grid', gap: '1rem', background: cardBg, padding: '1.5rem', borderRadius: '20px', border: `1px solid ${primaryColor}40` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ color: primaryColor }}><ShieldCheck size={24} /></div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: textColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.paidEvent')}</div>
                                            </div>

                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: primaryColor }}>
                                                {form.paymentConfig.price} <span style={{ fontSize: '1rem' }}>{form.paymentConfig.currency}</span>
                                            </div>

                                            {form.paymentConfig.instructions && (
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.6', color: secondaryTextColor, whiteSpace: 'pre-wrap' }}>
                                                    {form.paymentConfig.instructions}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Right Side: Form */}
                            <motion.div
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="luxury-card"
                                style={{ background: cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${borderColor}`, padding: '2.5rem', borderRadius: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                            >
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: textColor }}>{t('form.fillYourData')}</h3>

                                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                    {form.fields.map((field) => (
                                        <div key={field.id}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: secondaryTextColor, marginBottom: '0.6rem' }}>
                                                {field.label} {field.required && <span style={{ color: primaryColor }}>*</span>}
                                            </label>

                                            {field.type === 'select' ? (
                                                <select
                                                    required={field.required}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                                >
                                                    <option value="">{t('form.select')}</option>
                                                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    required={field.required}
                                                    placeholder={`${t('form.your')} ${field.label.toLowerCase()}...`}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {form.paymentConfig?.requireProof && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#aaa', marginBottom: '0.8rem' }}>
                                                {t('form.attachProof')} <span style={{ color: '#FFD700' }}>*</span>
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
                                                        <Upload size={32} color={primaryColor} style={{ marginBottom: '0.5rem' }} />
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: textColor }}>{t('form.clickToUpload')}</div>
                                                        <div style={{ fontSize: '0.75rem', color: secondaryTextColor, marginTop: '4px' }}>{t('form.maxSize')}</div>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary"
                                        style={{ marginTop: '1.5rem', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', background: primaryColor, color: isDark ? '#000' : '#fff', border: 'none', borderRadius: '12px' }}
                                    >
                                        {submitting ? (
                                            <><Loader2 className="animate-spin" size={20} /> {t('form.processing')}</>
                                        ) : (
                                            <>{t('form.finishRegistration')} <ArrowRight size={20} /></>
                                        )}
                                    </button>

                                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#555' }}>
                                        {t('form.termsAgreement')}
                                    </p>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <footer style={{ textAlign: 'center', padding: '3rem', color: '#333', fontSize: '0.8rem', borderTop: '1px solid #111' }}>
                {t('form.poweredBy')} &copy; 2026. {t('form.allRightsReserved')}
            </footer>
        </main>
    );
}
