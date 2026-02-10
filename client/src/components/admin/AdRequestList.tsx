"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, CheckCircle, XCircle, Clock, ExternalLink, Image as ImageIcon, CreditCard, Trash2, Power, PowerOff, Eye, MousePointer2 } from 'lucide-react';
import { adService, AdRequestModel } from '@/lib/adService';
import { useCurrency } from '@/context/CurrencyContext';
import Image from 'next/image';
import { toast } from 'sonner';

export default function AdRequestList() {
    const [requests, setRequests] = useState<AdRequestModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const { formatPrice } = useCurrency();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await adService.getAllAdRequestsAdmin();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading ads:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await adService.updateAdRequestStatus(id, status);
            toast.success(`Anúncio ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`);
            loadRequests();
        } catch (err) {
            console.error('Error updating ad status:', err);
            toast.error('Erro ao atualizar status do anúncio');
        }
    };

    const handleToggleActive = async (id: string, current: boolean | undefined) => {
        try {
            await adService.toggleAdStatus(id, !current);
            toast.success(`Anúncio ${!current ? 'ativado' : 'pausado'} com sucesso`);
            loadRequests();
        } catch (err) {
            console.error('Error toggling ad status:', err);
            toast.error('Erro ao alternar status do anúncio');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja realmente excluir este anúncio permanentemente?')) {
            try {
                await adService.deleteAdRequest(id);
                toast.success('Anúncio excluído');
                loadRequests();
            } catch (err) {
                console.error('Error deleting ad:', err);
                toast.error('Erro ao excluir anúncio');
            }
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    if (loading) return (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] gap-4">
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
                <Megaphone size={48} className="text-yellow-500" />
            </motion.div>
            <p className="text-gray-500 font-medium animate-pulse">Carregando painel de gestão...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 md:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <Megaphone className="text-yellow-400" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Gestão de Anúncios</h2>
                            <p className="text-gray-400 text-sm md:text-base max-w-md">Painel administrativo para controle total de publicidade, aprovações e métricas.</p>
                        </div>
                    </div>

                    {/* Stats Compact */}
                    <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 min-w-[100px]">
                            <div className="text-xs text-gray-400 uppercase font-bold mb-1">Total</div>
                            <div className="text-2xl font-black">{requests.length}</div>
                        </div>
                        <div className="bg-blue-500/20 backdrop-blur-md px-4 py-3 rounded-xl border border-blue-500/30 min-w-[100px]">
                            <div className="text-xs text-blue-300 uppercase font-bold mb-1">Pendentes</div>
                            <div className="text-2xl font-black text-blue-200">{requests.filter(r => r.status === 'pending').length}</div>
                        </div>
                        <div className="bg-green-500/20 backdrop-blur-md px-4 py-3 rounded-xl border border-green-500/30 min-w-[100px]">
                            <div className="text-xs text-green-300 uppercase font-bold mb-1">Ativos</div>
                            <div className="text-2xl font-black text-green-200">{requests.filter(r => r.isActive).length}</div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${filter === f
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 scale-105'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {f === 'pending' && <Clock size={16} />}
                            {f === 'approved' && <CheckCircle size={16} />}
                            {f === 'rejected' && <XCircle size={16} />}
                            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Rejeitados'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-12 md:p-20 rounded-3xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Megaphone size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum anúncio encontrado</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Não há solicitações de anúncios com o filtro selecionado no momento.
                        </p>
                    </motion.div>
                ) : (
                    filteredRequests.map((req, index) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row">
                                {/* Media Preview Section */}
                                <div className="lg:w-72 bg-gray-100 relative shrink-0">
                                    <div className="aspect-video lg:h-full w-full relative">
                                        {req.mediaUrl ? (
                                            req.mediaType === 'video' ? (
                                                <video src={req.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                            ) : (
                                                <Image src={req.mediaUrl} alt={req.title} fill className="object-cover" />
                                            )
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                                <ImageIcon size={40} />
                                            </div>
                                        )}
                                        {/* Overlay Status Badge for Mobile/Desktop */}
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${req.status === 'approved' ? 'bg-green-500/90 text-white' :
                                                req.status === 'pending' ? 'bg-blue-500/90 text-white' : 'bg-red-500/90 text-white'
                                                }`}>
                                                {req.status === 'approved' ? 'Aprovado' : req.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                            </span>
                                            {req.isActive && (
                                                <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-yellow-400/90 text-black shadow-sm backdrop-blur-md">
                                                    Ativo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5 lg:p-6 flex-1 flex flex-col">
                                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                    {req.category || 'Geral'}
                                                </span>
                                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                                    <Clock size={12} /> {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">{req.title}</h3>
                                            <p className="text-gray-600 text-sm line-clamp-2">{req.description}</p>
                                        </div>

                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 shrink-0">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Investimento</span>
                                                <span className="text-lg font-black text-green-600">{formatPrice(req.priceTotal)}</span>
                                            </div>
                                            <div className="w-px h-8 bg-gray-200" />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Duração</span>
                                                <span className="text-sm font-bold text-gray-700">{req.durationWeeks} sem.</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Info & Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <div className="text-xs text-blue-500 font-bold uppercase mb-1 flex items-center gap-1"><Eye size={12} /> Views</div>
                                            <div className="font-black text-blue-900 text-lg">{req.views || 0}</div>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                                            <div className="text-xs text-purple-500 font-bold uppercase mb-1 flex items-center gap-1"><MousePointer2 size={12} /> Clicks</div>
                                            <div className="font-black text-purple-900 text-lg">{req.clicks || 0}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Anunciante</div>
                                            <div className="font-bold text-gray-800 truncate text-sm">
                                                {typeof req.userId === 'object' ? (req.userId as { name: string })?.name : 'Usuário'}
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">
                                                {typeof req.userId === 'object' ? (req.userId as { email: string })?.email : req.userId}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Toolbar */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                                        {/* Proof of Payment Link */}
                                        {req.paymentProofUrl && (
                                            <a
                                                href={req.paymentProofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold"
                                            >
                                                <CreditCard size={16} /> <span className="hidden sm:inline">Comprovante</span>
                                            </a>
                                        )}

                                        {/* Target Link */}
                                        {req.targetUrl && (
                                            <a
                                                href={req.targetUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold"
                                            >
                                                <ExternalLink size={16} /> <span className="hidden sm:inline">Link</span>
                                            </a>
                                        )}

                                        <div className="flex-1" />

                                        {req.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => req._id && handleUpdateStatus(req._id, 'rejected')}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors text-sm font-bold"
                                                >
                                                    <XCircle size={18} /> Rejeitar
                                                </button>
                                                <button
                                                    onClick={() => req._id && handleUpdateStatus(req._id, 'approved')}
                                                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-xl transition-all text-sm font-bold"
                                                >
                                                    <CheckCircle size={18} /> Aprovar Publicação
                                                </button>
                                            </>
                                        )}

                                        {req.status === 'approved' && (
                                            <button
                                                onClick={() => req._id && handleToggleActive(req._id, req.isActive)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-bold ${req.isActive
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    }`}
                                            >
                                                {req.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                                                {req.isActive ? 'Pausar' : 'Reativar'}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => req._id && handleDelete(req._id)}
                                            className="inline-flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir permanentemente"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}


