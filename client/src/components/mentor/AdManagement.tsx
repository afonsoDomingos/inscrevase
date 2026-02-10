"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Clock, Eye, MousePointer2, Settings2, Trash2, Power, PowerOff, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { adService, AdRequestModel } from '@/lib/adService';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdManagement() {
    const [ads, setAds] = useState<AdRequestModel[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useCurrency();
    const router = useRouter();

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
                toast.error('Erro ao excluir anúncio');
            }
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

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Megaphone className="text-gold" /> Meus Anúncios
                    </h2>
                    <p className="text-gray-500 mt-1">Gerencie sua publicidade e acompanhe os resultados</p>
                </div>
                <button
                    onClick={() => router.push('/anunciar')}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-all font-bold"
                >
                    <Plus size={20} /> Promover Novo Item
                </button>
            </div>

            {ads.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-16 rounded-3xl border border-dashed border-gray-300 text-center flex flex-col items-center"
                >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Megaphone size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Você ainda não tem anúncios</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                        Promova seus eventos, serviços ou produtos para milhares de potenciais clientes na nossa rede.
                    </p>
                    <button
                        onClick={() => router.push('/anunciar')}
                        className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Começar Agora
                    </button>
                </motion.div>
            ) : (
                <div className="grid gap-6">
                    {ads.map((ad) => (
                        <motion.div
                            key={ad._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 relative overflow-hidden group"
                        >
                            {/* Status Stripe */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${ad.status === 'approved' ? (ad.isActive ? 'bg-green-500' : 'bg-yellow-500') :
                                ad.status === 'pending' ? 'bg-blue-500' : 'bg-red-500'
                                }`} />

                            {/* Media Preview */}
                            <div className="relative w-full md:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
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
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold truncate">{ad.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ad.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        ad.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {ad.status === 'approved' ? 'Aprovado' : ad.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                    </span>
                                    {ad.status === 'approved' && (
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {ad.isActive ? 'Ativo' : 'Pausado'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{ad.description}</p>

                                {/* Performance Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Eye size={14} /> <span className="text-[10px] font-bold uppercase">Visualizações</span>
                                        </div>
                                        <div className="text-lg font-bold">{ad.views || 0}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <MousePointer2 size={14} /> <span className="text-[10px] font-bold uppercase">Cliques</span>
                                        </div>
                                        <div className="text-lg font-bold">{ad.clicks || 0}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Clock size={14} /> <span className="text-[10px] font-bold uppercase">Duração</span>
                                        </div>
                                        <div className="text-lg font-bold">{ad.durationWeeks} Semanas</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <ExternalLink size={14} /> <span className="text-[10px] font-bold uppercase">Investimento</span>
                                        </div>
                                        <div className="text-lg font-bold">{formatPrice(ad.priceTotal)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col gap-2 justify-end">
                                {ad.status === 'approved' && (
                                    <button
                                        onClick={() => handleToggleStatus(ad._id!, ad.isActive)}
                                        className={`p-3 rounded-xl transition-all ${ad.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                        title={ad.isActive ? 'Pausar Anúncio' : 'Ativar Anúncio'}
                                    >
                                        {ad.isActive ? <PowerOff size={20} /> : <Power size={20} />}
                                    </button>
                                )}
                                <button
                                    onClick={() => ad._id && handleDeleteAd(ad._id)}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                    title="Excluir Anúncio"
                                >
                                    <Trash2 size={20} />
                                </button>
                                {ad.targetUrl && (
                                    <a
                                        href={ad.targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center"
                                        title="Ver Link do Anúncio"
                                    >
                                        <ExternalLink size={20} />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Hint Box */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-700 text-sm">
                <AlertCircle className="flex-shrink-0" size={20} />
                <p>
                    <strong>Nota:</strong> Anúncios marcados como pausados não serão exibidos nas seções patrocinadas até que sejam reativados.
                    Anúncios pendentes aguardam validação do pagamento e conteúdo pela nossa equipe.
                </p>
            </div>
        </div>
    );
}
