/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formService, FormModel } from '@/lib/formService';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
    FileText,
    Coins,
    Star,
    Users,
    X,
    Minimize2,
    Maximize2
} from 'lucide-react';
import StripeCheckout from '@/components/StripeCheckout';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import PaypalButton from '@/components/common/PaypalButton';
import { toast } from 'sonner';
import MetaPixel from '@/components/MetaPixel';
import { useMetaPixelEvents } from '@/hooks/useMetaPixelEvents';
/* import AdBanner removed */
import { useCurrency } from '@/context/CurrencyContext';
import EventNotFound from './not-found';

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
    const [showPromo, setShowPromo] = useState(false); // Promo Popup State
    const [showFloatingButton, setShowFloatingButton] = useState(false);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [paymentMode, setPaymentMode] = useState<'stripe' | 'manual' | 'paypal' | null>(null);
    const visitRecorded = useRef(false);
    const { trackViewContent, trackAddToCart, trackPurchase } = useMetaPixelEvents();

    // Scroll Animations
    const { scrollY } = useScroll();
    const titleOpacity = useTransform(scrollY, [0, 300], [1, 0.4]);
    const titleScale = useTransform(scrollY, [0, 300], [1, 0.96]);
    const titleY = useTransform(scrollY, [0, 300], [0, -10]);

    const [currentStep, setCurrentStep] = useState(0);
    const FIELDS_PER_STEP = 2;
    const [isVideoHidden, setIsVideoHidden] = useState(false);
    const isMultiStep = form && form.fields && form.fields.length > 2;
    const numFieldSteps = form ? Math.ceil(form.fields.length / FIELDS_PER_STEP) : 1;
    const hasPaymentStep = isMultiStep && form?.paymentConfig?.enabled;
    const totalSteps = isMultiStep ? numFieldSteps + (hasPaymentStep ? 1 : 0) : 1;

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation for current step fields
        const stepFields = form?.fields.slice(currentStep * FIELDS_PER_STEP, (currentStep + 1) * FIELDS_PER_STEP);
        const missingRequired = stepFields?.some(f => f.required && !formData[f.label]);

        if (missingRequired) {
            toast.error('Por favor, preencha todos os campos obrigatórios para continuar.');
            return;
        }

        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
            // Scroll to form top if on mobile
            if (window.innerWidth <= 768) {
                const formEl = document.querySelector('.premium-card');
                formEl?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            handleSubmit(e);
        }
    };

    // Trigger Promo Popup on Success
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setShowPromo(true), 4000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Show floating button only when reaching the bottom of the page
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            // Trigger when user is within 150px of the bottom of the page
            const bottomThreshold = document.documentElement.scrollHeight - 150;
            
            if (scrollPosition >= bottomThreshold) {
                setShowFloatingButton(true);
            } else {
                setShowFloatingButton(false);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

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
            // Default select first tier if exists
            if (initialForm.paymentConfig?.useTieredPricing && initialForm.paymentConfig.pricingTiers && initialForm.paymentConfig.pricingTiers.length > 0) {
                setSelectedTierId(initialForm.paymentConfig.pricingTiers[0].id);
            }
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
                if (data?.paymentConfig?.useTieredPricing && data.paymentConfig.pricingTiers && data.paymentConfig.pricingTiers.length > 0) {
                    setSelectedTierId(data.paymentConfig.pricingTiers[0].id);
                }
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
            if (paymentMode === 'stripe' || paymentMode === 'paypal') return;
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
        return <EventNotFound />;
    }

    const isLuxury = !form.theme?.style || form.theme?.style === 'luxury';
    const primaryColor = form.theme?.primaryColor || '#FFD700';
    const bgColor = form.theme?.backgroundColor || (isLuxury ? '#050505' : '#FFFFFF');
    const isGradient = bgColor.includes('gradient') || bgColor.includes('radial');
    const bgImage = form.theme?.backgroundImage ? `url(${form.theme.backgroundImage})` : (isGradient ? bgColor : (isLuxury ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/bio-organic.png")` : 'none'));
    const isDark = (bgColor.startsWith('#') && !isGradient)
        ? (parseInt(bgColor.slice(1).length === 3 ? bgColor.slice(1).split('').map(c => c + c).join('') : bgColor.slice(1), 16) < 0x999999)
        : (bgColor.toLowerCase().includes('night') || bgColor.toLowerCase().includes('black') || bgColor.toLowerCase().includes('#0f172a') || bgColor.toLowerCase().includes('#050505') || bgColor.toLowerCase().includes('#1e293b') || bgColor.toLowerCase().includes('linear-gradient(135deg, #0f172a') || (isGradient && bgColor.includes('rgba(0,0,0')));

    // Explicitly determine colors based on brightness to avoid white-on-white
    const titleColor = isDark
        ? (form.theme?.titleColor || '#ffffff')
        : (form.theme?.titleColor && form.theme.titleColor.toLowerCase() !== '#ffffff' ? form.theme.titleColor : '#000000');
    const textColor = isDark ? '#ffffff' : '#111111';
    const secondaryTextColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
    const cardBg = isDark ? 'rgba(0, 0, 0, 0.65)' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const inputBg = form.theme?.inputBackgroundColor || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)');
    const placeholderColor = form.theme?.inputPlaceholderColor || (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.65)');
    const formPosition = form.theme?.formPosition || 'right';

    return (
        <main style={{
            position: 'relative',
            minHeight: '100vh',
            color: textColor,
            fontFamily: form.theme?.fontFamily || 'Inter'
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
                    background: bgImage,
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
                .responsive-form-grid.form-left.has-vsl {
                    grid-template-columns: 400px 280px 1fr;
                }
                .responsive-form-grid.form-left.no-vsl {
                    grid-template-columns: 420px 1fr;
                }
                .responsive-form-grid.no-vsl .vsl-column {
                    display: none;
                }
                @media (min-width: 1201px) {
                    .responsive-form-grid.form-left .info-column { order: 3; }
                    .responsive-form-grid.form-left .vsl-column { order: 2; }
                    .responsive-form-grid.form-left .form-column { order: 1; }
                }
                @media (max-width: 1200px) {
                    .responsive-form-grid.has-vsl,
                    .responsive-form-grid.no-vsl,
                    .responsive-form-grid.form-left.has-vsl,
                    .responsive-form-grid.form-left.no-vsl {
                        grid-template-columns: 1fr 1fr;
                        gap: 25px;
                    }
                    .responsive-form-grid.has-vsl .vsl-column,
                    .responsive-form-grid.form-left.has-vsl .vsl-column {
                        grid-column: 1 / -1;
                        justify-self: center;
                    }
                }
                @media (max-width: 768px) {
                    img, video, iframe {
                        max-width: 100% !important;
                    }
                    .responsive-form-grid.has-vsl,
                    .responsive-form-grid.no-vsl,
                    .responsive-form-grid.form-left.has-vsl,
                    .responsive-form-grid.form-left.no-vsl {
                        grid-template-columns: 1fr;
                    }
                    .info-column {
                        align-items: center !important;
                        text-align: center !important;
                        width: 100% !important;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                    .info-column > * {
                        max-width: 100% !important;
                    }
                    .info-column > div, .info-column > a, .info-column > form {
                        justify-content: center !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                    .info-column h1 {
                        text-align: center !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                        word-break: break-word !important;
                    }
                    .info-column .markdown-content p {
                        text-align: center !important;
                        word-break: break-word !important;
                    }
                    .form-column {
                        width: 100% !important;
                    }
                    .form-column > div {
                        margin-left: auto !important;
                        margin-right: auto !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .form-column label {
                        text-align: left !important;
                        justify-content: flex-start !important;
                        width: 100% !important;
                    }
                    .form-column .premium-input {
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .form-column .premium-upload {
                        align-items: center !important;
                        justify-content: center !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .responsive-form-grid {
                        width: 100% !important;
                    }
                    .vsl-wrapper {
                        max-width: 100% !important;
                    }
                }
                .responsive-form-grid.horizontal-vsl {
                    grid-template-columns: 1fr 400px !important;
                }
                .responsive-form-grid.horizontal-vsl .vsl-column {
                    grid-column: 1 / -1;
                    order: -1;
                    margin-bottom: 1rem;
                }
                @media (max-width: 1000px) {
                    .responsive-form-grid.horizontal-vsl {
                        grid-template-columns: 1fr !important;
                    }
                }
                .premium-input {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid ${borderColor} !important;
                }
                .premium-input::placeholder {
                    color: ${placeholderColor} !important;
                    opacity: 1;
                }
                .premium-input:hover {
                    border-color: ${primaryColor}70 !important;
                    background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .premium-input:focus {
                    border-color: ${primaryColor} !important;
                    background: ${bgColor} !important;
                    box-shadow: 0 0 0 4px ${primaryColor}20, 0 8px 20px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }
                .premium-input::placeholder {
                    color: ${isDark ? 'rgba(255,255,255,0.4)' : '#a0a0a0'} !important;
                    opacity: 1;
                }
                .checkbox-container {
                    transition: all 0.2s ease;
                }
                .checkbox-container:hover {
                    background: rgba(255,255,255,0.05);
                    padding-left: 10px !important;
                }
                .premium-upload {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} !important;
                    border: 2px dashed ${borderColor} !important;
                }
                .premium-upload:hover {
                    border-color: ${primaryColor} !important;
                    background: ${primaryColor}05 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .premium-btn {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    overflow: hidden;
                }
                .premium-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px ${primaryColor}40 !important;
                    filter: brightness(1.1);
                }
                .premium-btn:active {
                    transform: translateY(-1px);
                    filter: brightness(0.9);
                }
                .premium-btn::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(
                        45deg,
                        transparent,
                        rgba(255, 255, 255, 0.1),
                        transparent
                    );
                    transform: rotate(45deg);
                    transition: 0.5s;
                    pointer-events: none;
                }
                .premium-btn:hover::after {
                    left: 120%;
                }
                .premium-card {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .premium-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                    border-color: ${primaryColor}70 !important;
                }
                .premium-card.active {
                    background: ${primaryColor}15 !important;
                    border-color: ${primaryColor} !important;
                    box-shadow: 0 8px 20px ${primaryColor}30;
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
                    <div key="form" className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px', paddingLeft: 'clamp(16px, 5vw, 40px)', paddingRight: 'clamp(16px, 5vw, 40px)', boxSizing: 'border-box' }}>

                        {/* Logo removed from absolute positioning */}

                        <div className={`responsive-form-grid ${((form as any).videoUrl && !isVideoHidden) ? 'has-vsl' : 'no-vsl'} ${(form as any).videoOrientation === 'horizontal' ? 'horizontal-vsl' : ''} form-${formPosition}`}>

                            {/* Column 1: Info + Banner */}
                            <motion.div
                                className="info-column"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                            >
                                {/* Strategic Logo Placement */}
                                {form.logo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            marginBottom: '2rem',
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: `3px solid ${primaryColor}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#fff',
                                            boxShadow: `0 10px 25px ${primaryColor}15`,
                                            padding: '5px'
                                        }}
                                    >
                                        <Image
                                            src={form.logo}
                                            alt="Logo"
                                            width={90}
                                            height={90}
                                            style={{ objectFit: 'contain', width: '80%', height: '80%', borderRadius: '50%' }}
                                        />
                                    </motion.div>
                                )}
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

                                <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                                                background: ((form.capacity + (form.extraCapacity || 0)) - (form.submissionCount || 0)) <= 5 ? '#ef4444' : `${primaryColor}15`,
                                                color: ((form.capacity + (form.extraCapacity || 0)) - (form.submissionCount || 0)) <= 5 ? '#fff' : primaryColor,
                                                border: ((form.capacity + (form.extraCapacity || 0)) - (form.submissionCount || 0)) <= 5 ? 'none' : `1px solid ${primaryColor}30`,
                                                animation: ((form.capacity + (form.extraCapacity || 0)) - (form.submissionCount || 0)) <= 5 ? 'pulse-red 2s infinite' : 'none'
                                            }}
                                        >
                                            <Zap size={12} fill="currentColor" />
                                            {(() => {
                                                const subCount = form.submissionCount || 0;
                                                const cap = form.capacity;
                                                const extra = form.extraCapacity || 0;
                                                const total = cap + extra;

                                                if (subCount >= total) return t('events.public.soldOutBadge') || 'VAGAS ESGOTADAS';

                                                if (subCount >= cap) {
                                                    return `${t('events.public.initialSoldOut')} | ${total - subCount} ${t('events.public.extraSlots')}`;
                                                }

                                                return (t('events.public.onlySlots') || 'APENAS {count} VAGAS').replace('{count}', (cap - subCount).toString());
                                            })()}
                                        </div>
                                    )}
                                </motion.div>

                                <motion.h1
                                    variants={itemVariants}
                                    style={{
                                        fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
                                        fontWeight: 900,
                                        marginTop: '0',
                                        marginBottom: '1.5rem',
                                        color: titleColor,
                                        lineHeight: 1.1,
                                        letterSpacing: '-1px',
                                        opacity: titleOpacity,
                                        scale: titleScale,
                                        y: titleY,
                                        textAlign: 'center'
                                    }}
                                >
                                    {form.title}
                                </motion.h1>

                                <motion.div
                                    variants={itemVariants}
                                    style={{
                                        color: isDark ? 'rgba(255,255,255,0.9)' : secondaryTextColor,
                                        fontSize: '1.1rem',
                                        lineHeight: '1.8',
                                        marginBottom: '2.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div className="markdown-content">
                                        {(() => {
                                            const descLimit = 300;
                                            const shouldTruncateDesc = form.description && form.description.length > descLimit;
                                            const displayedDesc = (!isDescExpanded && shouldTruncateDesc)
                                                ? `${form.description.substring(0, descLimit)}...`
                                                : form.description;

                                            return (
                                                <>
                                                    {displayedDesc?.split('\n').map((line, i, arr) => {
                                                        const isLast = i === arr.length - 1;
                                                        return (
                                                            <p key={i} style={{ marginBottom: isLast ? '0' : (line.trim() === '' ? '1rem' : '0.5rem'), display: 'block' }}>
                                                                {line}
                                                                {isLast && shouldTruncateDesc && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); setIsDescExpanded(!isDescExpanded); }}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: primaryColor,
                                                                            fontWeight: 800,
                                                                            fontSize: '0.95rem',
                                                                            cursor: 'pointer',
                                                                            padding: '0',
                                                                            marginLeft: '8px',
                                                                            textDecoration: 'underline',
                                                                            fontStyle: 'normal',
                                                                            display: 'inline-block',
                                                                            verticalAlign: 'baseline'
                                                                        }}
                                                                    >
                                                                        {isDescExpanded ? 'Ler menos' : 'Ler mais'}
                                                                    </button>
                                                                )}
                                                            </p>
                                                        );
                                                    }) || displayedDesc}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </motion.div>

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
                                            padding: '12px 20px',
                                            background: '#25D366',
                                            color: '#ffffff',
                                            textDecoration: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            border: 'none',
                                            marginBottom: '1rem',
                                            boxShadow: '0 8px 15px rgba(37, 211, 102, 0.2)',
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
                                {((form.totalStudents !== undefined && form.totalStudents > 0) || (form.totalEvents !== undefined && form.totalEvents > 0) || (form.averageRating !== undefined && form.averageRating > 0)) && (
                                    <motion.div
                                        variants={itemVariants}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                            gap: '10px',
                                            marginBottom: '1rem',
                                            width: '100%'
                                        }}
                                    >
                                        {(form.totalStudents !== undefined && form.totalStudents > 0) && (
                                            <div style={{ background: cardBg, padding: '0.5rem 0.8rem', borderRadius: '10px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                                                <div style={{ color: primaryColor, marginBottom: '2px', display: 'flex', justifyContent: 'center' }}>
                                                    <Users size={16} />
                                                </div>
                                                <div style={{ fontSize: '1rem', fontWeight: 900, color: titleColor }}>{form.totalStudents}+</div>
                                                <div style={{ fontSize: '0.6rem', color: secondaryTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('feedback.socialProof.students')}</div>
                                            </div>
                                        )}

                                        {(form.totalEvents !== undefined && form.totalEvents > 0) && (
                                            <div style={{ background: cardBg, padding: '0.5rem 0.8rem', borderRadius: '10px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 900, color: titleColor }}>{form.totalEvents}+</div>
                                                <div style={{ fontSize: '0.6rem', color: secondaryTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('feedback.socialProof.eventsCreated')}</div>
                                            </div>
                                        )}

                                        {(form.averageRating !== undefined && form.averageRating > 0) && (
                                            <div style={{ background: cardBg, padding: '0.5rem 0.8rem', borderRadius: '10px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                                                <div style={{ color: '#FFD700', marginBottom: '2px', display: 'flex', justifyContent: 'center', gap: '2px' }}>
                                                    <Star size={12} fill="#FFD700" />
                                                    <Star size={12} fill="#FFD700" />
                                                    <Star size={12} fill="#FFD700" />
                                                    <Star size={12} fill="#FFD700" />
                                                    <Star size={12} fill="#FFD700" />
                                                </div>
                                                <div style={{ fontSize: '1rem', fontWeight: 900, color: titleColor }}>{form.averageRating}</div>
                                                <div style={{ fontSize: '0.6rem', color: secondaryTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('feedback.eventRating.stats.average')}</div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {form.creator && (
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ y: -2, boxShadow: `0 4px 15px ${primaryColor}10` }}
                                        style={{ background: cardBg, padding: '0.8rem 1rem', borderRadius: '12px', border: `1px solid ${borderColor}`, marginBottom: '0.8rem', transition: 'all 0.3s ease', width: '100%', textAlign: 'left' }}
                                    >
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${primaryColor}40`, flexShrink: 0, marginTop: '2px' }}>
                                                {form.creator.profilePhoto ? (
                                                    <Image src={form.creator.profilePhoto} alt={form.creator.name} width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, fontSize: '1rem', fontWeight: 800 }}>
                                                        {form.creator.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, textAlign: 'left' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontSize: '0.65rem', color: primaryColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px', textAlign: 'left' }}>
                                                            {t('events.public.officialRole', { role: t(`common.badges.${form.creator.role || 'mentor'}`) })}
                                                        </div>
                                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: titleColor, textAlign: 'left' }}>{form.creator.name}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
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
                                                {form.creator.bio && (() => {
                                                    const limit = 120;
                                                    const shouldTruncate = form.creator.bio.length > limit;
                                                    const displayedBio = (!isBioExpanded && shouldTruncate)
                                                        ? `${form.creator.bio.substring(0, limit)}...`
                                                        : form.creator.bio;
                                                    return (
                                                        <p style={{ fontSize: '0.85rem', color: secondaryTextColor, marginTop: '8px', fontStyle: 'italic', lineHeight: '1.4', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                                                            &quot;{displayedBio}&quot;
                                                            {shouldTruncate && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.preventDefault(); setIsBioExpanded(!isBioExpanded); }}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: primaryColor,
                                                                        fontWeight: 800,
                                                                        fontSize: '0.75rem',
                                                                        cursor: 'pointer',
                                                                        padding: '0',
                                                                        marginLeft: '8px',
                                                                        textDecoration: 'underline',
                                                                        fontStyle: 'normal',
                                                                        display: 'inline'
                                                                    }}
                                                                >
                                                                    {isBioExpanded ? 'Ler menos' : 'Ler mais'}
                                                                </button>
                                                            )}
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

{/* Middle Ad Slot Hidden */}

                                {form.paymentConfig?.enabled && (
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.01 }}
                                        style={{ background: cardBg, padding: '0.8rem 1rem', borderRadius: '14px', border: `1px solid ${primaryColor}40`, transition: 'all 0.3s ease', marginBottom: '0.5rem', width: '100%' }}
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
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, color: primaryColor, wordBreak: 'break-word', lineHeight: '1' }}>
                                                {formatPrice(form.paymentConfig.price || 0, form.paymentConfig.currency)}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: secondaryTextColor, fontWeight: 600, paddingBottom: '4px' }}>
                                                <span style={{ opacity: 0.6 }}>Aprox. </span>
                                                {formatPrice(form.paymentConfig.price || 0, form.paymentConfig.currency, currency === 'MZN' ? 'USD' : 'MZN')}
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
                                        {form.paymentConfig.instructions && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '0.9rem', color: secondaryTextColor, whiteSpace: 'pre-wrap' }}>
                                                {form.paymentConfig.instructions}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Column 2: VSL Video */}
                            <div className="vsl-column" style={{ width: '100%', display: isVideoHidden ? 'none' : 'block' }}>
                                {(form as any).videoUrl ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                                        style={{ position: (form as any).videoOrientation === 'horizontal' ? 'relative' : 'sticky', top: '20px' }}
                                    >
                                        <div className="vsl-wrapper" style={{
                                            position: 'relative',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            border: `3px solid ${primaryColor}`,
                                            boxShadow: `0 25px 50px rgba(0,0,0,0.4), inset 0 0 0 1px ${primaryColor}30`,
                                            background: '#000',
                                            aspectRatio: (form as any).videoOrientation === 'horizontal' ? '16/9' : '9/16',
                                            width: '100%',
                                            maxWidth: (form as any).videoOrientation === 'horizontal' ? '100%' : '420px',
                                            margin: '0 auto'
                                        }}>
                                            {/* Hide Video Button */}
                                            <button
                                                onClick={() => setIsVideoHidden(true)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    background: 'rgba(0,0,0,0.5)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: 'none',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    zIndex: 10,
                                                    transition: '0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                                                title="Recolher Vídeo"
                                            >
                                                <Minimize2 size={18} />
                                            </button>

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
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
                                className="form-column"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3, type: 'spring', damping: 20 }}
                            >
                                <motion.div
                                    whileHover={{ y: -5, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
                                    transition={{ duration: 0.3 }}
                                    style={{ background: cardBg, borderRadius: '30px', border: `1px solid ${borderColor}`, padding: 'clamp(1.5rem, 5vw, 2.5rem)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden', backdropFilter: isDark ? 'blur(20px)' : 'none' }}
                                >
                                    {form.capacity && (form.submissionCount || 0) >= (form.capacity + (form.extraCapacity || 0)) && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', backdropFilter: 'blur(4px)' }}>
                                            <div style={{ background: '#ef4444', color: '#fff', padding: '1rem 2rem', borderRadius: '50px', fontWeight: 900, marginBottom: '1rem' }}>{t('events.public.registrationsClosed')}</div>
                                            <p style={{ color: '#fff', fontSize: '1.1rem' }}>{t('events.public.capacityReachedDesc')}</p>
                                        </div>
                                    )}
                                    {form.capacity && (form.submissionCount || 0) >= form.capacity && (form.submissionCount || 0) < (form.capacity + (form.extraCapacity || 0)) && (
                                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,215,0,0.1)', border: '1px solid #FFD70040', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Zap size={20} color="#FFD700" fill="#FFD700" />
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#FFD700' }}>{t('events.public.extraCapacityTitle') || 'VAGAS INICIAIS ESGOTADAS!'}</div>
                                                <div style={{ fontSize: '0.75rem', color: secondaryTextColor }}>{t('events.public.extraCapacityDesc') || 'O mentor liberou algumas vagas extras. Garanta a sua agora!'}</div>
                                            </div>
                                        </div>
                                    )}
                                    <h3 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontWeight: 800, marginBottom: '2rem', color: titleColor, textAlign: 'center' }}>{t('form.fillYourData')}</h3>

                                    {isMultiStep && (
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem', justifyContent: 'center' }}>
                                            {Array.from({ length: totalSteps }).map((_, i) => (
                                                <div key={i} style={{
                                                    flex: 1,
                                                    height: '6px',
                                                    borderRadius: '10px',
                                                    background: currentStep >= i ? primaryColor : `${primaryColor}20`,
                                                    boxShadow: currentStep === i ? `0 0 10px ${primaryColor}40` : 'none',
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }} />
                                            ))}
                                        </div>
                                    )}

                                    <motion.form
                                        onSubmit={isMultiStep ? handleNextStep : handleSubmit}
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentStep}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ textAlign: 'left' }}
                                            >
                                                {/* STEP CONTENT: FIELDS */}
                                                {currentStep < numFieldSteps && (isMultiStep ? form.fields.slice(currentStep * FIELDS_PER_STEP, (currentStep + 1) * FIELDS_PER_STEP) : form.fields).map((field) => (
                                                    <div key={field.label} style={{ marginBottom: '1.5rem' }}>
                                                        {field.type !== 'checkbox' && (
                                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem', color: textColor, textAlign: 'left' }}>
                                                                {t(field.label)} {field.required && <span style={{ color: primaryColor }}>*</span>}
                                                            </label>
                                                        )}
                                                        {field.type === 'select' ? (
                                                            <div style={{ position: 'relative' }}>
                                                                <motion.select
                                                                    whileFocus={{ scale: 1.01 }}
                                                                    required={field.required}
                                                                    value={formData[field.label] || ''}
                                                                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                                    className="premium-input"
                                                                    style={{ width: '100%', padding: '1.2rem', paddingRight: '3rem', background: inputBg, borderRadius: '16px', color: textColor, outline: 'none', fontSize: '1rem', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                                                                >
                                                                    <option value="" disabled>{t('form.select')}</option>
                                                                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                </motion.select>
                                                                <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: textColor, opacity: 0.6 }}>
                                                                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        ) : field.type === 'textarea' ? (
                                                            <motion.textarea
                                                                whileFocus={{ scale: 1.01 }}
                                                                required={field.required}
                                                                placeholder={t(field.label)}
                                                                rows={4}
                                                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                                className="premium-input"
                                                                style={{ width: '100%', padding: '1.2rem', background: inputBg, borderRadius: '16px', color: textColor, outline: 'none', fontSize: '1rem', resize: 'none' }}
                                                            />
                                                        ) : field.type === 'radio' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                {(field.options || []).map((opt) => (
                                                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: formData[field.label] === opt ? `${primaryColor}15` : inputBg, borderRadius: '16px', border: `1px solid ${formData[field.label] === opt ? primaryColor : borderColor}`, transition: '0.2s' }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={field.label}
                                                                            value={opt}
                                                                            checked={formData[field.label] === opt}
                                                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                                            style={{ width: '20px', height: '20px', accentColor: primaryColor }}
                                                                        />
                                                                        <span style={{ fontSize: '1rem', color: formData[field.label] === opt ? titleColor : textColor, fontWeight: 600 }}>{opt}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        ) : field.type === 'checkbox' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                {field.options && field.options.length > 0 ? (
                                                                    field.options.map((opt) => {
                                                                        const currentValues = formData[field.label] ? formData[field.label].split(', ') : [];
                                                                        const isChecked = currentValues.includes(opt);
                                                                        return (
                                                                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: isChecked ? `${primaryColor}15` : inputBg, borderRadius: '16px', border: `1px solid ${isChecked ? primaryColor : borderColor}`, transition: '0.2s' }}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    value={opt}
                                                                                    checked={isChecked}
                                                                                    onChange={(e) => {
                                                                                        let newValues;
                                                                                        if (e.target.checked) {
                                                                                            newValues = [...currentValues, opt];
                                                                                        } else {
                                                                                            newValues = currentValues.filter(v => v !== opt);
                                                                                        }
                                                                                        handleInputChange(field.label, newValues.join(', '));
                                                                                    }}
                                                                                    style={{ width: '20px', height: '20px', accentColor: primaryColor }}
                                                                                />
                                                                                <span style={{ fontSize: '1rem', color: isChecked ? titleColor : textColor, fontWeight: 600 }}>{opt}</span>
                                                                            </label>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '1.2rem', background: inputBg, borderRadius: '16px', border: `1px solid ${borderColor}` }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            required={field.required}
                                                                            onChange={(e) => handleInputChange(field.label, e.target.checked ? 'Sim' : 'Não')}
                                                                            style={{ width: '22px', height: '22px', accentColor: primaryColor, cursor: 'pointer' }}
                                                                        />
                                                                        <span style={{ fontSize: '0.95rem', color: textColor, fontWeight: 600 }}>
                                                                            {t(field.label)} {field.required && <span style={{ color: primaryColor }}>*</span>}
                                                                        </span>
                                                                    </label>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <motion.input
                                                                whileFocus={{ scale: 1.01 }}
                                                                type={field.type === 'phone' ? 'tel' : field.type}
                                                                required={field.required}
                                                                placeholder={t(field.label)}
                                                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                                                className="premium-input"
                                                                style={{ width: '100%', padding: '1.2rem', background: inputBg, borderRadius: '16px', color: textColor, outline: 'none', fontSize: '1rem' }}
                                                            />
                                                        )}
                                                    </div>
                                                ))}

                                                {/* STEP CONTENT: PAYMENT SECTION (IF LAST STEP OR SINGLE STEP) */}
                                                {form.paymentConfig?.enabled && (!isMultiStep || currentStep === totalSteps - 1) && (
                                                    <div style={{ marginTop: isMultiStep ? '0' : '2rem', paddingTop: isMultiStep ? '0' : '2rem', borderTop: isMultiStep ? 'none' : `1px solid ${borderColor}` }}>
                                                        {/* PRICING TIERS SELECTION */}
                                                        {form.paymentConfig?.useTieredPricing && form.paymentConfig.pricingTiers && form.paymentConfig.pricingTiers.length > 0 && (
                                                            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: `1px solid ${borderColor}` }}>
                                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: secondaryTextColor, textAlign: 'center' }}>
                                                                    {t('form.selectTicketType') || 'Selecione o tipo de bilhete'}
                                                                </label>
                                                                <div style={{ display: 'grid', gap: '10px' }}>
                                                                    {form.paymentConfig.pricingTiers.map(tier => (
                                                                        <motion.div
                                                                            key={tier.id}
                                                                            whileHover={{ scale: 1.01 }}
                                                                            whileTap={{ scale: 0.99 }}
                                                                            onClick={() => setSelectedTierId(tier.id)}
                                                                            className={`premium-card ${selectedTierId === tier.id ? 'active' : ''}`}
                                                                            style={{
                                                                                padding: '1rem',
                                                                                borderRadius: '16px',
                                                                                cursor: 'pointer',
                                                                                border: `1px solid ${selectedTierId === tier.id ? primaryColor : borderColor}`,
                                                                                background: selectedTierId === tier.id ? `${primaryColor}10` : 'transparent',
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center'
                                                                            }}
                                                                        >
                                                                            <div style={{ textAlign: 'left' }}>
                                                                                <div style={{ fontWeight: 800, color: titleColor, fontSize: '0.95rem' }}>{tier.category}</div>
                                                                                {tier.description && (
                                                                                    <div style={{ fontSize: '0.7rem', color: secondaryTextColor }}>{tier.description}</div>
                                                                                )}
                                                                            </div>
                                                                            <div style={{ fontWeight: 900, color: primaryColor, fontSize: '1rem' }}>
                                                                                {formatPrice(tier.price, 'MZN', currency)}
                                                                            </div>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <h4 style={{ textAlign: 'center', fontWeight: 800, marginBottom: '1.5rem', color: titleColor }}>{t('form.paymentMethodHeader')}</h4>

                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                                            {form.paymentConfig.stripeEnabled && (
                                                                <motion.div
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => setPaymentMode('stripe')}
                                                                    className={`premium-card ${paymentMode === 'stripe' ? 'active' : ''}`}
                                                                    style={{ padding: '1.5rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${borderColor}`, cursor: 'pointer', textAlign: 'center' }}
                                                                >
                                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: paymentMode === 'stripe' ? primaryColor : 'rgba(128,128,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: '0.3s' }}>
                                                                        <CreditCard size={20} color={paymentMode === 'stripe' ? (isDark ? '#000' : '#fff') : '#888'} />
                                                                    </div>
                                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: paymentMode === 'stripe' ? primaryColor : titleColor }}>{t('form.cardPayment')}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: secondaryTextColor }}>{t('form.instant')}</div>
                                                                </motion.div>
                                                            )}

                                                            {form.creator.paypalEmail && (
                                                                <motion.div
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => setPaymentMode('paypal')}
                                                                    className={`premium-card ${paymentMode === 'paypal' ? 'active' : ''}`}
                                                                    style={{ padding: '1.5rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${borderColor}`, cursor: 'pointer', textAlign: 'center' }}
                                                                >
                                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: paymentMode === 'paypal' ? '#0070ba' : 'rgba(128,128,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: '0.3s' }}>
                                                                        <Globe size={20} color={paymentMode === 'paypal' ? '#fff' : '#888'} />
                                                                    </div>
                                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: paymentMode === 'paypal' ? '#0070ba' : titleColor }}>PayPal</div>
                                                                    <div style={{ fontSize: '0.7rem', color: secondaryTextColor }}>{t('form.instant')}</div>
                                                                </motion.div>
                                                            )}
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setPaymentMode('manual')}
                                                                className={`premium-card ${paymentMode === 'manual' ? 'active' : ''}`}
                                                                style={{ padding: '1.5rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${borderColor}`, cursor: 'pointer', textAlign: 'center' }}
                                                            >
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: paymentMode === 'manual' ? primaryColor : 'rgba(128,128,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: '0.3s' }}>
                                                                    <Upload size={20} color={paymentMode === 'manual' ? (isDark ? '#000' : '#fff') : '#888'} />
                                                                </div>
                                                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: paymentMode === 'manual' ? primaryColor : titleColor }}>{t('form.manualPayment')}</div>
                                                                <div style={{ fontSize: '0.75rem', color: secondaryTextColor }}>{t('form.uploadProof')}</div>
                                                            </motion.div>
                                                        </div>

                                                        <AnimatePresence mode="wait">
                                                            {paymentMode === 'stripe' && (
                                                                <motion.div key="stripe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                                    <StripeCheckout formId={form._id} formData={formData} eventTitle={form.title} price={form.paymentConfig.price || 0} currency={form.paymentConfig.currency || 'USD'} />
                                                                </motion.div>
                                                            )}
                                                            {paymentMode === 'paypal' && (
                                                                <motion.div key="paypal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
                                                                    <PaypalButton
                                                                        type="event_registration"
                                                                        formId={form._id}
                                                                        submissionData={{ ...formData, selectedTierId }}
                                                                        currency={form.paymentConfig.currency || 'USD'}
                                                                        onSuccess={(details) => {
                                                                            if (details.submissionId) {
                                                                                router.push(`/payment/success?submission_id=${details.submissionId}`);
                                                                            } else {
                                                                                setSuccess(true);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '10px' }}>
                                                                        {t('form.paypalSecureHint') || 'Transação segura processada pelo PayPal.'}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                            {paymentMode === 'manual' && (
                                                                <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
                                                                    {/* Manual Payment Details Card */}
                                                                    <div style={{
                                                                        background: isDark ? 'rgba(255,215,0,0.05)' : '#fff9e6',
                                                                        border: `1px solid ${primaryColor}40`,
                                                                        borderRadius: '16px',
                                                                        padding: '1.2rem',
                                                                        marginBottom: '1.5rem',
                                                                        fontSize: '0.85rem'
                                                                    }}>
                                                                        <h5 style={{ fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: primaryColor }}>
                                                                            <Info size={16} /> {t('form.paymentDetails')}
                                                                        </h5>

                                                                        <div style={{ display: 'grid', gap: '10px' }}>
                                                                            {/* Legacy M-Pesa/eMola for backward compatibility */}
                                                                            {form.paymentConfig?.mpesaNumber && !form.paymentConfig.manualMethods?.some(m => m.label.includes('M-Pesa')) && (
                                                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                                                    <span style={{ color: secondaryTextColor, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> M-Pesa:</span>
                                                                                    <span style={{ fontWeight: 700 }}>{form.paymentConfig.mpesaNumber}</span>
                                                                                </div>
                                                                            )}
                                                                            {form.paymentConfig?.emolaNumber && !form.paymentConfig.manualMethods?.some(m => m.label.includes('e-Mola')) && (
                                                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                                                    <span style={{ color: secondaryTextColor, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> e-Mola:</span>
                                                                                    <span style={{ fontWeight: 700 }}>{form.paymentConfig.emolaNumber}</span>
                                                                                </div>
                                                                            )}

                                                                            {/* Dynamic Custom Methods */}
                                                                            {form.paymentConfig?.manualMethods?.map((method, idx) => (
                                                                                <div key={idx} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                                                    <span style={{ color: secondaryTextColor, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                                                        {method.label.toLowerCase().includes('mobile') || method.label.toLowerCase().includes('money') || method.label.toLowerCase().includes('phone') ? <Phone size={14} /> : <Coins size={14} />}
                                                                                        {method.label}:
                                                                                    </span>
                                                                                    <span style={{ fontWeight: 700 }}>{method.value}</span>
                                                                                </div>
                                                                            ))}

                                                                            {form.paymentConfig?.bankAccount && (
                                                                                <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '8px', marginTop: '4px', display: 'grid', gap: '6px' }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                        <span style={{ color: secondaryTextColor }}>Banco:</span>
                                                                                        <span style={{ fontWeight: 700 }}>{form.paymentConfig.bankAccount}</span>
                                                                                    </div>
                                                                                    {form.paymentConfig.accountHolder && (
                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                            <span style={{ color: secondaryTextColor }}>Titular:</span>
                                                                                            <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{form.paymentConfig.accountHolder}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div style={{ marginBottom: '1.5rem' }}>
                                                                        <label className="premium-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', borderRadius: '20px', cursor: 'pointer', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: `2px dashed ${borderColor}` }}>
                                                                            <input type="file" hidden accept="image/*,application/pdf,.pdf" onChange={handleFileChange} />
                                                                            {filePreview ? (
                                                                                <div style={{ textAlign: 'center' }}>
                                                                                    <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 10px', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: file?.type === 'application/pdf' ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                                                                                        {file?.type === 'application/pdf' ? (
                                                                                            <FileText size={32} color={primaryColor} />
                                                                                        ) : (
                                                                                            <Image src={filePreview} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                                                                        )}
                                                                                    </div>
                                                                                    <div style={{ fontSize: '0.8rem', color: primaryColor, fontWeight: 700 }}>{file?.name.substring(0, 15)}...</div>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <Upload size={24} color={primaryColor} />
                                                                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: titleColor, marginTop: '8px' }}>{t('form.attachComprovative')}</span>
                                                                                </>
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* FORM NAVIGATION BUTTONS */}
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                            {isMultiStep && currentStep > 0 && (
                                                <button
                                                    type="button"
                                                    disabled={submitting}
                                                    onClick={() => {
                                                        setCurrentStep(prev => prev - 1);
                                                        if (window.innerWidth <= 768) {
                                                            document.querySelector('.premium-card')?.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }}
                                                    style={{ flex: 1, padding: '0.85rem 1rem', borderRadius: '16px', border: `1px solid ${borderColor}`, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: titleColor, fontWeight: 700, cursor: 'pointer', transition: '0.3s', fontSize: '0.9rem' }}
                                                >
                                                    {t('common.prev') === 'common.prev' ? 'Voltar' : t('common.prev')}
                                                </button>
                                            )}

                                            {!(currentStep === totalSteps - 1 && (paymentMode === 'stripe' || paymentMode === 'paypal')) && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="btn-primary premium-btn"
                                                    style={{
                                                        flex: isMultiStep && currentStep > 0 ? 2 : 1,
                                                        padding: '0.85rem 1rem',
                                                        background: primaryColor,
                                                        color: isDark ? '#000' : '#fff',
                                                        borderRadius: '16px',
                                                        fontWeight: 900,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        whiteSpace: 'nowrap',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    {submitting ? (
                                                        <Loader2 className="animate-spin" />
                                                    ) : (
                                                        currentStep < totalSteps - 1 ? (
                                                            <>Próximo Passo <ArrowRight size={18} /></>
                                                        ) : (
                                                            form.paymentConfig?.enabled ? t('form.finishRegistration').toUpperCase() : 'GARANTIR MINHA VAGA'
                                                        )
                                                    )}
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.form>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Bottom Ad Slot Hidden */}

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

            {/* Promo Popup (After Success) */}
            <AnimatePresence>
                {showPromo && (
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{
                            position: 'fixed',
                            bottom: '30px',
                            right: '30px',
                            width: 'calc(100% - 60px)',
                            maxWidth: '400px',
                            background: '#111',
                            color: '#fff',
                            borderRadius: '24px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            zIndex: 10001,
                            padding: '24px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <button
                            onClick={() => setShowPromo(false)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#aaa',
                                transition: 'color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 8px 16px rgba(255, 215, 0, 0.25)'
                            }}>
                                <Zap size={28} color="#000" fill="#000" />
                            </div>

                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>Gostou deste evento?</h4>
                                <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#aaa', lineHeight: '1.5' }}>
                                    Descubra mais experiências incríveis na <strong>Inscreva-se.ai</strong> e gerencie suas inscrições.
                                </p>

                                <button
                                    onClick={() => window.open('/register?utm_source=event_success_popup', '_blank')}
                                    style={{
                                        width: '100%',
                                        background: '#fff',
                                        color: '#000',
                                        border: 'none',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'transform 0.2s',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Criar Conta Grátis <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Discover Platform Button */}
            <AnimatePresence>
                {!showPromo && showFloatingButton && (
                    <motion.a
                        href="/"
                        target="_blank"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
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
                            padding: '10px 20px',
                            borderRadius: '10px 4px 4px 10px',
                            fontSize: '0.65rem',
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
                            width: '42px',
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
                )}
            </AnimatePresence>

            {/* Show video back button if hidden */}
            <AnimatePresence>
                {isVideoHidden && (form as any).videoUrl && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                        onClick={() => setIsVideoHidden(false)}
                        style={{
                            position: 'fixed',
                            bottom: '30px',
                            left: '30px',
                            zIndex: 100,
                            background: primaryColor,
                            color: isDark ? '#000' : '#fff',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '14px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: `0 10px 25px ${primaryColor}40`,
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Maximize2 size={18} />
                        Ver Vídeo (VSL)
                    </motion.button>
                )}
            </AnimatePresence>
        </main>
    );
}

