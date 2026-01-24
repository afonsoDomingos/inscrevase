/* eslint-disable */
"use client";
// Force refresh

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, MessageCircle, Save, Loader2, Info, Layout, CheckCircle, Palette, DollarSign, Wand2, Megaphone, Copy, Check, Sparkles, Award, Video, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { formService, FormModel } from '@/lib/formService';
import { aiService } from '@/lib/aiService';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import CustomFieldsEditor from './CustomFieldsEditor';
import AgendaEditor from './AgendaEditor';
import MaterialsEditor from './MaterialsEditor';
import CertificateEditor from './CertificateEditor';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    form: FormModel;
}

export default function EditEventModal({ isOpen, onClose, onSuccess, form }: EditEventModalProps) {
    const { t, locale } = useTranslate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

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

    const handleAiGenerate = async () => {
        if (!title.trim()) {
            toast.error(t('ai.promptOrient'));
            return;
        }

        setAiLoading(true);
        try {
            const prompt = `Crie uma descrição sofisticada, luxuosa e persuasiva para um evento chamado "${title}". Foque nos benefícios exclusivos para os participantes e use um tom de elite.`;
            const data = await aiService.chat(prompt, locale);
            setDescription(data.reply);
            toast.success(t('ai.toastSuccess'));
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || t('ai.toastError'));
        } finally {
            setAiLoading(false);
        }
    };

    // Theme State
    const [theme, setTheme] = useState({
        primaryColor: '#FFD700',
        style: 'luxury',
        backgroundColor: '#050505',
        fontFamily: 'Inter'
    });

    // Aura AI State
    const [showAiOptions, setShowAiOptions] = useState(false);
    const handleAiGenerateWithTone = async (tone: string) => {
        if (!title.trim()) { toast.error(t('ai.promptOrient')); return; }
        setAiLoading(true);
        try {
            const prompt = `Crie uma descrição para um evento chamado "${title}" com um tom ${tone}. Aja como um copywriter expert, focando em conversão e exclusividade.`;
            const data = await aiService.chat(prompt, locale);
            setDescription(data.reply);
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
    const [coverImage, setCoverImage] = useState<string>('');
    const [coverImageMode, setCoverImageMode] = useState<'full' | 'banner'>('full');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [location, setLocation] = useState('');
    const [onlineLink, setOnlineLink] = useState('');
    const [waitingVideo, setWaitingVideo] = useState('');
    const [showVideoOnStart, setShowVideoOnStart] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [fields, setFields] = useState<any[]>([]);

    const [whatsappConfig, setWhatsappConfig] = useState({
        phoneNumber: '',
        message: 'Olá! Gostaria de confirmar minha inscrição.',
        communityUrl: ''
    });

    const [paymentConfig, setPaymentConfig] = useState({
        enabled: false,
        price: 0,
        currency: 'MT',
        mpesaNumber: '',
        emolaNumber: '',
        bankAccount: '',
        accountHolder: '',
        instructions: '',
        requireProof: false,
        stripeEnabled: false,
        stripePriceId: '',
        stripeProductId: ''
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
    const [certificateConfig, setCertificateConfig] = useState({
        enabled: false,
        template: 'classic',
        primaryColor: '#D4AF37',
        title: 'CERTIFICADO',
        subtitle: 'DE CONCLUSÃO',
        description: 'concluiu com êxito a participação no evento:',
        signerName: '',
        signerRole: 'Mentor Responsável',
        requireCheckIn: false
    });

    useEffect(() => {
        if (form) {
            setTitle(form.title || '');
            setDescription(form.description || '');
            setEventDate(form.eventDate ? new Date(form.eventDate).toISOString().substring(0, 10) : '');
            setEventTime(form.eventTime || '');
            setEventType(form.eventType || 'modeOnline');
            setCategory(form.category || 'Outros');
            setCapacity(form.capacity ? form.capacity.toString() : '');
            setCoverImage(form.coverImage || '');
            setCoverImageMode((form as any).coverImageMode || 'full');
            setLocation(form.location || '');
            setOnlineLink(form.onlineLink || '');
            setWaitingVideo((form as any).waitingVideo || '');
            setShowVideoOnStart((form as any).showVideoOnStart || false);
            setVideoUrl((form as any).videoUrl || '');
            setFields(form.fields || []);
            if (form.whatsappConfig) {
                setWhatsappConfig({
                    phoneNumber: form.whatsappConfig.phoneNumber || '',
                    message: form.whatsappConfig.message || 'Olá! Gostaria de confirmar minha inscrição.',
                    communityUrl: form.whatsappConfig.communityUrl || ''
                });
            }
            if (form.certificateConfig) {
                setCertificateConfig({
                    enabled: form.certificateConfig.enabled || false,
                    template: form.certificateConfig.template || 'classic',
                    primaryColor: form.certificateConfig.primaryColor || '#D4AF37',
                    title: form.certificateConfig.title || 'CERTIFICADO',
                    subtitle: form.certificateConfig.subtitle || 'DE CONCLUSÃO',
                    description: form.certificateConfig.description || 'concluiu com êxito a participação no evento:',
                    signerName: form.certificateConfig.signerName || '',
                    signerRole: form.certificateConfig.signerRole || 'Mentor Responsável',
                    requireCheckIn: form.certificateConfig.requireCheckIn || false
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
                    stripeProductId: form.paymentConfig?.stripeProductId || ''
                });
            }
            if (form.theme) {
                setTheme({
                    primaryColor: form.theme.primaryColor || '#FFD700',
                    style: form.theme.style || 'luxury',
                    backgroundColor: form.theme.backgroundColor || '#050505',
                    fontFamily: form.theme.fontFamily || 'Inter'
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
            } catch (err: unknown) {
                console.error(err);
                alert(t('events.profile.uploadError'));
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 100 * 1024 * 1024) {
                toast.error('O vídeo deve ter no máximo 100MB');
                return;
            }
            setUploadingVideo(true);
            try {
                const url = await formService.uploadFile(file, 'videos');
                setVideoUrl(url);
                toast.success('Vídeo carregado com sucesso!');
            } catch (err: unknown) {
                console.error(err);
                toast.error('Erro ao carregar o vídeo');
            } finally {
                setUploadingVideo(false);
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
                toast.error('Erro ao carregar imagem de fundo');
            } finally {
                setUploadingHubBackground(false);
            }
        }
    };

    const handleSubmit = async () => {
        if (!title || !description) {
            alert(t('events.fillTitleDescAlert'));
            setStep(1);
            return;
        }

        // Validate Fields
        const hasEmptyFields = fields.some(f => !f.label.trim());
        if (hasEmptyFields) {
            alert(t('events.emptyFieldsAlert'));
            setStep(2);
            return;
        }

        // Clean up fields (remove temporary id for existing fields or rename if needed)
        const cleanedFields = fields.map(f => {
            const { id, ...rest } = f;
            return rest;
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
                active: form.active
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || t('common.updateStatusError'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="edit-event-modal"
                >
                    {/* Sidebar */}
                    <div className="edit-event-sidebar custom-scrollbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', color: '#FFD700' }}>
                            <Layout size={24} />
                            <span className="btn-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>{t('events.editEvent')}</span>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {[
                                { id: 1, label: t('events.steps.info'), icon: <Info size={18} /> },
                                { id: 2, label: t('events.steps.form'), icon: <Plus size={18} /> },
                                { id: 3, label: t('events.steps.design'), icon: <Palette size={18} /> },
                                { id: 4, label: t('events.steps.payment'), icon: <DollarSign size={18} /> },
                                { id: 5, label: t('events.steps.communication'), icon: <MessageCircle size={18} /> },
                                { id: 6, label: 'Marketing AI', icon: <Megaphone size={18} /> },
                                { id: 7, label: 'Hub Personalizado', icon: <Sparkles size={18} /> },
                                { id: 8, label: 'Certificados', icon: <Award size={18} /> },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(s.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: step === s.id ? '#FFD70015' : 'transparent',
                                        color: step === s.id ? '#FFD700' : '#666',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {s.icon}
                                    <span className="btn-text">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Wrapper */}
                    <div className="edit-event-content">
                        {/* Scrollable Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '3rem', paddingBottom: '120px', minHeight: 0 }} className="custom-scrollbar">
                            <button
                                onClick={onClose}
                                style={{ position: 'absolute', top: '2rem', right: '2rem', background: '#eee', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                            >
                                <X size={18} />
                            </button>

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
                                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('events.description')}</label>

                                                    {!showAiOptions ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            type="button"
                                                            onClick={() => setShowAiOptions(true)}
                                                            disabled={aiLoading}
                                                            style={{
                                                                background: 'linear-gradient(90deg, #FFF8E1 0%, #FFFFFF 100%)',
                                                                border: '1px solid #FFD700',
                                                                borderRadius: '20px',
                                                                padding: '6px 12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 800,
                                                                color: '#b8860b',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 5px rgba(255, 215, 0, 0.2)'
                                                            }}
                                                        >
                                                            <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} />
                                                            {aiLoading ? "Criando Mágica..." : "Aura AI: Assistente"}
                                                        </motion.button>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            style={{ display: 'flex', gap: '5px', alignItems: 'center', background: '#FFF8E1', padding: '4px', borderRadius: '20px', border: '1px solid #FFD700' }}
                                                        >
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#B8860B', marginLeft: '8px', marginRight: '4px' }}>Tom:</span>
                                                            {['Profissional', 'Inspirador', 'Exclusivo'].map(tone => (
                                                                <button
                                                                    key={tone}
                                                                    type="button"
                                                                    onClick={() => handleAiGenerateWithTone(tone)}
                                                                    disabled={aiLoading}
                                                                    className="hover:scale-105 transition-transform"
                                                                    style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', border: 'none', background: '#fff', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', color: '#333', fontWeight: 500 }}
                                                                >
                                                                    {tone}
                                                                </button>
                                                            ))}
                                                            <button type="button" onClick={() => setShowAiOptions(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: '5px', display: 'flex' }}><X size={14} color="#b8860b" /></button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    maxLength={500}
                                                    rows={4}
                                                    placeholder={t('events.descriptionPlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', resize: 'none' }}
                                                />
                                                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                                                    {description.length}/500
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
                                                    <input type="file" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                                    {uploadingImage ? <Loader2 className="animate-spin" /> : (
                                                        coverImage ? <Image src={coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} /> : (
                                                            <>
                                                                <ImageIcon size={32} color="#aaa" />
                                                                <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px' }}>{t('events.coverImageHelp')}</span>
                                                            </>
                                                        )
                                                    )}
                                                </div>

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
                                                                background: 'rgba(255,0,0,0.8)',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '28px',
                                                                height: '28px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            <X size={14} color="#fff" />
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

                                                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '10px' }}>
                                                    💡 Vídeo vertical (9:16) recomendado para melhor visualização. Ideal para VSLs e Reels.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('events.formFields')}</h2>
                                            <button
                                                onClick={handleAddField}
                                                style={{ background: '#000', color: '#FFD700', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Plus size={16} /> {t('events.addField')}
                                            </button>
                                        </div>

                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            {fields.map((field) => (
                                                <div key={field._id || field.id} style={{ background: '#fff', padding: '1.2rem', borderRadius: '15px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 100px 40px', gap: '1rem', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={field.label}
                                                            onChange={(e) => handleFieldChange(field._id || field.id, 'label', e.target.value)}
                                                            placeholder={t('events.fieldLabel')}
                                                            style={{ border: 'none', borderBottom: '1px solid #eee', padding: '5px', outline: 'none', fontSize: '0.9rem' }}
                                                        />
                                                        <select
                                                            value={field.type}
                                                            onChange={(e) => handleFieldChange(field._id || field.id, 'type', e.target.value)}
                                                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #eee', outline: 'none', fontSize: '0.8rem' }}
                                                        >
                                                            <option value="text">{t('events.typeText')}</option>
                                                            <option value="email">{t('events.typeEmail')}</option>
                                                            <option value="number">{t('events.typeNumber')}</option>
                                                            <option value="phone">{t('events.typePhone')}</option>
                                                            <option value="select">{t('events.typeSelect')}</option>
                                                            <option value="checkbox">{t('events.typeCheckbox')}</option>
                                                            <option value="date">{t('events.typeDate')}</option>
                                                            <option value="file">{t('events.typeFile')}</option>
                                                            <option value="textarea">Área de Texto (Grande)</option>
                                                        </select>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => handleFieldChange(field._id || field.id, 'required', e.target.checked)}
                                                            /> {t('events.requiredField')}
                                                        </label>
                                                        <button
                                                            onClick={() => handleRemoveField(field._id || field.id)}
                                                            style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>

                                                    {/* Options input for Select type */}
                                                    {field.type === 'select' && (
                                                        <input
                                                            type="text"
                                                            value={Array.isArray(field.options) ? field.options.join(', ') : ''}
                                                            onChange={(e) => handleFieldChange(field._id || field.id, 'options', e.target.value.split(',').map((s: string) => s.trim()))}
                                                            placeholder={t('events.optionsPlaceholder')}
                                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px dashed #ccc', fontSize: '0.85rem', background: '#f9f9f9' }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>{t('events.customization')}</h2>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
                                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.primaryColor')}</label>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        {['#FFD700', '#3182ce', '#38a169', '#e53e3e', '#805ad5', '#d69e2e'].map((color) => (
                                                            <motion.button
                                                                key={color}
                                                                onClick={() => setTheme({ ...theme, primaryColor: color })}
                                                                style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '50%',
                                                                    background: color,
                                                                    border: theme.primaryColor === color ? '3px solid #000' : '3px solid transparent',
                                                                    cursor: 'pointer'
                                                                }}
                                                                whileHover={{ scale: 1.1 }}
                                                            />
                                                        ))}
                                                        <input
                                                            type="color"
                                                            value={theme.primaryColor}
                                                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.backgroundColor')}</label>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <input
                                                            type="color"
                                                            value={theme.backgroundColor}
                                                            onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                                        />
                                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{theme.backgroundColor}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Live Preview */}
                                            <div style={{
                                                background: theme.backgroundColor,
                                                borderRadius: '16px',
                                                padding: '1.5rem',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                                border: `1px solid ${theme.style === 'luxury' ? 'rgba(255,255,255,0.1)' : '#eee'}`,
                                                color: theme.style === 'luxury' ? '#fff' : '#000',
                                                marginTop: '0'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: theme.primaryColor, fontWeight: 700, marginBottom: '0.5rem' }}>
                                                    {t('events.preview')}
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
                                                    {title || t('events.eventName')}
                                                </h3>
                                                <button style={{
                                                    width: '100%',
                                                    padding: '0.8rem',
                                                    borderRadius: '8px',
                                                    background: `linear-gradient(45deg, ${theme.primaryColor}, ${theme.primaryColor}dd)`,
                                                    color: '#000',
                                                    border: 'none',
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {t('events.registerNow')}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.visualStyle')}</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div
                                                    onClick={() => setTheme({ ...theme, style: 'luxury', backgroundColor: '#050505' })}
                                                    style={{
                                                        padding: '1.5rem',
                                                        borderRadius: '12px',
                                                        border: theme.style === 'luxury' ? '2px solid #FFD700' : '1px solid #ddd',
                                                        background: '#000',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{t('events.luxuryStyle')}</div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('events.luxuryHelp')}</div>
                                                </div>
                                                <div
                                                    onClick={() => setTheme({ ...theme, style: 'minimalist', backgroundColor: '#FFFFFF' })}
                                                    style={{
                                                        padding: '1.5rem',
                                                        borderRadius: '12px',
                                                        border: theme.style === 'minimalist' ? '2px solid #3182ce' : '1px solid #ddd',
                                                        background: '#fff',
                                                        color: '#000',
                                                        cursor: 'pointer',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{t('events.minimalistStyle')}</div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('events.minimalistHelp')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>{t('events.paymentConfig')}</h2>

                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600, background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={paymentConfig.enabled}
                                                    onChange={(e) => setPaymentConfig({ ...paymentConfig, enabled: e.target.checked })}
                                                    style={{ width: '20px', height: '20px' }}
                                                />
                                                {t('events.isPaidEvent')}
                                            </label>

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
                                                                <option value="MT">{t('events.metical')}</option>
                                                                <option value="USD">{t('events.dollar')}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div style={{ background: '#f0f7ff', padding: '1.5rem', borderRadius: '15px', border: '1px solid #c3dafe' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 700, color: '#2c5282', cursor: 'pointer', marginBottom: '1rem' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={paymentConfig.stripeEnabled}
                                                                onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeEnabled: e.target.checked })}
                                                                style={{ width: '20px', height: '20px' }}
                                                            />
                                                            Habilitar Pagamento com Cartão (Stripe)
                                                        </label>

                                                        {paymentConfig.stripeEnabled && (
                                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                                                    Para usar o Stripe, você precisa criar um Produto e um Preço no seu painel do Stripe e colar o <b>Price ID</b> abaixo.
                                                                </p>
                                                                <div>
                                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.8rem' }}>Stripe Price ID</label>
                                                                    <input
                                                                        type="text"
                                                                        value={paymentConfig.stripePriceId}
                                                                        onChange={(e) => setPaymentConfig({ ...paymentConfig, stripePriceId: e.target.value })}
                                                                        placeholder="Ex: price_1Q..."
                                                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.manualPaymentHeader')}</label>
                                                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>{t('events.paymentMethodsHelp')}</p>

                                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                                            {/* Titular da Conta */}
                                                            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                                        <circle cx="12" cy="7" r="4" />
                                                                    </svg>
                                                                    {t('events.accountHolderLabel')}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={paymentConfig.accountHolder || ''}
                                                                    onChange={(e) => setPaymentConfig({ ...paymentConfig, accountHolder: e.target.value })}
                                                                    placeholder="Ex: Nome do Titular da Conta"
                                                                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem' }}
                                                                />
                                                            </div>

                                                            {/* NIB / Conta Bancária */}
                                                            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                        <rect x="2" y="5" width="20" height="14" rx="2" />
                                                                        <line x1="2" y1="10" x2="22" y2="10" />
                                                                    </svg>
                                                                    NIB / Conta Bancária
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={paymentConfig.bankAccount || ''}
                                                                    onChange={(e) => setPaymentConfig({ ...paymentConfig, bankAccount: e.target.value })}
                                                                    placeholder="Ex: 0000 0000 0000 0000 0000 0000 0"
                                                                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem' }}
                                                                />
                                                            </div>

                                                            {/* MPesa */}
                                                            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                                                    </svg>
                                                                    M-Pesa (Número)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={paymentConfig.mpesaNumber || ''}
                                                                    onChange={(e) => setPaymentConfig({ ...paymentConfig, mpesaNumber: e.target.value })}
                                                                    placeholder="Ex: +258 84 123 4567"
                                                                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem' }}
                                                                />
                                                            </div>

                                                            {/* eMola */}
                                                            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                        <circle cx="12" cy="12" r="10" />
                                                                        <path d="M12 6v6l4 2" />
                                                                    </svg>
                                                                    e-Mola (Número)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={paymentConfig.emolaNumber || ''}
                                                                    onChange={(e) => setPaymentConfig({ ...paymentConfig, emolaNumber: e.target.value })}
                                                                    placeholder="Ex: +258 86 123 4567"
                                                                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem' }}
                                                                />
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
                                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                                        {copied ? 'Copiado!' : 'Copiar'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 7 && (
                                    <motion.div key="step7" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Personalização do Hub</h2>

                                        <div style={{ display: 'grid', gap: '2rem' }}>
                                            {/* Imagem de Fundo do Hub */}
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                    🖼️ Imagem de Fundo do Hub
                                                </label>
                                                <div style={{
                                                    width: '100%',
                                                    height: '150px',
                                                    background: hubBackgroundImage ? `url(${hubBackgroundImage}) center/cover` : '#eee',
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
                                        </div>
                                    </motion.div>
                                )}

                                {step === 8 && (
                                    <motion.div key="step8" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Configuração de Certificados</h2>
                                        <CertificateEditor
                                            config={certificateConfig}
                                            onChange={setCertificateConfig}
                                            mentorName={form.creator.name}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer Actions */}
                        <div style={{ padding: '1.5rem 3rem', background: '#fff', borderTop: '2px solid #FFD700', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 20, flexShrink: 0 }}>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary"
                                style={{ borderRadius: '12px', padding: '1rem 3rem', minWidth: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', fontWeight: 700, background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {t('events.profile.saveChanges')}</>}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div >
        </AnimatePresence >
    );
}
