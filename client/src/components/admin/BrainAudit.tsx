"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Users, MessageSquare, TrendingUp, Clock, Bot, ChevronDown, ChevronUp, Zap, Target, Search } from 'lucide-react';
import { aiService } from '@/lib/aiService';
import { toast } from 'sonner';

interface BrainLog {
    _id: string;
    user?: { name: string, email?: string };
    userName?: string;
    userRole: string;
    timestamp: string;
    transcript: string;
    reply: string;
    modelUsed?: string;
    pageContext?: string;
}

interface BrainStats {
    total: number;
    successCount: number;
    errorCount: number;
    roleStats: { _id: string; count: number }[];
    recentLogs: BrainLog[];
    topQuestions: { _id: string; count: number }[];
}

export default function BrainAudit() {
    const [stats, setStats] = useState<BrainStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            toast.error("Erro ao carregar estatísticas do Brain");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px' }}>
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #facc15', borderTopColor: 'transparent' }} 
                />
            </div>
        );
    }

    const filteredLogs = stats?.recentLogs.filter(log => 
        log.transcript.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userRole.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '15px', margin: 0, fontFamily: 'var(--font-playfair)' }}>
                        <div style={{ background: 'var(--gold-gradient)', padding: '12px', borderRadius: '15px', color: '#000', boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)' }}>
                            <Brain size={28} />
                        </div>
                        Auditoria do Brain AI
                    </h2>
                    <p style={{ color: '#666', marginTop: '8px', fontSize: '1.1rem', fontWeight: 500 }}>
                        Monitorização de inteligência neural e padrões de interação.
                    </p>
                </div>
                <button 
                    onClick={loadStats}
                    className="btn-primary"
                    style={{ padding: '12px 25px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <Zap size={18} fill="#000" /> Atualizar Matriz
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatBox 
                    icon={<MessageSquare size={22} />} 
                    label="Total Interações" 
                    value={stats?.total || 0} 
                    color="#3b82f6" 
                />
                <StatBox 
                    icon={<Bot size={22} />} 
                    label="Sucessos IA" 
                    value={stats?.successCount || 0} 
                    color="#10b981" 
                    trend={stats?.total ? `${Math.round(((stats.successCount || 0) / stats.total) * 100)}%` : '100%'}
                />
                <StatBox 
                    icon={<Target size={22} />} 
                    label="Falhas Neurais" 
                    value={stats?.errorCount || 0} 
                    color="#ef4444" 
                    trend={stats?.total ? `${Math.round(((stats.errorCount || 0) / stats.total) * 100)}%` : '0%'}
                />
                {stats?.roleStats.map((role) => (
                    <StatBox 
                        key={role._id}
                        icon={<Users size={22} />} 
                        label={role._id || 'Utilizadores'} 
                        value={role.count} 
                        color="#eab308" 
                    />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left Column: Top Questions */}
                <div className="luxury-card" style={{ background: '#fff', padding: '2rem', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '8px', borderRadius: '10px', color: '#eab308' }}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>Dúvidas Frequentes</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats?.topQuestions.map((q, idx) => (
                            <div key={idx} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '15px', 
                                background: '#f8fafc', 
                                borderRadius: '15px',
                                border: '1px solid #f1f5f9'
                            }}>
                                <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600, flex: 1, paddingRight: '10px' }}>
                                    &quot;{q._id}&quot;
                                </span>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 800, 
                                    background: 'var(--gold-gradient)', 
                                    color: '#000', 
                                    padding: '4px 10px', 
                                    borderRadius: '50px',
                                    boxShadow: '0 2px 5px rgba(212, 175, 55, 0.2)'
                                }}>
                                    {q.count}x
                                </span>
                            </div>
                        ))}
                        {(!stats?.topQuestions || stats.topQuestions.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                <Target size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p style={{ fontSize: '0.9rem' }}>Nenhum padrão detectado ainda.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Activity Logs */}
                <div className="luxury-card" style={{ background: '#fff', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '10px', color: '#3b82f6' }}>
                                <Clock size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>Registos de Atividade</h3>
                        </div>

                        <div style={{ position: 'relative', width: '250px' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                            <input 
                                type="text"
                                placeholder="Procurar logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px 10px 38px', 
                                    borderRadius: '10px', 
                                    border: '1px solid #e2e8f0', 
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {filteredLogs.map((log) => (
                            <div key={log._id} style={{ 
                                border: '1px solid #f1f5f9', 
                                borderRadius: '16px', 
                                overflow: 'hidden',
                                transition: 'all 0.2s ease'
                            }}>
                                <div 
                                    style={{ 
                                        padding: '15px 20px', 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        background: expandedLog === log._id ? '#fafafa' : '#fff'
                                    }}
                                    onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ 
                                            width: '42px', 
                                            height: '42px', 
                                            borderRadius: '12px', 
                                            background: '#f1f5f9', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: '#64748b',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a' }}>{log.user?.name || log.userName || 'Utilizador Anónimo'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                                                <span style={{ 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: 900, 
                                                    textTransform: 'uppercase', 
                                                    background: log.userRole === 'SuperAdmin' ? '#000' : '#f1f5f9', 
                                                    color: log.userRole === 'SuperAdmin' ? '#facc15' : '#64748b',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {log.userRole}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                                                    {new Date(log.timestamp).toLocaleString('pt-PT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ color: '#94a3b8' }}>
                                        {expandedLog === log._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                                
                                <AnimatePresence>
                                    {expandedLog === log._id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #eab308' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#eab308', textTransform: 'uppercase', marginBottom: '5px' }}>Pergunta do Usuário</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>&quot;{log.transcript}&quot;</div>
                                                </div>
                                                <div style={{ background: 'rgba(59, 130, 246, 0.03)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '5px' }}>Resposta do Brain</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>{log.reply}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '20px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Motor de Inteligência</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                            {log.modelUsed && log.modelUsed.includes(':') ? (
                                                                <>
                                                                    <span style={{ 
                                                                        fontSize: '0.6rem', 
                                                                        fontWeight: 900, 
                                                                        background: log.modelUsed.split(':')[0] === 'groq' ? '#f59e0b' : '#3b82f6', 
                                                                        color: '#fff',
                                                                        padding: '1px 5px',
                                                                        borderRadius: '3px',
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        {log.modelUsed.split(':')[0]}
                                                                    </span>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                                                        {log.modelUsed.split(':')[1]}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                                                    {log.modelUsed || 'Gemini-1.5-Flash'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Contexto de Rota</div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{log.pageContext || 'Global / Home'}</div>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Hash da Sessão</div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{log._id.substring(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                        {filteredLogs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
                                <Bot size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
                                <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>Aguardando interações neurais...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 1024px) {
                    div {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

function StatBox({ icon, label, value, color, trend }: { icon: React.ReactNode, label: string, value: string | number, color: string, trend?: string }) {
    return (
        <div className="luxury-card" style={{ 
            background: '#fff', 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: `${color}15`, color: color, padding: '10px', borderRadius: '12px' }}>
                    {icon}
                </div>
                {trend && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: trend === 'Estável' ? '#10b981' : '#3b82f6', background: trend === 'Estável' ? '#10b98115' : '#3b82f615', padding: '4px 8px', borderRadius: '6px' }}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1a1a1a', fontFamily: 'var(--font-playfair)', marginTop: '2px' }}>{value}</div>
            </div>
        </div>
    );
}
