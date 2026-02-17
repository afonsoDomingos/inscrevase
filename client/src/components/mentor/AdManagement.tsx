"use client";

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Clock, Eye, MousePointer2, Trash2, Power, PowerOff, ExternalLink, AlertCircle, Calendar, Package, Briefcase, Zap, MapPin, ArrowLeft, Upload, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { adService, AdRequestModel } from '@/lib/adService';
import { formService, FormModel } from '@/lib/formService';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdManagement() {
    const [ads, setAds] = useState<AdRequestModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [myEvents, setMyEvents] = useState<FormModel[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const { formatPrice } = useCurrency();

    const PRICING_PER_WEEK = 5; // USD

    const [form, setForm] = useState<AdRequestModel>({
        title: '',
        description: '',
        category: 'event',
        mediaUrl: '',
        mediaType: 'image',
        durationWeeks: 1,
        priceTotal: PRICING_PER_WEEK,
        paymentMethod: 'manual',
        status: 'pending',
        targetUrl: ''
    });

    const [paymentProof, setPaymentProof] = useState<string | null>(null);

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
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';

        setUploading(true);
        try {
            const url = await formService.uploadFile(file, 'ads');
            setForm(prev => ({ ...prev, mediaUrl: url, mediaType }));
            toast.success('Arquivo enviado com sucesso');
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Erro ao subir arquivo');
        } finally {
            setUploading(false);
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
            if (form.paymentMethod === 'stripe') {
                const checkout = await adService.createAdCheckout(form);
                if (checkout.url) {
                    window.location.href = checkout.url;
                    return;
                }
            }

            await adService.submitAdRequest(form);
            toast.success('Pedido de anúncio enviado com sucesso!');
            setShowCreateForm(false);
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => setShowCreateForm(false)}
                        style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: '#f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-playfair)' }}>Solicitar Novo Destaque</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* Form Part */}
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="luxury-card" style={{ background: '#fff', padding: '2rem', borderRadius: '24px', position: 'relative' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                                {[1, 2, 3].map((s) => (
                                    <div key={s} style={{
                                        flex: 1,
                                        height: '6px',
                                        borderRadius: '3px',
                                        background: s <= step ? 'var(--gold-gradient)' : '#f0f0f0',
                                        transition: 'all 0.5s'
                                    }} />
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>O que deseja promover?</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                                {[
                                                    { id: 'event', label: 'Evento', icon: Calendar },
                                                    { id: 'service', label: 'Serviço', icon: Briefcase },
                                                    { id: 'product', label: 'Produto', icon: Package }
                                                ].map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setForm({ ...form, category: cat.id as AdRequestModel['category'] })}
                                                        style={{
                                                            padding: '1.5rem 1rem',
                                                            borderRadius: '16px',
                                                            border: form.category === cat.id ? '2px solid #FFD700' : '2px solid #f0f0f0',
                                                            background: form.category === cat.id ? 'rgba(255, 215, 0, 0.05)' : '#fff',
                                                            color: form.category === cat.id ? '#B8860B' : '#999',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <cat.icon size={24} />
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{cat.label}</span>
                                                    </button>
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
                                            </div>
                                        )}

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
                                                padding: '2rem',
                                                textAlign: 'center',
                                                background: '#f9f9f9',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                                            >
                                                {form.mediaUrl ? (
                                                    <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                                        {form.mediaType === 'video' ? (
                                                            <video src={form.mediaUrl} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <Image src={form.mediaUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setForm({ ...form, mediaUrl: '' }); }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '1rem',
                                                                right: '1rem',
                                                                background: 'rgba(0,0,0,0.6)',
                                                                backdropFilter: 'blur(4px)',
                                                                color: '#fff',
                                                                padding: '0.5rem',
                                                                borderRadius: '50%',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Upload size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                                                        <p style={{ fontWeight: 700, color: '#666', marginBottom: '0.25rem' }}>Upload de Imagem ou Vídeo</p>
                                                        <p style={{ fontSize: '0.8rem', color: '#999' }}>Arraste aqui ou clique para selecionar</p>
                                                        <input
                                                            type="file"
                                                            onChange={handleFileUpload}
                                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                            accept="image/*,video/*"
                                                        />
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

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Duração do Destaque</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                                {[1, 2, 3, 4].map(w => (
                                                    <button
                                                        key={w}
                                                        onClick={() => setForm({ ...form, durationWeeks: w, priceTotal: w * PRICING_PER_WEEK })}
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
                                                <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{formatPrice(form.durationWeeks * PRICING_PER_WEEK, 'USD')}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button
                                                onClick={() => setStep(1)}
                                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: '#f0f0f0', fontWeight: 700, cursor: 'pointer', color: '#666' }}>
                                                Voltar
                                            </button>
                                            <button
                                                onClick={() => setStep(3)}
                                                disabled={!form.mediaUrl}
                                                style={{
                                                    flex: 2,
                                                    padding: '1rem',
                                                    background: '#000',
                                                    color: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    fontWeight: 800,
                                                    cursor: !form.mediaUrl ? 'not-allowed' : 'pointer',
                                                    opacity: !form.mediaUrl ? 0.5 : 1
                                                }}
                                            >
                                                Ir para Pagamento
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' }}>Método de Pagamento</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <button
                                                    onClick={() => setForm({ ...form, paymentMethod: 'stripe' })}
                                                    style={{
                                                        padding: '1.5rem',
                                                        borderRadius: '20px',
                                                        border: form.paymentMethod === 'stripe' ? '2px solid #FFD700' : '2px solid #eee',
                                                        background: form.paymentMethod === 'stripe' ? 'rgba(255, 215, 0, 0.05)' : '#fff',
                                                        color: form.paymentMethod === 'stripe' ? '#B8860B' : '#999',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <CreditCard size={32} />
                                                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Cartão / Stripe</span>
                                                </button>
                                                <button
                                                    onClick={() => setForm({ ...form, paymentMethod: 'manual' })}
                                                    style={{
                                                        padding: '1.5rem',
                                                        borderRadius: '20px',
                                                        border: form.paymentMethod === 'manual' ? '2px solid #FFD700' : '2px solid #eee',
                                                        background: form.paymentMethod === 'manual' ? 'rgba(255, 215, 0, 0.05)' : '#fff',
                                                        color: form.paymentMethod === 'manual' ? '#B8860B' : '#999',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <Megaphone size={32} />
                                                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>M-Pesa / E-Mola</span>
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
                                                {isSubmitting ? 'Processando...' : `Pagar ${formatPrice(form.priceTotal, 'USD')}`}
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
                            <div style={{ position: 'relative', aspectRatio: '4/5', background: '#f0f0f0' }}>
                                {form.mediaUrl ? (
                                    form.mediaType === 'video' ? (
                                        <video src={form.mediaUrl} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Image src={form.mediaUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                    )
                                ) : (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Megaphone size={64} color="#ddd" />
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
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(to right, rgba(255,215,0,0.1), #FFF8E1)',
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,215,0,0.2)'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '3.5rem',
                                height: '3.5rem',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(184, 134, 11, 0.3)'
                            }}>
                                <Megaphone color="#fff" size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', margin: 0, lineHeight: 1.1 }}>Meus Anúncios</h2>
                                <p style={{ color: '#666', margin: '4px 0 0', fontSize: '0.95rem' }}>Gerencie sua publicidade e acompanhe os resultados em tempo real</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: '#000',
                                color: '#fff',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '12px',
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Plus size={20} /> Solicitar Destaque
                        </button>
                    </div>
                </div>
            </motion.div>

            {ads.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#fff',
                        padding: '4rem 2rem',
                        borderRadius: '24px',
                        border: '2px dashed #eee',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <div style={{
                        width: '6rem',
                        height: '6rem',
                        background: '#f9f9f9',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <Megaphone size={48} color="#ddd" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', fontFamily: 'var(--font-playfair)' }}>Nenhum anúncio ainda</h3>
                    <p style={{ color: '#888', maxWidth: '450px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                        Comece a promover seus eventos, serviços ou produtos para milhares de potenciais clientes na nossa plataforma.
                    </p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        style={{
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            padding: '1rem 2.5rem',
                            borderRadius: '12px',
                            fontWeight: 900,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                        }}
                    >
                        Começar Agora
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {ads.map((ad, index) => (
                        <motion.div
                            key={ad._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: '#fff',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                border: '1px solid #f0f0f0',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ position: 'relative', height: '200px', background: '#f5f5f5' }}>
                                {ad.mediaType === 'video' ? (
                                    <video
                                        src={ad.mediaUrl}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        autoPlay
                                        muted
                                        loop
                                    />
                                ) : (
                                    <Image
                                        src={ad.mediaUrl}
                                        alt={ad.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                )}
                                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        background: ad.status === 'approved' ? '#16a34a' : ad.status === 'pending' ? '#3b82f6' : '#ef4444',
                                        color: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}>
                                        {ad.status === 'approved' ? '✓ Aprovado' : ad.status === 'pending' ? '⏱ Pendente' : '✗ Rejeitado'}
                                    </span>
                                    {ad.status === 'approved' && (
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            background: ad.isActive ? '#16a34a' : '#6b7280',
                                            color: '#fff',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                        }}>
                                            {ad.isActive ? '● Ativo' : '○ Pausado'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.3 }}>{ad.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ad.description}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#3b82f6', marginBottom: '0.25rem' }}>
                                            <Eye size={14} /> Views
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{ad.views || 0}</div>
                                    </div>
                                    <div style={{ background: '#faf5ff', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.25rem' }}>
                                            <MousePointer2 size={14} /> Clicks
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{ad.clicks || 0}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                    {ad.status === 'approved' && (
                                        <button
                                            onClick={() => handleToggleStatus(ad._id!, ad.isActive)}
                                            style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: ad.isActive ? '#FFF8E1' : '#DCFCE7',
                                                color: ad.isActive ? '#B8860B' : '#166534',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title={ad.isActive ? 'Pausar' : 'Ativar'}
                                        >
                                            {ad.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => ad._id && handleDeleteAd(ad._id)}
                                        style={{
                                            flex: 1,
                                            padding: '0.6rem',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#FEF2F2',
                                            color: '#DC2626',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    {ad.targetUrl && (
                                        <a
                                            href={ad.targetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: '#F3F4F6',
                                                color: '#4B5563',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Ver Link"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
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
                </div>
            </motion.div>
        </div>
    );
}
