"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Star, Layout, Rocket, UserCircle, ShieldCheck, Share2, MessageSquare, Globe, DollarSign, Zap, Link as LinkIcon, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';
import { UserData } from '@/lib/authService';
import { AdminStats } from '@/lib/dashboardService';
import { FormModel } from '@/lib/formService';
import { useTranslate } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

interface Insight {
    id: string;
    icon: JSX.Element;
    title: string;
    text: string;
    color: string;
    action?: 'create' | 'settings' | 'referral' | 'ads' | 'smartlinks' | 'social_facebook' | 'social_linkedin' | 'social_youtube';
    buttonText?: string;
}

interface SmartInsightsProps {
    user: UserData | null;
    stats: AdminStats | null;
    forms: FormModel[];
    onCreateEvent?: () => void;
    onOpenSettings?: () => void;
}

export default function SmartInsights({ user, stats, forms, onCreateEvent, onOpenSettings }: SmartInsightsProps) {
    const { t } = useTranslate();
    const router = useRouter();
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
                    title: t('dashboard.insights.welcomeBack.title', { name: user.name.split(' ')[0] }),
                    text: t('dashboard.insights.welcomeBack.text', { days: daysSinceLastLogin.toString() }),
                    color: '#FFD700'
                });
            }

            // 2. Global Business Insight
            list.push({
                id: 'global_money',
                icon: <Globe className="text-blue-400" />,
                title: t('dashboard.insights.globalMoney.title'),
                text: t('dashboard.insights.globalMoney.text'),
                color: '#60a5fa'
            });

            // 3. Profit Maximization
            list.push({
                id: 'profit_tips',
                icon: <DollarSign className="text-green-500" />,
                title: t('dashboard.insights.profitTips.title'),
                text: t('dashboard.insights.profitTips.text'),
                color: '#4ade80'
            });

            // 4. Feature Adoption (Smart Links)
            list.push({
                id: 'smart_links_tip',
                icon: <LinkIcon className="text-purple-400" />,
                title: t('dashboard.insights.smartLinksTip.title'),
                text: t('dashboard.insights.smartLinksTip.text'),
                color: '#a78bfa',
                action: 'smartlinks',
                buttonText: t('dashboard.insights.buttons.smartlinks')
            });

            // 5. Growth Ad Nudge
            list.push({
                id: 'boost_now',
                icon: <Zap className="text-orange-400" />,
                title: t('dashboard.insights.boostNow.title'),
                text: t('dashboard.insights.boostNow.text'),
                color: '#fb923c',
                action: 'ads',
                buttonText: t('dashboard.insights.buttons.ads')
            });

            // 6. Recent Enrollment Boom
            if (stats && stats.submissions > 0) {
                list.push({
                    id: 'recent_success',
                    icon: <TrendingUp className="text-green-500" />,
                    title: t('dashboard.insights.recentSuccess.title'),
                    text: t('dashboard.insights.recentSuccess.text', { count: stats.submissions.toString() }),
                    color: '#4ade80'
                });
            }

            // 7. No active events nudge
            const activeEvents = forms?.filter(f => f.active).length || 0;
            if (activeEvents === 0) {
                list.push({
                    id: 'no_events',
                    icon: <Star className="text-yellow-400" />,
                    title: t('dashboard.insights.noEvents.title'),
                    text: t('dashboard.insights.noEvents.text'),
                    color: '#FFD700',
                    action: 'create',
                    buttonText: t('dashboard.insights.buttons.create')
                });

                list.push({
                    id: 'event_idea',
                    icon: <Layout className="text-blue-400" />,
                    title: t('dashboard.insights.eventIdea.title'),
                    text: t('dashboard.insights.eventIdea.text'),
                    color: '#60a5fa'
                });
            } else {
                list.push({
                    id: 'keep_going',
                    icon: <Rocket className="text-orange-500" />,
                    title: t('dashboard.insights.keepGoing.title'),
                    text: t('dashboard.insights.keepGoing.text', {
                        count: activeEvents.toString(),
                        active_events_text: activeEvents === 1 ? t('dashboard.insights.keepGoing.singular') : t('dashboard.insights.keepGoing.plural')
                    }),
                    color: '#f97316',
                    action: 'create',
                    buttonText: t('dashboard.insights.buttons.create')
                });
            }

            // 8. Profile Completeness Nudge
            if (!user?.bio || !user?.profilePhoto) {
                list.push({
                    id: 'complete_profile',
                    icon: <UserCircle className="text-pink-500" />,
                    title: t('dashboard.insights.completeProfile.title'),
                    text: t('dashboard.insights.completeProfile.text'),
                    color: '#ec4899',
                    action: 'settings',
                    buttonText: t('dashboard.insights.buttons.settings')
                });
            }

            // 9. Verification Nudge
            if (!user?.isVerified) {
                list.push({
                    id: 'get_verified',
                    icon: <ShieldCheck className="text-indigo-400" />,
                    title: t('dashboard.insights.getVerified.title'),
                    text: t('dashboard.insights.getVerified.text'),
                    color: '#818cf8',
                    action: 'settings',
                    buttonText: t('dashboard.insights.buttons.verify')
                });
            }

            // 10. Social Media - LinkedIn
            list.push({
                id: 'social_linkedin',
                icon: <Linkedin className="text-blue-500" />,
                title: "Inscreva-se no LinkedIn",
                text: "Conecte-se com a maior rede de mentores e profissionais de eventos da lusofonia.",
                color: '#0077b5',
                action: 'social_linkedin',
                buttonText: t('dashboard.insights.buttons.social')
            });

            // 11. Social Media - Facebook
            list.push({
                id: 'social_facebook',
                icon: <Facebook className="text-blue-600" />,
                title: "Nossa Comunidade no Facebook",
                text: "Acompanhe as novidades, eventos e dicas exclusivas na nossa página oficial.",
                color: '#1877f2',
                action: 'social_facebook',
                buttonText: t('dashboard.insights.buttons.social')
            });

            // 12. Social Media - YouTube
            list.push({
                id: 'social_youtube',
                icon: <Youtube className="text-red-600" />,
                title: "Tutoriais no YouTube",
                text: "Aprenda a dominar todas as ferramentas da plataforma com os nossos vídeos tutoriais.",
                color: '#ff0000',
                action: 'social_youtube',
                buttonText: t('dashboard.insights.buttons.social')
            });

            // 13. Referral nudge
            list.push({
                id: 'referral_impact',
                icon: <Share2 className="text-green-400" />,
                title: t('dashboard.insights.referralImpact.title'),
                text: t('dashboard.insights.referralImpact.text'),
                color: '#22c55e',
                action: 'referral',
                buttonText: t('dashboard.insights.buttons.referral')
            });

            // 12. Support
            list.push({
                id: 'support_ready',
                icon: <MessageSquare className="text-cyan-400" />,
                title: t('dashboard.insights.supportReady.title'),
                text: t('dashboard.insights.supportReady.text'),
                color: '#22d3ee'
            });

            setInsights(list);
        };

        generateInsights();
    }, [user, stats, forms, t]);

    useEffect(() => {
        if (insights.length > 1) {
            const timer = setInterval(() => {
                setCurrentInsight(prev => (prev + 1) % insights.length);
            }, 10000);
            return () => clearInterval(timer);
        }
    }, [insights]);

    if (insights.length === 0) return null;

    const insight = insights[currentInsight];

    const handleClick = () => {
        if (!insight.action) return;

        switch (insight.action) {
            case 'create':
                if (onCreateEvent) {
                    onCreateEvent();
                } else {
                    router.push('/dashboard/mentor/create');
                }
                break;
            case 'settings':
                if (onOpenSettings) {
                    onOpenSettings();
                } else {
                    router.push('/dashboard/mentor/settings');
                }
                break;
            case 'referral':
                // Try to trigger a global event or something if available
                break;
            case 'smartlinks':
                router.push('/dashboard/mentor/smart-links');
                break;
            case 'ads':
                router.push('/dashboard/mentor/ads');
                break;
            case 'social_linkedin':
                window.open('https://www.linkedin.com/company/inscreva-se', '_blank');
                break;
            case 'social_facebook':
                window.open('https://www.facebook.com/profile.php?id=61586427553486&locale=pt_BR', '_blank');
                break;
            case 'social_youtube':
                window.open('https://www.youtube.com/@Inscreva-se-events', '_blank');
                break;
        }
    };

    return (
        <div style={{ marginBottom: '2.5rem' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    onClick={handleClick}
                    className="luxury-card group"
                    style={{
                        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
                        padding: '1.5rem 2.5rem',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: `1px solid ${insight.color}30`,
                        boxShadow: `0 15px 35px ${insight.color}08`,
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: insight.action ? 'pointer' : 'default',
                        transition: 'border-color 0.3s ease'
                    }}
                >
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '4px', height: '100%', background: insight.color, opacity: 0.8 }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            style={{
                                background: `${insight.color}15`,
                                padding: '16px',
                                borderRadius: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: insight.color,
                                border: `1px solid ${insight.color}25`
                            }}
                        >
                            {insight.icon}
                        </motion.div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.3px' }}>
                                {insight.title}
                            </h4>
                            <p style={{ color: '#999', fontSize: '0.9rem', margin: 0, lineHeight: 1.5, maxWidth: '90%' }}>
                                {insight.text}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {insight.buttonText && (
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${insight.color}40` }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    background: insight.color,
                                    color: '#000',
                                    padding: '10px 22px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 900,
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClick();
                                }}
                            >
                                {insight.buttonText}
                                <Rocket size={14} />
                            </motion.button>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
                            {insights.map((_, idx) => (
                                <div
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentInsight(idx);
                                    }}
                                    style={{
                                        width: '6px',
                                        height: idx === currentInsight ? '20px' : '6px',
                                        background: idx === currentInsight ? insight.color : '#333',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
