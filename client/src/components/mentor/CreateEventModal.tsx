/* eslint-disable */
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, MessageCircle, Save, Loader2, Info, Layout, CheckCircle, Palette, DollarSign, Wand2, Video, Upload, Minus, Coins, Database, Play, Check, BookOpen, Lock, HelpCircle, AlertCircle, Eye, Globe, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { formService, FormModel } from '@/lib/formService';
import { aiService } from '@/lib/aiService';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import { lessonService, Lesson } from '@/lib/lessonService';
import PartnersEditor from './PartnersEditor';
import PricingTiersEditor from './PricingTiersEditor'; // Import Pricing Editor
import { Users2 } from 'lucide-react';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Field {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[]; // Added options
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
    const { t } = useTranslate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Mobile Detection
    useState(() => {
        if (typeof window !== 'undefined') {
            const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }
    });

    const handleAiGenerate = async () => {
        if (!title.trim()) {
            toast.error(t('ai.promptOrient'));
            return;
        }

        setAiLoading(true);
        try {
            const promptTemplate = t('ai.descriptionPrompt');
            const prompt = promptTemplate.replace('{title}', title);
            const data = await aiService.chat(prompt, t('locale') || 'pt');
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

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [capacity, setCapacity] = useState('');
    const [extraCapacity, setExtraCapacity] = useState('0');
    const [coverImage, setCoverImage] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [location, setLocation] = useState('');
    const [onlineLink, setOnlineLink] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventType, setEventType] = useState('modePresencial');
    const [category, setCategory] = useState('Outros');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoOrientation, setVideoOrientation] = useState<'vertical' | 'horizontal'>('vertical');
    const [logo, setLogo] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [fields, setFields] = useState<Field[]>([
        { id: '1', label: t('events.defaultFieldName'), type: 'text', required: true },
        { id: '2', label: t('events.defaultFieldEmail'), type: 'email', required: true }
    ]);

    // Visibility & Preview
    const [isPublic, setIsPublic] = useState(true);
    const [showPreview, setShowPreview] = useState(false);

    const [whatsappConfig, setWhatsappConfig] = useState({
        phoneNumber: '',
        message: t('events.whatsappDefaultMessage'),
        communityUrl: ''
    });

    const [welcomeMessage, setWelcomeMessage] = useState('');

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
        manualMethods: [] as { label: string; value: string; icon?: string }[],
        pricingTiers: [] as { id: string; category: string; price: number; description?: string }[], // NEW: Pricing tiers
        useTieredPricing: false // NEW: Toggle between single price and tiered pricing
    });

    // Lesson Selection State
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [selectedLessons, setSelectedLessons] = useState<string[]>([]);

    // Success State
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdEventSlug, setCreatedEventSlug] = useState('');
    const [lessonsLoading, setLessonsLoading] = useState(false);

    // Partners State
    const [partners, setPartners] = useState<string[]>([]);

    // Auto-Save & Draft Recovery State
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftBanner, setShowDraftBanner] = useState(false);
    const [draftData, setDraftData] = useState<any>(null);
    const [isDraggingImage, setIsDraggingImage] = useState(false);

    // Validation State
    const [validation, setValidation] = useState({
        title: { valid: true, message: '' },
        description: { valid: true, message: '' },
        eventDate: { valid: true, message: '' },
        capacity: { valid: true, message: '' }
    });

    // Calculate Progress
    const calculateProgress = () => {
        const totalFields = 8; // title, description, date, image, fields, theme, payment, communication
        let completedFields = 0;

        if (title.trim()) completedFields++;
        if (description.trim()) completedFields++;
        if (eventDate) completedFields++;
        if (coverImage) completedFields++;
        if (fields.length > 0 && fields.every(f => f.label.trim())) completedFields++;
        if (theme.primaryColor) completedFields++;
        if (whatsappConfig.phoneNumber || whatsappConfig.communityUrl) completedFields++;
        if (step >= 4) completedFields++; // viewed payment config

        return Math.round((completedFields / totalFields) * 100);
    };

    // Validation Functions
    const validateTitle = (value: string) => {
        if (!value.trim()) {
            return { valid: false, message: t('events.titleRequired') || 'Título é obrigatório' };
        }
        if (value.length < 5) {
            return { valid: false, message: 'Título muito curto (mín. 5 caracteres)' };
        }
        if (value.length > 100) {
            return { valid: false, message: 'Título muito longo (máx. 100 caracteres)' };
        }
        return { valid: true, message: '' };
    };

    const validateDescription = (value: string) => {
        if (!value.trim()) {
            return { valid: false, message: 'Descrição é obrigatória' };
        }
        if (value.length < 20) {
            return { valid: false, message: 'Descrição muito curta (mín. 20 caracteres)' };
        }
        return { valid: true, message: '' };
    };

    const validateEventDate = (value: string) => {
        if (!value) {
            return { valid: false, message: 'Data do evento é obrigatória' };
        }
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return { valid: false, message: 'Data não pode ser no passado' };
        }
        return { valid: true, message: '' };
    };

    const validateCapacity = (value: string) => {
        if (value && (parseInt(value) < 1 || parseInt(value) > 10000)) {
            return { valid: false, message: 'Capacidade deve estar entre 1 e 10.000' };
        }
        return { valid: true, message: '' };
    };

    // Auto-Save Effect
    useEffect(() => {
        if (!isOpen) return;

        const autoSaveInterval = setInterval(() => {
            if (title || description || coverImage || fields.length > 2) {
                const draftData = {
                    title, description, eventDate, capacity, extraCapacity,
                    coverImage, location, onlineLink, eventTime, eventType,
                    category, videoUrl, videoOrientation, logo, fields,
                    theme, paymentConfig, whatsappConfig, welcomeMessage,
                    selectedLessons, partners,
                    timestamp: Date.now(),
                    step
                };

                localStorage.setItem('event-draft', JSON.stringify(draftData));
                setLastSaved(new Date());
            }
        }, 30000); // Auto-save a cada 30 segundos

        return () => clearInterval(autoSaveInterval);
    }, [
        isOpen, title, description, eventDate, capacity, extraCapacity,
        coverImage, location, onlineLink, eventTime, eventType, category,
        videoUrl, videoOrientation, logo, fields, theme, paymentConfig,
        whatsappConfig, welcomeMessage, selectedLessons, partners, step
    ]);

    // Check for Draft on Open
    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem('event-draft');
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    const draftAge = Date.now() - draft.timestamp;

                    // Show banner if draft is less than 24 hours old
                    if (draftAge < 24 * 60 * 60 * 1000) {
                        setDraftData(draft);
                        setShowDraftBanner(true);
                    } else {
                        // Remove old draft
                        localStorage.removeItem('event-draft');
                    }
                } catch (err) {
                    console.error('Error loading draft:', err);
                }
            }
        }
    }, [isOpen]);

    const restoreDraft = () => {
        if (draftData) {
            setTitle(draftData.title || '');
            setDescription(draftData.description || '');
            setEventDate(draftData.eventDate || '');
            setCapacity(draftData.capacity || '');
            setExtraCapacity(draftData.extraCapacity || '0');
            setCoverImage(draftData.coverImage || '');
            setLocation(draftData.location || '');
            setOnlineLink(draftData.onlineLink || '');
            setEventTime(draftData.eventTime || '');
            setEventType(draftData.eventType || 'modePresencial');
            setCategory(draftData.category || 'Outros');
            setVideoUrl(draftData.videoUrl || '');
            setVideoOrientation(draftData.videoOrientation || 'vertical');
            setLogo(draftData.logo || '');
            setFields(draftData.fields || []);
            setTheme(draftData.theme || theme);
            setPaymentConfig(draftData.paymentConfig || paymentConfig);
            setWhatsappConfig(draftData.whatsappConfig || whatsappConfig);
            setWelcomeMessage(draftData.welcomeMessage || '');
            setSelectedLessons(draftData.selectedLessons || []);
            setPartners(draftData.partners || []);
            setStep(draftData.step || 1);

            setShowDraftBanner(false);
            toast.success('Rascunho restaurado com sucesso!');
        }
    };

    const discardDraft = () => {
        localStorage.removeItem('event-draft');
        setShowDraftBanner(false);
        setDraftData(null);
        toast.info('Rascunho descartado');
    };

    // Keyboard Shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyboard = (e: KeyboardEvent) => {
            // Ctrl/Cmd + Enter = Submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (step === 7) {
                    handleSubmit();
                }
            }

            // Ctrl/Cmd + → = Next step
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
                e.preventDefault();
                setStep(Math.min(7, step + 1));
            }

            // Ctrl/Cmd + ← = Previous step
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
                e.preventDefault();
                setStep(Math.max(1, step - 1));
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [isOpen, step]);

    useEffect(() => {
        const fetchLessons = async () => {
            setLessonsLoading(true);
            try {
                const data = await lessonService.getManagedLessons();
                setAllLessons(data.lessons || []);
            } catch (err) {
                console.error("Error fetching lessons for modal:", err);
            } finally {
                setLessonsLoading(false);
            }
        };

        if (isOpen) fetchLessons();
    }, [isOpen]);

    const toggleLessonSelection = (lessonId: string) => {
        setSelectedLessons(prev =>
            prev.includes(lessonId)
                ? prev.filter(id => id !== lessonId)
                : [...prev, lessonId]
        );
    };

    const handleAddField = () => {
        const newId = (fields.length + 1).toString();
        setFields([...fields, { id: newId, label: '', type: 'text', required: true }]);
    };

    const handleRemoveField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleFieldChange = (id: string, key: keyof Field, value: string | boolean | string[]) => {
        setFields(fields.map(f => {
            if (f.id !== id) return f;
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

    // Drag & Drop for Cover Image
    const handleImageDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingImage(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(f => f.type.startsWith('image/'));

        if (imageFile) {
            setUploadingImage(true);
            try {
                const url = await formService.uploadFile(imageFile, 'covers');
                setCoverImage(url);
                toast.success('Imagem de capa carregada com sucesso!');
            } catch (err: unknown) {
                console.error("Cover Upload Error:", err);
                toast.error('Erro ao carregar imagem. Por favor, tente novamente.');
            } finally {
                setUploadingImage(false);
            }
        } else {
            toast.error('Por favor, solte apenas arquivos de imagem');
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingLogo(true);
            try {
                const url = await formService.uploadFile(e.target.files[0], 'logos');
                setLogo(url);
                toast.success('Logo empresarial carregado!');
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

    // Drag & Drop for Logo
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);

    const handleLogoDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingLogo(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(f => f.type.startsWith('image/'));

        if (imageFile) {
            setUploadingLogo(true);
            try {
                const url = await formService.uploadFile(imageFile, 'logos');
                setLogo(url);
                toast.success('Logo empresarial carregado!');
            } catch (err: unknown) {
                console.error("Logo Upload Error:", err);
                toast.error('Erro ao carregar logo. Por favor, tente novamente.');
            } finally {
                setUploadingLogo(false);
            }
        } else {
            toast.error('Por favor, solte apenas arquivos de imagem');
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
                toast.error('Erro ao carregar vídeo. Por favor, tente novamente.');
            } finally {
                setUploadingVideo(false);
                // Reset input para permitir re-upload do mesmo arquivo se necessário
                e.target.value = '';
            }
        }
    };

    // Drag & Drop for Video
    const [isDraggingVideo, setIsDraggingVideo] = useState(false);

    const handleVideoDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingVideo(false);

        const files = Array.from(e.dataTransfer.files);
        const videoFile = files.find(f => f.type.startsWith('video/'));

        if (videoFile) {
            if (videoFile.size > 100 * 1024 * 1024) {
                toast.error('O vídeo deve ter no máximo 100MB');
                return;
            }
            setUploadingVideo(true);
            try {
                const url = await formService.uploadFile(videoFile, 'videos');
                setVideoUrl(url);
                toast.success('Vídeo carregado com sucesso!');
            } catch (err: unknown) {
                console.error(err);
                toast.error('Erro ao carregar vídeo. Por favor, tente novamente.');
            } finally {
                setUploadingVideo(false);
            }
        } else {
            toast.error('Por favor, solte apenas arquivos de vídeo');
        }
    };

    const handleSubmit = async () => {
        // 1. Validar título e descrição
        if (!title || !description) {
            toast.error(t('events.fillTitleDescAlert'));
            setStep(1);
            return;
        }

        // 2. Validar data obrigatória
        if (!eventDate) {
            toast.error('Data do evento é obrigatória');
            setStep(1);
            return;
        }


        // 4. Validação condicional: Location para eventos presenciais
        if (eventType === 'modePresencial' && !location.trim()) {
            toast.error('Localização é obrigatória para eventos presenciais');
            setStep(1);
            return;
        }

        // 5. Validação condicional: Online Link para eventos online
        if ((eventType === 'modeOnline' || eventType === 'modeHibrido') && !onlineLink.trim()) {
            toast.error('Link online é obrigatório para eventos online/híbridos');
            setStep(1);
            return;
        }

        // 6. Validar formato de URL do link online
        if (onlineLink.trim()) {
            try {
                new URL(onlineLink);
            } catch {
                toast.error('Link online inválido. Use uma URL completa (ex: https://zoom.us/...)');
                setStep(1);
                return;
            }
        }

        // 7. Validar campos do formulário
        const hasEmptyFields = fields.some(f => !f.label.trim());
        if (hasEmptyFields) {
            toast.error(t('events.emptyFieldsAlert'));
            setStep(2);
            return;
        }

        // 8. Validar campos Select têm opções
        const selectFieldsWithoutOptions = fields.filter(f =>
            f.type === 'select' && (!f.options || f.options.length === 0)
        );
        if (selectFieldsWithoutOptions.length > 0) {
            toast.error(`Campo "${selectFieldsWithoutOptions[0].label}" do tipo Select precisa de opções`);
            setStep(2);
            return;
        }

        // 9. Validar configuração de pagamento
        if (paymentConfig.enabled) {
            // Se usa preços por categoria
            if (paymentConfig.useTieredPricing) {
                if (!paymentConfig.pricingTiers || paymentConfig.pricingTiers.length === 0) {
                    toast.error('Adicione pelo menos uma categoria de preço');
                    setStep(4);
                    return;
                }

                // Validar cada tier
                const invalidTiers = paymentConfig.pricingTiers.filter(t =>
                    !t.category.trim() || t.price <= 0
                );
                if (invalidTiers.length > 0) {
                    toast.error('Todas as categorias devem ter nome e preço maior que 0');
                    setStep(4);
                    return;
                }
            }
            // Se usa preço único
            else {
                if (paymentConfig.price <= 0) {
                    toast.error('Evento pago deve ter preço maior que 0');
                    setStep(4);
                    return;
                }
            }

            // Validar métodos de pagamento manual
            if (paymentConfig.manualMethods && paymentConfig.manualMethods.length > 0) {
                const invalidMethods = paymentConfig.manualMethods.filter(m =>
                    !m.label.trim() || !m.value.trim()
                );
                if (invalidMethods.length > 0) {
                    toast.error('Métodos de pagamento devem ter nome e detalhes preenchidos');
                    setStep(4);
                    return;
                }
            }
        }

        // 10. Validar URL do vídeo se fornecido
        if (videoUrl && videoUrl.trim()) {
            try {
                new URL(videoUrl);
            } catch {
                toast.error('URL do vídeo inválida');
                setStep(1);
                return;
            }
        }

        // 11. Validar telefone WhatsApp se fornecido
        if (whatsappConfig.phoneNumber && whatsappConfig.phoneNumber.trim()) {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            const cleanPhone = whatsappConfig.phoneNumber.replace(/[\s\-()]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                toast.error('Formato de telefone WhatsApp inválido. Use formato internacional: +258...');
                setStep(5);
                return;
            }
        }

        // 12. Validar URL da comunidade WhatsApp se fornecida
        if (whatsappConfig.communityUrl && whatsappConfig.communityUrl.trim()) {
            try {
                new URL(whatsappConfig.communityUrl);
            } catch {
                toast.error('URL da comunidade WhatsApp inválida');
                setStep(5);
                return;
            }
        }

        // Clean up fields (remove temporary id)
        const cleanedFields = fields.map(f => {
            const { id, ...rest } = f;
            return rest;
        });

        setLoading(true);
        try {
            const createdForm = await formService.createForm({
                title,
                description,
                eventDate,
                fields: cleanedFields as FormModel['fields'],
                coverImage,
                whatsappConfig,
                theme: {
                    ...theme,
                    style: theme.style as "luxury" | "minimalist",
                    backgroundColor: theme.backgroundColor,
                    fontFamily: theme.fontFamily
                },
                paymentConfig,
                capacity: capacity ? parseInt(capacity) : null,
                extraCapacity: extraCapacity ? parseInt(extraCapacity) : 0,
                location,
                onlineLink,
                eventTime,
                eventType,
                category,
                videoUrl,
                videoOrientation,
                logo,
                welcomeMessage,
                associatedLessons: selectedLessons,
                partners,
                active: isPublic
            });

            // Limpar draft após sucesso
            localStorage.removeItem('event-draft');

            toast.success('Evento criado com sucesso! 🎉');

            // Show Success Screen
            try {
                if (createdForm && createdForm.slug) {
                    setCreatedEventSlug(createdForm.slug);
                }
            } catch (e) { console.error(e); }

            setShowSuccess(true);

            onSuccess();
            // onClose(); // Don't close immediately
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Create Event Error:", error);
            toast.error(error.message || t('common.error'));
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
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: isMobile ? '100%' : '900px',
                        background: '#fff',
                        borderRadius: isMobile ? '0' : '30px',
                        overflow: 'hidden',
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
                        height: isMobile ? '100vh' : '85vh',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        zIndex: 2002
                    }}
                >
                    {/* Sidebar / Top Nav */}
                    <div style={{
                        background: '#000',
                        padding: isMobile ? '1.5rem 1rem' : '3rem 2rem',
                        color: '#fff',
                        display: isMobile ? 'flex' : 'block',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: isMobile ? 'column' : 'initial',
                        gap: isMobile ? '1rem' : '0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isMobile ? '0.5rem' : '3rem', color: '#FFD700' }}>
                            <Layout size={isMobile ? 18 : 24} />
                            <span style={{ fontWeight: 800, fontSize: isMobile ? '1rem' : '1.2rem' }}>{t('events.newTitle')}</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            gap: isMobile ? '0.5rem' : '1.5rem',
                            overflowX: isMobile ? 'auto' : 'visible',
                            width: isMobile ? '100%' : 'auto',
                            paddingBottom: isMobile ? '10px' : '0',
                            justifyContent: isMobile ? 'center' : 'flex-start'
                        }} className="no-scrollbar">
                            {[
                                { id: 1, label: t('events.steps.info'), icon: <Info size={18} /> },
                                { id: 2, label: t('events.steps.form'), icon: <Plus size={18} /> },
                                { id: 3, label: t('events.steps.design'), icon: <Palette size={18} /> },
                                { id: 4, label: t('events.steps.payment'), icon: <DollarSign size={18} /> },
                                { id: 5, label: t('events.steps.communication'), icon: <MessageCircle size={18} /> },
                                { id: 6, label: 'Aulas do Evento', icon: <BookOpen size={18} /> },
                                { id: 7, label: 'Parceiros/Co-org', icon: <Users2 size={18} /> },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(s.id)}
                                    title={s.label}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: isMobile ? '0' : '12px',
                                        padding: isMobile ? '0.75rem' : '1rem',
                                        minWidth: isMobile ? '45px' : 'auto',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: step === s.id ? '#FFD70015' : 'transparent',
                                        color: step === s.id ? '#FFD700' : '#666',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {s.icon}
                                    {!isMobile && s.label}
                                </button>
                            ))}
                        </div>

                        {!isMobile && (
                            <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem' }}>
                                <button
                                    onClick={step === 7 ? handleSubmit : () => setStep(step + 1)}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ width: '100%', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (step === 7 ? <><Save size={18} /> {t('events.publish')}</> : t('common.next'))}
                                </button>
                                <div style={{
                                    marginTop: '12px',
                                    fontSize: '0.65rem',
                                    color: '#666',
                                    textAlign: 'center',
                                    lineHeight: '1.4'
                                }}>
                                    <span style={{ opacity: 0.7 }}>⌨️ Atalhos:</span>{' '}
                                    <span style={{ background: '#222', padding: '2px 6px', borderRadius: '4px', color: '#FFD700' }}>Ctrl+→</span> próximo{' '}
                                    <span style={{ background: '#222', padding: '2px 6px', borderRadius: '4px', color: '#FFD700' }}>Ctrl+←</span> voltar
                                    {step === 7 && <><br /><span style={{ background: '#222', padding: '2px 6px', borderRadius: '4px', color: '#FFD700' }}>Ctrl+Enter</span> publicar</>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: isMobile ? '1.5rem' : '3rem',
                        paddingBottom: isMobile ? '7rem' : '3rem',
                        overflowY: 'auto',
                        background: '#f8f9fa'
                    }}>
                        <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                            <button
                                onClick={() => setShowPreview(true)}
                                title="Pré-visualizar Evento"
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

                        {/* Progress Indicator */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{
                                background: '#e5e7eb',
                                borderRadius: '999px',
                                height: '8px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateProgress()}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    style={{
                                        background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                                        height: '100%',
                                        borderRadius: '999px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '8px'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: '#666',
                                    fontWeight: 600
                                }}>
                                    {calculateProgress()}% completo
                                </span>
                                {lastSaved && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <CheckCircle size={12} />
                                        Salvo {new Date(lastSaved).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Draft Recovery Banner */}
                        {showDraftBanner && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                                    border: '2px solid #fbbf24',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 4px 6px rgba(251, 191, 36, 0.1)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                    <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            color: '#92400e',
                                            marginBottom: '4px'
                                        }}>
                                            Rascunho encontrado
                                        </h4>
                                        <p style={{
                                            fontSize: '0.8rem',
                                            color: '#78350f',
                                            marginBottom: '12px',
                                            lineHeight: '1.4'
                                        }}>
                                            Encontramos um rascunho salvo de {
                                                draftData
                                                    ? Math.round((Date.now() - draftData.timestamp) / 60000) < 60
                                                        ? `${Math.round((Date.now() - draftData.timestamp) / 60000)} minutos atrás`
                                                        : `${Math.round((Date.now() - draftData.timestamp) / 3600000)} horas atrás`
                                                    : 'recentemente'
                                            }. Deseja restaurar?
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={restoreDraft}
                                                style={{
                                                    background: '#f59e0b',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#d97706'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#f59e0b'}
                                            >
                                                Restaurar Rascunho
                                            </button>
                                            <button
                                                onClick={discardDraft}
                                                style={{
                                                    background: 'transparent',
                                                    color: '#92400e',
                                                    border: '1px solid #d97706',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Descartar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>{t('events.basicInfo')}</h2>

                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                {t('events.eventName')} <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => {
                                                    setTitle(e.target.value);
                                                    setValidation(v => ({ ...v, title: validateTitle(e.target.value) }));
                                                }}
                                                onBlur={() => setValidation(v => ({ ...v, title: validateTitle(title) }))}
                                                placeholder={t('events.namePlaceholder')}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    borderRadius: '12px',
                                                    border: !validation.title.valid && title ? '2px solid #ef4444' : '1px solid #ddd',
                                                    outline: 'none',
                                                    transition: 'border 0.2s'
                                                }}
                                            />
                                            {!validation.title.valid && title && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        color: '#ef4444',
                                                        fontSize: '0.75rem',
                                                        marginTop: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <AlertCircle size={12} />
                                                    {validation.title.message}
                                                </motion.p>
                                            )}
                                            {validation.title.valid && title && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        color: '#10b981',
                                                        fontSize: '0.75rem',
                                                        marginTop: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <CheckCircle size={12} />
                                                    Perfeito!
                                                </motion.p>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                    {t('events.eventDate')} <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={eventDate}
                                                    onChange={(e) => {
                                                        setEventDate(e.target.value);
                                                        setValidation(v => ({ ...v, eventDate: validateEventDate(e.target.value) }));
                                                    }}
                                                    onBlur={() => setValidation(v => ({ ...v, eventDate: validateEventDate(eventDate) }))}
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem',
                                                        borderRadius: '12px',
                                                        border: !validation.eventDate.valid && eventDate ? '2px solid #ef4444' : '1px solid #ddd',
                                                        outline: 'none',
                                                        transition: 'border 0.2s'
                                                    }}
                                                />
                                                {!validation.eventDate.valid && eventDate && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        style={{
                                                            color: '#ef4444',
                                                            fontSize: '0.75rem',
                                                            marginTop: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <AlertCircle size={12} />
                                                        {validation.eventDate.message}
                                                    </motion.p>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.eventTime')}</label>
                                                <input
                                                    type="text"
                                                    value={eventTime}
                                                    onChange={(e) => setEventTime(e.target.value)}
                                                    placeholder={t('events.eventTimePlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                    {t('events.capacityLabel')}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={capacity}
                                                    onChange={(e) => {
                                                        setCapacity(e.target.value);
                                                        setValidation(v => ({ ...v, capacity: validateCapacity(e.target.value) }));
                                                    }}
                                                    onBlur={() => setValidation(v => ({ ...v, capacity: validateCapacity(capacity) }))}
                                                    placeholder={t('events.capacityPlaceholder')}
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem',
                                                        borderRadius: '12px',
                                                        border: !validation.capacity.valid && capacity ? '2px solid #ef4444' : '1px solid #ddd',
                                                        outline: 'none',
                                                        transition: 'border 0.2s'
                                                    }}
                                                />
                                                {!validation.capacity.valid && capacity ? (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        style={{
                                                            color: '#ef4444',
                                                            fontSize: '0.75rem',
                                                            marginTop: '5px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <AlertCircle size={12} />
                                                        {validation.capacity.message}
                                                    </motion.p>
                                                ) : (
                                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>
                                                        {t('events.capacityHelp')}
                                                    </p>
                                                )}
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

                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.locationPhysical')}</label>
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    placeholder={t('events.locationPlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.onlineLink')}</label>
                                                <input
                                                    type="text"
                                                    value={onlineLink}
                                                    onChange={(e) => setOnlineLink(e.target.value)}
                                                    placeholder={t('events.onlinePlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('events.description')}</label>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="button"
                                                    onClick={handleAiGenerate}
                                                    disabled={aiLoading}
                                                    style={{
                                                        background: 'rgba(255,215,0,0.1)',
                                                        border: '1px solid rgba(255,215,0,0.3)',
                                                        borderRadius: '20px',
                                                        padding: '4px 10px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        color: '#b8860b',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {aiLoading ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />}
                                                    {t('ai.buttonDescribe')}
                                                </motion.button>
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
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                                                onDragLeave={() => setIsDraggingImage(false)}
                                                onDrop={handleImageDrop}
                                                style={{
                                                    width: '100%',
                                                    height: '180px',
                                                    background: isDraggingImage ? '#fffbeb' : '#eee',
                                                    borderRadius: '20px',
                                                    border: isDraggingImage ? '3px dashed #FFD700' : '2px dashed #ccc',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    transition: 'all 0.2s ease'
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
                                                            {isDraggingImage ? (
                                                                <>
                                                                    <Upload size={48} color="#FFD700" />
                                                                    <span style={{ fontSize: '0.9rem', color: '#FFD700', marginTop: '10px', fontWeight: 700 }}>
                                                                        Solte a imagem aqui!
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ImageIcon size={32} color="#aaa" />
                                                                    <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px' }}>{t('events.coverImageHelp')}</span>
                                                                    <span style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '4px' }}>ou arraste e solte aqui</span>
                                                                </>
                                                            )}
                                                        </>
                                                    )
                                                )}
                                            </div>
                                            {coverImage && !uploadingImage && (
                                                <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '8px', fontWeight: 600 }}>
                                                    ✓ Imagem carregada! Clique acima para alterar ou use o botão Remover.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Logo da Empresa (Opcional)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                                                    onDragLeave={() => setIsDraggingLogo(false)}
                                                    onDrop={handleLogoDrop}
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        background: isDraggingLogo ? '#fffbeb' : '#f8f9fa',
                                                        borderRadius: '16px',
                                                        border: isDraggingLogo ? '3px dashed #FFD700' : '2px dashed #ddd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        transition: 'all 0.2s ease'
                                                    }}>
                                                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                                    {uploadingLogo ? <Loader2 className="animate-spin" size={20} /> : (
                                                        logo ? <Image src={logo} alt="Logo" fill style={{ objectFit: 'contain', padding: '10px' }} /> : (
                                                            <div style={{ textAlign: 'center' }}>
                                                                {isDraggingLogo ? (
                                                                    <>
                                                                        <Upload size={28} color="#FFD700" />
                                                                        <p style={{ fontSize: '0.55rem', color: '#FFD700', marginTop: '4px', fontWeight: 700 }}>Solte!</p>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Upload size={20} color="#aaa" />
                                                                        <p style={{ fontSize: '0.6rem', color: '#888', marginTop: '4px' }}>Logo</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
                                                        Adicione uma logo empresarial para aparecer no topo do seu formulário. Se não desejar usar uma logo, deixe este campo vazio.
                                                    </p>
                                                    <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '4px' }}>
                                                        💡 Dica: Arraste e solte para upload rápido
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
                                                {t('events.vslVideoLabel')}
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
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('events.videoConfigured')}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', wordBreak: 'break-all' }}>
                                                        {videoUrl.length > 60 ? videoUrl.substring(0, 60) + '...' : videoUrl}
                                                    </p>
                                                </div>
                                            )}

                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                                {/* Upload Option */}
                                                <label
                                                    htmlFor="video-upload"
                                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                                                    onDragLeave={() => setIsDraggingVideo(false)}
                                                    onDrop={handleVideoDrop}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '1.5rem',
                                                        background: uploadingVideo ? '#f0fdf4' : (isDraggingVideo ? '#fffbeb' : '#f8f9fa'),
                                                        border: isDraggingVideo ? '3px dashed #FFD700' : '2px dashed #ddd',
                                                        borderRadius: '16px',
                                                        cursor: uploadingVideo ? 'wait' : 'pointer',
                                                        transition: 'all 0.2s',
                                                        minHeight: '120px'
                                                    }}>
                                                    <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} id="video-upload" disabled={uploadingVideo} />
                                                    {uploadingVideo ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={28} color="#22c55e" />
                                                            <span style={{ fontSize: '0.8rem', marginTop: '8px', color: '#22c55e', fontWeight: 600 }}>{t('events.processing')}</span>
                                                        </>
                                                    ) : isDraggingVideo ? (
                                                        <>
                                                            <Upload size={36} color="#FFD700" />
                                                            <span style={{ fontSize: '0.9rem', marginTop: '8px', color: '#FFD700', fontWeight: 700 }}>Solte o vídeo aqui!</span>
                                                            <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Máx: 100MB</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={28} color="#888" />
                                                            <span style={{ fontSize: '0.85rem', marginTop: '8px', fontWeight: 600 }}>{t('events.uploadVideo')}</span>
                                                            <span style={{ fontSize: '0.7rem', color: '#888' }}>Máx: 100MB</span>
                                                            <span style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '4px' }}>ou arraste aqui</span>
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
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t('events.orPasteLink')}</span>
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
                                                {t('events.videoTip')}
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
                                            <div key={field.id} style={{ background: '#fff', padding: '1.2rem', borderRadius: '15px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 150px 100px 40px', gap: '1rem', alignItems: 'center' }}>
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                                                        placeholder={t('events.fieldLabel')}
                                                        style={{ border: 'none', borderBottom: '1px solid #eee', padding: '5px', outline: 'none', fontSize: '0.9rem' }}
                                                    />
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => handleFieldChange(field.id, 'type', e.target.value)}
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
                                                        <option value="textarea">{t('events.typeTextarea')}</option>
                                                    </select>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                                                        /> {t('events.requiredField')}
                                                    </label>
                                                    <button
                                                        onClick={() => handleRemoveField(field.id)}
                                                        style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                {/* Options input for Select type */}
                                                {field.type === 'select' && (
                                                    <input
                                                        type="text"
                                                        value={field.options?.join(', ') || ''}
                                                        onChange={(e) => handleFieldChange(field.id, 'options', e.target.value.split(',').map(s => s.trim()))}
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

                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.primaryColor')}</label>
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                    {['#FFD700', '#3182ce', '#38a169', '#e53e3e', '#805ad5', '#d69e2e', '#000000', '#ffffff'].map((color) => (
                                                        <motion.button
                                                            key={color}
                                                            onClick={() => setTheme({ ...theme, primaryColor: color })}
                                                            style={{
                                                                width: '36px',
                                                                height: '36px',
                                                                borderRadius: '50%',
                                                                background: color,
                                                                border: theme.primaryColor === color ? '3px solid #000' : '1px solid #ddd',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                            }}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        />
                                                    ))}
                                                    <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                        <input
                                                            type="color"
                                                            value={theme.primaryColor}
                                                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                                            style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', padding: 0, margin: 0, border: 'none', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.backgroundColor')}</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                        <input
                                                            type="color"
                                                            value={theme.backgroundColor}
                                                            onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                                                            style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', padding: 0, margin: 0, border: 'none', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                    <span style={{ fontSize: '0.9rem', color: '#666', fontFamily: 'monospace' }}>{theme.backgroundColor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Live Preview - Improved */}
                                        <div style={{
                                            background: theme.backgroundColor,
                                            borderRadius: '20px',
                                            padding: '2rem',
                                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                                            border: `1px solid ${theme.style === 'luxury' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)'}`,
                                            color: theme.style === 'luxury' || theme.backgroundColor === '#000000' ? '#fff' : '#000',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            minHeight: '280px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}>
                                            {/* Preview Background/Overlay Logic */}
                                            {theme.style === 'luxury' && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)', pointerEvents: 'none' }} />
                                            )}

                                            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '2px',
                                                    color: theme.primaryColor,
                                                    fontWeight: 800,
                                                    marginBottom: '1rem',
                                                    opacity: 0.9
                                                }}>
                                                    {t('events.preview')}
                                                </div>

                                                <h3 style={{
                                                    fontSize: '1.5rem',
                                                    fontWeight: 800,
                                                    marginBottom: '1.5rem',
                                                    lineHeight: 1.2,
                                                    color: theme.style === 'luxury' || theme.backgroundColor.toLowerCase() === '#050505' || theme.backgroundColor.toLowerCase() === '#000000' ? '#fff' : '#1a1a1a'
                                                }}>
                                                    {title || "Título do Seu Evento Incrível"}
                                                </h3>

                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem', opacity: 0.7, fontSize: '0.85rem' }}>
                                                    <span>📅 {eventDate ? new Date(eventDate).toLocaleDateString() : "Data do Evento"}</span>
                                                    <span>•</span>
                                                    <span>📍 {eventType === 'modeOnline' ? 'Online' : (location || 'Local')}</span>
                                                </div>

                                                <button style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    borderRadius: '12px',
                                                    background: theme.primaryColor,
                                                    color: (['#FFD700', '#ffffff', '#e2e8f0'].includes(theme.primaryColor)) ? '#000' : '#fff',
                                                    border: 'none',
                                                    fontWeight: 700,
                                                    fontSize: '0.95rem',
                                                    boxShadow: `0 10px 20px -5px ${theme.primaryColor}66`,
                                                    cursor: 'default'
                                                }}>
                                                    {t('events.registerNow')}
                                                </button>
                                            </div>
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
                                                {/* Currency Selector - Always Visible for Paid Events */}
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
                                                        <option value="BRL">Real (BRL)</option>
                                                    </select>
                                                </div>

                                                {/* Tiered Pricing Toggle */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '1rem',
                                                    background: '#f0f9ff',
                                                    border: '1px solid #bae6fd',
                                                    borderRadius: '12px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <Users2 size={24} color="#0284c7" />
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0369a1' }}>Preços Diferenciados</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#0c4a6e' }}>
                                                                Cobrar preços diferentes por público? (Ex: Estudantes, VIP)
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={paymentConfig.useTieredPricing}
                                                            onChange={(e) => setPaymentConfig({ ...paymentConfig, useTieredPricing: e.target.checked })}
                                                            style={{ opacity: 0, width: 0, height: 0 }}
                                                        />
                                                        <span className="slider round" style={{
                                                            position: 'absolute',
                                                            cursor: 'pointer',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            backgroundColor: paymentConfig.useTieredPricing ? '#0ea5e9' : '#ccc',
                                                            transition: '.4s',
                                                            borderRadius: '34px'
                                                        }}>
                                                            <span style={{
                                                                position: 'absolute',
                                                                content: "",
                                                                height: '20px',
                                                                width: '20px',
                                                                left: paymentConfig.useTieredPricing ? '26px' : '4px',
                                                                bottom: '4px',
                                                                backgroundColor: 'white',
                                                                transition: '.4s',
                                                                borderRadius: '50%'
                                                            }} />
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Price Input OR Tier Editor */}
                                                {!paymentConfig.useTieredPricing ? (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.ticketPrice')}</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#666' }}>
                                                                {paymentConfig.currency === 'MT' ? 'MT' :
                                                                    paymentConfig.currency === 'USD' ? '$' :
                                                                        paymentConfig.currency === 'EUR' ? '€' :
                                                                            paymentConfig.currency}
                                                            </span>
                                                            <input
                                                                type="number"
                                                                value={paymentConfig.price}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value);
                                                                    setPaymentConfig({ ...paymentConfig, price: isNaN(val) ? 0 : val });
                                                                }}
                                                                placeholder="0.00"
                                                                min="0"
                                                                step="0.01"
                                                                style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                        <PricingTiersEditor
                                                            tiers={paymentConfig.pricingTiers}
                                                            currency={paymentConfig.currency}
                                                            onUpdate={(tiers) => setPaymentConfig({ ...paymentConfig, pricingTiers: tiers })}
                                                        />
                                                    </motion.div>
                                                )}

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
                                                                <Lock size={12} color="#64748b" />
                                                            </div>
                                                        </div>
                                                        {t('events.stripeHeader')}
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
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.paymentInstructionsHeader')}</label>
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
                                                                    <Coins size={16} className="gold-text" /> {t('events.customPayments')}
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPaymentConfig({
                                                                        ...paymentConfig,
                                                                        manualMethods: [...(paymentConfig.manualMethods || []), { label: '', value: '', icon: 'phone' }]
                                                                    })}
                                                                    style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '20px', background: '#111', color: '#FFD700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    <Plus size={12} /> {t('events.addMethod')}
                                                                </button>
                                                            </div>

                                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                                {paymentConfig.manualMethods?.length === 0 && (
                                                                    <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', fontStyle: 'italic', padding: '1rem' }}>
                                                                        {t('events.noCustomMethods')}
                                                                    </p>
                                                                )}

                                                                {paymentConfig.manualMethods?.map((method, idx) => (
                                                                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#f9f9f9', padding: '10px', borderRadius: '12px' }}>
                                                                        <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                                                                            <input
                                                                                type="text"
                                                                                placeholder={t('events.methodNamePlaceholder')}
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
                                                                                placeholder={t('events.methodValuePlaceholder')}
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
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.otherInstructionsLabel')}</label>
                                                            <textarea
                                                                value={paymentConfig.instructions || ''}
                                                                onChange={(e) => setPaymentConfig({ ...paymentConfig, instructions: e.target.value })}
                                                                rows={3}
                                                                placeholder={t('events.otherInstructionsPlaceholder')}
                                                                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', resize: 'vertical', fontSize: '0.9rem' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600, padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={paymentConfig.requireProof}
                                                        onChange={(e) => setPaymentConfig({ ...paymentConfig, requireProof: e.target.checked })}
                                                        style={{ width: '18px', height: '18px' }}
                                                    />
                                                    {t('events.requireProofLabel')}
                                                </label>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div key="step5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
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
                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.communityLinkLabel')}</label>
                                            <input
                                                type="text"
                                                value={whatsappConfig.communityUrl}
                                                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, communityUrl: e.target.value })}
                                                placeholder={t('events.communityPlaceholder')}
                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                            />
                                        </div>

                                        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#FDF2F2', borderRadius: '20px', border: '1px solid #FEE2E2' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '0.5rem', fontSize: '1rem', color: '#9B1C1C' }}>
                                                <MessageCircle size={20} />
                                                Mensagem Automática de Boas-Vindas
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

                                            <p style={{ fontSize: '0.8rem', color: '#7F1D1D', marginBottom: '1rem' }}>
                                                Esta mensagem será enviada automaticamente pelo chat assim que o participante se inscrever.
                                            </p>
                                            <textarea
                                                value={welcomeMessage}
                                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                                placeholder="Ex: Olá! Seja bem-vindo ao evento. Estamos muito felizes com sua participação..."
                                                rows={4}
                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #FCA5A5', outline: 'none', resize: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 6 && (
                                <motion.div key="step6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Aulas do Evento</h2>
                                    <p style={{ color: '#666', marginBottom: '2rem' }}>Selecione quais aulas da sua biblioteca estarão disponíveis no Hub deste evento.</p>

                                    {lessonsLoading ? (
                                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                                            <Loader2 className="animate-spin" size={40} color="#FFD700" />
                                            <p style={{ marginTop: '1rem', color: '#666' }}>Carregando suas aulas...</p>
                                        </div>
                                    ) : allLessons.length === 0 ? (
                                        <div style={{ padding: '3rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '20px', border: '1px dashed #ddd' }}>
                                            <BookOpen size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                                            <p style={{ fontWeight: 600, color: '#333' }}>Nenhuma aula encontrada</p>
                                            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                                                Você precisa criar aulas na seção "Aulas" do seu painel antes de associá-las a um evento.
                                            </p>
                                            <a
                                                href="/dashboard/mentor/lessons"
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
                                    )}
                                </motion.div>
                            )}
                            {step === 7 && (
                                <motion.div key="step7" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Parceiros & Publicação</h2>

                                    <PartnersEditor
                                        partners={partners}
                                        onChange={setPartners}
                                    />

                                    <div style={{ marginTop: '3rem', padding: '1.5rem', background: isPublic ? '#f0fff4' : '#fff5f5', borderRadius: '16px', border: isPublic ? '1px solid #c6f6d5' : '1px solid #fed7d7', transition: 'all 0.3s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ paddingRight: '20px' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: isPublic ? '#22543d' : '#742a2a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                                                    {isPublic ? 'Publicar Evento' : 'Salvar como Rascunho'}
                                                </h3>
                                                <p style={{ fontSize: '0.9rem', color: isPublic ? '#2f855a' : '#9b2c2c', margin: 0, lineHeight: 1.5 }}>
                                                    {isPublic
                                                        ? 'Seu evento ficará visível para todos os inscritos e aparecerá na busca.'
                                                        : 'Seu evento ficará oculto (Inativo). Você poderá publicá-lo depois pelo painel.'}
                                                </p>
                                            </div>
                                            <label className="switch" style={{ transform: 'scale(1.2)' }}>
                                                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mobile Footer Action */}
                        {
                            isMobile && (
                                <div style={{
                                    position: 'fixed',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '1.25rem',
                                    background: '#fff',
                                    borderTop: '1px solid #eee',
                                    zIndex: 2005,
                                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
                                }}>
                                    <button
                                        onClick={step === 7 ? handleSubmit : () => setStep(step + 1)}
                                        disabled={loading}
                                        className="btn-primary"
                                        style={{
                                            width: '100%',
                                            borderRadius: '14px',
                                            padding: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            fontSize: '1rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : (step === 7 ? <><Save size={18} /> {t('events.publish')}</> : t('common.next'))}
                                    </button>
                                </div>
                            )
                        }
                    </div >

                    {/* SUCCESS MODAL OVERLAY */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{ position: 'fixed', inset: 0, zIndex: 3000, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                            >
                                <div style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: 360 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                        style={{ width: '80px', height: '80px', background: '#e6fffa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#319795' }}
                                    >
                                        <CheckCircle size={40} strokeWidth={3} />
                                    </motion.div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#1a202c' }}>Evento Criado! 🎉</h2>
                                    <p style={{ color: '#4a5568', marginBottom: '2.5rem', lineHeight: 1.6, fontSize: '1.1rem' }}>
                                        Seu evento <strong>"{title}"</strong> foi salvo com sucesso. O que você gostaria de fazer agora?
                                    </p>

                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <button
                                            onClick={() => window.open(`/event/${createdEventSlug}`, '_blank')}
                                            style={{ background: '#000', color: '#FFD700', padding: '1.2rem', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)' }}
                                            className="hover-scale"
                                        >
                                            <Globe size={20} /> Ver Página Pública
                                        </button>
                                        <button
                                            onClick={() => window.open(`/hub/${createdEventSlug}`, '_blank')}
                                            style={{ background: '#fff', color: '#1a202c', border: '2px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                            className="hover-scale"
                                        >
                                            <Layout size={20} /> Ver Hub do Inscrito
                                        </button>
                                        <button onClick={onClose} style={{ marginTop: '1rem', color: '#718096', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>
                                            Voltar para o Painel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* PREVIEW MODAL OVERLAY */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.9)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <div style={{ width: '100%', maxWidth: '1000px', height: '90vh', background: '#fff', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#333', fontWeight: 700 }}>
                                            <Eye size={18} /> Pré-visualização do Evento
                                        </h3>
                                        <button onClick={() => setShowPreview(false)} style={{ background: '#f7fafc', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', background: theme.backgroundColor, color: theme.style === 'luxury' && (theme.backgroundColor === '#050505' || theme.backgroundColor === '#000000') ? '#fff' : '#1a202c' }}>
                                        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
                                            {coverImage && (
                                                <div style={{ width: '100%', height: '300px', position: 'relative', borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' }}>
                                                    <Image src={coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} />
                                                </div>
                                            )}

                                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2, color: theme.primaryColor }}>{title || 'Título do seu evento incrível'}</h1>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', opacity: 0.8, fontSize: '1rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📅 {eventDate ? new Date(eventDate).toLocaleDateString() : 'Data a definir'}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📍 {location || 'Local a definir'}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    💰 {paymentConfig.enabled
                                                        ? (paymentConfig.useTieredPricing ? 'Vários Preços' : `${paymentConfig.currency} ${paymentConfig.price}`)
                                                        : 'Gratuito'}
                                                </span>
                                            </div>

                                            <div style={{ lineHeight: 1.8, fontSize: '1.1rem', opacity: 0.9, whiteSpace: 'pre-line' }}>
                                                {description || 'A descrição do seu evento aparecerá aqui...'}
                                            </div>

                                            <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px dashed ' + theme.primaryColor, textAlign: 'center' }}>
                                                <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Área de Inscrição (Simulação)</p>
                                                <button style={{ background: theme.primaryColor, color: (['#FFD700', '#ffffff', '#e2e8f0'].includes(theme.primaryColor)) ? '#000' : '#fff', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, border: 'none', fontSize: '1rem' }}>
                                                    Inscrever-se Agora
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <style jsx>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .no-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}</style>
                </motion.div >
            </div >
        </AnimatePresence >
    );
}
