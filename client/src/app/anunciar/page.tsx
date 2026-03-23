"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Calendar, CreditCard, Upload, CheckCircle2, AlertCircle, Package, Briefcase, Zap, Info, ChevronRight, MapPin, ArrowRight, Copy, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/context/CurrencyContext';
import { formService } from '@/lib/formService';
import { adService, AdRequestModel } from '@/lib/adService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FormModel } from '@/lib/formService';
import Cookies from 'js-cookie';
import PaypalButton from '@/components/common/PaypalButton';
import { toast } from 'sonner';

const PRICING_PER_WEEK = 5; // USD

export default function AnunciarPage() {
    const router = useRouter();
    const { formatPrice } = useCurrency();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [myEvents, setMyEvents] = useState<FormModel[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [linkType, setLinkType] = useState<'url' | 'whatsapp'>('url');

    const [form, setForm] = useState<AdRequestModel>({
        title: '',
        description: '',
        category: 'event',
        mediaUrl: '',
        mediaType: 'image',
        durationWeeks: 1,
        priceTotal: PRICING_PER_WEEK,
        currency: 'USD',
        paymentMethod: 'manual',
        status: 'pending',
        targetUrl: ''
    });

    const [paymentProof, setPaymentProof] = useState<string | null>(null);

    // Check authentication
    useEffect(() => {
        const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
        if (!token) {
            router.push('/login?redirect=/anunciar');
        }
    }, [router]);

    // Load user events
    useEffect(() => {
        const loadMyEvents = async () => {
            try {
                const events = await formService.getMyForms();
                setMyEvents(events);
            } catch (err) {
                console.error("Error loading events:", err);
            }
        };
        loadMyEvents();
    }, []);

    // Update total price when duration changes
    useEffect(() => {
        setForm(prev => ({ ...prev, priceTotal: prev.durationWeeks * PRICING_PER_WEEK }));
    }, [form.durationWeeks]);

    // Handle event selection
    const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const eventId = e.target.value;
        setSelectedEventId(eventId);

        if (eventId) {
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

    // Auto-convert WhatsApp to link
    useEffect(() => {
        if (linkType === 'whatsapp' && whatsappNumber) {
            const clean = whatsappNumber.replace(/\D/g, '');
            setForm(prev => ({ ...prev, targetUrl: `https://wa.me/${clean}` }));
        }
    }, [whatsappNumber, linkType]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';

        setUploading(true);
        setError(null);
        try {
            const url = await formService.uploadFile(file, 'ads');
            setForm(prev => ({ ...prev, mediaUrl: url, mediaType }));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao subir arquivo');
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
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao subir comprovativo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            console.log('📤 [AnunciarPage] Submitting ad request:', form);

            if (form.paymentMethod === 'stripe') {
                const checkout = await adService.createAdCheckout(form);
                if (checkout.url) {
                    window.location.href = checkout.url;
                    return;
                }
            }

            const response = await adService.submitAdRequest(form);
            console.log('✅ [AnunciarPage] Ad submitted successfully:', response);
            setSuccess(true);
        } catch (err: unknown) {
            console.error('🔴 [AnunciarPage] Error submitting ad:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro ao enviar o pedido.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', maxWidth: '500px', background: '#fff', padding: '3rem', borderRadius: '32px', boxShadow: '0 40px 100px rgba(0,0,0,0.05)' }}
                    >
                        <div style={{ width: '80px', height: '80px', background: '#38a169', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Pedido Enviado!</h2>
                        <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '2rem' }}>
                            Seu pedido de anúncio foi enviado com sucesso. Nossa equipe analisará as informações e o pagamento. Você será notificado assim que for aprovado.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard/mentor')}
                            style={{ width: '100%', padding: '1.2rem', background: '#000', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            Ver Meus Anúncios <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fcfcfc' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '120px 20px 60px' }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(212, 175, 55, 0.1)', color: '#B8860B', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                            <Megaphone size={16} /> Publicidade Premium
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', color: '#111', marginBottom: '1rem' }}>
                            Promova seu <span className="gold-text">Sucesso</span>
                        </h1>
                        <p style={{ maxWidth: '600px', margin: '0 auto', color: '#666', fontSize: '1.1rem', lineHeight: 1.6 }}>
                            Alcance milhares de pessoas interessadas em eventos, educação e serviços profissionais em Moçambique e no mundo.
                        </p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>

                        {/* Form Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                                {[1, 2, 3].map((s) => (
                                    <div key={s} style={{ flex: 1, height: '4px', background: s <= step ? 'var(--gold-gradient)' : '#eee', borderRadius: '10px' }} />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>O que deseja promover?</h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: '0.8rem' }}>Categoria</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                                    {[
                                                        { id: 'event', label: 'Evento', icon: Calendar },
                                                        { id: 'service', label: 'Serviço', icon: Briefcase },
                                                        { id: 'product', label: 'Produto', icon: Package }
                                                    ].map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => setForm({ ...form, category: cat.id as 'event' | 'service' | 'product' })}
                                                            style={{
                                                                padding: '1rem 0.5rem',
                                                                borderRadius: '12px',
                                                                border: form.category === cat.id ? '2px solid #FFD700' : '1px solid #eee',
                                                                background: form.category === cat.id ? '#FFD70005' : 'transparent',
                                                                color: form.category === cat.id ? '#B8860B' : '#666',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                transition: '0.3s'
                                                            }}
                                                        >
                                                            <cat.icon size={20} />
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{cat.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {form.category === 'event' && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: '0.8rem' }}>Selecione o Evento</label>
                                                    <select
                                                        value={selectedEventId}
                                                        onChange={handleEventSelect}
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9', marginBottom: '1.5rem' }}
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
                                                <>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: '0.8rem' }}>Título do Anúncio</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: Masterclass de Marketing Digital"
                                                            value={form.title}
                                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9' }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: '0.8rem' }}>Descrição Breve</label>
                                                        <textarea
                                                            placeholder="O que torna este item especial?"
                                                            rows={3}
                                                            value={form.description}
                                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9', resize: 'none' }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: '0.8rem' }}>Destinar Leads para:</label>
                                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                                                            <button
                                                                onClick={() => setLinkType('url')}
                                                                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: linkType === 'url' ? '2px solid #000' : '1px solid #eee', background: linkType === 'url' ? '#000' : 'transparent', color: linkType === 'url' ? '#fff' : '#666', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                            >Site / Link</button>
                                                            <button
                                                                onClick={() => setLinkType('whatsapp')}
                                                                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: linkType === 'whatsapp' ? '2px solid #25D366' : '1px solid #eee', background: linkType === 'whatsapp' ? '#25D36610' : 'transparent', color: linkType === 'whatsapp' ? '#25D366' : '#666', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                            >WhatsApp</button>
                                                        </div>

                                                        {linkType === 'url' ? (
                                                            <input
                                                                type="url"
                                                                placeholder="https://exemplo.com"
                                                                value={form.targetUrl}
                                                                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9' }}
                                                            />
                                                        ) : (
                                                            <input
                                                                type="tel"
                                                                placeholder="Ex: 258841234567"
                                                                value={whatsappNumber}
                                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9' }}
                                                            />
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {form.category === 'event' && selectedEventId && selectedEventId !== 'custom' && (
                                                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', gap: '10px' }}>
                                                    <Info size={20} color="#0369a1" />
                                                    <p style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: 1.5 }}>
                                                        Os dados deste evento serão usados automaticamente. Você poderá ajustar a imagem na próxima etapa se desejar.
                                                    </p>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setStep(2)}
                                                disabled={!form.title || !form.description}
                                                style={{ marginTop: '1rem', padding: '1.2rem', background: '#000', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: (!form.title || !form.description) ? 0.5 : 1 }}
                                            >
                                                Continuar
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Visual e Duração</h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: '0.8rem' }}>Mídia do Anúncio (Imagem ou Vídeo)</label>
                                                <div style={{ position: 'relative', height: '200px', width: '100%', border: '2px dashed #eee', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {form.mediaUrl ? (
                                                        <>
                                                            {form.mediaType === 'video' ? (
                                                                <video src={form.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls autoPlay muted loop />
                                                            ) : (
                                                                <Image src={form.mediaUrl} alt="Anuncio" fill style={{ objectFit: 'cover' }} />
                                                            )}
                                                            <button
                                                                onClick={() => setForm({ ...form, mediaUrl: '', mediaType: 'image' })}
                                                                style={{ position: 'absolute', top: '10px', right: '10px', background: '#000', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.7rem' }}
                                                            >Trocar</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {uploading ? <div className="spinner" /> : (
                                                                <>
                                                                    <Upload size={30} color="#ccc" />
                                                                    <div style={{ textAlign: 'center' }}>
                                                                        <span style={{ fontSize: '0.8rem', color: '#999', display: 'block', marginTop: '10px' }}>Clique para subir imagem ou vídeo</span>
                                                                        <span style={{ fontSize: '0.6rem', color: '#bbb' }}>Máx 10MB para vídeos</span>
                                                                    </div>
                                                                    <input type="file" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} accept="image/*,video/*" />
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: '0.8rem' }}>Duração do Anúncio</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                                    {[1, 2, 3, 4].map((w) => (
                                                        <button
                                                            key={w}
                                                            onClick={() => setForm({ ...form, durationWeeks: w })}
                                                            style={{
                                                                padding: '1rem 0.5rem',
                                                                borderRadius: '12px',
                                                                border: form.durationWeeks === w ? '2px solid #FFD700' : '1px solid #eee',
                                                                background: form.durationWeeks === w ? '#000' : 'transparent',
                                                                color: form.durationWeeks === w ? '#fff' : '#666',
                                                                cursor: 'pointer',
                                                                transition: '0.3s'
                                                            }}
                                                        >
                                                            <div style={{ fontSize: '1rem', fontWeight: 900 }}>{w}</div>
                                                            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>{w === 1 ? 'Semana' : 'Semanas'}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div style={{ marginTop: '1rem', background: '#fdf8e6', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Info size={16} color="#B8860B" />
                                                    <span style={{ fontSize: '0.8rem', color: '#B8860B', fontWeight: 600 }}>Total: {formatPrice(form.durationWeeks * PRICING_PER_WEEK, 'USD')}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '1.2rem', background: '#f5f5f5', color: '#444', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Voltar</button>
                                                <button
                                                    onClick={() => setStep(3)}
                                                    disabled={!form.mediaUrl}
                                                    style={{ flex: 2, padding: '1.2rem', background: '#000', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: !form.mediaUrl ? 0.5 : 1 }}
                                                >Finalizar e Pagar</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Pagamento</h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>Escolha o método de sua preferência para concluir.</p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                                <button
                                                    onClick={() => setError("Checkout via Stripe temporariamente indisponível. Por favor, use o botão PayPal abaixo para pagar com seu cartão VISA ou MASTERCARD – é 100% seguro, instantâneo e não precisa ter conta no PayPal!")}
                                                    style={{
                                                        padding: '1.5rem',
                                                        borderRadius: '24px',
                                                        border: '2px dashed #eee',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        background: '#fcfcfc',
                                                        cursor: 'help',
                                                        opacity: 0.6,
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.5 }}>
                                                        <Lock size={14} />
                                                    </div>
                                                    <CreditCard size={28} opacity={0.5} />
                                                    <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#999' }}>Stripe</span>
                                                </button>
                                                <button
                                                    onClick={() => setForm({ ...form, paymentMethod: 'paypal' })}
                                                    style={{
                                                        padding: '1.5rem',
                                                        borderRadius: '16px',
                                                        border: form.paymentMethod === 'paypal' ? '2px solid #003087' : '1px solid #eee',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        background: form.paymentMethod === 'paypal' ? '#00308705' : 'transparent',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Image src="/payments/paypal.png" alt="PayPal" width={32} height={32} style={{ objectFit: 'contain' }} />
                                                    <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>PayPal</span>
                                                </button>
                                                <button
                                                    onClick={() => setForm({ ...form, paymentMethod: 'manual' })}
                                                    style={{
                                                        padding: '1.5rem',
                                                        borderRadius: '16px',
                                                        border: form.paymentMethod === 'manual' ? '2px solid #FFD700' : '1px solid #eee',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        background: form.paymentMethod === 'manual' ? '#FFD70005' : 'transparent',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Upload size={24} />
                                                    <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>Manual (MZ)</span>
                                                </button>
                                            </div>
                                            {form.paymentMethod === 'paypal' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{ background: '#f0f9ff', padding: '2rem', borderRadius: '16px', border: '1.5px solid #bae6fd' }}
                                                >
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', marginBottom: '1rem', textAlign: 'center' }}>Pagar com PayPal (Instantâneo)</p>
                                                    <div style={{ height: '45px', overflow: 'hidden', borderRadius: '12px', border: '1px solid #003087' }}>
                                                        <PaypalButton 
                                                            type="ad_checkout" 
                                                            adData={form}
                                                            currency="USD"
                                                            onSuccess={() => {
                                                                setSuccess(true);
                                                                toast.success("Pagamento realizado com sucesso!");
                                                            }} 
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {form.paymentMethod === 'manual' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee' }}
                                                >
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>Siga estas instruções:</p>
                                                    <ul style={{ fontSize: '0.8rem', color: '#666', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                                        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span><b>M-Pesa:</b> 847877405 (Afonso Domingos)</span>
                                                            <button onClick={() => { navigator.clipboard.writeText('847877405'); toast.success('Número copiado!'); }} style={{ padding: '4px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Copy size={12} /></button>
                                                        </li>
                                                        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span><b>E-Mola:</b> 879642412 (Afonso Domingos)</span>
                                                            <button onClick={() => { navigator.clipboard.writeText('879642412'); toast.success('Número copiado!'); }} style={{ padding: '4px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Copy size={12} /></button>
                                                        </li>
                                                        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span><b>NIB:</b> 000100000074301049557</span>
                                                            <button onClick={() => { navigator.clipboard.writeText('000100000074301049557'); toast.success('NIB copiado!'); }} style={{ padding: '4px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Copy size={12} /></button>
                                                        </li>
                                                        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span><b>PayPal:</b> karinganastudio23@gmail.com</span>
                                                            <button onClick={() => { navigator.clipboard.writeText('karinganastudio23@gmail.com'); toast.success('PayPal copiado!'); }} style={{ padding: '4px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Copy size={12} /></button>
                                                        </li>
                                                    </ul>

                                                    <div style={{ position: 'relative', border: '2px dashed #ddd', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                                        {paymentProof ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38a169', fontWeight: 700, fontSize: '0.8rem' }}>
                                                                <CheckCircle2 size={16} /> Comprovativo anexado
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span style={{ fontSize: '0.75rem', color: '#999' }}>Suba o comprovativo aqui</span>
                                                                <input type="file" onChange={handleProofUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {error && <div style={{ color: '#e53e3e', fontSize: '0.85rem', background: '#fff5f5', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16} /> {error}</div>}

                                            {form.paymentMethod !== 'paypal' && (
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting || (form.paymentMethod === 'manual' && !paymentProof)}
                                                    style={{ padding: '1.2rem', background: 'var(--gold-gradient)', color: '#000', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', opacity: (isSubmitting || (form.paymentMethod === 'manual' && !paymentProof)) ? 0.5 : 1 }}
                                                >
                                                    {isSubmitting ? 'Enviando...' : `Pagar ${formatPrice(form.priceTotal, 'USD')}`}
                                                </button>
                                            )}

                                            <button onClick={() => setStep(2)} style={{ padding: '1rem', background: 'transparent', color: '#888', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Preview Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ position: 'sticky', top: '100px' }}
                        >
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#888', marginBottom: '1.5rem', letterSpacing: '2px' }}>PRÉ-VISUALIZAÇÃO</h3>

                            <div style={{
                                background: '#fff',
                                borderRadius: '32px',
                                overflow: 'hidden',
                                boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
                                border: '1px solid #f0f0f0',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'relative',
                                    height: '400px',
                                    background: form.mediaUrl ? '#f0f0f0' : 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {form.mediaUrl ? (
                                        form.mediaType === 'video' ? (
                                            <video src={form.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />
                                        ) : (
                                            <Image src={form.mediaUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                        )
                                    ) : (
                                        <div style={{ position: 'relative', width: '50%', height: '50%', opacity: 0.1, filter: 'grayscale(1)' }}>
                                            <Image src="/logo.png" alt="Logo" fill style={{ objectFit: 'contain' }} />
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: '#fff',
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.6rem',
                                        fontWeight: 800,
                                        backdropFilter: 'blur(10px)',
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}>
                                        <Zap size={10} fill="#FFD700" /> Patrocinado
                                    </div>
                                </div>
                                <div style={{ padding: '2rem' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B8860B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{form.category}</div>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111', lineHeight: 1.2, marginBottom: '1rem' }}>{form.title || 'Título do seu Anúncio'}</h4>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#888', fontSize: '0.75rem' }}><Calendar size={12} /> {form.category === 'event' ? 'Evento Interno' : 'Disponível'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#888', fontSize: '0.75rem' }}><MapPin size={12} /> {form.targetUrl?.includes('wa.me') ? 'WhatsApp' : 'Web/Link'}</div>
                                    </div>
                                    <div style={{ padding: '1rem', background: '#000', color: '#fff', borderRadius: '12px', textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        Ver Detalhes <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', background: 'rgba(212,175,55,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.1)' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#B8860B', marginBottom: '0.8rem' }}>Por que anunciar?</h4>
                                <ul style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
                                    <li><b>Visibilidade Instantânea:</b> Apareça no topo de todas as páginas.</li>
                                    <li><b>Segmentação Inteligente:</b> Alcance quem realmente importa.</li>
                                    <li><b>Retorno de Investimento:</b> Aumente suas conversões de forma orgânica.</li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />

            <style jsx>{`
                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #eee;
                    border-top: 3px solid #FFD700;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .gold-text {
                    background: var(--gold-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </div >
    );
}
