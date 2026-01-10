/* eslint-disable */
"use client";
// Force refresh

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, MessageCircle, Save, Loader2, Info, Layout, CheckCircle, Palette, DollarSign, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { formService, FormModel } from '@/lib/formService';
import { aiService } from '@/lib/aiService';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    form: FormModel;
}

export default function EditEventModal({ isOpen, onClose, onSuccess, form }: EditEventModalProps) {
    const { t } = useTranslate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const handleAiGenerate = async () => {
        if (!title.trim()) {
            toast.error(t('ai.promptOrient'));
            return;
        }

        setAiLoading(true);
        try {
            const prompt = `Crie uma descrição sofisticada, luxuosa e persuasiva para um evento chamado "${title}". Foque nos benefícios exclusivos para os participantes e use um tom de elite.`;
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

    useEffect(() => {
        if (form) {
            setTitle(form.title || '');
            setDescription(form.description || '');
            setEventDate(form.eventDate ? new Date(form.eventDate).toISOString().substring(0, 10) : '');
            setCapacity(form.capacity ? form.capacity.toString() : '');
            setCoverImage(form.coverImage || '');
            setLocation(form.location || '');
            setOnlineLink(form.onlineLink || '');
            setFields(form.fields || []);
            if (form.whatsappConfig) {
                setWhatsappConfig({
                    phoneNumber: form.whatsappConfig.phoneNumber || '',
                    message: form.whatsappConfig.message || 'Olá! Gostaria de confirmar minha inscrição.',
                    communityUrl: form.whatsappConfig.communityUrl || ''
                });
            }
            if (form.paymentConfig) {
                setPaymentConfig({
                    enabled: form.paymentConfig.enabled || false,
                    price: form.paymentConfig.price || 0,
                    currency: form.paymentConfig.currency || 'MT',
                    mpesaNumber: form.paymentConfig.mpesaNumber || '',
                    emolaNumber: form.paymentConfig.emolaNumber || '',
                    bankAccount: form.paymentConfig.bankAccount || '',
                    accountHolder: form.paymentConfig.accountHolder || '',
                    instructions: form.paymentConfig.instructions || '',
                    requireProof: form.paymentConfig.requireProof || false,
                    stripeEnabled: (form.paymentConfig as any).stripeEnabled || false,
                    stripePriceId: (form.paymentConfig as any).stripePriceId || '',
                    stripeProductId: (form.paymentConfig as any).stripeProductId || ''
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
        }
    }, [form]);

    const handleAddField = () => {
        const newId = (fields.length + 1).toString();
        setFields([...fields, { id: newId, label: '', type: 'text', required: true }]);
    };

    const handleRemoveField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleFieldChange = (id: string, key: string, value: string | boolean | string[]) => {
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
                console.error(err);
                alert(t('events.profile.uploadError'));
            } finally {
                setUploadingImage(false);
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
                capacity: capacity ? parseInt(capacity) : undefined,
                location,
                onlineLink,
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
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '900px',
                        background: '#fff',
                        borderRadius: '30px',
                        overflow: 'hidden',
                        display: 'grid',
                        gridTemplateColumns: '280px 1fr',
                        height: '85vh',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Sidebar */}
                    <div style={{ background: '#000', padding: '3rem 2rem', color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', color: '#FFD700' }}>
                            <Layout size={24} />
                            <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{t('events.editEvent')}</span>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
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
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem' }}>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> {t('events.profile.saveChanges')}</>}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '3rem', overflowY: 'auto', background: '#f8f9fa' }}>
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
                                                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                                    {t('ai.buttonDescribe')}
                                                </motion.button>
                                            </div>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={4}
                                                placeholder={t('events.descriptionPlaceholder')}
                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', resize: 'none' }}
                                            />
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
                                                        <option value="tel">{t('events.typePhone')}</option>
                                                        <option value="select">{t('events.typeSelect')}</option>
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
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Preço do Ingresso</label>
                                                        <input
                                                            type="number"
                                                            value={paymentConfig.price}
                                                            onChange={(e) => setPaymentConfig({ ...paymentConfig, price: parseFloat(e.target.value) })}
                                                            placeholder="Ex: 500"
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Moeda</label>
                                                        <select
                                                            value={paymentConfig.currency}
                                                            onChange={(e) => setPaymentConfig({ ...paymentConfig, currency: e.target.value })}
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', background: '#fff' }}
                                                        >
                                                            <option value="MT">Metical (MT)</option>
                                                            <option value="USD">Dólar (USD)</option>
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
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div >
        </AnimatePresence >
    );
}
