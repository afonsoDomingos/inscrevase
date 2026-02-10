/* eslint-disable @typescript-eslint/no-explicit-any */
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
    CreditCard,
    Instagram,
    Linkedin,
    Globe,
    Zap,
    ArrowRight,
    Phone,
    Info,
    Coins,
    Star,
    Users
} from 'lucide-react';
import StripeCheckout from '@/components/StripeCheckout';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import { toast } from 'sonner';
import MetaPixel from '@/components/MetaPixel';
import { useMetaPixelEvents } from '@/hooks/useMetaPixelEvents';
import AdBanner from '@/components/common/AdBanner';
import { useCurrency } from '@/context/CurrencyContext';

// Update Props
interface PublicFormProps {
    params: { slug: string };
    initialForm?: FormModel | null;
}

export default function PublicForm({ params, initialForm }: PublicFormProps) {
    const router = useRouter();
    const { t } = useTranslate();
    const { currency, setCurrency, formatPrice } = useCurrency();
    const { slug } = params;
    const [form, setForm] = useState<FormModel | null>(initialForm || null);
    const [loading, setLoading] = useState(!initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [paymentMode, setPaymentMode] = useState<'stripe' | 'manual' | null>(null);
    const visitRecorded = useRef(false);
    const { trackViewContent, trackAddToCart, trackPurchase } = useMetaPixelEvents();

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 50, damping: 15 }
        }
    };

    useEffect(() => {
        if (slug && !visitRecorded.current) {
            formService.recordVisit(slug);
            visitRecorded.current = true;
        }
    }, [slug]);

    useEffect(() => {
        if (initialForm) {
            setLoading(false);
            if (initialForm) {
                trackViewContent({
                    content_name: initialForm.title,
                    content_category: initialForm.category || 'Event',
                    value: initialForm.paymentConfig?.price,
                    currency: initialForm.paymentConfig?.currency
                });
            }
            return;
        }

        const loadForm = async () => {
            if (!slug || slug === 'undefined') {
                setLoading(false);
                return;
            }
            try {
                const data = await formService.getFormBySlug(slug);
                setForm(data);
                if (data) {
                    trackViewContent({
                        content_name: data.title,
                        content_category: data.category || 'Event',
                        value: data.paymentConfig?.price,
                        currency: data.paymentConfig?.currency
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadForm();
    }, [slug, initialForm, trackViewContent]);


    const handleInputChange = (id: string, value: string) => {
        // Track first interaction with form (AddToCart)
        if (Object.keys(formData).length === 0 && form) {
            trackAddToCart({
                content_name: form.title,
                value: form.paymentConfig?.price,
                currency: form.paymentConfig?.currency
            });
        }
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

            // Track successful registration (Purchase)
            if (form.paymentConfig?.enabled && form.paymentConfig.price) {
                trackPurchase({
                    content_name: form.title,
                    value: form.paymentConfig.price,
                    currency: form.paymentConfig.currency || 'USD'
                });
            }

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
    const bgImage = form.theme?.backgroundImage ? `url(${form.theme.backgroundImage})` : (isLuxury ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/bio-organic.png")` : 'none');
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
            position: 'relative',
            minHeight: '100vh',
            color: textColor,
            fontFamily: form.theme?.fontFamily || 'Inter',
            overflow: 'hidden'
        }}>
            {form.creator?.facebookPixelId && <MetaPixel pixelId={form.creator.facebookPixelId} />}
            {/* Animated Background */}
            <div
                style={{
                    position: 'fixed',
                    top: -50,
                    left: -50,
                    right: -50,
                    bottom: -50,
                    backgroundImage: bgImage,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0,
                    animation: 'float-bg 30s ease-in-out infinite alternate'
                }}
            />

            {/* Overlay for better text readability if needed, though handled in bgImage logic mostly */}
            <div style={{ position: 'fixed', inset: 0, background: isLuxury ? 'rgba(0,0,0,0.3)' : 'transparent', zIndex: 1, pointerEvents: 'none' }} />



            <style jsx global>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                @keyframes float-bg {
                    0% { transform: scale(1.0) translate(0, 0); }
                    50% { transform: scale(1.25) translate(-2%, -2%); }
                    100% { transform: scale(1.0) translate(0, 0); }
                }
                .scarcity-badge-active {
                    animation: pulse-red 2s infinite;
                }
                .input-transition {
                    transition: all 0.3s ease;
                }
                .input-transition:focus {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                input::placeholder, select::placeholder, textarea::placeholder {
                    color: ${placeholderColor} !important;
                }
                select option {
                    background: ${bgColor} !important;
                    color: ${textColor} !important;
                }
                .payment-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                }
                @media (max-width: 500px) {
                    .payment-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        padding-bottom: 10px;
                        margin-bottom: 5px;
                    }
                    .payment-row:last-child {
                        border-bottom: none;
                        padding-bottom: 0;
                        margin-bottom: 0;
                    }
                    .payment-row span:last-child {
                        word-break: break-all;
                        font-family: inherit;
                        font-size: 0.95rem;
                        font-weight: 800;
                        background: rgba(255,255,255,0.05);
                        padding: 6px 10px;
                        border-radius: 8px;
                        width: 100%;
                        color: #fff;
                    }
                }
                .responsive-form-grid {
                    display: grid;
                    gap: 30px;
                    align-items: start;
                }
                .responsive-form-grid.has-vsl {
                    grid-template-columns: 1fr 280px 400px;
                }
                .responsive-form-grid.no-vsl {
                    grid-template-columns: 1fr 420px;
                }
                .responsive-form-grid.no-vsl .vsl-column {
                    display: none;
                }
                @media (max-width: 1200px) {
                    .responsive-form-grid.has-vsl,
                    .responsive-form-grid.no-vsl {
                        grid-template-columns: 1fr 1fr;
                        gap: 25px;
                    }
                    .responsive-form-grid.has-vsl .vsl-column {
                        grid-column: 1 / -1;
                        justify-self: center;
                    }
                }
                @media (max-width: 768px) {
                    .responsive-form-grid.has-vsl,
                    .responsive-form-grid.no-vsl {
                        grid-template-columns: 1fr;
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
                        style={{ maxWidth: '600px', margin: 'auto', paddingTop: '150px', textAlign: 'center', padding: '3rem', position: 'relative', zIndex: 10 }}
                    >
                        <div style={{ background: `${primaryColor}10`, padding: '3rem', borderRadius: '30px', border: `1px solid ${primaryColor}20`, backdropFilter: 'blur(10px)' }}>
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
                    <div key="form" className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px' }}>
                        <div className={`responsive-form-grid ${(form as any).videoUrl ? 'has-vsl' : 'no-vsl'}`}>

                            {/* Column 1: Info + Banner */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                style={{ display: 'flex', flexDirection: 'column' }}
                            >
                                {/* Cover Image */}
                                {form.coverImage && (
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            marginBottom: '1.5rem',
                                            border: `1px solid ${borderColor}`,
                                            cursor: 'zoom-in',
                                            background: 'rgba(0,0,0,0.1)',
                                            ...(form.coverImageMode === 'banner' ? {
                                                height: '240px'
                                            } : {})
                                        }}
                                        onClick={() => setSelectedImage(form.coverImage!)}
                                    >
                                        <Image
                                            src={form.coverImage}
                                            alt={form.title}
                                            width={800}
                                            height={600}
                                            style={{
                                                width: '100%',
                                                ...(form.coverImageMode === 'banner' ? {
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                } : {
                                                    height: 'auto',
                                                    maxHeight: '400px',
                                                    objectFit: 'cover'
                                                }),
                                                display: 'block'
                                            }}
                                        />
                                    </motion.div>
                                )}

                                <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{ color: primaryColor, fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('form.registrationsOpen')}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: secondaryTextColor }}>
                                        <Eye size={14} /> {form.visits || 0} visitas
                                    </div>
                                    {form.capacity && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                background: (form.capacity - (form.submissionCount || 0)) <= 5 ? '#ef4444' : `${primaryColor}15`,
                                                color: (form.capacity - (form.submissionCount || 0)) <= 5 ? '#fff' : primaryColor,
                                                border: (form.capacity - (form.submissionCount || 0)) <= 5 ? 'none' : `1px solid ${primaryColor}30`
                                            }}
                                        >
                                            <Zap size={12} fill="currentColor" />
                                            {form.capacity - (form.submissionCount || 0) > 0
                                                ? `APENAS ${form.capacity - (form.submissionCount || 0)} VAGAS`
                                                : 'VAGAS ESGOTADAS'}
                                        </div>
                                    )}
                                </motion.div>

                                <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 900, marginTop: '0', marginBottom: '1rem', color: titleColor }}>{form.title}</motion.h1>
                                <motion.p variants={itemVariants} style={{ color: secondaryTextColor, fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>{form.description}</motion.p>

                                {form.whatsappConfig?.communityUrl && (
                                    <motion.a
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(37, 211, 102, 0.3)' }}
                                        whileTap={{ scale: 0.98 }}
                                        href={form.whatsappConfig.communityUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            padding: '16px 28px',
                                            background: '#25D366',
                                            color: '#ffffff',
                                            textDecoration: 'none',
                                            borderRadius: '16px',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            border: 'none',
                                            marginBottom: '2rem',
                                            boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)',
                                            width: '100%',
                                        }}
                                    >
                                        <div style={{ background: '#fff', borderRadius: '50%', padding: '4px', display: 'flex' }}>
                                            <MessageCircle size={20} color="#25D366" fill="#25D366" />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: titleColor }}>{t('events.public.vipGroup')}</span>
                                    </motion.a>
                                )}

                                {/* Social Proof Metrics */}
                                <motion.div
                                    variants={itemVariants}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                        gap: '15px',
                                        marginBottom: '2rem'
                                    }}
                                >
                                    <div style={{ background: cardBg, padding: '1.25rem', borderRadius: '20px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                                        <div style={{ color: primaryColor, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                            <Users size={24} />
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: titleColor }}>{form.totalStudents || 120}+</div>
                                        <div style={{ fontSize: '0.7rem', color: secondaryTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('feedback.socialProof.students')}</div>
                                    </div>

                                    <div style={{ background: cardBg, padding: '1.25rem', borderRadius: '20px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                                        <div style={{ color: primaryColor, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                            <Zap size={24} />
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: titleColor }}>{form.totalEvents || 12}+</div>
                                        <div style={{ fontSize: '0.7rem', color: secondaryTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('feedback.socialProof.eventsCreated')}</div>
                                    </div>

                                    <div style={{ background: cardBg, padding: '1.25rem', borderRadius: '20px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                                        <div style={{ color: '#FFD700', marginBottom: '8px', display: 'flex', justifyContent: 'center', gap: '2px' }}>
                                            <Star size={18} fill="#FFD700" />
                                            <Star size={18} fill="#FFD700" />
                                            <Star size={18} fill="#FFD700" />
                                            <Star size={18} fill="#FFD700" />
                                            <Star size={18} fill="#FFD700" />
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: titleColor }}>{form.averageRating || 4.9}</div>
                                        <div style={{ fontSize: '0.7rem', color: secondaryTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('feedback.eventRating.stats.average')}</div>
                                    </div>
                                </motion.div>

                                {form.creator && (
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ y: -5, boxShadow: `0 10px 30px ${primaryColor}10` }}
                                        style={{ background: cardBg, padding: '1.5rem', borderRadius: '24px', border: `1px solid ${borderColor}`, marginBottom: '2rem', transition: 'all 0.3s ease' }}
                                    >
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '16px', overflow: 'hidden', border: `2px solid ${primaryColor}40`, flexShrink: 0 }}>
                                                {form.creator.profilePhoto ? (
                                                    <Image src={form.creator.profilePhoto} alt={form.creator.name} width={60} height={60} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, fontSize: '1.5rem', fontWeight: 800 }}>
                                                        {form.creator.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: primaryColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                                                            {t('events.public.officialRole', { role: t(`common.badges.${form.creator.role || 'mentor'}`) })}
                                                        </div>
                                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: titleColor }}>{form.creator.name}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {form.creator.socialLinks?.instagram && (
                                                            <a href={form.creator.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: secondaryTextColor }} className="hover:opacity-80 transition-opacity">
                                                                <Instagram size={16} />
                                                            </a>
                                                        )}
                                                        {form.creator.socialLinks?.linkedin && (
                                                            <a href={form.creator.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: secondaryTextColor }} className="hover:opacity-80 transition-opacity">
                                                                <Linkedin size={16} />
                                                            </a>
                                                        )}
                                                        {form.creator.socialLinks?.website && (
                                                            <a href={form.creator.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ color: secondaryTextColor }} className="hover:opacity-80 transition-opacity">
                                                                <Globe size={16} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                {form.creator.bio && <p style={{ fontSize: '0.85rem', color: secondaryTextColor, marginTop: '8px', fontStyle: 'italic', lineHeight: '1.4' }}>&quot;{form.creator.bio}&quot;</p>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Middle Ad Slot */}
                                <AdBanner slot="3569850277" format="horizontal" />

                                {form.paymentConfig?.enabled && (
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02 }}
                                        style={{ background: cardBg, padding: '1.5rem', borderRadius: '20px', border: `1px solid ${primaryColor}40`, transition: 'all 0.3s ease' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <ShieldCheck size={20} color={primaryColor} />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('events.public.registrationValue')}</span>
                                            </div>
                                            {/* Currency Toggle */}
                                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '100px', padding: '2px' }}>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setCurrency('MZN'); }}
                                                    style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '100px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: currency === 'MZN' ? primaryColor : 'transparent',
                                                        color: currency === 'MZN' ? (isDark ? '#000' : '#fff') : secondaryTextColor,
                                                        transition: '0.2s'
                                                    }}
                                                >MT</button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setCurrency('USD'); }}
                                                    style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '100px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: currency === 'USD' ? primaryColor : 'transparent',
                                                        color: currency === 'USD' ? (isDark ? '#000' : '#fff') : secondaryTextColor,
                                                        transition: '0.2s'
                                                    }}
                                                >USD</button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: primaryColor, wordBreak: 'break-word', lineHeight: '1.1' }}>
                                                {formatPrice(form.paymentConfig.price || 0, form.paymentConfig.currency)}
                                            </div>
                                            {form.paymentConfig.originalPrice && form.paymentConfig.originalPrice > (form.paymentConfig.price || 0) && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
                                                    <div style={{ fontSize: '1rem', color: secondaryTextColor, textDecoration: 'line-through', fontWeight: 600, opacity: 0.6 }}>
                                                        {formatPrice(form.paymentConfig.originalPrice, form.paymentConfig.currency)}
                                                    </div>
                                                    <div style={{
                                                        background: '#ef4444',
                                                        color: '#fff',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        textTransform: 'uppercase',
                                                        width: 'fit-content'
                                                    }}>
                                                        -{Math.round(((form.paymentConfig.originalPrice - (form.paymentConfig.price || 0)) / form.paymentConfig.originalPrice) * 100)}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Alternative Currency Hint */}
                                        <div style={{ fontSize: '0.85rem', color: secondaryTextColor, marginTop: '8px', fontWeight: 600, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                            <span style={{ opacity: 0.6 }}>Aprox. </span>
                                            {formatPrice(form.paymentConfig.price || 0, form.paymentConfig.currency, currency === 'MZN' ? 'USD' : 'MZN')}
                                        </div>
                                        {form.paymentConfig.instructions && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '0.9rem', color: secondaryTextColor }}>
                                                {form.paymentConfig.instructions}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Column 2: VSL Video */}
                            <div className="vsl-column" style={{ width: '100%' }}>
                                {(form as any).videoUrl ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                                        style={{ position: 'sticky', top: '20px' }}
                                    >
                                        <div style={{
                                            position: 'relative',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            border: `3px solid ${primaryColor}`,
                                            boxShadow: `0 25px 50px rgba(0,0,0,0.4), inset 0 0 0 1px ${primaryColor}30`,
                                            background: '#000',
                                            aspectRatio: '9/16',
                                            width: '100%',
                                            maxWidth: '300px',
                                            margin: '0 auto'
                                        }}>
                                            {/* Top Gradient Overlay */}
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: `linear-gradient(to bottom, ${primaryColor}30, transparent)`, zIndex: 2, pointerEvents: 'none' }} />

                                            {/* Play Badge */}
                                            <div style={{ position: 'absolute', top: '12px', left: '12px', background: primaryColor, color: '#000', padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', zIndex: 3, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> VSL
                                            </div>

                                            {/* Video Iframe/Element */}
                                            {(form as any).videoUrl.includes('youtube.com') || (form as any).videoUrl.includes('youtu.be') ? (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${(form as any).videoUrl.includes('youtu.be')
                                                        ? (form as any).videoUrl.split('/').pop()?.split('?')[0]
                                                        : new URLSearchParams(new URL((form as any).videoUrl).search).get('v')}?autoplay=0&rel=0&modestbranding=1`}
                                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            ) : (form as any).videoUrl.includes('vimeo.com') ? (
                                                <iframe
                                                    src={`https://player.vimeo.com/video/${(form as any).videoUrl.split('/').pop()?.split('?')[0]}`}
                                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                                    allow="autoplay; fullscreen; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <video
                                                    src={(form as any).videoUrl}
                                                    controls
                                                    playsInline
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            )}

                                            {/* Bottom Gradient Overlay */}
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: `linear-gradient(to top, rgba(0,0,0,0.8), transparent)`, zIndex: 2, pointerEvents: 'none' }} />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div style={{ display: 'none' }}></div>
                                )}
                            </div>

                            {/* Column 3: Form */}
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3, type: 'spring', damping: 20 }}
                            >
                                <motion.div
                                    whileHover={{ y: -5, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
                                    transition={{ duration: 0.3 }}
                                    style={{ background: cardBg, borderRadius: '30px', border: `1px solid ${borderColor}`, padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}
                                >
                                    {form.capacity && (form.capacity - (form.submissionCount || 0)) <= 0 && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', backdropFilter: 'blur(4px)' }}>
                                            <div style={{ background: '#ef4444', color: '#fff', padding: '1rem 2rem', borderRadius: '50px', fontWeight: 900, marginBottom: '1rem' }}>{t('events.public.registrationsClosed')}</div>
                                            <p style={{ color: '#fff', fontSize: '1.1rem' }}>{t('events.public.capacityReachedDesc')}</p>
                                        </div>
                                    )}
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: titleColor }}>{t('form.fillYourData')}</h3>

                                    <motion.form
                                        onSubmit={handleSubmit}
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {form.fields.map((field) => (
                                            <motion.div variants={itemVariants} key={field.label} style={{ marginBottom: '1.5rem' }}>
                                                {field.type !== 'checkbox' && (
                                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem', color: textColor }}>
                                                        {field.label} {field.required && <span style={{ color: primaryColor }}>*</span>}
                                                    </label>
                                                )}
                                                {field.type === 'select' ? (
                                                    <motion.select
                                                        whileFocus={{ scale: 1.02, borderColor: primaryColor, boxShadow: `0 0 0 4px ${primaryColor}15` }}
                                                        required={field.required}
                                                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                        style={{ width: '100%', padding: '1.2rem', background: inputBg, border: `1px solid ${borderColor}`, borderRadius: '16px', color: textColor, outline: 'none', fontSize: '1rem' }}
                                                    >
                                                        <option value="">{t('form.select')}</option>
                                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </motion.select>
                                                ) : field.type === 'textarea' ? (
                                                    <motion.textarea
                                                        whileFocus={{ scale: 1.02, borderColor: primaryColor, boxShadow: `0 0 0 4px ${primaryColor}15` }}
                                                        required={field.required}
                                                        placeholder={field.label}
                                                        rows={4}
                                                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                        style={{ width: '100%', padding: '1.2rem', background: inputBg, border: `1px solid ${borderColor}`, borderRadius: '16px', color: textColor, outline: 'none', fontSize: '1rem', resize: 'none' }}
                                                    />
                                                ) : field.type === 'checkbox' ? (
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '0.5rem 0' }}>
                                                        <input
                                                            type="checkbox"
                                                            required={field.required}
                                                            onChange={(e) => handleInputChange(field.label, e.target.checked ? 'Sim' : 'Não')}
                                                            style={{ width: '20px', height: '20px', accentColor: primaryColor }}
                                                        />
                                                        <span style={{ fontSize: '0.9rem', color: textColor }}>
                                                            {field.label} {field.required && <span style={{ color: primaryColor }}>*</span>}
                                                        </span>
                                                    </label>
                                                ) : (
                                                    <motion.input
                                                        whileFocus={{ scale: 1.02, borderColor: primaryColor, boxShadow: `0 0 0 4px ${primaryColor}15` }}
                                                        type={field.type === 'phone' ? 'tel' : field.type}
                                                        required={field.required}
                                                        placeholder={field.label}
                                                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                        style={{ width: '100%', padding: '1.2rem', background: inputBg, border: `1px solid ${borderColor}`, borderRadius: '16px', color: textColor, outline: 'none', fontSize: '1rem' }}
                                                    />
                                                )}
                                            </motion.div>
                                        ))}

                                        {form.paymentConfig?.enabled && (
                                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: `1px solid ${borderColor}` }}>
                                                <h4 style={{ textAlign: 'center', fontWeight: 800, marginBottom: '1.5rem', color: titleColor }}>Escolha o Método de Pagamento</h4>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                                    {form.paymentConfig.stripeEnabled && (
                                                        <motion.div
                                                            whileHover={{ scale: 1.05, borderColor: primaryColor }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setPaymentMode('stripe')}
                                                            style={{ padding: '1.5rem', borderRadius: '20px', background: paymentMode === 'stripe' ? `${primaryColor}20` : 'rgba(255,255,255,0.02)', border: `2px solid ${paymentMode === 'stripe' ? primaryColor : borderColor}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}
                                                        >
                                                            <CreditCard size={24} color={paymentMode === 'stripe' ? primaryColor : '#888'} style={{ margin: '0 auto 10px' }} />
                                                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Cartão</div>
                                                            <div style={{ fontSize: '0.7rem', color: secondaryTextColor }}>Instantâneo</div>
                                                        </motion.div>
                                                    )}
                                                    <motion.div
                                                        whileHover={{ scale: 1.05, borderColor: primaryColor }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setPaymentMode('manual')}
                                                        style={{ padding: '1.5rem', borderRadius: '20px', background: paymentMode === 'manual' ? `${primaryColor}20` : 'rgba(255,255,255,0.02)', border: `2px solid ${paymentMode === 'manual' ? primaryColor : borderColor}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}
                                                    >
                                                        <Upload size={24} color={paymentMode === 'manual' ? primaryColor : '#888'} style={{ margin: '0 auto 10px' }} />
                                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Manual</div>
                                                        <div style={{ fontSize: '0.7rem', color: secondaryTextColor }}>Enviando Prova</div>
                                                    </motion.div>
                                                </div>

                                                <AnimatePresence mode="wait">
                                                    {paymentMode === 'stripe' && (
                                                        <motion.div key="stripe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                            <StripeCheckout formId={form._id} formData={formData} eventTitle={form.title} price={form.paymentConfig.price || 0} currency={form.paymentConfig.currency || 'USD'} />
                                                        </motion.div>
                                                    )}
                                                    {paymentMode === 'manual' && (
                                                        <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                            {/* Manual Payment Details Card */}
                                                            <div style={{
                                                                background: isDark ? 'rgba(255,215,0,0.05)' : '#fff9e6',
                                                                border: `1px solid ${primaryColor}40`,
                                                                borderRadius: '16px',
                                                                padding: '1.5rem',
                                                                marginBottom: '1.5rem',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                <h5 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: primaryColor }}>
                                                                    <Info size={18} /> Detalhes para Pagamento
                                                                </h5>

                                                                <div style={{ display: 'grid', gap: '12px' }}>
                                                                    {/* Legacy M-Pesa/eMola for backward compatibility */}
                                                                    {form.paymentConfig?.mpesaNumber && !form.paymentConfig.manualMethods?.some(m => m.label.includes('M-Pesa')) && (
                                                                        <div className="payment-row">
                                                                            <span style={{ color: secondaryTextColor, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> M-Pesa:</span>
                                                                            <span style={{ fontWeight: 700 }}>{form.paymentConfig.mpesaNumber}</span>
                                                                        </div>
                                                                    )}
                                                                    {form.paymentConfig?.emolaNumber && !form.paymentConfig.manualMethods?.some(m => m.label.includes('e-Mola')) && (
                                                                        <div className="payment-row">
                                                                            <span style={{ color: secondaryTextColor, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> e-Mola:</span>
                                                                            <span style={{ fontWeight: 700 }}>{form.paymentConfig.emolaNumber}</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Dynamic Custom Methods */}
                                                                    {form.paymentConfig?.manualMethods?.map((method, idx) => (
                                                                        <div key={idx} className="payment-row">
                                                                            <span style={{ color: secondaryTextColor, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                                                {method.label.toLowerCase().includes('mobile') || method.label.toLowerCase().includes('money') || method.label.toLowerCase().includes('phone') ? <Phone size={14} /> : <Coins size={14} />}
                                                                                {method.label}:
                                                                            </span>
                                                                            <span style={{ fontWeight: 700 }}>{method.value}</span>
                                                                        </div>
                                                                    ))}

                                                                    {form.paymentConfig?.bankAccount && (
                                                                        <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '10px', marginTop: '5px', display: 'grid', gap: '8px' }}>
                                                                            <div className="payment-row">
                                                                                <span style={{ color: secondaryTextColor }}>Banco:</span>
                                                                                <span style={{ fontWeight: 700, textAlign: 'right' }}>{form.paymentConfig.bankAccount}</span>
                                                                            </div>
                                                                            {form.paymentConfig.accountHolder && (
                                                                                <div className="payment-row">
                                                                                    <span style={{ color: secondaryTextColor }}>Titular:</span>
                                                                                    <span style={{ fontWeight: 600, fontSize: '0.8rem', textAlign: 'right' }}>{form.paymentConfig.accountHolder}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {form.paymentConfig?.instructions && (
                                                                        <div style={{
                                                                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                                                            padding: '10px',
                                                                            borderRadius: '8px',
                                                                            marginTop: '5px',
                                                                            fontSize: '0.8rem',
                                                                            fontStyle: 'italic',
                                                                            color: secondaryTextColor
                                                                        }}>
                                                                            {form.paymentConfig.instructions}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

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
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                type="submit"
                                                                disabled={submitting}
                                                                className="btn-primary"
                                                                style={{ width: '100%', padding: '1.2rem', background: primaryColor, color: isDark ? '#000' : '#fff', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                                                            >
                                                                {submitting ? <Loader2 className="animate-spin" /> : 'FINALIZAR INSCRIÇÃO'}
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {!form.paymentConfig?.enabled && (
                                            <motion.button
                                                whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${primaryColor}40` }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={submitting}
                                                className="btn-primary"
                                                style={{ width: '100%', padding: '1.2rem', background: primaryColor, color: isDark ? '#000' : '#fff', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                                            >
                                                {submitting ? <Loader2 className="animate-spin" /> : 'GARANTIR MINHA VAGA'}
                                            </motion.button>
                                        )}
                                    </motion.form>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Bottom Ad Slot */}
                        <div style={{ marginTop: '3rem' }}>
                            <AdBanner slot="3569850277" format="fluid" />
                        </div>

                        {/* Mini Footer for AdSense Compliance */}
                        <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.5, fontSize: '0.75rem' }}>
                            <p style={{ marginBottom: '10px' }}>{t('form.poweredBy')} © {new Date().getFullYear()}</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                <Link href="/privacidade" style={{ color: 'inherit', textDecoration: 'underline' }}>{t('hub.privacy')}</Link>
                                <Link href="/privacidade#termos" style={{ color: 'inherit', textDecoration: 'underline' }}>{t('hub.terms')}</Link>
                            </div>
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

            {/* Floating Discover Platform Button */}
            <motion.a
                href="/"
                target="_blank"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0',
                    textDecoration: 'none',
                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.3))'
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
            >
                <div style={{
                    background: '#1a1a1a',
                    color: '#fff',
                    padding: '10px 20px', // Smaller padding
                    borderRadius: '10px 4px 4px 10px',
                    fontSize: '0.65rem', // Smaller text
                    fontWeight: 800,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.1)',
                    whiteSpace: 'nowrap'
                }}>
                    {t('common.discoverPlatform')}
                </div>
                <div style={{
                    background: '#FFD700',
                    width: '42px', // Smaller icon part
                    height: '42px',
                    borderRadius: '4px 10px 10px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    marginLeft: '-1px',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)'
                }}>
                    <ArrowRight size={18} strokeWidth={2.5} />
                </div>
            </motion.a>
        </main>
    );
}

