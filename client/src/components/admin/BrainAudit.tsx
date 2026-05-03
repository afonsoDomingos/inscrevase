"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Users, MessageSquare, TrendingUp, Search, Clock, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { aiService } from '@/lib/aiService';
import { toast } from 'sonner';

interface BrainStats {
    total: number;
    roleStats: { _id: string; count: number }[];
    recentLogs: any[];
    topQuestions: { _id: string; count: number }[];
}

export default function BrainAudit() {
    const [stats, setStats] = useState<BrainStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await aiService.getBrainStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar estatísticas do Cérbero");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Brain className="text-yellow-500" /> Auditoria do Cérbero AI
                    </h2>
                    <p className="text-gray-400">Analise o uso, performance e as questões mais frequentes da IA.</p>
                </div>
                <button 
                    onClick={loadStats}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                >
                    Atualizar Dados
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <MessageSquare className="text-blue-500" size={24} />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Interações</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <Bot className="text-purple-500" size={24} />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Eficiência IA</span>
                    </div>
                    <div className="text-3xl font-bold text-white">100%</div>
                </div>

                {stats?.roleStats.map((role) => (
                    <div key={role._id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="text-yellow-500" size={24} />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{role._id || 'Utilizadores'}</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{role.count}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Questions */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
                        <TrendingUp className="text-yellow-500" size={20} />
                        <h3 className="font-bold text-white">Dúvidas Mais Comuns</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {stats?.topQuestions.map((q, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                                <span className="text-sm text-gray-300 line-clamp-1 flex-1 pr-4">"{q._id}"</span>
                                <span className="text-xs font-bold bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">{q.count}x</span>
                            </div>
                        ))}
                        {stats?.topQuestions.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-8">Nenhuma interação registada ainda.</p>
                        )}
                    </div>
                </div>

                {/* Recent Logs */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="text-blue-500" size={20} />
                            <h3 className="font-bold text-white">Registos de Atividade em Tempo Real</h3>
                        </div>
                    </div>
                    <div className="divide-y divide-zinc-800">
                        {stats?.recentLogs.map((log) => (
                            <div key={log._id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                                <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                            <Users size={18} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{log.user?.name || log.userName || 'Utilizador'}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                <span className="uppercase text-[10px] font-black px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700">{log.userRole}</span>
                                                • {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    {expandedLog === log._id ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                </div>
                                
                                {expandedLog === log._id && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 space-y-4 text-sm"
                                    >
                                        <div className="bg-black/30 p-3 rounded-xl border border-zinc-800/50">
                                            <div className="text-xs font-bold text-yellow-500 uppercase mb-1">Pergunta:</div>
                                            <div className="text-gray-300 italic">"{log.transcript}"</div>
                                        </div>
                                        <div className="bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/10">
                                            <div className="text-xs font-bold text-blue-400 uppercase mb-1">Resposta do Cérbero:</div>
                                            <div className="text-gray-300 whitespace-pre-wrap">{log.reply}</div>
                                        </div>
                                        <div className="flex gap-4 text-[10px] text-gray-600 uppercase font-bold">
                                            <div>Modelo: {log.modelUsed || 'Desconhecido'}</div>
                                            <div>Página: {log.pageContext || 'Global'}</div>
                                            <div>ID: {log._id}</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                        {stats?.recentLogs.length === 0 && (
                            <p className="text-center text-gray-500 py-20">Aguardando as primeiras interações do Cérbero...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
