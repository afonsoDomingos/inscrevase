"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Clock, Eye, MousePointer2, Trash2, Power, PowerOff, ExternalLink, AlertCircle } from 'lucide-react';
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
                        onClick={() => router.push('/anunciar')}
                        className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl hover:bg-gray-900 hover:scale-105 transition-all font-bold shadow-lg hover:shadow-xl text-sm md:text-base w-full lg:w-auto"
                    >
                        <Plus size={20} /> Criar Novo Anúncio
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
                        onClick={() => router.push('/anunciar')}
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
