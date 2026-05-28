'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

const milestones = [
    {
        id: 'silver',
        title: 'Silver Milestone',
        description: 'Vendas superiores a',
        value: '10 mil',
        currency: 'Meticais',
        subtitle: 'Primeiro grande passo',
        color: '#94a3b8', // Silver/Slate
        textColor: '#fff',
        icon: '🥈'
    },
    {
        id: 'emerald',
        title: 'Emerald Milestone',
        description: 'Parabéns por alcançar',
        value: '100 mil',
        currency: 'Meticais',
        subtitle: 'Conquista de prestígio',
        color: '#10b981', // Emerald
        textColor: '#fff',
        icon: '💎'
    },
    {
        id: 'black',
        title: 'Black Pearl',
        description: 'Parabéns por alcançar',
        value: '1 milhão',
        currency: 'Meticais',
        subtitle: 'Domínio de Mercado',
        color: '#000', // Black
        textColor: '#fff',
        icon: '🌟'
    }
];

export default function MentorMilestonesSection() {
    // Component logic here

    return (
        <section style={{
            padding: '100px 0',
            background: '#fafafa',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background elements */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, rgba(255,255,255,0) 70%)',
                zIndex: 0
            }} />

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                            fontWeight: 800,
                            color: '#111',
                            marginBottom: '1rem',
                            letterSpacing: '-0.5px'
                        }}>
                            Conquiste marcos e seja <span style={{ color: '#D4AF37' }}>reconhecido</span>
                        </h2>
                        <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
                            Nosso sistema de reconhecimento celebra cada conquista dos nossos criadores, desde os primeiros passos até os grandes marcos de vendas.
                        </p>
                    </motion.div>
                </div>

                {/* Milestone Cards Carousel/Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '40px',
                    justifyContent: 'center'
                }}>
                    {milestones.map((milestone, idx) => (
                        <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            style={{
                                background: '#fff',
                                borderRadius: '24px',
                                padding: '12px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                        >
                            {/* Recognition Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '24px',
                                right: '24px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: milestone.id === 'black' ? 'linear-gradient(135deg, #FFD700, #D4AF37)' : '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid #fff',
                                zIndex: 2
                            }}>
                                <CheckCircle2 size={16} color="#fff" />
                            </div>

                            {/* Inner Card (The Plate) */}
                            <div style={{
                                background: milestone.color,
                                borderRadius: '16px',
                                padding: '60px 40px',
                                color: milestone.textColor,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '20px',
                                flex: 1,
                                minHeight: '400px',
                                border: milestone.id === 'black' ? '2px solid rgba(212,175,55,0.3)' : 'none',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Plate Reflection Effect */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    left: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)',
                                    animation: 'shine 6s infinite linear'
                                }} />

                                <style jsx>{`
                                    @keyframes shine {
                                        0% { transform: translate(-30%, -30%); }
                                        100% { transform: translate(30%, 30%); }
                                    }
                                `}</style>

                                <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    Inscreva-se {milestone.id === 'black' ? 'Elite' : 'Mentor'}
                                </div>

                                <div style={{ fontSize: '3.5rem' }}>{milestone.icon}</div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>
                                        {milestone.description}
                                    </div>
                                    <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>
                                        {milestone.value}
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '5px' }}>
                                        {milestone.currency} em vendas
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: 'auto',
                                    width: '100%',
                                    height: '4px',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        style={{ height: '100%', background: milestone.id === 'gold' ? '#000' : '#fff' }}
                                    />
                                </div>
                            </div>

                            {/* Card Info Area */}
                            <div style={{ padding: '20px 10px 10px' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111' }}>{milestone.value} {milestone.currency}</div>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>{milestone.subtitle}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Growth Insight CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ marginTop: '60px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#666' }}
                >
                    <TrendingUp size={20} color="#D4AF37" />
                    <span>Junte-se a centenas de criadores de sucesso e comece a sua jornada hoje mesmo.</span>
                </motion.div>
            </div>
        </section>
    );
}
