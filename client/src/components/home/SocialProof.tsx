import { Users, Calendar, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { statsService } from '@/lib/statsService';

export default function SocialProof() {
    const [stats, setStats] = useState({
        totalEvents: 150,
        totalParticipants: 2500,
        totalMentors: 45,
        averageRating: 4.8
    });

    useEffect(() => {
        statsService.getPlatformStats().then(setStats);
    }, []);

    const statItems = [
        {
            icon: Calendar,
            value: `${stats.totalEvents}+`,
            label: 'Eventos Criados',
            color: '#FFD700'
        },
        {
            icon: Users,
            value: `${stats.totalParticipants.toLocaleString()}+`,
            label: 'Participantes Inscritos',
            color: '#00D4FF'
        },
        {
            icon: TrendingUp,
            value: `${stats.totalMentors}+`,
            label: 'Mentores Ativos',
            color: '#FF6B9D'
        },
        {
            icon: Star,
            value: stats.averageRating.toFixed(1),
            label: 'Avaliação Média',
            color: '#FFD700'
        }
    ];

    return (
        <section style={{
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
                    style={{ textAlign: 'center', marginBottom: '60px' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 900,
                        color: '#fff',
                        marginBottom: '1rem',
                        letterSpacing: '-1px'
                    }}>
                        Resultados que Falam
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#aaa',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Milhares de mentores confiam na Inscreva.se para escalar seus eventos
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
