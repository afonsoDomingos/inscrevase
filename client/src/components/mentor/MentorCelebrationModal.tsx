"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, X, ArrowRight, Zap, Target } from 'lucide-react';
// @ts-expect-error
import confetti from 'canvas-confetti';

interface MentorCelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    newSubmissionsCount: number;
    totalSubmissions: number;
}

const MentorCelebrationModal: React.FC<MentorCelebrationModalProps> = ({
    isOpen,
    onClose,
    newSubmissionsCount,
    totalSubmissions
}) => {
    useEffect(() => {
        if (isOpen) {
            // Lançar confetes dourados para o mentor
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#FFD700', '#DAA520', '#FFFFFF']
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#FFD700', '#B8860B', '#F0E68C']
                });
            }, 250);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="celebration-overlay" style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        className="mentor-celebration-card"
                        style={{
                            maxWidth: '500px',
                            width: '100%',
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                            borderRadius: '32px',
                            border: '1px solid rgba(255, 215, 0, 0.2)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(255, 215, 0, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Decoration */}
                        <div style={{
                            position: 'absolute',
                            top: -100,
                            right: -100,
                            width: '250px',
                            height: '250px',
                            background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }} />

                        <div style={{ padding: '40px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#888',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>

                            <motion.div
                                initial={{ rotate: -15, scale: 0.5 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', damping: 10 }}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 24px',
                                    boxShadow: '0 10px 20px rgba(212, 175, 55, 0.3)'
                                }}
                            >
                                <Trophy size={40} color="#000" strokeWidth={2.5} />
                            </motion.div>

                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: 900,
                                color: '#fff',
                                marginBottom: '12px',
                                fontFamily: 'var(--font-playfair)'
                            }}>
                                {newSubmissionsCount === 1
                                    ? "Nova Inscrição Recebida! 🚀"
                                    : "Sucesso em Escala! 📈"}
                            </h2>

                            <p style={{
                                fontSize: '16px',
                                color: 'rgba(255,255,255,0.6)',
                                lineHeight: '1.6',
                                marginBottom: '32px'
                            }}>
                                {newSubmissionsCount === 1
                                    ? `Acabou de receber uma nova inscrição no seu evento. O seu impacto está a crescer!`
                                    : `Incrível! Recebeu ${newSubmissionsCount} novas inscrições desde a sua última visita.`}
                            </p>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                marginBottom: '32px'
                            }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ color: '#FFD700', marginBottom: '8px' }}>
                                        <Zap size={20} />
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                                        +{newSubmissionsCount}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Recentes
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ color: '#3b82f6', marginBottom: '8px' }}>
                                        <Users size={20} />
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                                        {totalSubmissions}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Total Inscritos
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
                                    border: 'none',
                                    borderRadius: '16px',
                                    color: '#000',
                                    fontSize: '16px',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Gerir Inscrições <ArrowRight size={20} />
                            </button>

                            <p style={{
                                marginTop: '24px',
                                fontSize: '12px',
                                color: '#444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}>
                                <Target size={14} /> Foco na conversão. O seu sucesso é o nosso.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MentorCelebrationModal;
