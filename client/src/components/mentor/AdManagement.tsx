"use client";

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Eye, MousePointer2, Trash2, Power, PowerOff, ExternalLink, AlertCircle, Calendar, Package, Briefcase, Zap, MapPin, ArrowLeft, Upload, CreditCard, CheckCircle2, Loader2, TrendingUp, ChevronDown, Activity, Clock, XCircle, Edit2, Share2, MessageCircle, Lock } from 'lucide-react';
import { adService, AdRequestModel } from '@/lib/adService';
import { formService, FormModel } from '@/lib/formService';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslate } from '@/context/LanguageContext';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import PaypalButton from '../common/PaypalButton';

export default function AdManagement() {
    const [ads, setAds] = useState<AdRequestModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [myEvents, setMyEvents] = useState<FormModel[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingAdId, setEditingAdId] = useState<string | null>(null);
    const [ctaType, setCtaType] = useState<'whatsapp' | 'link'>('link');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [whatsappMessage, setWhatsappMessage] = useState('Saudações, vi o seu anúncio no Inscreva-se e gostaria de obter mais informações.');
    const { formatPrice, convertAmount } = useCurrency();
    const { t } = useTranslate();

    const PRICING_PER_WEEK = 5; // USD

    const [form, setForm] = useState<AdRequestModel>({
        title: '',
        description: '',
        category: 'event',
        mediaUrl: '',
        mediaUrls: [],
        mediaType: 'image',
        durationWeeks: 1,
        priceTotal: PRICING_PER_WEEK,
        currency: 'USD',
        paymentMethod: 'manual',
        status: 'pending',
        targetUrl: '',
        productPrice: undefined
    });

    const [paymentProof, setPaymentProof] = useState<string | null>(null);
    const [showOtherCurrencies, setShowOtherCurrencies] = useState(false);

    useEffect(() => {
        const baseUSD = form.durationWeeks * PRICING_PER_WEEK;
        const converted = convertAmount(baseUSD, 'USD', form.currency || 'USD');
        setForm(prev => ({ ...prev, priceTotal: converted }));
    }, [form.durationWeeks, form.currency, convertAmount]);

    useEffect(() => {
        loadAds();
        loadMyEvents();
    }, []);

    const loadMyEvents = async () => {
        try {
            const data = await formService.getMyForms();
            setMyEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        try {
            const data = await adService.getMyAdRequests();
            setAds(data);
        } catch (error) {
            console.error('Error loading ads:', error);
            toast.error('Erro ao carregar seus anúncios');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (adId: string, currentStatus: boolean | undefined) => {
        try {
            await adService.toggleAdStatus(adId, !currentStatus);
            toast.success(`Anúncio ${!currentStatus ? 'ativado' : 'pausado'} com sucesso`);
            loadAds();
        } catch (error) {
            console.error('Error toggling ad status:', error);
            toast.error('Erro ao alterar status do anúncio');
        }
    };

    const handleDeleteAd = async (adId: string) => {
        if (confirm('Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.')) {
            try {
                await adService.deleteAdRequest(adId);
                toast.success('Anúncio excluído com sucesso');
                loadAds();
            } catch (error) {
                console.error('Error deleting ad:', error);
                toast.error('Erro ao excluir anúncio');
            }
        }
    };

    const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const eventId = e.target.value;
        setSelectedEventId(eventId);

        if (eventId && eventId !== 'custom') {
            const event = myEvents.find(ev => ev._id === eventId);
            if (event) {
                setForm(prev => ({
                    ...prev,
                    title: event.title,
                    description: event.description.substring(0, 150),
                    mediaUrl: event.coverImage || '',
                    targetUrl: `${window.location.origin}/f/${event.slug}`
                }));
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const isVideo = files[0].type.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';

        if (form.category === 'product' && !isVideo) {
            const currentCount = form.mediaUrls?.length || 0;
            const remaining = 5 - currentCount;
            const toProcess = files.slice(0, remaining);

            if (toProcess.length === 0) {
                toast.error('Limite máximo de 5 imagens atingido.');
                return;
            }

            setUploading(true);
            try {
                const urls = await Promise.all(toProcess.map(f => formService.uploadFile(f, 'ads')));
                setForm(prev => {
                    const newUrls = [...(prev.mediaUrls || []), ...urls];
                    return {
                        ...prev,
                        mediaUrls: newUrls,
                        // Always keep the first one as main mediaUrl just for fallback/main display
                        mediaUrl: newUrls[0] || '',
                        mediaType
                    };
                });
                toast.success(`${urls.length} imagem(ns) enviada(s)`);
            } catch (err: unknown) {
                const error = err as Error;
                toast.error(error.message || 'Erro ao subir imagens');
            } finally {
                setUploading(false);
            }
        } else {
            // Standard single file upload (or if video is selected even for product)
            const file = files[0];
            setUploading(true);
            try {
                const url = await formService.uploadFile(file, 'ads');
                setForm(prev => ({
                    ...prev,
                    mediaUrl: url,
                    mediaUrls: [url],
                    mediaType
                }));
                toast.success('Arquivo enviado com sucesso');
            } catch (err: unknown) {
                const error = err as Error;
                toast.error(error.message || 'Erro ao subir arquivo');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await formService.uploadFile(file, 'payments');
            setPaymentProof(url);
            setForm(prev => ({ ...prev, paymentProofUrl: url }));
            toast.success('Comprovativo anexado');
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Erro ao subir comprovativo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitAd = async () => {
        setIsSubmitting(true);
        try {
            const formData = { ...form };
            if (ctaType === 'whatsapp' && whatsappNumber) {
                const cleanPhone = whatsappNumber.replace(/\D/g, '');
                formData.targetUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
            }

            if (isEditing && editingAdId) {
                await adService.updateAdRequest(editingAdId, formData);
                toast.success('Anúncio atualizado com sucesso!');
            } else {
                if (formData.paymentMethod === 'stripe') {
                    const checkout = await adService.createAdCheckout(formData);
                    if (checkout.url) {
                        window.location.href = checkout.url;
                        return;
                    }
                }
                await adService.submitAdRequest(formData);
                toast.success('Pedido de anúncio enviado com sucesso!');
            }
            setShowCreateForm(false);
            setIsEditing(false);
            setEditingAdId(null);
            setStep(1);
            loadAds();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Erro ao enviar pedido');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Megaphone size={40} color="#FFD700" />
                </motion.div>
            </div>
        );
    }

    if (showCreateForm) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.1, background: '#fff', color: '#000' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowCreateForm(false)}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '15px',
                                border: '1px solid rgba(0,0,0,0.05)',
                                background: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                        >
                            <ArrowLeft size={24} />
                        </motion.button>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', margin: 0 }}>{isEditing ? 'Editar Anúncio' : 'Solicitar Novo Destaque'}</h2>
                            <p style={{ color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>{isEditing ? 'Atualize as informações do seu anúncio' : 'Siga os passos para colocar sua marca em evidência'}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
                    {/* Form Part */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            background: '#0f172a',
                            padding: '3rem',
                            borderRadius: '32px',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {/* Stepper */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                                {[1, 2, 3].map((s) => (
                                    <div key={s} style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem'
                                    }}>
                                        <div style={{
                                            height: '4px',
                                            borderRadius: '2px',
                                            background: s <= step ? '#FFD700' : 'rgba(255,255,255,0.1)',
                                            transition: 'all 0.5s'
                                        }} />
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            color: s <= step ? '#FFD700' : 'rgba(255,255,255,0.3)',
                                            letterSpacing: '1px'
                                        }}>
                                            Passo {s}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>O que deseja promover?</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                                {[
                                                    { id: 'event', label: 'Evento', icon: Calendar },
                                                    { id: 'service', label: 'Serviço', icon: Briefcase },
                                                    { id: 'product', label: 'Produto', icon: Package }
                                                ].map((cat) => (
                                                    <motion.button
                                                        key={cat.id}
                                                        whileHover={{ scale: 1.02, background: 'rgba(255,215,0,0.1)' }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setForm({ ...form, category: cat.id as AdRequestModel['category'] })}
                                                        style={{
                                                            padding: '2rem 1rem',
                                                            borderRadius: '24px',
                                                            border: form.category === cat.id ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)',
                                                            background: form.category === cat.id ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255,255,255,0.02)',
                                                            color: form.category === cat.id ? '#FFD700' : 'rgba(255,255,255,0.4)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            transition: 'all 0.3s'
                                                        }}
                                                    >
                                                        <cat.icon size={32} />
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{cat.label}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {form.category === 'event' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Selecione o Evento</label>
                                                <select
                                                    value={selectedEventId}
                                                    onChange={handleEventSelect}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none', fontWeight: 600, fontSize: '0.95rem' }}
                                                >
                                                    <option value="">-- Escolher um evento meu --</option>
                                                    {myEvents.map(ev => (
                                                        <option key={ev._id} value={ev._id}>{ev.title}</option>
                                                    ))}
                                                    <option value="custom">-- Criar anúncio personalizado --</option>
                                                </select>
                                            </div>
                                        )}

                                        {(form.category !== 'event' || selectedEventId === 'custom') && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Título do Anúncio</label>
                                                    <input
                                                        type="text"
                                                        value={form.title}
                                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                        placeholder="Ex: Masterclass Premium"
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none', fontWeight: 600, fontSize: '0.95rem' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Descrição</label>
                                                    <textarea
                                                        value={form.description}
                                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                        rows={3}
                                                        placeholder="Breve descrição para atrair cliques..."
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                                                    />
                                                </div>

                                                {form.category === 'product' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Preço do Produto (Opcional)</label>
                                                        <input
                                                            type="number"
                                                            value={form.productPrice || ''}
                                                            onChange={(e) => setForm({ ...form, productPrice: e.target.value ? Number(e.target.value) : undefined })}
                                                            placeholder="Ex: 1500"
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none', fontWeight: 600, fontSize: '0.95rem' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Tipo de Link (Call to Action)</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => setCtaType('link')}
                                                        style={{ padding: '0.75rem', borderRadius: '12px', border: ctaType === 'link' ? '2px solid #FFD700' : '1px solid #ddd', background: ctaType === 'link' ? 'rgba(255, 215, 0, 0.05)' : '#fff', color: ctaType === 'link' ? '#000' : '#666', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                                    >
                                                        <ExternalLink size={18} /> Link Personalizado
                                                    </button>
                                                    <button
                                                        onClick={() => setCtaType('whatsapp')}
                                                        style={{ padding: '0.75rem', borderRadius: '12px', border: ctaType === 'whatsapp' ? '2px solid #25D366' : '1px solid #ddd', background: ctaType === 'whatsapp' ? 'rgba(37, 211, 102, 0.05)' : '#fff', color: ctaType === 'whatsapp' ? '#128C7E' : '#666', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                                    >
                                                        <MessageCircle size={18} /> WhatsApp
                                                    </button>
                                                </div>
                                            </div>

                                            {ctaType === 'link' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>URL de Destino</label>
                                                    <input
                                                        type="url"
                                                        value={form.targetUrl || ''}
                                                        onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                                                        placeholder="Ex: https://meusite.com/produto"
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none', fontWeight: 600, fontSize: '0.95rem' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(37, 211, 102, 0.05)', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#128C7E', letterSpacing: '0.5px' }}>Número do WhatsApp</label>
                                                        <input
                                                            type="text"
                                                            value={whatsappNumber}
                                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                                            placeholder="Ex: +258 84 000 0000"
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #a7f3d0', background: '#fff', outline: 'none', fontWeight: 600, fontSize: '0.95rem' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#128C7E', letterSpacing: '0.5px' }}>Mensagem Inicial Automática</label>
                                                        <textarea
                                                            value={whatsappMessage}
                                                            onChange={(e) => setWhatsappMessage(e.target.value)}
                                                            rows={2}
                                                            placeholder="Olá, vi seu anúncio no Inscreva-se..."
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #a7f3d0', background: '#fff', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={!form.title}
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                background: '#000',
                                                color: '#fff',
                                                borderRadius: '12px',
                                                border: 'none',
                                                fontWeight: 800,
                                                cursor: !form.title ? 'not-allowed' : 'pointer',
                                                opacity: !form.title ? 0.5 : 1,
                                                marginTop: '1rem'
                                            }}
                                        >
                                            Continuar
                                        </button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Visual e Mídia</label>
                                            <div style={{
                                                position: 'relative',
                                                border: '2px dashed #ddd',
                                                borderRadius: '24px',
                                                padding: form.mediaUrls && form.mediaUrls.length > 0 ? '1rem' : '2rem',
                                                textAlign: 'center',
                                                background: '#f9f9f9',
                                                transition: 'all 0.2s',

                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                            >
                                                {form.mediaUrls && form.mediaUrls.length > 0 ? (
                                                    <div style={{ display: 'grid', gridTemplateColumns: form.mediaUrls.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                                        {form.mediaUrls.map((url, idx) => (
                                                            <div key={idx} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                                                {form.mediaType === 'video' ? (
                                                                    <video src={url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <Image src={url} alt={`Preview ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newUrls = (form.mediaUrls || []).filter((_, i) => i !== idx);
                                                                        setForm({
                                                                            ...form,
                                                                            mediaUrls: newUrls,
                                                                            mediaUrl: newUrls[0] || ''
                                                                        });
                                                                    }}
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '0.5rem',
                                                                        right: '0.5rem',
                                                                        background: 'rgba(0,0,0,0.6)',
                                                                        backdropFilter: 'blur(4px)',
                                                                        color: '#fff',
                                                                        padding: '0.4rem',
                                                                        borderRadius: '50%',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        zIndex: 5
                                                                    }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {form.category === 'product' && form.mediaType !== 'video' && form.mediaUrls.length < 5 && (
                                                            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,215,0,0.1)', border: '2px dashed #FFD700', borderRadius: '16px', aspectRatio: '16/9', color: '#B8860B', fontWeight: 700, fontSize: '0.85rem' }}>
                                                                <Plus size={24} style={{ marginBottom: '0.5rem' }} />
                                                                Adicionar
                                                                <input
                                                                    type="file"
                                                                    onChange={handleFileUpload}
                                                                    style={{ display: 'none' }}
                                                                    accept="image/*"
                                                                    multiple
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Upload size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                                                        <p style={{ fontWeight: 700, color: '#666', marginBottom: '0.25rem' }}>Upload de Imagem ou Vídeo</p>
                                                        <p style={{ fontSize: '0.8rem', color: '#999' }}>
                                                            {form.category === 'product' ? 'Arraste ou selecione até 5 imagens, ou 1 vídeo' : 'Arraste aqui ou clique para selecionar (1 Mídia)'}
                                                        </p>
                                                        <label style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
                                                            <input
                                                                type="file"
                                                                onChange={handleFileUpload}
                                                                style={{ display: 'none' }}
                                                                accept="image/*,video/*"
                                                                multiple={form.category === 'product'}
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                                {uploading && (
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', zIndex: 10 }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                                                <Loader2 size={32} color="#FFD700" />
                                                            </motion.div>
                                                            <p style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Subindo...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {!isEditing && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Moeda de Pagamento</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                                    {['USD', 'EUR'].map(curr => (
                                                        <button
                                                            key={curr}
                                                            type="button"
                                                            onClick={() => {
                                                                setForm({ ...form, currency: curr });
                                                                setShowOtherCurrencies(false);
                                                            }}
                                                            style={{
                                                                padding: '0.75rem',
                                                                borderRadius: '12px',
                                                                border: (form.currency === curr && !showOtherCurrencies) ? '2px solid #FFD700' : '2px solid #eee',
                                                                background: (form.currency === curr && !showOtherCurrencies) ? '#FFD700' : '#fff',
                                                                color: (form.currency === curr && !showOtherCurrencies) ? '#000' : '#666',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                        >
                                                            {curr}
                                                        </button>
                                                    ))}
                                                    <div style={{ position: 'relative' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowOtherCurrencies(!showOtherCurrencies)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.75rem',
                                                                borderRadius: '12px',
                                                                border: (['USD', 'EUR'].includes(form.currency || '') && !showOtherCurrencies) ? '2px solid #eee' : '2px solid #FFD700',
                                                                background: (['USD', 'EUR'].includes(form.currency || '') && !showOtherCurrencies) ? '#fff' : '#FFD700',
                                                                color: (['USD', 'EUR'].includes(form.currency || '') && !showOtherCurrencies) ? '#666' : '#000',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                        >
                                                            {['USD', 'EUR'].includes(form.currency || '') ? 'Outras' : form.currency}
                                                            <ChevronDown size={14} />
                                                        </button>

                                                        {showOtherCurrencies && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '100%',
                                                                right: 0,
                                                                left: 0,
                                                                background: '#fff',
                                                                border: '1px solid #eee',
                                                                borderRadius: '12px',
                                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                                                zIndex: 50,
                                                                marginTop: '5px',
                                                                padding: '4px'
                                                            }}>
                                                                {['MZN', 'AOA', 'CVE', 'XOF'].map(curr => (
                                                                    <button
                                                                        key={curr}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setForm({ ...form, currency: curr });
                                                                            setShowOtherCurrencies(false);
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '0.6rem 1rem',
                                                                            border: 'none',
                                                                            background: form.currency === curr ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                                                                            borderRadius: '8px',
                                                                            textAlign: 'left',
                                                                            cursor: 'pointer',
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: 700,
                                                                            color: form.currency === curr ? '#B8860B' : '#666'
                                                                        }}
                                                                    >
                                                                        {curr}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!isEditing && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Duração do Destaque</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                                    {[1, 2, 3, 4].map(w => (
                                                        <button
                                                            key={w}
                                                            onClick={() => setForm({ ...form, durationWeeks: w })}
                                                            style={{
                                                                padding: '0.75rem',
                                                                borderRadius: '12px',
                                                                border: form.durationWeeks === w ? '2px solid #FFD700' : '2px solid #eee',
                                                                background: form.durationWeeks === w ? '#FFD700' : '#fff',
                                                                color: form.durationWeeks === w ? '#000' : '#999',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {w}W
                                                        </button>
                                                    ))}
                                                </div>
                                                <div style={{
                                                    padding: '1rem',
                                                    background: '#FFF8E1',
                                                    border: '1px solid #FFECB3',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    color: '#B8860B'
                                                }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Investimento Total</span>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{formatPrice(form.priceTotal, form.currency, form.currency)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button
                                                onClick={() => setStep(1)}
                                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: '#f0f0f0', fontWeight: 700, cursor: 'pointer', color: '#666' }}>
                                                Voltar
                                            </button>
                                            <button
                                                onClick={isEditing ? handleSubmitAd : () => setStep(3)}
                                                disabled={!form.mediaUrl || isSubmitting}
                                                style={{
                                                    flex: 2,
                                                    padding: '1rem',
                                                    background: '#000',
                                                    color: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    fontWeight: 800,
                                                    cursor: (!form.mediaUrl || isSubmitting) ? 'not-allowed' : 'pointer',
                                                    opacity: (!form.mediaUrl || isSubmitting) ? 0.5 : 1
                                                }}
                                            >
                                                {isEditing ? (isSubmitting ? 'Salvando...' : 'Salvar Alterações') : 'Ir para Pagamento'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && !isEditing && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Método de Pagamento</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                                {/* PayPal (New & Recommended) */}
                                                <div style={{ 
                                                    background: '#FFC439', 
                                                    borderRadius: '20px', 
                                                    height: '110px', 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    overflow: 'hidden',
                                                    border: form.paymentMethod === 'paypal' ? '2px solid #003087' : '2px solid transparent',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#003087"><path d="M20.067 8.478c.492.88.556 2.014.303 3.274-.744 3.713-3.005 6.045-7.054 6.045h-1.6c-.466 0-.846.347-.936.802l-.653 3.274c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l2.454-9.743c.09-.455.47-.802.936-.802h3.2c1.783 0 3.264-.09 4.316-.395.53-.151.782-.26 1.05-.53.284-.287.48-.686.586-1.124.162-.676.02-1.28-.432-1.74-.41-.424-1.07-.63-1.964-.63h-5.066c-.466 0-.846.347-.936.802l-1.306 6.548c-.03.146-.157.247-.303.247h-3.32c-.244 0-.414-.236-.356-.474l1.636-6.548c.09-.455.49-.802.956-.802h6.14c1.9 0 3.4.45 4.31 1.34s1.21 2.09.82 3.65c-.09.36-.21.69-.37 1zm-1.12-5.46c-.52-.51-1.34-.78-2.45-.78h-6.14c-.97 0-1.83.67-2.02 1.62l-2.03 10.15c-.06.31.18.61.5.61h3.32c.3 0 .58-.22.63-.52l.65-3.27c.09-.46.49-.81.96-.81h1.59c3.9 0 6.07-2.12 6.81-5.83.43-2.14.07-3.7-.62-4.47z" /></svg>
                                                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#003087', marginTop: '5px' }}>PayPal</span>
                                                    </div>
                                                    <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
                                                        <PaypalButton 
                                                            type="ad_checkout" 
                                                            adData={form}
                                                            currency="USD"
                                                            onSuccess={() => {
                                                                toast.success("Anúncio criado com sucesso!");
                                                                setShowCreateForm(false);
                                                                setStep(1);
                                                                loadRequests();
                                                            }} 
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toast.info("Checkout Global via Stripe em manutenção regulatória. Por favor, utilize o PayPal ou Método Manual.")}
                                                    style={{
                                                        padding: '1.2rem',
                                                        borderRadius: '20px',
                                                        border: '2px dashed #eee',
                                                        background: '#f8fafc',
                                                        color: '#94a3b8',
                                                        cursor: 'help',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        transition: 'all 0.2s',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.5 }}>
                                                        <Lock size={12} />
                                                    </div>
                                                    <CreditCard size={24} opacity={0.5} />
                                                    <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>Stripe (Lock)</span>
                                                </button>

                                                <button
                                                    onClick={() => setForm({ ...form, paymentMethod: 'manual' })}
                                                    style={{
                                                        padding: '1.2rem',
                                                        borderRadius: '20px',
                                                        border: form.paymentMethod === 'manual' ? '2px solid #FFD700' : '2px solid #eee',
                                                        background: form.paymentMethod === 'manual' ? 'rgba(255, 215, 0, 0.05)' : '#fff',
                                                        color: form.paymentMethod === 'manual' ? '#B8860B' : '#999',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <Megaphone size={24} />
                                                    <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>Manual (NIB)</span>
                                                </button>
                                            </div>
                                        </div>

                                        {form.paymentMethod === 'manual' && (
                                            <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 900, color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Contas para Depósito</p>
                                                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, color: '#444' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>M-Pesa:</span> <span>84 123 4567</span></div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>E-Mola:</span> <span>86 123 4567</span></div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>NIB:</span> <span>123456789 (BCI)</span></div>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    border: '2px dashed #ccc',
                                                    borderRadius: '12px',
                                                    padding: '1rem',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    background: '#fff',
                                                    marginTop: '0.5rem'
                                                }}>
                                                    {paymentProof ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'green', fontWeight: 800 }}>
                                                            <CheckCircle2 size={20} /> Comprovativo Anexado
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload size={24} color="#ccc" style={{ marginBottom: '0.5rem' }} />
                                                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#999' }}>Anexar Comprovativo</p>
                                                            <input type="file" onChange={handleProofUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button
                                                onClick={() => setStep(2)}
                                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: '#f0f0f0', fontWeight: 700, cursor: 'pointer', color: '#666' }}>
                                                Voltar
                                            </button>
                                            <button
                                                onClick={handleSubmitAd}
                                                disabled={isSubmitting || (form.paymentMethod === 'manual' && !paymentProof)}
                                                style={{
                                                    flex: 2,
                                                    padding: '1rem',
                                                    background: 'var(--gold-gradient)',
                                                    color: '#000',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    fontWeight: 900,
                                                    cursor: (isSubmitting || (form.paymentMethod === 'manual' && !paymentProof)) ? 'not-allowed' : 'pointer',
                                                    opacity: (isSubmitting || (form.paymentMethod === 'manual' && !paymentProof)) ? 0.5 : 1,
                                                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                                                }}
                                            >
                                                {isSubmitting ? 'Processando...' : `Pagar ${formatPrice(form.priceTotal, form.currency, form.currency)}`}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Preview Part */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#999', textAlign: 'center', letterSpacing: '0.5px' }}>Pré-visualização</label>
                        <div style={{
                            background: '#fff',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            position: 'sticky',
                            top: '2rem'
                        }}>
                            <div style={{
                                position: 'relative',
                                aspectRatio: '4/5',
                                background: form.mediaUrl ? '#f0f0f0' : 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {form.mediaUrls && form.mediaUrls.length > 0 ? (
                                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                        {form.mediaType === 'video' ? (
                                            <video src={form.mediaUrls[0]} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Image src={form.mediaUrls[0]} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                        )}
                                        {form.mediaUrls.length > 1 && (
                                            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>
                                                1 / {form.mediaUrls.length}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative', width: '60%', height: '60%', opacity: 0.1, filter: 'grayscale(1)' }}>
                                        <Image src="/logo.png" alt="Logo" fill style={{ objectFit: 'contain' }} />
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    left: '1rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    backdropFilter: 'blur(4px)',
                                    color: '#FFD700',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                }}>
                                    <Zap size={12} fill="#FFD700" /> {form.category || 'Patrocinado'}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#000', lineHeight: 1.2, fontFamily: 'var(--font-playfair)' }}>
                                    {form.title || 'Título do seu anúncio premium'}
                                </h4>
                                {form.productPrice && (
                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D4AF37', margin: '-0.5rem 0' }}>
                                        {formatPrice(form.productPrice, 'MZN', 'MZN')}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>
                                        <Calendar size={14} color="#FFD700" /> Hoje
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>
                                        <MapPin size={14} color="#FFD700" /> Global
                                    </div>
                                </div>
                                <div style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: '#000',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    fontWeight: 900,
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Saiba Mais
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: '#fff',
                    padding: '3rem',
                    borderRadius: '32px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #f1f5f9',
                    marginBottom: '2.5rem'
                }}
            >
                {/* Decorative background glass elements */}
                {/* Decorative background glass elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', borderRadius: '50%' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '20px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                            border: '1px solid #f1f5f9'
                        }}>
                            <Megaphone className="text-yellow-500" size={36} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-1.5px', fontFamily: 'var(--font-playfair)' }}>
                                {t('ads.myAds')} <span style={{ color: '#D4AF37' }}>{t('ads.myAdsHighlight')}</span>
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', margin: '6px 0 0', fontWeight: 500 }}>
                                <Zap size={14} fill="#FFD700" color="#FFD700" /> {t('ads.subtitle')}
                            </div>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(255, 215, 0, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setForm({
                                title: '',
                                description: '',
                                category: 'event',
                                mediaUrl: '',
                                mediaUrls: [],
                                mediaType: 'image',
                                durationWeeks: 1,
                                priceTotal: PRICING_PER_WEEK,
                                currency: 'USD',
                                paymentMethod: 'manual',
                                status: 'pending',
                                targetUrl: '',
                                productPrice: undefined
                            });
                            setEditingAdId(null);
                            setIsEditing(false);
                            setCtaType('link');
                            setWhatsappNumber('');
                            setWhatsappMessage('Saudações, vi o seu anúncio no Inscreva-se e gostaria de obter mais informações.');
                            setStep(1);
                            setShowCreateForm(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            padding: '1rem 2rem',
                            borderRadius: '16px',
                            fontWeight: 900,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            boxShadow: '0 8px 20px rgba(212, 175, 55, 0.2)'
                        }}
                    >
                        <Plus size={22} strokeWidth={3} /> {t('ads.createNew')}
                    </motion.button>
                </div>

                <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        whileHover={{ y: -5 }}
                        style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <Megaphone size={22} color="#64748b" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>{t('ads.totalCampaigns')}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{ads.length}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '24px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <Activity size={22} color="#16a34a" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>{t('ads.activeNow')}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d' }}>{ads.filter(a => a.isActive && a.status === 'approved').length}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <Clock size={22} color="#2563eb" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>{t('ads.awaitingVerification')}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1d4ed8' }}>{ads.filter(a => a.status === 'pending').length}</div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {ads.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#fff',
                        padding: '6rem 2rem',
                        borderRadius: '32px',
                        border: '2px dashed #f1f5f9',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                    }}
                >
                    <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'rgba(255, 215, 0, 0.05)',
                        borderRadius: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem',
                        position: 'relative'
                    }}>
                        <Megaphone size={60} color="#D4AF37" strokeWidth={1.5} />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            style={{ position: 'absolute', top: -10, right: -10, width: '30px', height: '30px', background: 'var(--gold-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '12px', fontWeight: 900 }}
                        >
                            <Plus size={16} />
                        </motion.div>
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', fontFamily: 'var(--font-playfair)', color: '#0f172a' }}>{t('ads.emptyTitle')}</h3>
                    <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500 }}>
                        {t('ads.emptyDesc')}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateForm(true)}
                        style={{
                            background: '#0f172a',
                            color: '#fff',
                            padding: '1.2rem 3rem',
                            borderRadius: '16px',
                            fontWeight: 900,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        {t('ads.createFirst')} <Zap size={18} fill="#FFD700" color="#FFD700" />
                    </motion.button>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {ads.map((ad, index) => (
                        <motion.div
                            key={ad._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, type: 'spring', stiffness: 50 }}
                            style={{
                                background: '#fff',
                                borderRadius: '32px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative'
                            }}
                        >
                            <div style={{ position: 'relative', height: '240px', background: '#f8fafc', overflow: 'hidden' }}>
                                {ad.mediaUrl ? (
                                    ad.mediaType === 'video' ? (
                                        <video
                                            src={ad.mediaUrl}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            autoPlay muted loop
                                        />
                                    ) : (
                                        <Image
                                            src={ad.mediaUrl}
                                            alt={ad.title}
                                            fill
                                            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                        />
                                    )
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                        <Megaphone size={60} opacity={0.2} />
                                    </div>
                                )}

                                <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', zIndex: 10 }}>
                                    <div style={{
                                        padding: '6px 14px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900,
                                        textTransform: 'uppercase', backdropFilter: 'blur(10px)', color: '#fff',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                        background: ad.status === 'approved' ? 'rgba(34, 197, 94, 0.9)' :
                                            ad.status === 'pending' ? 'rgba(59, 130, 246, 0.9)' :
                                                ad.status === 'suspended' ? 'rgba(217, 119, 6, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {ad.status === 'approved' ? <><CheckCircle2 size={12} /> {t('ads.statusApproved')}</> :
                                            ad.status === 'pending' ? <><Clock size={12} /> {t('ads.statusPending')}</> :
                                                ad.status === 'suspended' ? <><AlertCircle size={12} /> {t('ads.statusSuspended')}</> : <><XCircle size={12} /> {t('ads.statusRejected')}</>}
                                    </div>

                                    {ad.status === 'approved' && (
                                        <div style={{
                                            padding: '6px 14px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900,
                                            textTransform: 'uppercase', color: '#000', backdropFilter: 'blur(10px)',
                                            background: ad.isActive ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 255, 255, 0.8)',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            border: '1px solid rgba(0,0,0,0.05)'
                                        }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ad.isActive ? '#000' : '#888' }} />
                                            {ad.isActive ? t('ads.active') : t('ads.paused')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                                <div style={{ minHeight: '80px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                            {ad.category}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.2 }}>{ad.title}</h3>
                                    {ad.productPrice && (
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37', marginBottom: '8px' }}>
                                            {formatPrice(ad.productPrice, 'MZN', 'MZN')}
                                        </div>
                                    )}
                                    <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {ad.description}
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '0.6rem 0.4rem', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#64748b', fontWeight: 800, fontSize: '0.5rem', textTransform: 'uppercase' }}>
                                            <Eye size={10} strokeWidth={2.5} /> Viz.
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{ad.views || 0}</div>
                                    </div>
                                    <div style={{ background: '#fffbeb', padding: '0.6rem 0.4rem', borderRadius: '14px', border: '1px solid #fef3c7', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ca8a04', fontWeight: 800, fontSize: '0.5rem', textTransform: 'uppercase' }}>
                                            <MousePointer2 size={10} strokeWidth={2.5} /> Cliques
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#854d0e' }}>{ad.clicks || 0}</div>
                                    </div>
                                    <div style={{ background: '#f0fdf4', padding: '0.6rem 0.4rem', borderRadius: '14px', border: '1px solid #dcfce7', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#16a34a', fontWeight: 800, fontSize: '0.5rem', textTransform: 'uppercase' }}>
                                            <TrendingUp size={10} strokeWidth={2.5} /> CTR
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#14532d' }}>
                                            {ad.views && ad.views > 0 ? ((ad.clicks || 0) / ad.views * 100).toFixed(1) : '0.0'}%
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleToggleStatus(ad._id!, ad.isActive)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '14px',
                                            border: 'none',
                                            background: ad.isActive ? '#0f172a' : 'var(--gold-gradient)',
                                            color: ad.isActive ? '#fff' : '#000',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            fontSize: '0.75rem',
                                            boxShadow: ad.isActive ? 'none' : '0 4px 12px rgba(212, 175, 55, 0.2)'
                                        }}
                                    >
                                        {ad.isActive ? <><PowerOff size={14} /> {t('ads.pause')}</> : <><Power size={14} /> {t('ads.activate')}</>}
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => ad._id && handleDeleteAd(ad._id)}
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '14px',
                                            border: '1px solid #fee2e2',
                                            background: '#fff',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                        title="Excluir"
                                    >
                                        <Trash2 size={20} />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setForm(ad);
                                            setEditingAdId(ad._id!);
                                            setIsEditing(true);

                                            // Handle CTA Type and WhatsApp parsing
                                            if (ad.targetUrl && ad.targetUrl.includes('wa.me/')) {
                                                setCtaType('whatsapp');
                                                const match = ad.targetUrl.match(/wa\.me\/(\d+)/);
                                                setWhatsappNumber(match ? match[1] : '');
                                                const textMatch = ad.targetUrl.match(/text=([^&]+)/);
                                                if (textMatch) {
                                                    setWhatsappMessage(decodeURIComponent(textMatch[1]));
                                                } else {
                                                    setWhatsappMessage('Saudações, vi o seu anúncio no Inscreva-se e gostaria de obter mais informações.');
                                                }
                                            } else {
                                                setCtaType('link');
                                                setWhatsappNumber('');
                                                setWhatsappMessage('Saudações, vi o seu anúncio no Inscreva-se e gostaria de obter mais informações.');
                                            }

                                            setStep(1);
                                            setShowCreateForm(true);
                                        }}
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '14px',
                                            border: '1px solid #e2e8f0',
                                            background: '#fff',
                                            color: '#3b82f6',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                        title="Editar"
                                    >
                                        <Edit2 size={20} />
                                    </motion.button>

                                    {ad.targetUrl && (
                                        <motion.a
                                            whileTap={{ scale: 0.95 }}
                                            href={ad.targetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '14px',
                                                border: '1px solid #e2e8f0',
                                                background: '#fff',
                                                color: '#475569',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                                            title="Ver Link"
                                        >
                                            <ExternalLink size={18} />
                                        </motion.a>
                                    )}

                                    {ad.targetUrl && (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                const publicLink = `${window.location.origin}/anuncio/${ad._id}`;
                                                navigator.clipboard.writeText(publicLink);
                                                toast.success('Link do anúncio copiado para partilhar!');
                                            }}
                                            style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '14px',
                                                border: '1px solid #e2e8f0',
                                                background: '#fff',
                                                color: '#10b981',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = '#ecfdf5'}
                                            onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                            title="Copiar Link para Partilhar"
                                        >
                                            <Share2 size={18} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Hint Box */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    background: '#EFF6FF',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    gap: '1rem',
                    color: '#1E40AF'
                }}
            >
                <AlertCircle size={24} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <strong style={{ fontWeight: 900, display: 'block', marginBottom: '0.25rem' }}>💡 Dica Importante:</strong>
                    Anúncios marcados como <strong>pausados</strong> não aparecem nas seções patrocinadas.
                    Anúncios <strong>pendentes</strong> aguardam aprovação da nossa equipe de moderacão.
                    Anúncios <strong>suspensos</strong> foram desativados pela moderação por violação de termos.
                </div>
            </motion.div>
        </div>
    );
}
