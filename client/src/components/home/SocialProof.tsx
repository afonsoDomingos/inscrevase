import { Users, Calendar, TrendingUp, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { publicService, PublicImpactStats } from '@/lib/publicService';
import { useTranslate } from '@/context/LanguageContext';

export default function SocialProof() {
    const { t } = useTranslate();
    const [stats, setStats] = useState<PublicImpactStats | null>(null);

    useEffect(() => {
        publicService.getImpactStats().then(setStats).catch(console.error);
    }, []);

    const formatValue = (val: number | undefined) => {
        if (val === undefined) return '...';
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M+`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}k+`;
        return `${val}+`;
    };

    const statItems = [
        {
            icon: Calendar,
            value: formatValue(stats?.globalStats.totalEvents),
            label: t('home.stats.createdEvents'),
            color: '#FFD700'
        },
        {
            icon: Users,
            value: formatValue(stats?.globalStats.totalSubmissions),
            label: t('home.stats.subscribers'),
            color: '#00D4FF'
        },
        {
            icon: TrendingUp,
            value: formatValue(stats?.globalStats.totalMentors),
            label: t('home.stats.activeMentors'),
            color: '#FF6B9D'
        },
        {
            icon: Globe,
            value: `${stats?.globalStats.totalCountries || 0}+`,
            label: t('mentors.location'),
            color: '#4ADE80'
        }
    ];

    return (
        <section id="results-section" style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
            padding: '80px 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                backgroundImage: 'radial-gradient(circle, #FFD700 1px, transparent 1px)',
                backgroundSize: '50px 50px',
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '30px' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 900,
                        color: '#fff',
                        marginBottom: '1rem',
                        letterSpacing: '-1px'
                    }}>
                        {t('home.stats.title')}
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#aaa',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {t('home.stats.description')}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '30px'
                }}>
                    {statItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -10, boxShadow: `0 20px 40px ${item.color}20` }}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                padding: '40px 30px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <item.icon
                                size={48}
                                style={{
                                    color: item.color,
                                    marginBottom: '20px',
                                    display: 'block',
                                    margin: '0 auto 20px'
                                }}
                            />
                            <div style={{
                                fontSize: '3rem',
                                fontWeight: 900,
                                color: '#fff',
                                marginBottom: '10px',
                                background: `linear-gradient(135deg, ${item.color}, #fff)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {item.value}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#888',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: 600
                            }}>
                                {item.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
