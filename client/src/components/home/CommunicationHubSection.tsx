'use client';

import { motion } from 'framer-motion';
import { useTranslate } from '@/context/LanguageContext';
import Image from 'next/image';
import { Bell, BarChart2, FileText, Headphones, ArrowRight, Zap, LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface FeatureCardProps {
    icon: LucideIcon;
    titleKey: string;
    descriptionKey: string;
    delay: number;
}

export default function CommunicationHubSection() {
    const { t } = useTranslate();

    const features = [
        { icon: Zap, key: 'notifications' }, // Using Zap for "Solução"/"Notifications" as it implies speed/instant
        { icon: BarChart2, key: 'stats' },
        { icon: FileText, key: 'reports' },
        { icon: Headphones, key: 'support' }
    ];

    return (
        <section style={{ padding: '100px 0', background: '#050505', position: 'relative', overflow: 'hidden' }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', marginBottom: '1rem', fontWeight: 700 }}
                    >
                        {t('home.communicationHub.title').split('em um só lugar')[0]} <span className="gold-text">em um só lugar</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{ color: '#888', fontSize: '1.1rem' }}
                    >
                        {t('home.communicationHub.subtitle')}
                    </motion.p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>

                    {/* Left Side: 2x2 Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={feature.key}
                                icon={feature.icon}
                                titleKey={`home.communicationHub.cards.${feature.key}.title`}
                                descriptionKey={`home.communicationHub.cards.${feature.key}.description`}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>

                    {/* Right Side: Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ position: 'relative', height: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1000&auto=format&fit=crop"
                            alt="Communication Hub"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', zIndex: 1 }} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon: Icon, titleKey, descriptionKey, delay }: FeatureCardProps) {
    const { t } = useTranslate();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            style={{
                background: '#0f0f0f',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
            whileHover={{ y: -5, borderColor: 'rgba(255, 215, 0, 0.3)' }}
        >
            {/* Hover Glow */}
            <motion.div
                animate={{ opacity: isHovered ? 1 : 0 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                    pointerEvents: 'none'
                }}
            />

            <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFD700',
                marginBottom: '20px'
            }}>
                <Icon size={24} />
            </div>

            <div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                    {t(titleKey)}
                </h3>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {t(descriptionKey)}
                </p>
            </div>
        </motion.div>
    );
}
