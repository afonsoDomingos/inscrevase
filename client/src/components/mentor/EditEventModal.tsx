/* eslint-disable */
"use client";
// Force refresh

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, MessageCircle, Save, Loader2, Info, Layout, CheckCircle, Palette, DollarSign, Wand2, Megaphone, Copy, Check, Sparkles, Award, Video, Upload, ChevronRight, Minus, Coins, Database, Play, Lock, ExternalLink, Eye, EyeOff, ShieldCheck, Shield, FileText, Menu, AlignLeft, AlignRight, Mail, Hash, Calendar, CheckSquare, Phone, ChevronDown, ChevronUp, Circle, Square, Crown, Globe, BookOpen, Users2 } from 'lucide-react';
import { toast } from 'sonner';
import { formService, FormModel } from '@/lib/formService';
import { aiService } from '@/lib/aiService';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import CustomFieldsEditor from './CustomFieldsEditor';
import AgendaEditor from './AgendaEditor';
import MaterialsEditor from './MaterialsEditor';
import CertificateEditor, { CertificateConfig } from './CertificateEditor';
import { lessonService, Lesson } from '@/lib/lessonService';
import PartnersEditor from './PartnersEditor';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    form: FormModel;
    userPlan?: string;
    userRole?: string;
    onUpgradeClick?: () => void;
}

function FeaturePaywall({ title, description, onUpgrade }: { title: string, description: string, onUpgrade: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: '#fff',
                borderRadius: '32px',
                border: '1px solid #FFD70044',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '600px',
                margin: '2.5rem auto'
            }}
        >
            <div
                onClick={onUpgrade}
                style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #FFD70015 0%, #FFD70005 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem',
                    border: '1px solid #FFD70033',
                    cursor: 'pointer'
                }}>
                <ShieldCheck size={48} color="#FFD700" />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: '#111' }}>{title}</h3>
            <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: 1.6 }}>{description}</p>
            <button
                onClick={onUpgrade}
                className="btn-primary"
                style={{
                    padding: '1.2rem 2.5rem',
                    borderRadius: '20px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 15px 30px rgba(255, 215, 0, 0.2)'
                }}
            >
                DESBLOQUEAR AGORA <Crown size={20} />
            </button>
        </motion.div>
    );
}

export default function EditEventModal({ isOpen, onClose, onSuccess, form, userPlan = 'free', userRole = 'mentor', onUpgradeClick }: EditEventModalProps) {
    const { t, locale } = useTranslate();
    const [step, setStep] = useState(1);
    const isAdmin = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'superadmin';
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }
    }, []);

    // Marketing State
    const [marketingPlatform, setMarketingPlatform] = useState('instagram');
    const [marketingContent, setMarketingContent] = useState('');
    const [marketingLoading, setMarketingLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleMarketingGenerate = async () => {
        if (!title.trim()) {
            toast.error(t('ai.promptOrient'));
            return;
        }

        setMarketingLoading(true);
        try {
            const prompt = `Crie um post de marketing persuasivo e envolvente para o ${marketingPlatform} sobre o evento: "${title}". Use emojis, hashtags relevantes e um tom luxuoso e exclusivo. Inclua Call to Action.`;
            const data = await aiService.chat(prompt, locale);
            setMarketingContent(data.reply);
            toast.success(t('ai.toastSuccess'));
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || t('ai.toastError'));
        } finally {
            setMarketingLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!marketingContent) return;
        navigator.clipboard.writeText(marketingContent);
        setCopied(true);
        toast.success(t('ai.copySuccess') || 'Copiado!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAiGenerate = async (isRegeneration = false) => {
        if (!title.trim()) {
            toast.error(t('ai.promptOrient'));
            return;
        }

        setAiLoading(true);
        try {
            const promptKey = isRegeneration ? 'ai.descriptionRegeneratePrompt' : 'ai.descriptionPrompt';
            const promptTemplate = t(promptKey);
            const prompt = promptTemplate.replace('{title}', title);
            const data = await aiService.chat(prompt, locale);

            // Clean markdown bold if still present (fallback)
            const cleanDescription = data.reply.replace(/\*\*(.*?)\*\*/g, '$1');
            setDescription(cleanDescription);

            toast.success(t('ai.toastSuccess'));
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || t('ai.toastError'));
        } finally {
            setAiLoading(false);
        }
    };

    const [theme, setTheme] = useState({
        primaryColor: '#0d9488',
        style: 'luxury' as 'luxury' | 'minimalist',
        backgroundColor: 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff',
        fontFamily: 'Inter',
        formPosition: 'right' as 'left' | 'right'
    });

    // Aura AI State
    const [showAiOptions, setShowAiOptions] = useState(false);
    const handleAiGenerateWithTone = async (tone: string) => {
        if (!title.trim()) { toast.error(t('ai.promptOrient')); return; }
        setAiLoading(true);
        try {
            const prompt = `Crie uma descrição para um evento chamado "${title}" com um tom ${tone}. Aja como um copywriter expert, focando em conversão e exclusividade. NÃO use markdown (como **negrito**, # etc).`;
            const data = await aiService.chat(prompt, locale);

            // Clean markdown bold if still present (fallback)
            const cleanDescription = data.reply.replace(/\*\*(.*?)\*\*/g, '$1').replace(/### (.*?)\n/g, '$1\n').replace(/## (.*?)\n/g, '$1\n');
            setDescription(cleanDescription);
            toast.success(t('ai.toastSuccess'));
            setShowAiOptions(false);
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || t('ai.toastError'));
        } finally { setAiLoading(false); }
    };

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventType, setEventType] = useState('modeOnline');
    const [category, setCategory] = useState('Outros');
    const [capacity, setCapacity] = useState('');
    const [extraCapacity, setExtraCapacity] = useState('');
    const [coverImage, setCoverImage] = useState<string>('');
    const [coverImageMode, setCoverImageMode] = useState<'full' | 'banner'>('full');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [location, setLocation] = useState('');
    const [onlineLink, setOnlineLink] = useState('');
    const [waitingVideo, setWaitingVideo] = useState('');
    const [showVideoOnStart, setShowVideoOnStart] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoOrientation, setVideoOrientation] = useState<'vertical' | 'horizontal'>('vertical');
    const [logo, setLogo] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [fields, setFields] = useState<any[]>([]);
    const [editingTypeFieldId, setEditingTypeFieldId] = useState<string | null>(null);

    const [whatsappConfig, setWhatsappConfig] = useState({
        phoneNumber: '',
        message: 'Olá! Gostaria de confirmar minha inscrição.',
        communityUrl: ''
    });

    const [paymentConfig, setPaymentConfig] = useState({
        enabled: false,
        price: 0,
        currency: 'USD',
        mpesaNumber: '',
        emolaNumber: '',
        bankAccount: '',
        accountHolder: '',
        instructions: '',
        requireProof: false,
        stripeEnabled: false,
        stripePriceId: '',
        stripeProductId: '',
        manualMethods: [] as { label: string; value: string; icon?: string }[]
    });

    // Hub Customization State
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [welcomeVideo, setWelcomeVideo] = useState('');
    const [hubBackgroundImage, setHubBackgroundImage] = useState('');
    const [hubButtonColor, setHubButtonColor] = useState('#FFD700');
    const [showHubButton, setShowHubButton] = useState(true);
    const [uploadingHubBackground, setUploadingHubBackground] = useState(false);
    const [customFields, setCustomFields] = useState<any[]>([]);
    const [agenda, setAgenda] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);

    // Certificate State
    const [certificateConfig, setCertificateConfig] = useState<CertificateConfig>({
        enabled: false,
        template: 'classic',
        primaryColor: '#D4AF37',
        backgroundColor: '#ffffff',
        nameColor: '#EAB308',
        title: 'CERTIFICADO',
        subtitle: 'DE CONCLUSÃO',
        description: 'concluiu com êxito a participação no evento:',
        signerName: '',
        signerRole: 'Mentor Responsável',
        requireCheckIn: false,
        showLogo: true
    });

    // Lesson Selection State
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
    const [lessonsLoading, setLessonsLoading] = useState(false);

    // Partners State
    const [partners, setPartners] = useState<any[]>([]);

    useEffect(() => {
        const fetchLessons = async () => {
            setLessonsLoading(true);
            try {
                const data = await lessonService.getManagedLessons();
                setAllLessons(data.lessons || []);

                // Initialize selected lessons from form
                if (form?._id) {
                    const initiallySelected = (data.lessons || [])
                        .filter((l: Lesson) => l.associatedEvents?.includes(form._id))
                        .map((l: Lesson) => l._id);
                    setSelectedLessons(initiallySelected);
                }
            } catch (err) {
                console.error("Error fetching lessons for modal:", err);
            } finally {
                setLessonsLoading(false);
            }
        };

        if (isOpen) fetchLessons();
    }, [isOpen, form?._id]);

    const toggleLessonSelection = (lessonId: string) => {
        setSelectedLessons(prev =>
            prev.includes(lessonId)
                ? prev.filter(id => id !== lessonId)
                : [...prev, lessonId]
        );
    };

    useEffect(() => {
        if (form) {
            setTitle(form.title || '');
            setDescription(form.description || '');
            setEventDate(form.eventDate ? new Date(form.eventDate).toISOString().substring(0, 10) : '');
            setEventTime(form.eventTime || '');
            setEventType(form.eventType || 'modeOnline');
            setCategory(form.category || 'Outros');
            setCapacity(form.capacity ? form.capacity.toString() : '');
            setExtraCapacity((form as any).extraCapacity ? (form as any).extraCapacity.toString() : '0');
            setCoverImage(form.coverImage || '');
            setCoverImageMode((form as any).coverImageMode || 'full');
            setLocation(form.location || '');
            setOnlineLink(form.onlineLink || '');
            setWaitingVideo((form as any).waitingVideo || '');
            setShowVideoOnStart((form as any).showVideoOnStart || false);
            setVideoUrl((form as any).videoUrl || '');
            setVideoOrientation((form as any).videoOrientation || 'vertical');
            setLogo(form.logo || '');
            setFields((form.fields || []).map(f => ({
                ...f,
                label: t(f.label)
            })));
            if (form.whatsappConfig) {
                setWhatsappConfig({
                    phoneNumber: form.whatsappConfig.phoneNumber || '',
                    message: form.whatsappConfig.message || 'Olá! Gostaria de confirmar minha inscrição.',
                    communityUrl: form.whatsappConfig.communityUrl || ''
                });
            }
            if (form.certificateConfig) {
                const certConfig = form.certificateConfig as any;
                setCertificateConfig({
                    enabled: certConfig.enabled || false,
                    template: certConfig.template || 'classic',
                    primaryColor: certConfig.primaryColor || '#D4AF37',
                    backgroundColor: certConfig.backgroundColor || '#ffffff',
                    nameColor: certConfig.nameColor || '#EAB308',
                    title: certConfig.title || 'CERTIFICADO',
                    subtitle: certConfig.subtitle || 'DE CONCLUSÃO',
                    description: certConfig.description || 'concluiu com êxito a participação no evento:',
                    signerName: certConfig.signerName || '',
                    signerRole: certConfig.signerRole || 'Mentor Responsável',
                    requireCheckIn: certConfig.requireCheckIn || false,
                    showLogo: certConfig.showLogo !== undefined ? certConfig.showLogo : true
                });
            }
            if (form.paymentConfig) {
                setPaymentConfig({
                    enabled: form.paymentConfig?.enabled || false,
                    price: form.paymentConfig?.price || 0,
                    currency: form.paymentConfig?.currency || 'MT',
                    mpesaNumber: form.paymentConfig?.mpesaNumber || '',
                    emolaNumber: form.paymentConfig?.emolaNumber || '',
                    bankAccount: form.paymentConfig?.bankAccount || '',
                    accountHolder: form.paymentConfig?.accountHolder || '',
                    instructions: form.paymentConfig?.instructions || '',
                    requireProof: form.paymentConfig?.requireProof || false,
                    stripeEnabled: form.paymentConfig?.stripeEnabled || false,
                    stripePriceId: form.paymentConfig?.stripePriceId || '',
                    stripeProductId: form.paymentConfig?.stripeProductId || '',
                    manualMethods: form.paymentConfig?.manualMethods || []
                });
            }
            if (form.theme) {
                setTheme({
                    primaryColor: form.theme.primaryColor || '#0d9488',
                    style: form.theme.style || 'luxury',
                    backgroundColor: form.theme.backgroundColor || 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff',
                    fontFamily: form.theme.fontFamily || 'Inter',
                    formPosition: form.theme.formPosition || 'right'
                });
            }
            setWelcomeMessage(form.welcomeMessage || '');
            setWelcomeVideo(form.welcomeVideo || '');
            setHubBackgroundImage(form.hubBackgroundImage || '');
            setHubButtonColor(form.hubButtonColor || '#FFD700');
            setShowHubButton(form.showHubButton !== undefined ? form.showHubButton : true);
            setCustomFields(form.customFields || []);
            setAgenda(form.agenda || []);
            setMaterials(form.materials || []);
            setPartners(form.partners || []);
        }
    }, [form]);

    const handleAddField = () => {
        const newId = (fields.length + 1).toString();
        setFields([...fields, { id: newId, label: '', type: 'text', required: true }]);
    };

    const handleRemoveField = (id: string) => {
        setFields(fields.filter(f => ((f as any)._id || f.id) !== id));
    };

    const handleFieldChange = (id: string, key: string, value: string | boolean | string[]) => {
        setFields(fields.map(f => {
            const fieldId = (f as any)._id || f.id;
            if (fieldId !== id) return f;

            if (key === 'type') {
                const newType = value as string;
                const currentLabel = f.label.trim();

                const defaultLabels = [
                    '',
                    t('events.defaultFieldName'),
                    t('events.defaultFieldEmail'),
                    t('events.typeText'),
                    t('events.typeEmail'),
                    t('events.typeNumber'),
                    t('events.typePhone'),
                    t('events.typeSelect'),
                    t('events.typeCheckbox'),
                    t('events.typeDate'),
                    t('events.typeFile'),
                    t('events.typeTextarea')
                ];

                const shouldUpdateLabel = !currentLabel || defaultLabels.some(lbl => lbl === currentLabel);

                return {
                    ...f,
                    type: newType,
                    label: shouldUpdateLabel
                        ? t(`events.type${newType.charAt(0).toUpperCase() + newType.slice(1)}`)
                        : f.label
                };
            }

            if (key === 'required') {
                return { ...f, required: value as boolean };
            }
            if (key === 'options') {
                return { ...f, options: value as string[] };
            }
            // For other string fields
            return { ...f, [key]: value as string };
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingImage(true);
            try {
                const url = await formService.uploadFile(e.target.files[0], 'covers');
                setCoverImage(url);
                toast.success('Imagem de capa carregada com sucesso!');
            } catch (err: unknown) {
                console.error("Cover Upload Error:", err);
                toast.error('Erro ao carregar imagem. Por favor, tente novamente.');
            } finally {
                setUploadingImage(false);
                // Reset input para permitir re-upload do mesmo arquivo se necessário
                e.target.value = '';
            }
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingLogo(true);
            try {
                const url = await formService.uploadFile(e.target.files[0], 'logos');
                setLogo(url);
                toast.success('Logo empresarial carregada!');
            } catch (err: unknown) {
                console.error("Logo Upload Error:", err);
                toast.error('Erro ao carregar logo. Por favor, tente novamente.');
            } finally {
                setUploadingLogo(false);
                // Reset input para permitir re-upload do mesmo arquivo se necessário
                e.target.value = '';
            }
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 100 * 1024 * 1024) {
                toast.error('O vídeo deve ter no máximo 100MB');
                e.target.value = ''; // Reset input
                return;
            }
            setUploadingVideo(true);
            try {
                const url = await formService.uploadFile(file, 'videos');
                setVideoUrl(url);
                toast.success('Vídeo carregado com sucesso!');
            } catch (err: unknown) {
                console.error(err);
                toast.error('Erro ao carregar o vídeo. Por favor, tente novamente.');
            } finally {
                setUploadingVideo(false);
                // Reset input para permitir re-upload do mesmo arquivo se necessário
                e.target.value = '';
            }
        }
    };

    const handleHubBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingHubBackground(true);
            try {
                const url = await formService.uploadFile(e.target.files[0], 'hub-backgrounds');
                setHubBackgroundImage(url);
                toast.success('Imagem de fundo do Hub carregada!');
            } catch (err: unknown) {
                console.error(err);
                toast.error('Erro ao carregar imagem de fundo. Por favor, tente novamente.');
            } finally {
                setUploadingHubBackground(false);
                // Reset input para permitir re-upload do mesmo arquivo se necessário
                e.target.value = '';
            }
        }
    };

    const handleSubmit = async () => {
        if (!title || !description) {
            toast.error(t('events.fillTitleDescAlert'));
            setStep(1);
            return;
        }

        // Validate Fields
        const hasEmptyFields = fields.some(f => !f.label.trim());
        if (hasEmptyFields) {
            toast.error(t('events.emptyFieldsAlert'));
            setStep(2);
            return;
        }

        // Clean up fields (remove temporary id for existing fields or rename if needed)
        const cleanedFields = fields.map(f => {
            const { id, ...rest } = f;
            return {
                ...rest,
                label: t(rest.label)
            };
        });

        setLoading(true);
        try {
            await formService.updateForm(form._id, {
                title,
                description,
                eventDate,
                eventTime,
                eventType,
                category,
                capacity: capacity ? parseInt(capacity) : null,
                extraCapacity: extraCapacity ? parseInt(extraCapacity) : 0,
                location,
                onlineLink,
                fields: cleanedFields as FormModel['fields'],
                coverImage,
                coverImageMode,
                whatsappConfig,
                theme: {
                    ...theme,
                    style: theme.style as "luxury" | "minimalist",
                    backgroundColor: theme.backgroundColor,
                    fontFamily: theme.fontFamily
                },
                paymentConfig,
                welcomeMessage,
                welcomeVideo,
                hubBackgroundImage,
                hubButtonColor,
                showHubButton,
                waitingVideo,
                showVideoOnStart,
                videoUrl,
                customFields: customFields.filter(f => f.label.trim() && f.value.trim()),
                agenda: agenda.filter(a => a.time.trim() && a.activity.trim()),
                materials: materials.filter(m => m.name.trim() && m.url.trim()),
                certificateConfig,
                videoOrientation,
                logo,
                associatedLessons: selectedLessons,
                partners: partners.map(p => typeof p === 'string' ? p : p._id),
                active: form.active
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Update Event Error Detail:", error);
            toast.error(error.message || t('common.updateStatusError'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="edit-event-modal"
                    style={{
                        height: '100vh',
                        width: '100vw',
                        maxWidth: '100%',
                        borderRadius: 0,
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : `${isSidebarVisible ? '300px' : '0px'} 1fr`,
                        gridTemplateRows: isMobile ? 'auto 1fr' : '1fr',
                        background: '#fff',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Sidebar */}
                    <div
                        className="edit-event-sidebar custom-scrollbar"
                        style={{
                            width: isSidebarVisible ? (isMobile ? '100%' : '300px') : '0',
                            opacity: isSidebarVisible ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRight: isSidebarVisible ? '1px solid #eee' : 'none',
                            background: '#0a0a0a'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#FFD700' }}>
                            <Layout size={24} />
                            <span className="btn-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>{t('events.editEvent')}</span>
                        </div>

                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            {[
                                { id: 1, label: t('events.steps.info'), icon: <Info size={18} /> },
                                { id: 2, label: t('events.steps.form'), icon: <Plus size={18} /> },
                                { id: 3, label: t('events.steps.design'), icon: <Palette size={18} /> },
                                { id: 4, label: t('events.steps.payment'), icon: <DollarSign size={18} />, premium: true },
                                { id: 5, label: t('events.steps.communication'), icon: <MessageCircle size={18} /> },
                                { id: 6, label: 'Marketing AI', icon: <Megaphone size={18} /> },
                                { id: 7, label: 'Hub Personalizado', icon: <Sparkles size={18} /> },
                                { id: 8, label: 'Certificados', icon: <Award size={18} />, premium: true },
                                { id: 9, label: 'Aulas do Evento', icon: <BookOpen size={18} />, premium: true },
                                { id: 10, label: 'Parceiros/Co-org', icon: <Users2 size={18} />, premium: true },
                            ].map((s) => {
                                const isLocked = !isAdmin && s.premium && (userPlan === 'free' || !userPlan);
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            if (isLocked) {
                                                if (onUpgradeClick) onUpgradeClick();
                                            } else {
                                                setStep(s.id);
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '0.6rem 1rem',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: step === s.id ? '#FFD70015' : 'transparent',
                                            color: step === s.id ? '#FFD700' : '#888',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s',
                                            fontSize: '0.85rem',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {s.icon}
                                            {isLocked && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    background: '#111',
                                                    color: '#FFD700',
                                                    borderRadius: '50%',
                                                    width: '14px',
                                                    height: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '8px',
                                                    border: '1px solid #FFD700'
                                                }}>
                                                    <Lock size={8} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="btn-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Wrapper */}
                    <div className="edit-event-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
                        {/* Scrollable Area */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: isMobile ? '1rem' : '2rem',
                            paddingBottom: '5rem',
                            minHeight: 0,
                            position: 'relative'
                        }} className="custom-scrollbar">
                            <div style={{ position: 'absolute', top: isMobile ? '1rem' : '2rem', left: isMobile ? '1rem' : '2rem', zIndex: 10 }}>
                                {!isMobile && (
                                    <button
                                        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                                        style={{
                                            background: '#fff',
                                            border: '1px solid #ddd',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            color: '#666'
                                        }}
                                    >
                                        <Menu size={20} />
                                    </button>
                                )}
                            </div>

                            <div style={{ position: 'absolute', top: isMobile ? '1rem' : '2rem', right: isMobile ? '1rem' : '2rem', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                                <button
                                    onClick={() => setShowPreview(true)}
                                    title="Pré-visualizar Alterações"
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #ddd',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        color: '#333'
                                    }}
                                >
                                    <Eye size={18} />
                                    {!isMobile && "Pré-visualizar"}
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{ background: '#eee', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>{t('events.basicInfo')}</h2>

                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.eventName')}</label>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder={t('events.namePlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.eventDate')}</label>
                                                    <input
                                                        type="date"
                                                        value={eventDate}
                                                        onChange={(e) => setEventDate(e.target.value)}
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.eventTime')}</label>
                                                    <input
                                                        type="text"
                                                        value={eventTime}
                                                        onChange={(e) => setEventTime(e.target.value)}
                                                        placeholder={t('events.eventTimePlaceholder') || 'HH:MM'}
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.capacityLabel')}</label>
                                                    <input
                                                        type="number"
                                                        value={capacity}
                                                        onChange={(e) => setCapacity(e.target.value)}
                                                        placeholder={t('events.capacityPlaceholder')}
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                    />
                                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>{t('events.capacityHelp')}</p>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.extraCapacityLabel')}</label>
                                                    <input
                                                        type="number"
                                                        value={extraCapacity}
                                                        onChange={(e) => setExtraCapacity(e.target.value)}
                                                        placeholder="Ex: 10"
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                    />
                                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>{t('events.extraCapacityHelp')}</p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.eventMode')}</label>
                                                    <select
                                                        value={eventType}
                                                        onChange={(e) => setEventType(e.target.value)}
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', background: '#fff' }}
                                                    >
                                                        <option value="modePresencial">{t('events.modePresencial')}</option>
                                                        <option value="modeOnline">{t('events.modeOnline')}</option>
                                                        <option value="modeHybrid">{t('events.modeHybrid')}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Categoria</label>
                                                    <select
                                                        value={category}
                                                        onChange={(e) => setCategory(e.target.value)}
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', background: '#fff' }}
                                                    >
                                                        <option value="Outros">Outros</option>
                                                        <option value="Negócios">Negócios</option>
                                                        <option value="Tecnologia">Tecnologia</option>
                                                        <option value="Arte & Música">Arte & Música</option>
                                                        <option value="Educação">Educação</option>
                                                        <option value="Saúde & Bem-estar">Saúde & Bem-estar</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Localização (Presencial)</label>
                                                    <input
                                                        type="text"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        placeholder="Ex: Av. Eduardo Mondlane, Maputo"
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Link do Evento (Online)</label>
                                                    <input
                                                        type="text"
                                                        value={onlineLink}
                                                        onChange={(e) => setOnlineLink(e.target.value)}
                                                        placeholder="Ex: Zoom, Google Meet link"
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Vídeo de Aquecimento (Loop Pré-Live)</label>
                                                <input
                                                    type="text"
                                                    value={waitingVideo}
                                                    onChange={(e) => setWaitingVideo(e.target.value)}
                                                    placeholder="Link do Youtube para tocar antes do evento (Opcional)"
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                                <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input
                                                        type="checkbox"
                                                        id="showVideoOnStart"
                                                        checked={showVideoOnStart}
                                                        onChange={(e) => setShowVideoOnStart(e.target.checked)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#111' }}
                                                    />
                                                    <label htmlFor="showVideoOnStart" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500, userSelect: 'none' }}>
                                                        Iniciar com Player Expandido (Automático)
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '10px' }}>
                                                    <label style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.description')}</label>

                                                    {!showAiOptions ? (
                                                        <motion.button
                                                            type="button"
                                                            onClick={() => setShowAiOptions(true)}
                                                            disabled={aiLoading}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            style={{
                                                                padding: '8px 16px',
                                                                borderRadius: '20px',
                                                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                                                border: 'none',
                                                                color: '#000',
                                                                fontWeight: 800,
                                                                fontSize: '0.75rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 5px rgba(255, 215, 0, 0.2)',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} />
                                                            {aiLoading ? "Criando Mágica..." : (description ? t('ai.buttonRegenerate') : "Aura AI: Assistente")}
                                                        </motion.button>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            style={{ display: 'flex', gap: '5px', alignItems: 'center', background: '#FFF8E1', padding: '4px', borderRadius: '20px', border: '1px solid #FFD700' }}
                                                        >
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#B8860B', marginLeft: '8px', marginRight: '4px' }}>Tom:</span>
                                                            {['Profissional', 'Inspirador', 'Exclusivo', 'Outra'].map(tone => (
                                                                <button
                                                                    key={tone}
                                                                    type="button"
                                                                    onClick={() => tone === 'Outra' ? handleAiGenerate(true) : handleAiGenerateWithTone(tone)}
                                                                    disabled={aiLoading}
                                                                    className="hover:scale-105 transition-transform"
                                                                    style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', border: 'none', background: '#fff', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', color: '#333', fontWeight: 500 }}
                                                                >
                                                                    {tone === 'Outra' ? 'Gerar Outra' : tone}
                                                                </button>
                                                            ))}
                                                            <button type="button" onClick={() => setShowAiOptions(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: '5px', display: 'flex' }}><X size={14} color="#b8860b" /></button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    maxLength={3000}
                                                    rows={4}
                                                    placeholder={t('events.descriptionPlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', resize: 'none' }}
                                                />
                                                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                                                    {description.length}/3000
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.coverImageLabel')}</label>
                                                <div style={{
                                                    width: '100%',
                                                    height: '180px',
                                                    background: '#eee',
                                                    borderRadius: '20px',
                                                    border: '2px dashed #ccc',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: coverImage ? 0 : 1 }}
                                                    />
                                                    {uploadingImage ? <Loader2 className="animate-spin" /> : (
                                                        coverImage ? (
                                                            <>
                                                                <Image src={coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} />
                                                                <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 2 }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); setCoverImage(''); }}
                                                                        style={{
                                                                            background: 'rgba(239, 68, 68, 0.9)',
                                                                            color: '#fff',
                                                                            border: 'none',
                                                                            borderRadius: '8px',
                                                                            padding: '8px 12px',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 600,
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px'
                                                                        }}
                                                                    >
                                                                        <Trash2 size={14} /> Remover
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ImageIcon size={32} color="#aaa" />
                                                                <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px' }}>{t('events.coverImageHelp')}</span>
                                                            </>
                                                        )
                                                    )}
                                                </div>
                                                {coverImage && !uploadingImage && (
                                                    <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '8px', fontWeight: 600 }}>
                                                        ✓ Imagem carregada! Clique acima para alterar ou use o botão Remover.
                                                    </p>
                                                )}

                                                {/* Image Display Mode Selector */}
                                                {coverImage && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
                                                            📐 Como exibir a imagem na página?
                                                        </label>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setCoverImageMode('full')}
                                                                style={{
                                                                    padding: '0.8rem',
                                                                    borderRadius: '12px',
                                                                    border: coverImageMode === 'full' ? '2px solid #22c55e' : '1px solid #ddd',
                                                                    background: coverImageMode === 'full' ? '#f0fdf4' : '#fff',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'center'
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🖼️</div>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: coverImageMode === 'full' ? '#16a34a' : '#333' }}>Imagem Completa</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#888' }}>Mostra toda a imagem</div>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setCoverImageMode('banner')}
                                                                style={{
                                                                    padding: '0.8rem',
                                                                    borderRadius: '12px',
                                                                    border: coverImageMode === 'banner' ? '2px solid #22c55e' : '1px solid #ddd',
                                                                    background: coverImageMode === 'banner' ? '#f0fdf4' : '#fff',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'center'
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🎞️</div>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: coverImageMode === 'banner' ? '#16a34a' : '#333' }}>Formato Banner</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#888' }}>Altura fixa (cortada)</div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Logo da Empresa (Opcional)</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        background: '#f8f9fa',
                                                        borderRadius: '16px',
                                                        border: '2px dashed #ddd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <input type="file" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                                        {uploadingLogo ? <Loader2 className="animate-spin" size={20} /> : (
                                                            logo ? <Image src={logo} alt="Logo" fill style={{ objectFit: 'contain', padding: '10px' }} /> : (
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <Upload size={20} color="#aaa" />
                                                                    <p style={{ fontSize: '0.6rem', color: '#888', marginTop: '4px' }}>Logo</p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
                                                            Adicione uma logo empresarial para aparecer no topo do seu formulário. Se não desejar usar uma logo, deixe este campo vazio.
                                                        </p>
                                                        {logo && (
                                                            <button
                                                                onClick={() => setLogo('')}
                                                                style={{ marginTop: '8px', fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                                            >
                                                                Remover Logo
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                                                    🎬 Vídeo de Vendas (VSL)
                                                </label>

                                                {/* Video Preview */}
                                                {videoUrl && (
                                                    <div style={{
                                                        marginBottom: '1rem',
                                                        padding: '1rem',
                                                        background: '#000',
                                                        borderRadius: '16px',
                                                        position: 'relative'
                                                    }}>
                                                        <button
                                                            onClick={() => setVideoUrl('')}
                                                            type="button"
                                                            style={{
                                                                position: 'absolute',
                                                                top: '0.5rem',
                                                                right: '0.5rem',
                                                                background: 'rgba(255,0,0,0.9)',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '6px 10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                cursor: 'pointer',
                                                                zIndex: 10,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                color: '#fff'
                                                            }}
                                                        >
                                                            <Trash2 size={14} /> Remover Vídeo
                                                        </button>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            color: '#4ade80'
                                                        }}>
                                                            <Video size={20} />
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Vídeo configurado</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', wordBreak: 'break-all' }}>
                                                            {videoUrl.length > 60 ? videoUrl.substring(0, 60) + '...' : videoUrl}
                                                        </p>
                                                    </div>
                                                )}

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    {/* Upload Option */}
                                                    <label style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '1.5rem',
                                                        background: uploadingVideo ? '#f0fdf4' : '#f8f9fa',
                                                        border: '2px dashed #ddd',
                                                        borderRadius: '16px',
                                                        cursor: uploadingVideo ? 'wait' : 'pointer',
                                                        transition: 'all 0.2s',
                                                        minHeight: '120px'
                                                    }}>
                                                        <input
                                                            type="file"
                                                            hidden
                                                            accept="video/*"
                                                            onChange={handleVideoUpload}
                                                            disabled={uploadingVideo}
                                                        />
                                                        {uploadingVideo ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={28} color="#22c55e" />
                                                                <span style={{ fontSize: '0.8rem', marginTop: '8px', color: '#22c55e', fontWeight: 600 }}>Carregando...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload size={28} color="#888" />
                                                                <span style={{ fontSize: '0.85rem', marginTop: '8px', fontWeight: 600 }}>Upload Vídeo</span>
                                                                <span style={{ fontSize: '0.7rem', color: '#888' }}>Máx: 100MB</span>
                                                            </>
                                                        )}
                                                    </label>

                                                    {/* Link Option */}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        padding: '1rem',
                                                        background: '#f8f9fa',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '16px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                            <Video size={16} color="#888" />
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Ou cole um link</span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={videoUrl}
                                                            onChange={(e) => setVideoUrl(e.target.value)}
                                                            placeholder="YouTube, Vimeo, etc."
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.7rem',
                                                                borderRadius: '8px',
                                                                border: '1px solid #e0e0e0',
                                                                outline: 'none',
                                                                fontSize: '0.85rem'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {videoUrl && (
                                                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fffbeb', borderRadius: '16px', border: '1px solid #fef3c7' }}>
                                                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', color: '#92400e' }}>
                                                            Orientação do Vídeo (VSL)
                                                        </label>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setVideoOrientation('vertical')}
                                                                style={{
                                                                    padding: '1rem',
                                                                    borderRadius: '12px',
                                                                    border: '2px solid',
                                                                    borderColor: videoOrientation === 'vertical' ? '#b45309' : '#e5e7eb',
                                                                    background: videoOrientation === 'vertical' ? '#fff' : '#f9fafb',
                                                                    color: videoOrientation === 'vertical' ? '#b45309' : '#6b7280',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <div style={{ width: '20px', height: '32px', border: '2px solid currentColor', borderRadius: '4px', position: 'relative' }}>
                                                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', background: 'currentColor', borderRadius: '50%' }} />
                                                                </div>
                                                                Vertical (9:16)
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setVideoOrientation('horizontal')}
                                                                style={{
                                                                    padding: '1rem',
                                                                    borderRadius: '12px',
                                                                    border: '2px solid',
                                                                    borderColor: videoOrientation === 'horizontal' ? '#b45309' : '#e5e7eb',
                                                                    background: videoOrientation === 'horizontal' ? '#fff' : '#f9fafb',
                                                                    color: videoOrientation === 'horizontal' ? '#b45309' : '#6b7280',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <div style={{ width: '32px', height: '20px', border: '2px solid currentColor', borderRadius: '4px', position: 'relative' }}>
                                                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', background: 'currentColor', borderRadius: '50%' }} />
                                                                </div>
                                                                Horizontal (16:9)
                                                            </button>
                                                        </div>
                                                        <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '12px', lineHeight: '1.4' }}>
                                                            Escolha a orientação correta do seu vídeo para garantir que ele seja exibido perfeitamente na página do evento.
                                                        </p>
                                                    </div>
                                                )}

                                                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '10px' }}>
                                                    💡 Vídeo vertical (9:16) recomendado para melhor visualização. Ideal para VSLs e Reels.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 800 }}>{t('events.formFields')}</h2>
                                            <button
                                                onClick={handleAddField}
                                                style={{ background: '#000', color: '#FFD700', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Plus size={16} /> {isMobile ? '' : t('events.addField')}
                                            </button>
                                        </div>

                                        <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '2rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ background: '#0ea5e9', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Sparkles size={18} />
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#0369a1', lineHeight: '1.4', margin: 0 }}>
                                                <strong>Ajuste seu formulário:</strong> Edite os campos que os alunos preencherão ao se inscrever.
                                            </p>
                                        </div>

                                        <div style={{ display: 'grid', gap: '1.2rem' }}>
                                            {fields.map((field) => (
                                                <div key={field._id || field.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '18px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                    {/* Header: Label + Trash */}
                                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <input
                                                                type="text"
                                                                value={field.label}
                                                                onChange={(e) => handleFieldChange(field._id || field.id, 'label', e.target.value)}
                                                                placeholder={t('events.fieldLabel')}
                                                                style={{ border: 'none', borderBottom: '2px solid #f8f9fa', padding: '8px 0', outline: 'none', fontSize: '1.1rem', width: '100%', fontWeight: 700 }}
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: field.required ? '#111' : '#ccc' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.required}
                                                                    onChange={(e) => handleFieldChange(field._id || field.id, 'required', e.target.checked)}
                                                                    style={{ width: '16px', height: '16px', accentColor: '#000' }}
                                                                /> {t('events.requiredField')}
                                                            </label>
                                                            <button
                                                                onClick={() => handleRemoveField(field._id || field.id)}
                                                                style={{ color: '#ef4444', background: '#fef2f2', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Type Selector Toggle */}
                                                    <div
                                                        onClick={() => setEditingTypeFieldId(editingTypeFieldId === (field._id || field.id) ? null : (field._id || field.id))}
                                                        style={{
                                                            background: editingTypeFieldId === (field._id || field.id) ? '#111' : '#f8f9fa',
                                                            padding: '12px 18px',
                                                            borderRadius: '12px',
                                                            border: '1px solid',
                                                            borderColor: editingTypeFieldId === (field._id || field.id) ? '#111' : '#eee',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ background: editingTypeFieldId === (field._id || field.id) ? 'rgba(255, 215, 0, 0.1)' : '#fff', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                                {(() => {
                                                                    const types = [
                                                                        { value: 'text', icon: FileText },
                                                                        { value: 'email', icon: Mail },
                                                                        { value: 'number', icon: Hash },
                                                                        { value: 'phone', icon: Phone },
                                                                        { value: 'select', icon: Menu },
                                                                        { value: 'checkbox', icon: CheckSquare },
                                                                        { value: 'date', icon: Calendar },
                                                                        { value: 'file', icon: Upload },
                                                                        { value: 'textarea', icon: AlignLeft }
                                                                    ];
                                                                    const current = types.find(t => t.value === field.type) || types[0];
                                                                    return <current.icon size={18} style={{ color: editingTypeFieldId === (field._id || field.id) ? '#FFD700' : '#111' }} />;
                                                                })()}
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: editingTypeFieldId === (field._id || field.id) ? '#888' : '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>
                                                                    Modificar Tipo
                                                                </p>
                                                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: editingTypeFieldId === (field._id || field.id) ? '#FFD700' : '#111', margin: 0 }}>
                                                                    {t(`events.type${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {editingTypeFieldId === (field._id || field.id) ? <ChevronUp size={20} style={{ color: '#FFD700' }} /> : <ChevronDown size={20} style={{ color: '#64748b' }} />}
                                                    </div>

                                                    {/* Expandable Type Picker */}
                                                    <AnimatePresence>
                                                        {editingTypeFieldId === (field._id || field.id) && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                style={{ overflow: 'hidden' }}
                                                            >
                                                                <div style={{ background: '#fafafa', padding: '15px', borderRadius: '15px', border: '1px solid #eee', marginTop: '10px' }}>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
                                                                        {[
                                                                            { value: 'text', icon: FileText, label: t('events.typeText'), desc: 'Texto curto' },
                                                                            { value: 'email', icon: Mail, label: t('events.typeEmail'), desc: 'E-mail válido' },
                                                                            { value: 'number', icon: Hash, label: t('events.typeNumber'), desc: 'Apenas números' },
                                                                            { value: 'phone', icon: Phone, label: t('events.typePhone'), desc: 'Telefone/WhatsApp' },
                                                                            { value: 'select', icon: Menu, label: t('events.typeSelect'), desc: 'Lista suspensa (Drop)' },
                                                                            { value: 'radio', icon: Circle, label: 'Escolha Única (Radio)', desc: 'Visualização em lista' },
                                                                            { value: 'checkbox', icon: CheckSquare, label: 'Múltipla Escolha', desc: 'Caixas de seleção' },
                                                                            { value: 'date', icon: Calendar, label: t('events.typeDate'), desc: 'Data do calendário' },
                                                                            { value: 'file', icon: Upload, label: t('events.typeFile'), desc: 'Anexo de arquivo' },
                                                                            { value: 'textarea', icon: AlignLeft, label: t('events.typeTextarea'), desc: 'Texto longo (parágrafo)' }
                                                                        ].map((type) => (
                                                                            <button
                                                                                key={type.value}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    handleFieldChange(field._id || field.id, 'type', type.value);
                                                                                    setEditingTypeFieldId(null);
                                                                                }}
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '12px',
                                                                                    padding: '10px',
                                                                                    borderRadius: '12px',
                                                                                    border: '2px solid',
                                                                                    borderColor: field.type === type.value ? '#111' : '#eee',
                                                                                    background: field.type === type.value ? '#111' : '#fff',
                                                                                    color: field.type === type.value ? '#FFD700' : '#64748b',
                                                                                    cursor: 'pointer',
                                                                                    textAlign: 'left',
                                                                                    transition: 'all 0.2s'
                                                                                }}
                                                                            >
                                                                                <div style={{
                                                                                    background: field.type === type.value ? 'rgba(255, 215, 0, 0.1)' : '#f8f9fa',
                                                                                    padding: '8px',
                                                                                    borderRadius: '8px',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center'
                                                                                }}>
                                                                                    <type.icon size={18} />
                                                                                </div>
                                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: field.type === type.value ? '#FFD700' : '#111' }}>{type.label}</span>
                                                                                    <span style={{ fontSize: '0.65rem', opacity: 0.8, color: field.type === type.value ? '#fff' : '#64748b' }}>{type.desc}</span>
                                                                                </div>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Row 3: Special Configs (Select, Radio, Checkbox) */}
                                                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                                                        <div style={{ background: '#fffbeb', padding: '1.2rem', borderRadius: '15px', border: '1px solid #fde68a', marginTop: '0.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                                                <div style={{ background: '#d97706', color: '#fff', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Layout size={14} />
                                                                </div>
                                                                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
                                                                    {field.type === 'select' ? 'Opções do Dropdown' : field.type === 'radio' ? 'Opções de Escolha Única' : 'Opções de Múltipla Escolha'}
                                                                </h4>
                                                            </div>
                                                            <p style={{ fontSize: '0.75rem', color: '#b45309', marginBottom: '1rem', opacity: 0.9 }}>
                                                                Configure as alternativas que aparecerão para o seu usuário.
                                                            </p>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                                                                {(field.options || []).map((opt: string, idx: number) => (
                                                                    <motion.div
                                                                        key={idx}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                                                    >
                                                                        {field.type === 'checkbox' ? (
                                                                            <Square size={18} color="#d97706" style={{ opacity: 0.5, flexShrink: 0 }} />
                                                                        ) : (
                                                                            <Circle size={18} color="#d97706" style={{ opacity: 0.5, flexShrink: 0 }} />
                                                                        )}
                                                                        <input
                                                                            type="text"
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const newOpts = [...(field.options || [])];
                                                                                newOpts[idx] = e.target.value;
                                                                                handleFieldChange(field._id || field.id, 'options', newOpts);
                                                                            }}
                                                                            placeholder={`Opção ${idx + 1}`}
                                                                            style={{
                                                                                flex: 1,
                                                                                padding: '8px 12px',
                                                                                background: 'transparent',
                                                                                border: 'none',
                                                                                borderBottom: '1px solid #fcd34d',
                                                                                fontSize: '0.85rem',
                                                                                color: '#92400e',
                                                                                outline: 'none',
                                                                                fontWeight: 600
                                                                            }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newOpts = (field.options || []).filter((_: any, i: number) => i !== idx);
                                                                                handleFieldChange(field._id || field.id, 'options', newOpts);
                                                                            }}
                                                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </motion.div>
                                                                ))}

                                                                {/* Google Forms Style "Add Option" field */}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                                                    {field.type === 'checkbox' ? (
                                                                        <Square size={18} color="#d97706" style={{ opacity: 0.3, flexShrink: 0 }} />
                                                                    ) : (
                                                                        <Circle size={18} color="#d97706" style={{ opacity: 0.3, flexShrink: 0 }} />
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newOpts = [...(field.options || []), `Opção ${(field.options?.length || 0) + 1}`];
                                                                            handleFieldChange(field._id || field.id, 'options', newOpts);
                                                                        }}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#d97706',
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: 700,
                                                                            cursor: 'pointer',
                                                                            padding: '8px 0',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '5px'
                                                                        }}
                                                                    >
                                                                        <Plus size={14} /> Adicionar Opção
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('events.customization')}</h2>
                                        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>Escolha um modelo pronto ou personalize as cores do seu evento.</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                                            <div style={{ display: 'grid', gap: '2rem' }}>
                                                {/* Presets Gallery */}
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '1rem', fontSize: '1rem', color: '#111' }}>
                                                        {t('events.backgroundTemplates')}
                                                    </label>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                        {[
                                                            { id: 'darkLuxury', name: t('events.presets.darkLuxury'), bg: '#050505', primary: '#FFD700', style: 'luxury' },
                                                            { id: 'royalGold', name: t('events.presets.royalGold'), bg: '#1a1a1a', primary: '#D4AF37', style: 'luxury' },
                                                            { id: 'modernWhite', name: t('events.presets.modernWhite'), bg: '#FFFFFF', primary: '#000000', style: 'minimalist' },
                                                            { id: 'oceanBlue', name: t('events.presets.oceanBlue'), bg: '#0f172a', primary: '#38bdf8', style: 'luxury' },
                                                            { id: 'aura-teal', name: '🌿 Teal Aura', bg: 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff', primary: '#0d9488', style: 'luxury' },
                                                            { id: 'aura-candy', name: '🍬 Candy', bg: 'radial-gradient(at 0% 0%, #fbcfe880 0%, transparent 50%), radial-gradient(at 100% 0%, #fef08a60 0%, transparent 50%), radial-gradient(at 50% 100%, #bfdbfe80 0%, transparent 50%), #fff', primary: '#db2777', style: 'luxury' },
                                                            { id: 'aura-sunset', name: '🌅 Peach', bg: 'radial-gradient(at 0% 0%, #ffedd5 0%, transparent 50%), radial-gradient(at 100% 100%, #fecdd3 0%, transparent 50%), #fff', primary: '#e11d48', style: 'luxury' },
                                                            { id: 'aura-nordic', name: '❄️ Nordic', bg: 'radial-gradient(at 0% 0%, #e0f2fe 0%, transparent 50%), radial-gradient(at 100% 0%, #f3e8ff 0%, transparent 50%), radial-gradient(at 50% 100%, #fefce8 0%, transparent 50%), #fff', primary: '#0ea5e9', style: 'luxury' },
                                                            { id: 'aura-rose', name: '🌸 Rose', bg: 'radial-gradient(at 0% 0%, #fff1f2 0%, transparent 50%), radial-gradient(at 100% 100%, #fecdd3 0%, transparent 50%), #fff', primary: '#f43f5e', style: 'luxury' },
                                                            { id: 'aura-sky', name: '☁️ Sky', bg: 'radial-gradient(at 0% 0%, #f0f9ff 0%, transparent 50%), radial-gradient(at 100% 100%, #e0f2fe 0%, transparent 50%), #fff', primary: '#0ea5e9', style: 'luxury' },
                                                            { id: 'aura-forest', name: '🌲 Forest', bg: 'radial-gradient(at 0% 0%, #f0fdf4 0%, transparent 50%), radial-gradient(at 100% 100%, #dcfce7 0%, transparent 50%), #fff', primary: '#16a34a', style: 'luxury' },
                                                            { id: 'aura-night', name: '🌃 Night', bg: 'radial-gradient(at 0% 0%, #1e1b4b 0%, transparent 50%), radial-gradient(at 100% 100%, #312e81 0%, transparent 50%), #0f172a', primary: '#818cf8', style: 'luxury' },
                                                            { id: 'royal', name: '👑 Royal', bg: 'linear-gradient(135deg, #0f172a 0%, #FFD700 100%)', primary: '#FFD700', style: 'luxury' },
                                                            { id: 'aurora', name: '✨ Aurora', bg: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', primary: '#000000', style: 'luxury' }
                                                        ].map((preset) => (
                                                            <motion.button
                                                                key={preset.id}
                                                                whileHover={{ y: -4 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => setTheme({
                                                                    ...theme,
                                                                    primaryColor: preset.primary,
                                                                    backgroundColor: preset.bg,
                                                                    style: preset.style as 'luxury' | 'minimalist',
                                                                    fontFamily: theme.fontFamily
                                                                })}
                                                                style={{
                                                                    background: preset.bg,
                                                                    border: theme.backgroundColor === preset.bg && theme.primaryColor === preset.primary ? `3px solid ${preset.primary}` : '1px solid #ddd',
                                                                    borderRadius: '16px',
                                                                    padding: '1.2rem',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'left',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    justifyContent: 'space-between',
                                                                    minHeight: '100px',
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                                                }}
                                                            >
                                                                <div style={{ color: preset.primary, fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{preset.name}</div>
                                                                <div style={{ width: '24px', height: '24px', background: preset.primary, borderRadius: '50%', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {theme.backgroundColor === preset.bg && theme.primaryColor === preset.primary && <Check size={14} color={['#FFD700', '#FFFFFF', '#4ade80', '#38bdf8'].includes(preset.primary) ? '#000' : '#fff'} />}
                                                                </div>
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Customization Section */}
                                                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #eee' }}>
                                                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '1.2rem', fontSize: '0.9rem', color: '#333' }}>
                                                        {t('events.customBackground')}
                                                    </label>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.8rem', color: '#666' }}>{t('events.primaryColor')}</label>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{ position: 'relative', width: '45px', height: '45px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                                    <input
                                                                        type="color"
                                                                        value={theme.primaryColor}
                                                                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                                                        style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', padding: 0, margin: 0, border: 'none', cursor: 'pointer' }}
                                                                    />
                                                                </div>
                                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: '#444', wordBreak: 'break-all', lineHeight: '1.2' }}>{theme.primaryColor.toUpperCase()}</span>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.8rem', color: '#666' }}>{t('events.backgroundColor')}</label>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                                <div style={{ position: 'relative', width: '45px', height: '45px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                                                                    <input
                                                                        type="color"
                                                                        value={theme.backgroundColor.startsWith('#') ? theme.backgroundColor : '#ffffff'}
                                                                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                                                                        style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', padding: 0, margin: 0, border: 'none', cursor: 'pointer' }}
                                                                    />
                                                                </div>
                                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: '#444', wordBreak: 'break-all', lineHeight: '1.2', flex: 1, minWidth: '100px' }}>{theme.backgroundColor.toUpperCase()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: '1.5rem' }}>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.8rem', color: '#666' }}>{t('events.visualStyle')}</label>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button
                                                                onClick={() => setTheme({ ...theme, style: 'luxury' })}
                                                                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: theme.style === 'luxury' ? '#111' : '#f4f4f4', color: theme.style === 'luxury' ? '#fff' : '#666', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                                            >
                                                                Premium (Luxury)
                                                            </button>
                                                            <button
                                                                onClick={() => setTheme({ ...theme, style: 'minimalist' })}
                                                                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: theme.style === 'minimalist' ? '#111' : '#f4f4f4', color: theme.style === 'minimalist' ? '#fff' : '#666', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                                            >
                                                                Simples (Minimalist)
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: '1.5rem' }}>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.8rem', color: '#666' }}>Alinhamento do Formulário (Página Pública)</label>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button
                                                                onClick={() => setTheme({ ...theme, formPosition: 'left' })}
                                                                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: theme.formPosition === 'left' ? '#111' : '#f4f4f4', color: theme.formPosition === 'left' ? '#fff' : '#666', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                            >
                                                                <AlignLeft size={16} /> À Esquerda
                                                            </button>
                                                            <button
                                                                onClick={() => setTheme({ ...theme, formPosition: 'right' })}
                                                                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: theme.formPosition === 'right' ? '#111' : '#f4f4f4', color: theme.formPosition === 'right' ? '#fff' : '#666', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                            >
                                                                <AlignRight size={16} /> À Direita (Padrão)
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Live Preview - Improved */}
                                            <div style={{ position: 'sticky', top: '2rem' }}>
                                                <label style={{ display: 'block', fontWeight: 800, marginBottom: '1rem', fontSize: '1rem', color: '#111' }}>
                                                    {t('events.preview')}
                                                </label>
                                                <div style={{
                                                    background: theme.backgroundColor,
                                                    borderRadius: '30px',
                                                    padding: '1.5rem 1rem',
                                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                                                    border: `1px solid ${theme.primaryColor}22`,
                                                    color: (theme.backgroundColor === '#000000' || theme.backgroundColor === '#050505' || theme.backgroundColor === '#1a1a1a') ? '#fff' : '#1a1a1a',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    minHeight: '320px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {theme.style === 'luxury' && (
                                                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent)', pointerEvents: 'none' }} />
                                                    )}

                                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                                        <div style={{
                                                            fontSize: '0.65rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '3px',
                                                            color: theme.primaryColor,
                                                            fontWeight: 900,
                                                            marginBottom: '1rem',
                                                            opacity: 0.8
                                                        }}>
                                                            EXCLUSIVO
                                                        </div>

                                                        <h3 style={{
                                                            fontSize: '1.6rem',
                                                            fontWeight: 900,
                                                            marginBottom: '1.5rem',
                                                            lineHeight: 1.1,
                                                            fontFamily: theme.fontFamily,
                                                            color: (theme.backgroundColor === '#000000' || theme.backgroundColor === '#050505' || theme.backgroundColor === '#1a1a1a') ? '#fff' : '#000'
                                                        }}>
                                                            {title || "Nome do Evento"}
                                                        </h3>

                                                        <div style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', fontSize: '0.85rem' }}>
                                                            <span style={{ opacity: 0.7 }}>📅 {eventDate ? new Date(eventDate).toLocaleDateString() : "Data"}</span>
                                                        </div>

                                                        <button style={{
                                                            width: '100%',
                                                            padding: '1.2rem',
                                                            borderRadius: '16px',
                                                            background: theme.primaryColor,
                                                            color: (['#FFD700', '#ffffff', '#e2e8f0', '#4ade80', '#38bdf8'].includes(theme.primaryColor.toUpperCase())) ? '#000' : '#fff',
                                                            border: 'none',
                                                            fontWeight: 900,
                                                            fontSize: '1rem',
                                                            boxShadow: `0 15px 30px ${theme.primaryColor}44`,
                                                            cursor: 'default'
                                                        }}>
                                                            {t('events.registerNow')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>{t('events.paymentConfig')}</h2>

                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            {userPlan === 'free' && !isAdmin ? (
                                                <FeaturePaywall
                                                    title="Evento Pago"
                                                    description="Transforme o seu conhecimento em lucro. Desbloqueie a funcionalidade de eventos pagos para aceitar pagamentos via Cartão, M-Pesa e muito mais."
                                                    onUpgrade={onUpgradeClick || (() => { })}
                                                />
                                            ) : (
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600, background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={paymentConfig.enabled}
                                                        onChange={(e) => setPaymentConfig({ ...paymentConfig, enabled: e.target.checked })}
                                                        style={{ width: '20px', height: '20px' }}
                                                    />
                                                    {t('events.isPaidEvent')}
                                                </label>
                                            )}

                                            {paymentConfig.enabled && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'grid', gap: '1.5rem', overflow: 'hidden' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.ticketPrice')}</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={paymentConfig.price}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value);
                                                                    setPaymentConfig({ ...paymentConfig, price: isNaN(val) ? 0 : val });
                                                                }}
                                                                placeholder={t('events.pricePlaceholder')}
                                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.currency')}</label>
                                                            <select
                                                                value={paymentConfig.currency}
                                                                onChange={(e) => setPaymentConfig({ ...paymentConfig, currency: e.target.value })}
                                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', background: '#fff' }}
                                                            >
                                                                <option value="USD">{t('events.dollar')}</option>
                                                                <option value="EUR">{t('events.euro')}</option>
                                                                <option value="MT">{t('events.metical')}</option>
                                                                <option value="AOA">{t('events.kwanza')}</option>
                                                                <option value="CVE">{t('events.escudo')}</option>
                                                                <option value="XOF">{t('events.cfa')}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '15px', border: '1px solid #e2e8f0', opacity: 0.7, cursor: 'not-allowed', position: 'relative' }}>
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '12px',
                                                            right: '12px',
                                                            background: '#e2e8f0',
                                                            color: '#475569',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Em Breve
                                                        </div>

                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 700, color: '#64748b', cursor: 'not-allowed', marginBottom: '1rem' }}>
                                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={false}
                                                                    disabled={true}
                                                                    style={{ width: '20px', height: '20px', cursor: 'not-allowed' }}
                                                                />
                                                                <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#fff', borderRadius: '50%', padding: '2px' }}>
                                                                    <Shield size={12} color="#64748b" />
                                                                </div>
                                                            </div>
                                                            Habilitar Pagamento com Cartão (Stripe)
                                                        </label>

                                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                                            <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                                    Esta funcionalidade está a ser preparada para garantir total segurança nos seus pagamentos globais.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.manualPaymentHeader')}</label>
                                                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>{t('events.paymentMethodsHelp')}</p>

                                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                                            {/* Bank Account */}
                                                            <div style={{ padding: '1.2rem', background: '#fff', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '1rem', fontSize: '0.85rem', color: '#1a1a1b' }}>
                                                                    <Database size={16} className="gold-text" /> {t('events.bankAccount')}
                                                                </label>
                                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                                    <input
                                                                        type="text"
                                                                        value={paymentConfig.accountHolder || ''}
                                                                        onChange={(e) => setPaymentConfig({ ...paymentConfig, accountHolder: e.target.value })}
                                                                        placeholder={t('events.accountHolderPlaceholder')}
                                                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem' }}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={paymentConfig.bankAccount || ''}
                                                                        onChange={(e) => setPaymentConfig({ ...paymentConfig, bankAccount: e.target.value })}
                                                                        placeholder={t('events.bankAccountPlaceholder')}
                                                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem' }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Dynamic Manual Methods (Global Support) */}
                                                            <div style={{ padding: '1.2rem', background: '#fff', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.85rem', color: '#1a1a1b' }}>
                                                                        <Coins size={16} className="gold-text" /> Pagamentos Customizados
                                                                    </label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPaymentConfig({
                                                                            ...paymentConfig,
                                                                            manualMethods: [...(paymentConfig.manualMethods || []), { label: '', value: '', icon: 'phone' }]
                                                                        })}
                                                                        style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '20px', background: '#111', color: '#FFD700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                    >
                                                                        <Plus size={12} /> Adicionar Método
                                                                    </button>
                                                                </div>

                                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                                    {paymentConfig.manualMethods?.length === 0 && (
                                                                        <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', fontStyle: 'italic', padding: '1rem' }}>
                                                                            Nenhum método personalizado. Ex: M-Pesa, MTN, PayPal Manual, etc.
                                                                        </p>
                                                                    )}

                                                                    {paymentConfig.manualMethods?.map((method, idx) => (
                                                                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#f9f9f9', padding: '10px', borderRadius: '12px' }}>
                                                                            <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Nome (Ex: M-Pesa, Orange Money)"
                                                                                    value={method.label}
                                                                                    onChange={(e) => {
                                                                                        const newMethods = [...paymentConfig.manualMethods];
                                                                                        newMethods[idx].label = e.target.value;
                                                                                        setPaymentConfig({ ...paymentConfig, manualMethods: newMethods });
                                                                                    }}
                                                                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Número ou Identificador"
                                                                                    value={method.value}
                                                                                    onChange={(e) => {
                                                                                        const newMethods = [...paymentConfig.manualMethods];
                                                                                        newMethods[idx].value = e.target.value;
                                                                                        setPaymentConfig({ ...paymentConfig, manualMethods: newMethods });
                                                                                    }}
                                                                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                                                                />
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newMethods = paymentConfig.manualMethods.filter((_, i) => i !== idx);
                                                                                    setPaymentConfig({ ...paymentConfig, manualMethods: newMethods });
                                                                                }}
                                                                                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                                                            >
                                                                                <Minus size={14} />
                                                                            </button>
                                                                        </div>
                                                                    ))}

                                                                    {/* Backward Compatibility Checkbox / Simple Fields if needed */}
                                                                    {(paymentConfig.mpesaNumber || paymentConfig.emolaNumber) && (
                                                                        <div style={{ padding: '10px', border: '1px dashed #FFD700', borderRadius: '12px', background: '#fffef0' }}>
                                                                            <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600, marginBottom: '8px' }}>MÉTODOS LEGADOS (MOÇAMBIQUE):</p>
                                                                            {paymentConfig.mpesaNumber && <div style={{ fontSize: '0.8rem' }}><strong>M-Pesa:</strong> {paymentConfig.mpesaNumber}</div>}
                                                                            {paymentConfig.emolaNumber && <div style={{ fontSize: '0.8rem' }}><strong>e-Mola:</strong> {paymentConfig.emolaNumber}</div>}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newMethods = [...(paymentConfig.manualMethods || [])];
                                                                                    if (paymentConfig.mpesaNumber) newMethods.push({ label: 'M-Pesa', value: paymentConfig.mpesaNumber, icon: 'phone' });
                                                                                    if (paymentConfig.emolaNumber) newMethods.push({ label: 'e-Mola', value: paymentConfig.emolaNumber, icon: 'phone' });
                                                                                    setPaymentConfig({
                                                                                        ...paymentConfig,
                                                                                        manualMethods: newMethods,
                                                                                        mpesaNumber: '',
                                                                                        emolaNumber: ''
                                                                                    });
                                                                                }}
                                                                                style={{ marginTop: '10px', fontSize: '0.7rem', color: '#B8860B', background: 'none', border: '1px solid #B8860B', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                                            >
                                                                                Migrar para Novo Sistema
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.paymentInstructions')}</label>
                                                        <textarea
                                                            value={paymentConfig.instructions}
                                                            onChange={(e) => setPaymentConfig({ ...paymentConfig, instructions: e.target.value })}
                                                            rows={4}
                                                            placeholder={t('events.instructionsPlaceholder')}
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', resize: 'none' }}
                                                        />
                                                    </div>

                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600, padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={paymentConfig.requireProof}
                                                            onChange={(e) => setPaymentConfig({ ...paymentConfig, requireProof: e.target.checked })}
                                                            style={{ width: '18px', height: '18px' }}
                                                        />
                                                        {t('events.requireProof')}
                                                    </label>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 5 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>{t('events.whatsappConclusion')}</h2>

                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            <div style={{ background: '#e6fffa', padding: '1.5rem', borderRadius: '20px', border: '1px solid #b2f5ea', display: 'flex', gap: '1rem' }}>
                                                <div style={{ color: '#319795' }}><CheckCircle size={24} /></div>
                                                <p style={{ color: '#2c7a7b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                    {t('events.whatsappHelp')}
                                                </p>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.whatsappNumber')}</label>
                                                <input
                                                    type="text"
                                                    value={whatsappConfig.phoneNumber}
                                                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumber: e.target.value })}
                                                    placeholder={t('events.whatsappNumberPlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.whatsappMessage')}</label>
                                                <textarea
                                                    value={whatsappConfig.message}
                                                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, message: e.target.value })}
                                                    rows={3}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', resize: 'none' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Link da Comunidade (WhatsApp)</label>
                                                <input
                                                    type="text"
                                                    value={whatsappConfig.communityUrl}
                                                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, communityUrl: e.target.value })}
                                                    placeholder="Ex: https://chat.whatsapp.com/..."
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 6 && (
                                    <motion.div key="step6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Megaphone color="#FFD700" /> Marketing Social AI
                                        </h2>
                                        <p style={{ color: '#666', marginBottom: '2rem' }}>Deixe a Aura criar o post perfeito para divulgar seu evento.</p>

                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            <>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Escolha a Plataforma</label>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        {['instagram', 'linkedin', 'whatsapp'].map(p => (
                                                            <button
                                                                key={p}
                                                                type="button"
                                                                onClick={() => setMarketingPlatform(p)}
                                                                style={{
                                                                    padding: '10px 20px',
                                                                    borderRadius: '12px',
                                                                    border: '1px solid',
                                                                    borderColor: marketingPlatform === p ? '#FFD700' : '#ddd',
                                                                    background: marketingPlatform === p ? '#FFD700' : '#fff',
                                                                    color: marketingPlatform === p ? '#000' : '#666',
                                                                    fontWeight: 700,
                                                                    textTransform: 'capitalize',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    flex: 1
                                                                }}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleMarketingGenerate}
                                                    disabled={marketingLoading}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                                                        color: '#FFD700',
                                                        border: 'none',
                                                        padding: '1rem',
                                                        borderRadius: '15px',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '10px',
                                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    {marketingLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                                                    GERAR POST COM AURA
                                                </button>

                                                {marketingContent && (
                                                    <div style={{ position: 'relative' }}>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Resultado Gerado</label>
                                                        <textarea
                                                            value={marketingContent}
                                                            onChange={(e) => setMarketingContent(e.target.value)}
                                                            rows={10}
                                                            style={{ width: '100%', padding: '1.5rem', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', resize: 'none', background: '#f8f9fa', lineHeight: '1.6' }}
                                                        />
                                                        <button
                                                            onClick={copyToClipboard}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '35px',
                                                                right: '10px',
                                                                background: copied ? '#48bb78' : '#fff',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '8px',
                                                                padding: '8px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600,
                                                                color: copied ? '#fff' : '#333',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {form.active ? <Globe size={16} /> : <EyeOff size={16} />}
                                                            {copied ? 'Copiado!' : 'Copiar'}
                                                        </button>
                                                    </div>
                                                )}
                                            </>

                                        </div>
                                    </motion.div>
                                )}

                                {step === 7 && (
                                    <motion.div key="step7" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Personalização do Hub</h2>

                                        <div style={{ display: 'grid', gap: '2rem' }}>
                                            <>
                                                {/* Imagem de Fundo do Hub */}
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        🖼️ Imagem de Fundo do Hub
                                                    </label>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '150px',
                                                        background: hubBackgroundImage ? `url(${hubBackgroundImage}) center / cover` : '#eee',
                                                        borderRadius: '20px',
                                                        border: '2px dashed #ccc',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <input type="file" onChange={handleHubBackgroundUpload} accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                                        {uploadingHubBackground ? <Loader2 className="animate-spin" size={32} color="#111" /> : (
                                                            !hubBackgroundImage && (
                                                                <>
                                                                    <ImageIcon size={32} color="#aaa" />
                                                                    <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px' }}>Clique para carregar imagem</span>
                                                                </>
                                                            )
                                                        )}
                                                        {hubBackgroundImage && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setHubBackgroundImage(''); }}
                                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>
                                                        Substitui o fundo padrão do Hub. Recomendado: 1920x1080px (Escuro).
                                                    </p>
                                                </div>

                                                {/* Configuração do Botão Transmissão */}
                                                <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '20px', border: '1px solid #eee' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem' }}>
                                                                🔴 Botão "Assistir Transmissão"
                                                            </label>
                                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>Personalize o botão de chamada para ação do Hub</span>
                                                        </div>
                                                        <div
                                                            onClick={() => setShowHubButton(!showHubButton)}
                                                            style={{
                                                                width: '50px',
                                                                height: '26px',
                                                                background: showHubButton ? '#111' : '#ccc',
                                                                borderRadius: '100px',
                                                                cursor: 'pointer',
                                                                position: 'relative',
                                                                transition: '0.3s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                background: '#fff',
                                                                borderRadius: '50%',
                                                                position: 'absolute',
                                                                top: '3px',
                                                                left: showHubButton ? '27px' : '3px',
                                                                transition: '0.3s'
                                                            }} />
                                                        </div>
                                                    </div>

                                                    {showHubButton && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Cor do Botão</label>
                                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                                        <input
                                                                            type="color"
                                                                            value={hubButtonColor}
                                                                            onChange={(e) => setHubButtonColor(e.target.value)}
                                                                            style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={hubButtonColor}
                                                                            onChange={(e) => setHubButtonColor(e.target.value)}
                                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    width: '120px',
                                                                    height: '60px',
                                                                    background: hubButtonColor,
                                                                    borderRadius: '12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: '#000',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem',
                                                                    textTransform: 'uppercase',
                                                                    textAlign: 'center',
                                                                    padding: '5px',
                                                                    boxShadow: `0 4px 12px ${hubButtonColor}40`
                                                                }}>
                                                                    Preview
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Mensagem de Boas-Vindas */}
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        💬 Mensagem de Boas-Vindas
                                                    </label>

                                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setWelcomeMessage(t('events.welcomeTemplates.formalText'))}
                                                            style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                                        >
                                                            {t('events.welcomeTemplates.formal')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setWelcomeMessage(t('events.welcomeTemplates.excitedText'))}
                                                            style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                                        >
                                                            {t('events.welcomeTemplates.excited')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setWelcomeMessage(t('events.welcomeTemplates.briefText'))}
                                                            style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                                        >
                                                            {t('events.welcomeTemplates.brief')}
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={welcomeMessage}
                                                        onChange={(e) => setWelcomeMessage(e.target.value)}
                                                        rows={3}
                                                        placeholder="Escreva uma mensagem especial para seus participantes..."
                                                        style={{
                                                            width: '100%',
                                                            padding: '1rem',
                                                            borderRadius: '12px',
                                                            border: '1px solid #ddd',
                                                            outline: 'none',
                                                            resize: 'none'
                                                        }}
                                                    />
                                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>
                                                        Aparecerá em destaque no Hub com gradiente roxo
                                                    </p>
                                                </div>

                                                {/* Vídeo de Boas-Vindas */}
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        🎥 Vídeo de Boas-Vindas
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={welcomeVideo}
                                                        onChange={(e) => setWelcomeVideo(e.target.value)}
                                                        placeholder="https://youtube.com/watch?v=..."
                                                        style={{
                                                            width: '100%',
                                                            padding: '1rem',
                                                            borderRadius: '12px',
                                                            border: '1px solid #ddd',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>
                                                        Cole o link do YouTube, Vimeo ou qualquer vídeo embeddable
                                                    </p>
                                                </div>

                                                {/* Campos Customizados */}
                                                <CustomFieldsEditor
                                                    fields={customFields}
                                                    onChange={setCustomFields}
                                                />

                                                {/* Agenda */}
                                                <AgendaEditor
                                                    agenda={agenda}
                                                    onChange={setAgenda}
                                                />

                                                {/* Materiais */}
                                                <MaterialsEditor
                                                    materials={materials}
                                                    onChange={setMaterials}
                                                />
                                            </>

                                        </div>
                                    </motion.div>
                                )}

                                {step === 8 && (
                                    <motion.div key="step8" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Configuração de Certificados</h2>
                                        {userPlan === 'free' && !isAdmin ? (
                                            <FeaturePaywall
                                                title="Certificados Automatizados"
                                                description="Emita certificados personalizados automaticamente para todos os seus participantes com apenas um clique."
                                                onUpgrade={onUpgradeClick || (() => { })}
                                            />
                                        ) : (
                                            <CertificateEditor
                                                config={certificateConfig}
                                                onChange={setCertificateConfig}
                                                mentorName={form.creator.name}
                                                logo={logo}
                                            />
                                        )}
                                    </motion.div>
                                )}

                                {step === 9 && (
                                    <motion.div key="step9" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Aulas do Evento</h2>
                                        <p style={{ color: '#666', marginBottom: '2rem' }}>Selecione quais aulas da sua biblioteca estarão disponíveis no Hub deste evento.</p>

                                        {userPlan === 'free' && !isAdmin ? (
                                            <FeaturePaywall
                                                title="Conteúdo e Aulas"
                                                description="Hospede as suas aulas e conteúdos exclusivos diretamente no Hub do evento para os seus alunos assistirem quando quiserem."
                                                onUpgrade={onUpgradeClick || (() => { })}
                                            />
                                        ) : (
                                            lessonsLoading ? (
                                                <div style={{ padding: '3rem', textAlign: 'center' }}>
                                                    <Loader2 className="animate-spin" size={40} color="#FFD700" />
                                                    <p style={{ marginTop: '1rem', color: '#666' }}>Carregando suas aulas...</p>
                                                </div>
                                            ) : allLessons.length === 0 ? (
                                                <div style={{ padding: '3rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '20px', border: '1px dashed #ddd' }}>
                                                    <BookOpen size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                                                    <p style={{ fontWeight: 600, color: '#333' }}>Nenhuma aula encontrada</p>
                                                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>Você precisa criar aulas na seção "Aulas" do seu painel antes de associá-las a um evento.</p>
                                                    <a
                                                        href="/dashboard/mentor?tab=lessons"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            marginTop: '1rem',
                                                            padding: '0.75rem 1.5rem',
                                                            borderRadius: '12px',
                                                            background: '#111',
                                                            color: '#FFD700',
                                                            textDecoration: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        Criar Nova Aula <ExternalLink size={16} />
                                                    </a>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    {allLessons.map((lesson) => (
                                                        <div
                                                            key={lesson._id}
                                                            onClick={() => toggleLessonSelection(lesson._id)}
                                                            style={{
                                                                padding: '1.25rem',
                                                                borderRadius: '16px',
                                                                border: '2px solid',
                                                                borderColor: selectedLessons.includes(lesson._id) ? '#FFD700' : '#eee',
                                                                background: selectedLessons.includes(lesson._id) ? '#FFD70005' : '#fff',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '15px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '6px',
                                                                border: '2px solid',
                                                                borderColor: selectedLessons.includes(lesson._id) ? '#FFD700' : '#ddd',
                                                                background: selectedLessons.includes(lesson._id) ? '#FFD700' : 'transparent',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#fff'
                                                            }}>
                                                                {selectedLessons.includes(lesson._id) && <Check size={16} strokeWidth={4} />}
                                                            </div>

                                                            <div style={{
                                                                width: '60px',
                                                                height: '40px',
                                                                borderRadius: '8px',
                                                                background: '#eee',
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                flexShrink: 0
                                                            }}>
                                                                {lesson.thumbnailUrl ? (
                                                                    <Image src={lesson.thumbnailUrl} alt={lesson.title} fill style={{ objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
                                                                        <Play size={16} color="#fff" fill="#fff" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div style={{ flex: 1 }}>
                                                                <h4 style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>{lesson.title}</h4>
                                                                <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>{lesson.category}</span>
                                                            </div>

                                                            {!lesson.isPublished && (
                                                                <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', background: '#fffbeb', color: '#b45309', fontWeight: 600 }}>Rascunho</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </motion.div>
                                )}
                                {step === 10 && (
                                    <motion.div key="step10" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        {userPlan === 'free' && !isAdmin ? (
                                            <FeaturePaywall
                                                title="Equipa e Parceiros"
                                                description="Adicione co-organizadores, parceiros e palestrantes ao seu evento. Cada um terá o seu perfil em destaque na página do evento."
                                                onUpgrade={onUpgradeClick || (() => { })}
                                            />
                                        ) : (
                                            <PartnersEditor
                                                partners={partners}
                                                onChange={setPartners}
                                            />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div >

                        {/* Footer Actions */}
                        <div style={{
                            padding: isMobile ? '1rem 1.5rem' : '1.5rem 3rem',
                            background: '#fff',
                            borderTop: '2px solid #FFD700',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
                            zIndex: 20,
                            flexShrink: 0
                        }}>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    borderRadius: '12px',
                                    padding: '0.8rem 3rem',
                                    minWidth: isMobile ? '100%' : '220px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    background: '#111',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {t('events.profile.saveChanges')}</>}
                            </button>
                        </div>
                    </div >
                    {/* PREVIEW MODAL OVERLAY - Enhanced version */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ position: 'fixed', inset: 0, zIndex: 3100, background: 'rgba(0,0,0,0.85)', padding: isMobile ? '0' : '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{
                                        width: '100%',
                                        maxWidth: '1000px',
                                        height: isMobile ? '100vh' : '90vh',
                                        background: theme.backgroundColor || '#fff',
                                        borderRadius: isMobile ? '0' : '24px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                        border: `1px solid ${theme.primaryColor}33`
                                    }}
                                >
                                    <div style={{ padding: '1.2rem 1.5rem', borderBottom: `1px solid ${theme.primaryColor}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: theme.primaryColor, fontWeight: 700 }}>
                                            <Eye size={20} /> {t('preview.title') || 'Pré-visualização do Evento'}
                                        </h3>
                                        <button onClick={() => setShowPreview(false)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}><X size={20} /></button>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto', color: theme.style === 'luxury' && (theme.backgroundColor === '#050505' || theme.backgroundColor === '#000000') ? '#fff' : '#1a202c', position: 'relative' }}>
                                        {/* Logo Preview */}
                                        {logo && (
                                            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                                                <Image src={logo} alt="Logo" width={100} height={35} style={{ objectFit: 'contain' }} />
                                            </div>
                                        )}

                                        {/* Cover Image */}
                                        {coverImage ? (
                                            <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                                                <Image src={coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))' }} />
                                            </div>
                                        ) : (
                                            <div style={{ width: '100%', height: '100px', background: theme.primaryColor + '11' }} />
                                        )}

                                        <div style={{ maxWidth: '850px', margin: '0 auto', padding: '3rem 2rem', marginTop: coverImage ? '-60px' : '0', position: 'relative', zIndex: 2 }}>
                                            <div style={{ background: theme.backgroundColor, padding: '2.5rem', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: `1px solid ${theme.primaryColor}22` }}>
                                                <h1 style={{ fontSize: isMobile ? '2.2rem' : '3rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, color: theme.primaryColor, fontFamily: theme.fontFamily }}>
                                                    {title || 'Título do seu evento incrível'}
                                                </h1>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem', opacity: 0.9, fontSize: '1rem', fontWeight: 600 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📅 {eventDate ? new Date(eventDate).toLocaleDateString() : 'Data a definir'}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📍 {location || (onlineLink ? 'Online' : 'Local a definir')}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.primaryColor }}>
                                                        💰 {paymentConfig.enabled ? `${paymentConfig.currency} ${paymentConfig.price}` : 'Gratuito'}
                                                    </span>
                                                </div>

                                                {/* Video Preview */}
                                                {videoUrl && (
                                                    <div style={{ marginBottom: '3rem', borderRadius: '24px', overflow: 'hidden', border: `1px solid ${theme.primaryColor}44`, aspectRatio: videoOrientation === 'vertical' ? '9/16' : '16/9', maxHeight: '500px', margin: '0 auto 3rem', background: '#000' }}>
                                                        <video src={videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                )}

                                                <div style={{ lineHeight: 1.8, fontSize: '1.15rem', opacity: 0.95, whiteSpace: 'pre-line', marginBottom: '4rem' }}>
                                                    {description || 'A descrição do seu evento aparecerá aqui detalhando tudo o que seus participantes precisam saber...'}
                                                </div>

                                                {/* Form Fields Preview Section */}
                                                <div style={{ borderTop: `1px solid ${theme.primaryColor}22`, paddingTop: '3rem' }}>
                                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <FileText size={24} color={theme.primaryColor} /> {t('preview.registrationTitle') || 'Faça sua Inscrição'}
                                                    </h3>

                                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                        {fields.map((field, idx) => (
                                                            <div key={idx}>
                                                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem', opacity: 0.8 }}>
                                                                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                                                                </label>
                                                                <div style={{
                                                                    width: '100%',
                                                                    padding: '1.2rem',
                                                                    borderRadius: '16px',
                                                                    background: theme.style === 'luxury' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                                                    border: `1px solid ${theme.primaryColor}33`,
                                                                    color: '#888',
                                                                    fontSize: '0.95rem'
                                                                }}>
                                                                    {field.type === 'date' ? '00/00/0000' : field.type === 'select' ? 'Selecione uma opção...' : `Digite seu ${field.label.toLowerCase()}...`}
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* WhatsApp Trigger Preview */}
                                                        {(whatsappConfig.phoneNumber || whatsappConfig.communityUrl) && (
                                                            <div style={{ marginTop: '1rem', padding: '1.5rem', borderRadius: '20px', background: 'rgba(37, 211, 102, 0.05)', border: '1px solid rgba(37, 211, 102, 0.2)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                                <div style={{ width: '45px', height: '45px', background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                                    <MessageCircle size={24} />
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Botão do WhatsApp Ativo</div>
                                                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Os participantes poderão te contactar via WhatsApp.</div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <button
                                                            disabled
                                                            style={{
                                                                marginTop: '1.5rem',
                                                                width: '100%',
                                                                padding: '1.5rem',
                                                                borderRadius: '20px',
                                                                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}dd)`,
                                                                color: '#000',
                                                                fontWeight: 900,
                                                                fontSize: '1.1rem',
                                                                border: 'none',
                                                                opacity: 0.8,
                                                                boxShadow: `0 10px 30px ${theme.primaryColor}33`
                                                            }}
                                                        >
                                                            {paymentConfig.enabled ? 'PAGAR E INSCREVER' : 'CONFIRMAR INSCRIÇÃO'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.5, fontSize: '0.8rem' }}>
                                                © {new Date().getFullYear()} Inscreva.se - Todos os direitos reservados
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div >
            </div >
        </AnimatePresence >
    );

    if (typeof window === 'undefined') return null;
    return createPortal(modalContent, document.body);
}
