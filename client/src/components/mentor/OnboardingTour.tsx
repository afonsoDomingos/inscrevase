/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

export interface Step {
    targetId: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const MENTOR_STEPS: Step[] = [
    {
        targetId: 'welcome-modal', // Virtual target for center modal
        title: 'Bem-vindo ao Inscreva-se! 💎',
        description: 'Sua jornada para criar eventos de sucesso começa agora. Vamos fazer um tour rápido pela sua cabine de comando.',
        position: 'center'
    },
    {
        targetId: 'mentor-create-btn',
        title: 'Crie seu Primeiro Evento',
        description: 'Aqui é onde a mágica acontece. Clique aqui para configurar webinars, cursos ou eventos presenciais com nossa IA.',
        position: 'bottom'
    },
    {
        targetId: 'mentor-stats-grid',
        title: 'Acompanhe seu Sucesso',
        description: 'Visualize suas vendas, inscritos e receita em tempo real. Seus números, transparentes e claros.',
        position: 'bottom'
    },
    {
        targetId: 'mentor-support-btn',
        title: 'Suporte & Aura AI',
        description: 'Precisa de ajuda? Acesse nosso suporte ou use a Aura AI para potencializar seu trabalho.',
        position: 'right'
    },
    {
        targetId: 'mentor-profile-photo',
        title: 'Sua Marca Pessoal',
        description: 'Gerencie seu perfil, faça upgrades de plano e configure seus dados de pagamento aqui.',
        position: 'left'
    }
];

interface OnboardingTourProps {
    steps: Step[];
    storageKey: string;
}

export default function OnboardingTour({ steps, storageKey }: OnboardingTourProps) {
    // Start only if not seen
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem(storageKey);
        if (!hasSeenTour) {
            // Small delay to ensure UI renders
            setTimeout(() => setIsVisible(true), 1500);
        }

        const handleStartTour = () => {
            setIsVisible(true);
            setCurrentStep(0);
        };

        window.addEventListener('start-onboarding', handleStartTour);
        return () => window.removeEventListener('start-onboarding', handleStartTour);
    }, [storageKey]);

    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            setTargetRect(null); // Reset rect
            const step = steps[currentStep];
            if (step.position === 'center') {
                return;
            }

            const element = document.getElementById(step.targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                // Scroll element into view smoothly if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [currentStep, isVisible]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem(storageKey, 'true');
    };

    const handleSkip = () => {
        setIsVisible(false);
        localStorage.setItem(storageKey, 'true');
    };

    if (!isVisible) return null;

    const step = steps[currentStep];
    const isCenter = step.position === 'center';

    // Calculate tooltip position based on targetRect
    const getTooltipStyle = () => {
        if (isCenter || !targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '500px'
            };
        }

        const gap = 20;
        let top = 0;
        let left = 0;
        const width = 320; // Tooltip width

        switch (step.position) {
            case 'bottom':
                top = targetRect.bottom + gap;
                left = targetRect.left + (targetRect.width / 2) - (width / 2);
                break;
            case 'top':
                top = targetRect.top - gap - 200; // approx height
                left = targetRect.left + (targetRect.width / 2) - (width / 2);
                break;
            case 'left':
                top = targetRect.top;
                left = targetRect.left - width - gap;
                break;
            case 'right':
                top = targetRect.top;
                left = targetRect.right + gap;
                break;
        }

        // Boundary checks to prevent overflowing screen
        if (left < 20) left = 20;
        if (left + width > window.innerWidth - 20) left = window.innerWidth - width - 20;

        // Vertical boundary check (assuming approx height of card ~250-300px)
        const estimatedHeight = 300;
        if (top + estimatedHeight > window.innerHeight) {
            // If it overflows bottom, try to align bottom-up or just clamp
            top = window.innerHeight - estimatedHeight - 20;
        }
        if (top < 20) top = 20;

        return {
            top: top,
            left: left,
            position: 'fixed' as const,
            width: `${width}px`
        };
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop / Spotlight Effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            background: 'rgba(0,0,0,0.6)',
                            cursor: 'pointer' // Indicate clickable
                        }}
                        onClick={handleSkip} // Allow closing by clicking background
                    >
                        {/* Optional: Highlight Glow specific to the target if not center */}
                        {!isCenter && targetRect && (
                            <motion.div
                                layoutId="spotlight"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{
                                    position: 'absolute',
                                    top: targetRect.top - 5,
                                    left: targetRect.left - 5,
                                    width: targetRect.width + 10,
                                    height: targetRect.height + 10,
                                    borderRadius: '12px',
                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.7), 0 0 30px rgba(255,215,0,0.5)',
                                    border: '2px solid #FFD700',
                                    zIndex: 9998,
                                    pointerEvents: 'none'
                                }}
                            />
                        )}
                    </motion.div>

                    {/* Tooltip Card */}
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none', display: isCenter ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: isCenter ? 0 : 0, y: isCenter ? 0 : 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                pointerEvents: 'auto',
                                background: '#fff',
                                borderRadius: '24px',
                                padding: '24px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                maxWidth: '400px',
                                width: '100%',
                                position: isCenter ? 'relative' : 'fixed',
                                ...(isCenter ? {} : getTooltipStyle())
                            }}
                            className="onboarding-card"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ background: '#FFF8E1', padding: '10px', borderRadius: '50%', color: '#B8860B' }}>
                                    <Sparkles size={24} />
                                </div>
                                <button onClick={handleSkip} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                    PULAR
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: 'var(--font-playfair)' }}>
                                {step.title}
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.5', marginBottom: '24px' }}>
                                {step.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: i === currentStep ? '20px' : '6px',
                                                height: '6px',
                                                borderRadius: '3px',
                                                background: i === currentStep ? '#FFD700' : '#eee',
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {currentStep > 0 && (
                                        <button
                                            onClick={handlePrev}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '12px',
                                                border: '1px solid #eee',
                                                background: '#fff',
                                                cursor: 'pointer',
                                                color: '#666'
                                            }}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '12px',
                                            background: '#1a1a1a',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                                        {currentStep === steps.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
