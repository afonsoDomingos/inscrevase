"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, CheckCircle, XCircle, Clock, ExternalLink, Image as ImageIcon, CreditCard, Trash2, Power, PowerOff, Eye, MousePointer2, Video } from 'lucide-react';
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
            toast.error('Erro ao atualizar status do anúncio');
        }
    };

    const handleToggleActive = async (id: string, current: boolean | undefined) => {
        try {
            await adService.toggleAdStatus(id, !current);
            toast.success(`Anúncio ${!current ? 'ativado' : 'pausado'} com sucesso`);
            loadRequests();
        } catch (err) {
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
                toast.error('Erro ao excluir anúncio');
            }
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    if (loading) return <div className="p-8 text-center flex flex-col items-center gap-4"><div className="spinner" /> Carregando gestão de anúncios...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Megaphone className="text-yellow-500" /> Gestão Global de Anúncios
                    </h2>
                    <p className="text-gray-500 text-sm">Controle total sobre a publicidade da plataforma</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Rejeitados'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredRequests.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                        <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">Nenhum anúncio nesta categoria.</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-[120px_1fr_auto] gap-6 items-center overflow-hidden"
                        >
                            {/* Media Preview */}
                            <div className="relative h-24 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                {req.mediaUrl ? (
                                    req.mediaType === 'video' ? (
                                        <video src={req.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                    ) : (
                                        <Image src={req.mediaUrl} alt={req.title} fill className="object-cover" />
                                    )
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        {req.mediaType === 'video' ? <Video size={24} /> : <ImageIcon size={24} />}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${req.category === 'event' ? 'bg-blue-50 text-blue-600' :
                                        req.category === 'service' ? 'bg-purple-50 text-purple-600' :
                                            'bg-green-50 text-green-600'
                                        }`}>
                                        {req.category}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${req.status === 'approved' ? 'bg-green-50 text-green-600' :
                                        req.status === 'pending' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {req.status === 'approved' ? (req.isActive ? 'Ativo' : 'Pausado') : req.status}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} /> {req.durationWeeks} Semanas
                                    </span>
                                    <span className="text-xs font-bold text-gray-900 ml-2">
                                        {formatPrice(req.priceTotal)}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">{req.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1 mb-3">{req.description}</p>

                                <div className="flex flex-wrap items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Eye size={14} /> <strong>{req.views || 0}</strong> Views
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <MousePointer2 size={14} /> <strong>{req.clicks || 0}</strong> Cliques
                                    </div>
                                    {req.targetUrl && (
                                        <a href={req.targetUrl} target="_blank" className="text-blue-500 font-bold flex items-center gap-1 hover:underline">
                                            <ExternalLink size={12} /> Destino
                                        </a>
                                    )}
                                    {req.paymentProofUrl && (
                                        <a href={req.paymentProofUrl} target="_blank" className="text-yellow-600 font-bold flex items-center gap-1 hover:underline">
                                            <CreditCard size={12} /> Comprovativo
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                                {req.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(req._id!, 'approved')}
                                            className="p-2 bg-green-500 text-white rounded-xl shadow-lg shadow-green-100 hover:scale-110 transition-transform"
                                            title="Aprovar"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(req._id!, 'rejected')}
                                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                            title="Rejeitar"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {req.status === 'approved' && (
                                            <button
                                                onClick={() => handleToggleActive(req._id!, req.isActive)}
                                                className={`p-2 rounded-xl transition-all ${req.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                                title={req.isActive ? 'Pausar' : 'Ativar'}
                                            >
                                                {req.isActive ? <PowerOff size={20} /> : <Power size={20} />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(req._id!)}
                                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                            title="Excluir Permanentemente"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <style jsx>{`
                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #eee;
                    border-top: 3px solid #000;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}


