'use client';

import { motion } from 'framer-motion';
import { useTranslate } from '@/context/LanguageContext';
import {
    GraduationCap,
    Building2,
    Cpu,
    Music,
    HeartPulse,
    Briefcase,
    TrendingUp,
    Users,
    LucideIcon
} from 'lucide-react';

interface SectorCardProps {
    icon: LucideIcon;
    titleKey: string;
    descriptionKey: string;
    color: string;
    delay: number;
}

export default function SectorsSection() {
    const { t } = useTranslate();

    const sectors = [
        { icon: GraduationCap, key: 'education', color: '#FFD700' },
        { icon: Building2, key: 'corporate', color: '#C0C0C0' }, // Silver/Platinum
        { icon: Cpu, key: 'tech', color: '#00f2ea' }, // Cyan accent
        { icon: Music, key: 'entertainment', color: '#ff0080' }, // Pink accent
        { icon: HeartPulse, key: 'health', color: '#10b981' }, // Green accent
        { icon: Briefcase, key: 'finance', color: '#D4AF37' },
        { icon: TrendingUp, key: 'marketing', color: '#FF4500' }, // Orange accent
        { icon: Users, key: 'community', color: '#3b82f6' } // Blue accent
    ];

    return (
        <section style={{ padding: '100px 0', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(20, 82, 173, 0.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: '#fff', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)' }}
                    >
                        <span className="gold-text">{t('home.sectors.title').split(' ')[0]}</span> {t('home.sectors.title').split(' ').slice(1).join(' ')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{ color: '#888', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}
                    >
                        {t('home.sectors.description')}
                    </motion.p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {sectors.map((sector, index) => (
                        <SectorCard
                            key={sector.key}
                            icon={sector.icon}
                            titleKey={`home.sectors.${sector.key}.title`}
                            descriptionKey={`home.sectors.${sector.key}.description`}
                            color={sector.color}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            </div>

            {/* Curved Divider to White Section */}
            <div style={{
                position: 'absolute',
                bottom: '-1px',
                left: 0,
                width: '100%',
                overflow: 'hidden',
                lineHeight: 0,
                transform: 'rotate(180deg)',
                zIndex: 2
            }}>
                <svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    style={{
                        position: 'relative',
                        display: 'block',
                        width: 'calc(100% + 1.3px)',
                        height: '100px',
                        fill: '#fff'
                    }}
                >
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>
        </section>
    );
}

function SectorCard({ icon: Icon, titleKey, descriptionKey, color, delay }: SectorCardProps) {
    const { t } = useTranslate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="sector-card"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '30px',
                borderRadius: '20px',
                transition: 'all 0.4s ease',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden'
            }}
            whileHover={{ y: -10, borderColor: `${color}40`, boxShadow: `0 20px 40px -10px ${color}15` }}
        >
            <div style={{
                marginBottom: '20px',
                background: `${color}15`,
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                <Icon size={30} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
                {t(titleKey)}
            </h3>
            <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {t(descriptionKey)}
            </p>

            {/* Hover dash at bottom */}
            <div className="hover-line" style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '0%',
                height: '3px',
                background: color,
                transition: 'width 0.4s ease'
            }} />

            <style jsx>{`
                .sector-card:hover .hover-line { width: 100% !important; }
             `}</style>
        </motion.div>
    );
}
