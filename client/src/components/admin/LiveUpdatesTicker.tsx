"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, TrendingUp, Users, AlertCircle, Info, Calendar, Globe, Target } from 'lucide-react';
import { AdminStats, TrafficStats } from '@/lib/dashboardService';

interface LiveUpdatesTickerProps {
    stats: AdminStats | null;
    trafficStats: TrafficStats | null;
}

export default function LiveUpdatesTicker({ stats, trafficStats }: LiveUpdatesTickerProps) {
    const [messages, setMessages] = useState<{ id: string, text: string, icon: React.ReactNode, type: 'success'|'info'|'warning' }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!stats && !trafficStats) return;

        const newMessages: typeof messages = [];

        // 1. Visitors Check
        if (trafficStats) {
            if (trafficStats.visitsToday > 0) {
                newMessages.push({
                    id: 'visits-today',
                    text: `Tivemos ${trafficStats.visitsToday} visitantes hoje na plataforma.`,
                    icon: <Globe size={18} />,
                    type: 'info'
                });
            } else {
                newMessages.push({
                    id: 'no-visits-today',
                    text: `Atenção: Não tivemos nenhum visitante hoje. Talvez seja hora de partilhar a plataforma!`,
                    icon: <AlertCircle size={18} />,
                    type: 'warning'
                });
            }
        }

        // 2. Submissions Check
        if (stats) {
            if (stats.submissionsToday && stats.submissionsToday > 0) {
                newMessages.push({
                    id: 'submissions-today',
                    text: `Excelente! Tivemos ${stats.submissionsToday} novas inscrições hoje.`,
                    icon: <TrendingUp size={18} />,
                    type: 'success'
                });
            } else if (stats.submissionsThisWeek && stats.submissionsThisWeek > 0) {
                newMessages.push({
                    id: 'submissions-week',
                    text: `Tivemos ${stats.submissionsThisWeek} novas inscrições esta semana, mas nenhuma hoje.`,
                    icon: <Calendar size={18} />,
                    type: 'info'
                });
            } else if (stats.submissionsThisMonth === 0) {
                newMessages.push({
                    id: 'no-submissions-month',
                    text: `Aviso: Ainda não tivemos nenhuma nova inscrição este mês.`,
                    icon: <AlertCircle size={18} />,
                    type: 'warning'
                });
            } else {
                 newMessages.push({
                    id: 'no-submissions-today',
                    text: `Nenhuma nova inscrição hoje. Vamos impulsionar as partilhas!`,
                    icon: <Target size={18} />,
                    type: 'warning'
                });
            }

            // 3. Mentors & Users
            if (stats.usersToday && stats.usersToday > 0) {
                newMessages.push({
                    id: 'users-today',
                    text: `${stats.usersToday} novos utilizadores registaram-se hoje.`,
                    icon: <Users size={18} />,
                    type: 'success'
                });
            }

            if (stats.mentors && stats.mentors > 0) {
                newMessages.push({
                    id: 'total-mentors',
                    text: `O nosso ecossistema já conta com ${stats.mentors} Experts/Mentores ativos.`,
                    icon: <Info size={18} />,
                    type: 'info'
                });
            }
        }

        if (newMessages.length === 0) {
            newMessages.push({
                id: 'default',
                text: 'A carregar as últimas atualizações da plataforma...',
                icon: <Bell size={18} />,
                type: 'info'
            });
        }

        setMessages(newMessages);
        setCurrentIndex(0);
    }, [stats, trafficStats]);

    useEffect(() => {
        if (messages.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 5000); // Change message every 5 seconds

        return () => clearInterval(interval);
    }, [messages.length]);

    if (messages.length === 0) return null;

    const currentMsg = messages[currentIndex];

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0,0,0,0.05)',
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                background: currentMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 
                            currentMsg.type === 'warning' ? 'rgba(239, 68, 68, 0.1)' : 
                            'rgba(59, 130, 246, 0.1)',
                color: currentMsg.type === 'success' ? '#10b981' : 
                       currentMsg.type === 'warning' ? '#ef4444' : 
                       '#3b82f6',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                {currentMsg.icon}
            </div>

            <div style={{ flex: 1, position: 'relative', height: '24px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMsg.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', display: 'flex', alignItems: 'center', height: '100%' }}
                    >
                        <span style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: 600, 
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{ 
                                fontSize: '0.65rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1px', 
                                background: '#111', 
                                color: '#FFD700',
                                padding: '3px 8px', 
                                borderRadius: '6px',
                                fontWeight: 800
                            }}>
                                Live Feed
                            </span>
                            {currentMsg.text}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {messages.length > 1 && (
                <div 
                    key={currentMsg.id + '-progress'}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '3px',
                        background: currentMsg.type === 'success' ? '#10b981' : 
                                    currentMsg.type === 'warning' ? '#ef4444' : 
                                    '#3b82f6',
                        width: '100%',
                        animation: 'progressTicker 5s linear forwards'
                    }} 
                />
            )}
            <style>{`
                @keyframes progressTicker {
                    0% { transform: scaleX(0); transform-origin: left; }
                    100% { transform: scaleX(1); transform-origin: left; }
                }
            `}</style>
        </div>
    );
}
