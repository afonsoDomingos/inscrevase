"use client";

import { Megaphone, Plus, Clock, Eye, MousePointer2, Trash2, Power, PowerOff, ExternalLink, AlertCircle, Calendar, Package, Briefcase, Zap, Info, ChevronRight, MapPin, ArrowLeft, Upload, CreditCard, CheckCircle2 } from 'lucide-react';
import { adService, AdRequestModel } from '@/lib/adService';
import { formService, FormModel } from '@/lib/formService';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

export default function AdManagement() {
    const [ads, setAds] = useState<AdRequestModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [myEvents, setMyEvents] = useState<FormModel[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [linkType, setLinkType] = useState<'url' | 'whatsapp'>('url');
    const { formatPrice, currency } = useCurrency();
    const router = useRouter();

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
        } catch (err: any) {
            toast.error(err.message || 'Erro ao subir arquivo');
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
        } catch (err: any) {
            toast.error(err.message || 'Erro ao subir comprovativo');
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
        } catch (err: any) {
            toast.error(err.message || 'Erro ao enviar pedido');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Megaphone size={40} className="text-gold" />
                </motion.div>
            </div>
        );
    }

    if (showCreateForm) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCreateForm(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-black">Solicitar Novo Destaque</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Part */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl">
                            <div className="flex gap-2 mb-8">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-500 ${s <= step ? 'bg-gradient-to-r from-gold to-yellow-500' : 'bg-gray-100'}`} />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">O que deseja promover?</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'event', label: 'Evento', icon: Calendar },
                                                    { id: 'service', label: 'Serviço', icon: Briefcase },
                                                    { id: 'product', label: 'Produto', icon: Package }
                                                ].map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setForm({ ...form, category: cat.id as any })}
                                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${form.category === cat.id ? 'border-gold bg-gold/5 text-yellow-800' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                    >
                                                        <cat.icon size={24} />
                                                        <span className="text-xs font-bold">{cat.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {form.category === 'event' && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">Selecione o Evento</label>
                                                <select
                                                    value={selectedEventId}
                                                    onChange={handleEventSelect}
                                                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-gold outline-none font-bold"
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
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">Título do Anúncio</label>
                                                    <input
                                                        type="text"
                                                        value={form.title}
                                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                        placeholder="Ex: Masterclass Premium"
                                                        className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-gold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">Descrição</label>
                                                    <textarea
                                                        value={form.description}
                                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                        rows={3}
                                                        placeholder="Breve descrição para atrair cliques..."
                                                        className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-gold outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={!form.title}
                                            className="w-full p-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all disabled:opacity-50"
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
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">Visual e Mídia</label>
                                            <div className="relative border-4 border-dashed border-gray-100 rounded-3xl p-8 text-center hover:border-gold/30 transition-colors group">
                                                {form.mediaUrl ? (
                                                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                                                        {form.mediaType === 'video' ? (
                                                            <video src={form.mediaUrl} autoPlay muted loop className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Image src={form.mediaUrl} alt="Preview" fill className="object-cover" />
                                                        )}
                                                        <button
                                                            onClick={() => setForm({ ...form, mediaUrl: '' })}
                                                            className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="py-10">
                                                        <Upload className="mx-auto text-gray-300 mb-4 group-hover:text-gold transition-colors" size={48} />
                                                        <p className="text-gray-500 font-bold mb-1">Upload de Imagem ou Vídeo</p>
                                                        <p className="text-xs text-gray-400">Arraste aqui ou clique para selecionar</p>
                                                        <input
                                                            type="file"
                                                            onChange={handleFileUpload}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            accept="image/*,video/*"
                                                        />
                                                    </div>
                                                )}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                                                            <p className="text-sm font-black text-gray-900 tracking-widest uppercase">Subindo...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">Duração do Destaque</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[1, 2, 3, 4].map(w => (
                                                    <button
                                                        key={w}
                                                        onClick={() => setForm({ ...form, durationWeeks: w, priceTotal: w * PRICING_PER_WEEK })}
                                                        className={`p-3 rounded-xl border-2 font-black transition-all ${form.durationWeeks === w ? 'border-gold bg-gold text-black' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                    >
                                                        {w}W
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-center justify-between">
                                                <span className="text-sm font-bold text-yellow-800">Investimento Total</span>
                                                <span className="text-lg font-black text-yellow-900">{formatPrice(form.durationWeeks * PRICING_PER_WEEK, 'USD')}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button onClick={() => setStep(1)} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold">Voltar</button>
                                            <button
                                                onClick={() => setStep(3)}
                                                disabled={!form.mediaUrl}
                                                className="flex-[2] p-4 bg-black text-white rounded-xl font-bold disabled:opacity-50"
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
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">Método de Pagamento</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setForm({ ...form, paymentMethod: 'stripe' })}
                                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${form.paymentMethod === 'stripe' ? 'border-gold bg-gold/5 text-yellow-900' : 'border-gray-100 text-gray-400 hover:shadow-md'}`}
                                                >
                                                    <CreditCard size={32} />
                                                    <span className="font-black text-sm">Cartão / Stripe</span>
                                                </button>
                                                <button
                                                    onClick={() => setForm({ ...form, paymentMethod: 'manual' })}
                                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${form.paymentMethod === 'manual' ? 'border-gold bg-gold/5 text-yellow-900' : 'border-gray-100 text-gray-400 hover:shadow-md'}`}
                                                >
                                                    <Megaphone size={32} />
                                                    <span className="font-black text-sm">M-Pesa / E-Mola</span>
                                                </button>
                                            </div>
                                        </div>

                                        {form.paymentMethod === 'manual' && (
                                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Contas para Depósito</p>
                                                <div className="text-sm space-y-2 font-bold text-gray-700">
                                                    <div className="flex justify-between"><span>M-Pesa:</span> <span>84 123 4567</span></div>
                                                    <div className="flex justify-between"><span>E-Mola:</span> <span>86 123 4567</span></div>
                                                    <div className="flex justify-between"><span>NIB:</span> <span>123456789 (BCI)</span></div>
                                                </div>
                                                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gold/30 transition-colors">
                                                    {paymentProof ? (
                                                        <div className="flex items-center justify-center gap-2 text-green-600 font-black">
                                                            <CheckCircle2 size={20} /> Comprovativo Anexado
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="mx-auto text-gray-300 mb-2" size={24} />
                                                            <p className="text-xs text-gray-400 font-bold">Anexar Comprovativo</p>
                                                            <input type="file" onChange={handleProofUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button onClick={() => setStep(2)} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold">Voltar</button>
                                            <button
                                                onClick={handleSubmitAd}
                                                disabled={isSubmitting || (form.paymentMethod === 'manual' && !paymentProof)}
                                                className="flex-[2] p-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-black rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
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
                    <div className="space-y-4">
                        <label className="block text-sm font-black text-gray-500 uppercase tracking-wider text-center">Pré-visualização</label>
                        <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 sticky top-24">
                            <div className="relative aspect-[4/5] bg-gray-50">
                                {form.mediaUrl ? (
                                    form.mediaType === 'video' ? (
                                        <video src={form.mediaUrl} autoPlay muted loop className="w-full h-full object-cover" />
                                    ) : (
                                        <Image src={form.mediaUrl} alt="Preview" fill className="object-cover" />
                                    )
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Megaphone size={64} className="text-gray-100" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-gold px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                                    <Zap size={12} fill="#FFD700" className="animate-pulse" /> {form.category || 'Patrocinado'}
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <h4 className="text-xl font-black text-gray-900 leading-tight">
                                    {form.title || 'Título do seu anúncio premium'}
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                        <Calendar size={14} className="text-gold" /> Hoje
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                        <MapPin size={14} className="text-gold" /> Global
                                    </div>
                                </div>
                                <div className="w-full p-4 bg-black text-white rounded-2xl text-center font-black text-sm uppercase tracking-widest shadow-lg">
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
        <div className="space-y-6">
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-gold/10 via-yellow-50 to-orange-50 p-6 md:p-8 rounded-3xl border border-gold/20 shadow-sm"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Megaphone className="text-white" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Meus Anúncios</h2>
                            <p className="text-gray-600 text-sm md:text-base">Gerencie sua publicidade e acompanhe os resultados em tempo real</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl hover:bg-gray-900 hover:scale-105 transition-all font-bold shadow-lg hover:shadow-xl text-sm md:text-base w-full lg:w-auto"
                    >
                        <Plus size={20} /> Solicitar Destaque
                    </button>
                </div>
            </motion.div>

            {ads.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-12 md:p-20 rounded-3xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Megaphone size={48} className="text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-gray-900">Nenhum anúncio ainda</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                        Comece a promover seus eventos, serviços ou produtos para milhares de potenciais clientes na nossa plataforma.
                    </p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gradient-to-r from-gold to-yellow-500 text-black px-10 py-4 rounded-xl font-black hover:shadow-2xl hover:scale-105 transition-all text-lg"
                    >
                        Começar Agora
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {ads.map((ad, index) => (
                        <motion.div
                            key={ad._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden group"
                        >
                            {/* Mobile Layout */}
                            <div className="lg:hidden">
                                {/* Media Preview - Full Width on Mobile */}
                                <div className="relative w-full h-48 bg-gray-100">
                                    {ad.mediaType === 'video' ? (
                                        <video
                                            src={ad.mediaUrl}
                                            className="w-full h-full object-cover"
                                            autoPlay
                                            muted
                                            loop
                                        />
                                    ) : (
                                        <Image
                                            src={ad.mediaUrl}
                                            alt={ad.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg ${ad.status === 'approved' ? 'bg-green-500 text-white' :
                                            ad.status === 'pending' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                                            }`}>
                                            {ad.status === 'approved' ? '✓ Aprovado' : ad.status === 'pending' ? '⏱ Pendente' : '✗ Rejeitado'}
                                        </span>
                                        {ad.status === 'approved' && (
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg ${ad.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                                }`}>
                                                {ad.isActive ? '● Ativo' : '○ Pausado'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 mb-1 line-clamp-1">{ad.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">{ad.description}</p>
                                    </div>

                                    {/* Stats Grid - 2 columns on mobile */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Eye size={16} />
                                                <span className="text-xs font-bold uppercase tracking-wide">Views</span>
                                            </div>
                                            <div className="text-2xl font-black text-blue-900">{ad.views || 0}</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200">
                                            <div className="flex items-center gap-2 text-purple-600 mb-1">
                                                <MousePointer2 size={16} />
                                                <span className="text-xs font-bold uppercase tracking-wide">Clicks</span>
                                            </div>
                                            <div className="text-2xl font-black text-purple-900">{ad.clicks || 0}</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl border border-orange-200">
                                            <div className="flex items-center gap-2 text-orange-600 mb-1">
                                                <Clock size={16} />
                                                <span className="text-xs font-bold uppercase tracking-wide">Duração</span>
                                            </div>
                                            <div className="text-lg font-black text-orange-900">{ad.durationWeeks} Semanas</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                                            <div className="flex items-center gap-2 text-green-600 mb-1">
                                                <ExternalLink size={16} />
                                                <span className="text-xs font-bold uppercase tracking-wide">Investido</span>
                                            </div>
                                            <div className="text-lg font-black text-green-900">{formatPrice(ad.priceTotal, ad.currency || 'USD')}</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        {ad.status === 'approved' && (
                                            <button
                                                onClick={() => handleToggleStatus(ad._id!, ad.isActive)}
                                                className={`flex-1 p-3 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2 ${ad.isActive
                                                    ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200 hover:bg-yellow-100'
                                                    : 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100'
                                                    }`}
                                            >
                                                {ad.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                                                {ad.isActive ? 'Pausar' : 'Ativar'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => ad._id && handleDeleteAd(ad._id)}
                                            className="flex-1 p-3 bg-red-50 text-red-700 rounded-xl border-2 border-red-200 hover:bg-red-100 transition-all font-bold text-sm flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={18} /> Excluir
                                        </button>
                                        {ad.targetUrl && (
                                            <a
                                                href={ad.targetUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-gray-50 text-gray-700 rounded-xl border-2 border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:block">
                                <div className="flex gap-6 p-6 relative">
                                    {/* Status Stripe */}
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${ad.status === 'approved' ? (ad.isActive ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-yellow-400 to-yellow-600') :
                                        ad.status === 'pending' ? 'bg-gradient-to-b from-blue-400 to-blue-600' : 'bg-gradient-to-b from-red-400 to-red-600'
                                        }`} />

                                    {/* Media Preview */}
                                    <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md">
                                        {ad.mediaType === 'video' ? (
                                            <video
                                                src={ad.mediaUrl}
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                muted
                                                loop
                                            />
                                        ) : (
                                            <Image
                                                src={ad.mediaUrl}
                                                alt={ad.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black text-gray-900 mb-2">{ad.title}</h3>
                                                <p className="text-gray-600 line-clamp-2 leading-relaxed">{ad.description}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap ${ad.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    ad.status === 'pending' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                        'bg-red-100 text-red-700 border border-red-200'
                                                    }`}>
                                                    {ad.status === 'approved' ? '✓ Aprovado' : ad.status === 'pending' ? '⏱ Pendente' : '✗ Rejeitado'}
                                                </span>
                                                {ad.status === 'approved' && (
                                                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap ${ad.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        {ad.isActive ? '● Ativo' : '○ Pausado'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Performance Grid */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                                <div className="flex items-center gap-2 text-blue-600 mb-2">
                                                    <Eye size={16} />
                                                    <span className="text-xs font-bold uppercase tracking-wide">Views</span>
                                                </div>
                                                <div className="text-2xl font-black text-blue-900">{ad.views || 0}</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                                <div className="flex items-center gap-2 text-purple-600 mb-2">
                                                    <MousePointer2 size={16} />
                                                    <span className="text-xs font-bold uppercase tracking-wide">Clicks</span>
                                                </div>
                                                <div className="text-2xl font-black text-purple-900">{ad.clicks || 0}</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                                                <div className="flex items-center gap-2 text-orange-600 mb-2">
                                                    <Clock size={16} />
                                                    <span className="text-xs font-bold uppercase tracking-wide">Duração</span>
                                                </div>
                                                <div className="text-xl font-black text-orange-900">{ad.durationWeeks} Semanas</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                                <div className="flex items-center gap-2 text-green-600 mb-2">
                                                    <ExternalLink size={16} />
                                                    <span className="text-xs font-bold uppercase tracking-wide">Investido</span>
                                                </div>
                                                <div className="text-xl font-black text-green-900">{formatPrice(ad.priceTotal, ad.currency || 'USD')}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 justify-center">
                                        {ad.status === 'approved' && (
                                            <button
                                                onClick={() => handleToggleStatus(ad._id!, ad.isActive)}
                                                className={`p-3 rounded-xl transition-all hover:scale-110 ${ad.isActive
                                                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-2 border-yellow-200'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-200'
                                                    }`}
                                                title={ad.isActive ? 'Pausar Anúncio' : 'Ativar Anúncio'}
                                            >
                                                {ad.isActive ? <PowerOff size={22} /> : <Power size={22} />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => ad._id && handleDeleteAd(ad._id)}
                                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:scale-110 transition-all border-2 border-red-200"
                                            title="Excluir Anúncio"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                        {ad.targetUrl && (
                                            <a
                                                href={ad.targetUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 hover:scale-110 transition-all flex items-center justify-center border-2 border-gray-200"
                                                title="Ver Link do Anúncio"
                                            >
                                                <ExternalLink size={22} />
                                            </a>
                                        )}
                                    </div>
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
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 flex gap-4 text-blue-800"
            >
                <AlertCircle className="flex-shrink-0 mt-0.5" size={22} />
                <div className="text-sm leading-relaxed">
                    <strong className="font-black block mb-1">💡 Dica Importante:</strong>
                    Anúncios marcados como <span className="font-bold">pausados</span> não aparecem nas seções patrocinadas.
                    Anúncios <span className="font-bold">pendentes</span> aguardam aprovação da nossa equipe de moderação.
                </div>
            </motion.div>
        </div>
    );
}
