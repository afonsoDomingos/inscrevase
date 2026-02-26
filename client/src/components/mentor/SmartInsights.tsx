"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Star, Layout, Rocket, UserCircle, ShieldCheck, Share2, MessageSquare, Globe, DollarSign, Zap, Link as LinkIcon } from 'lucide-react';
import { UserData } from '@/lib/authService';
import { AdminStats } from '@/lib/dashboardService';
import { FormModel } from '@/lib/formService';

interface Insight {
    id: string;
    icon: JSX.Element;
    title: string;
    text: string;
    color: string;
    action?: 'create' | 'settings' | 'referral' | 'ads' | 'smartlinks';
}

interface SmartInsightsProps {
    user: UserData | null;
    stats: AdminStats | null;
    forms: FormModel[];
}

export default function SmartInsights({ user, stats, forms }: SmartInsightsProps) {
    const [currentInsight, setCurrentInsight] = useState(0);
    const [insights, setInsights] = useState<Insight[]>([]);

    useEffect(() => {
        const generateInsights = () => {
            const list: Insight[] = [];

            // 1. Welcome Back / Long Absence
            const lastLogin = user?.lastLoginAt ? new Date(user.lastLoginAt) : new Date();
            const daysSinceLastLogin = Math.floor((new Date().getTime() - lastLogin.getTime()) / (1000 * 3600 * 24));

            if (daysSinceLastLogin > 3 && user?.name) {
                list.push({
                    id: 'welcome_back',
                    icon: <Sparkles className="text-yellow-500" />,
                    title: `Bom ver você de volta, ${user.name.split(' ')[0]}!`,
                    text: `Sentimos sua falta nos últimos ${daysSinceLastLogin} dias. Que tal conferir as novidades no seu portal?`,
                    color: '#FFD700'
                });
            }

            // 2. Global Business Insight
            list.push({
                id: 'global_money',
                icon: <Globe className="text-blue-400" />,
                title: 'O Mundo é o seu Palco',
                text: 'Sabia que pode vender seus cursos para qualquer país? Use as nossas ferramentas de pagamento internacional e fature globalmente.',
                color: '#60a5fa'
            });

            // 3. Profit Maximization
            list.push({
                id: 'profit_tips',
                icon: <DollarSign className="text-green-500" />,
                title: 'Escalabilidade Financeira',
                text: 'Transforme o seu evento num produto digital perpétuo. Venda mesmo enquanto dorme utilizando os nossos funis inteligentes.',
                color: '#4ade80'
            });

            // 4. Feature Adoption (Smart Links)
            list.push({
                id: 'smart_links_tip',
                icon: <LinkIcon className="text-purple-400" />,
                title: 'Rastreio de Precisão',
                text: 'Use a ferramenta de Smart Links para descobrir qual rede social (Instagram, TikTok ou WhatsApp) traz mais dinheiro para o seu bolso.',
                color: '#a78bfa',
                action: 'smartlinks'
            });

            // 5. Growth Ad Nudge
            list.push({
                id: 'boost_now',
                icon: <Zap className="text-orange-400" />,
                title: 'Portal de Destaques',
                text: 'Quer crescer 10x mais rápido? Coloque o seu evento no topo da nossa plataforma com o sistema de anúncios integrados.',
                color: '#fb923c',
                action: 'ads'
            });

            // 6. Recent Enrollment Boom
            if (stats && stats.submissions > 0) {
                list.push({
                    id: 'recent_success',
                    icon: <TrendingUp className="text-green-500" />,
                    title: 'Seus eventos estão a crescer!',
                    text: `Já alcançou ${stats.submissions} inscrições totais. Continue o excelente trabalho!`,
                    color: '#4ade80'
                });
            }

            // 7. No active events nudge
            const activeEvents = forms?.filter(f => f.active).length || 0;
            if (activeEvents === 0) {
                list.push({
                    id: 'no_events',
                    icon: <Star className="text-yellow-400" />,
                    title: 'O seu conhecimento vale ouro!',
                    text: 'Não guarde o seu talento só para si. Crie agora o seu primeiro evento e comece a transformar vidas hoje mesmo.',
                    color: '#FFD700',
                    action: 'create'
                });

                list.push({
                    id: 'event_idea',
                    icon: <Layout className="text-blue-400" />,
                    title: 'Ideia para Evento',
                    text: 'Que tal um Workshop ao vivo ou uma Masterclass gratuita para construir a sua audiência?',
                    color: '#60a5fa'
                });
            } else {
                list.push({
                    id: 'keep_going',
                    icon: <Rocket className="text-orange-500" />,
                    title: 'Rumo ao Topo!',
                    text: `Tem ${activeEvents} ${activeEvents === 1 ? 'evento ativo' : 'eventos ativos'}. Que tal lançar uma nova edição ou um novo tema?`,
                    color: '#f97316'
                });
            }

            // 8. Profile Completeness Nudge
            if (!user?.bio || !user?.profilePhoto) {
                list.push({
                    id: 'complete_profile',
                    icon: <UserCircle className="text-pink-500" />,
                    title: 'Aumente a sua Confiança',
                    text: 'Perfis com foto e biografia detalhada convertem 3x mais. Complete o seu perfil agora!',
                    color: '#ec4899',
                    action: 'settings'
                });
            }

            // 9. Verification Nudge
            if (!user?.isVerified) {
                list.push({
                    id: 'get_verified',
                    icon: <ShieldCheck className="text-indigo-400" />,
                    title: 'Selo de Autoridade',
                    text: 'Solicite a sua verificação de conta para passar mais credibilidade aos seus alunos.',
                    color: '#818cf8',
                    action: 'settings'
                });
            }

            // 10. Referral nudge
            list.push({
                id: 'referral_impact',
                icon: <Share2 className="text-green-400" />,
                title: 'Ganhe com sua Rede',
                text: 'Ao convidar outros mentores, você ganha Pontos de Impacto que podem ser trocados por benefícios.',
                color: '#22c55e',
                action: 'referral'
            });

            // 11. Support
            list.push({
                id: 'support_ready',
                icon: <MessageSquare className="text-cyan-400" />,
                title: 'Estamos aqui para si',
                text: 'Dúvidas em como configurar o seu marketing? Fale com o nosso suporte premium a qualquer momento.',
                color: '#22d3ee'
            });

            setInsights(list);
        };

        generateInsights();
    }, [user, stats, forms]);

    useEffect(() => {
        if (insights.length > 1) {
            const timer = setInterval(() => {
                setCurrentInsight(prev => (prev + 1) % insights.length);
            }, 8000);
            return () => clearInterval(timer);
        }
    }, [insights]);

    if (insights.length === 0) return null;

    const insight = insights[currentInsight];

    return (
        <div style={{ marginBottom: '2rem' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="luxury-card"
                    style={{
                        background: 'linear-gradient(90deg, #1a1a1a 0%, #222 100%)',
                        padding: '1.25rem 2rem',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: `1px solid ${insight.color}40`,
                        boxShadow: `0 10px 30px ${insight.color}10`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '4px', height: '100%', background: insight.color }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            background: `${insight.color}20`,
                            padding: '12px',
                            borderRadius: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: insight.color
                        }}>
                            {insight.icon}
                        </div>
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, marginBottom: '0.2rem' }}>{insight.title}</h4>
                            <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>{insight.text}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {insights.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentInsight(idx)}
                                style={{
                                    width: idx === currentInsight ? '24px' : '8px',
                                    height: '4px',
                                    background: idx === currentInsight ? insight.color : '#333',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
