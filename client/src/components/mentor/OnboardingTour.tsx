/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

export interface Step {
    targetId: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
    steps: Step[];
    storageKey: string;
}

export default function OnboardingTour({ steps, storageKey }: OnboardingTourProps) {
    const { t } = useTranslate();
    // Start only if not seen
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const updateIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        updateIsMobile();
        window.addEventListener('resize', updateIsMobile);
        return () => window.removeEventListener('resize', updateIsMobile);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setIsVisible(false);
            return;
        }

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
    }, [storageKey, isMobile]);

    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            const step = steps[currentStep];
            if (step.position === 'center') {
                setTargetRect(null);
                return;
            }

            const element = document.getElementById(step.targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
            } else {
                setTargetRect(null);
            }
        };

        // Scroll element into view only when step changes
        const step = steps[currentStep];
        if (step.position !== 'center') {
            const element = document.getElementById(step.targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Delay to allow smooth scroll to finish
                setTimeout(updatePosition, 500);
            }
        } else {
            updatePosition();
        }

        const handleUpdate = () => {
            // Use requestAnimationFrame for smoother updates during scroll/resize
            requestAnimationFrame(updatePosition);
        };

        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, { passive: true });

        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate);
        };
    }, [currentStep, isVisible, steps]);

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
                maxWidth: '500px',
                position: 'fixed' as const
            };
        }

        const gap = 16;
        let top: string | number = 0;
        let left: string | number = 0;
        let transform = '';
        const width = window.innerWidth < 480 ? window.innerWidth * 0.9 : 340;

        switch (step.position) {
            case 'bottom':
                top = targetRect.bottom + gap;
                left = targetRect.left + (targetRect.width / 2) - (width / 2);
                break;
            case 'top':
                top = targetRect.top - gap;
                left = targetRect.left + (targetRect.width / 2) - (width / 2);
                transform = 'translateY(-100%)';
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2);
                left = targetRect.left - width - gap;
                transform = 'translateY(-50%)';
                break;
            case 'right':
                top = targetRect.top + (targetRect.height / 2);
                left = targetRect.right + gap;
                transform = 'translateY(-50%)';
                break;
        }

        // Screen boundary safety and clamping
        const padding = 16;
        const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

        // On small mobiles, force more vertical stacking for left/right positions
        if (isMobile && (step.position === 'left' || step.position === 'right')) {
            top = targetRect.bottom + gap;
            left = targetRect.left + (targetRect.width / 2) - (width / 2);
            transform = '';
        }

        // Horizontal boundary safety and clamping
        if (typeof left === 'number') {
            if (left < padding) left = padding;
            if (left + width > window.innerWidth - padding) left = window.innerWidth - width - padding;
        }

        // Vertical boundary safety (ensure it's not off-screen top or bottom)
        if (typeof top === 'number') {
            if (top < padding) top = padding;
            // Rough estimate of card height to prevent bottom overflow
            const estimatedHeight = 250;
            if (top + estimatedHeight > window.innerHeight - padding) {
                top = Math.max(padding, window.innerHeight - estimatedHeight - padding);
            }
        }

        return {
            top: top,
            left: left,
            transform: transform,
            position: 'fixed' as const,
            width: isMobile ? `calc(100vw - ${padding * 2}px)` : `${width}px`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10001
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
                                padding: window.innerWidth < 480 ? '20px' : '28px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                                maxWidth: 'calc(100vw - 32px)',
                                width: '100%',
                                border: '1px solid rgba(255,215,0,0.2)',
                                ...getTooltipStyle()
                            }}
                            className="onboarding-card"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ background: '#FFF8E1', padding: '10px', borderRadius: '50%', color: '#B8860B' }}>
                                    <Sparkles size={24} />
                                </div>
                                <button onClick={handleSkip} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {t('dashboard.settings.tour.skip')}
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
                                        {currentStep === steps.length - 1 ? t('dashboard.settings.tour.finish') : t('dashboard.settings.tour.next')}
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
