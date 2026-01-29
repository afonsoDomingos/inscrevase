/* eslint-disable */
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, MessageCircle, Save, Loader2, Info, Layout, CheckCircle, Palette, DollarSign, Wand2, Video, Upload, Minus, Coins, Database } from 'lucide-react';
import { toast } from 'sonner';
import { formService, FormModel } from '@/lib/formService';
import { aiService } from '@/lib/aiService';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';

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
    const [coverImage, setCoverImage] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [location, setLocation] = useState('');
    const [onlineLink, setOnlineLink] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventType, setEventType] = useState('modePresencial');
    const [category, setCategory] = useState('Outros');
    const [videoUrl, setVideoUrl] = useState('');
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [fields, setFields] = useState<Field[]>([
        { id: '1', label: t('events.defaultFieldName'), type: 'text', required: true },
        { id: '2', label: t('events.defaultFieldEmail'), type: 'email', required: true }
    ]);

    const [whatsappConfig, setWhatsappConfig] = useState({
        phoneNumber: '',
        message: t('events.whatsappDefaultMessage'),
        communityUrl: ''
    });

    const [welcomeMessage, setWelcomeMessage] = useState('');

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
        stripeProductId: '',
        manualMethods: [] as { label: string; value: string; icon?: string }[]
    });

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
            } catch (err: unknown) {
                console.error("Cover Upload Error:", err);
                toast.error(t('common.error'));
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
                toast.success(t('events.toastSuccessVideo'));
            } catch (err: unknown) {
                console.error(err);
                toast.error(t('events.toastErrorVideo'));
            } finally {
                setUploadingVideo(false);
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

        // Clean up fields (remove temporary id)
        const cleanedFields = fields.map(f => {
            const { id, ...rest } = f;
            return rest;
        });

        setLoading(true);
        try {
            await formService.createForm({
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
                    fontFamily: theme.fontFamily // Use theme.fontFamily directly
                },
                paymentConfig,
                capacity: capacity ? parseInt(capacity) : null,
                location,
                onlineLink,
                eventTime,
                eventType,
                category,
                videoUrl,
                welcomeMessage,
                active: true
            });
            onSuccess();
            onClose();
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
                                    onClick={step === 5 ? handleSubmit : () => setStep(step + 1)}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ width: '100%', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (step === 5 ? <><Save size={18} /> {t('events.publish')}</> : t('common.next'))}
                                </button>
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
                        <button
                            onClick={onClose}
                            style={{ position: 'absolute', top: '2rem', right: '2rem', background: '#eee', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                                                    placeholder={t('events.eventTimePlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
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
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('events.videoConfigured')}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', wordBreak: 'break-all' }}>
                                                        {videoUrl.length > 60 ? videoUrl.substring(0, 60) + '...' : videoUrl}
                                                    </p>
                                                </div>
                                            )}

                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                                {/* Upload Option */}
                                                <label htmlFor="video-upload" style={{
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
                                                    <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} id="video-upload" disabled={uploadingVideo} />
                                                    {uploadingVideo ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={28} color="#22c55e" />
                                                            <span style={{ fontSize: '0.8rem', marginTop: '8px', color: '#22c55e', fontWeight: 600 }}>{t('events.processing')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={28} color="#888" />
                                                            <span style={{ fontSize: '0.85rem', marginTop: '8px', fontWeight: 600 }}>{t('events.uploadVideo')}</span>
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

                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '2rem', alignItems: 'start' }}>
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
                                                {title || t('events.title')}
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
                                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.ticketPrice')}</label>
                                                        <input
                                                            type="number"
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
                                                        {t('events.stripeHeader')}
                                                    </label>

                                                    {paymentConfig.stripeEnabled && (
                                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                                            <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                                                <p style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                                                                    {t('events.stripeHelp')}
                                                                </p>
                                                                <a
                                                                    href="https://dashboard.stripe.com/products"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.5rem',
                                                                        color: '#2563eb',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.85rem',
                                                                        textDecoration: 'none',
                                                                        padding: '0.5rem 1rem',
                                                                        background: '#fff',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid #2563eb',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                                                    </svg>
                                                                    {t('events.stripeLink')}
                                                                </a>
                                                            </div>
                                                            <div>
                                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.8rem' }}>{t('events.stripePriceId')}</label>
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
                        </AnimatePresence>

                        {/* Mobile Footer Action */}
                        {isMobile && (
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
                                    onClick={step === 5 ? handleSubmit : () => setStep(step + 1)}
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
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (step === 5 ? <><Save size={18} /> {t('events.publish')}</> : t('common.next'))}
                                </button>
                            </div>
                        )}
                    </div >

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
