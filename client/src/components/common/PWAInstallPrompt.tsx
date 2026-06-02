"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect if already in standalone mode (already installed and open as app)
        const checkStandalone = () => {
            const isWindowStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isNavigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
            return isWindowStandalone || isNavigatorStandalone;
        };

        const inStandalone = checkStandalone();
        setIsStandalone(inStandalone);

        // Detect iOS
        const detectIOS = () => {
            return [
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod'
            ].includes(navigator.platform)
                // iPad on iOS 13 detection
                || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
        };

        const onIOS = detectIOS();
        setIsIOS(onIOS);

        // Listen for the PWA install prompt event (Chromium)
        const handleBeforeInstallPrompt = (e: Event) => {
            const promptEvent = e as BeforeInstallPromptEvent;
            promptEvent.preventDefault();
            setInstallPrompt(promptEvent);

            checkAndShow();
        };

        const checkAndShow = () => {
            if (inStandalone) return;

            let lastDismissed = 0;
            try {
                lastDismissed = parseInt(localStorage.getItem('pwa_prompt_dismissed_at') || '0');
            } catch {
                console.warn('localStorage not accessible for PWA prompt');
            }

            // Show if not dismissed in the last 24 hours
            const dayInMs = 24 * 60 * 60 * 1000;
            if (Date.now() - lastDismissed > dayInMs) {
                setTimeout(() => setIsVisible(true), 5000);
            }
        };

        // On iOS, we don't have beforeinstallprompt, so we check manually
        if (onIOS && !inStandalone) {
            checkAndShow();
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            setInstallPrompt(null);
            setIsVisible(false);
            setIsStandalone(true);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            // For iOS, we show a message explaining how to install
            alert('Para instalar: Clique no ícone de "Compartilhar" (quadrado com seta) na barra inferior e selecione "Adicionar ao Ecrã Principal".');
            return;
        }

        if (!installPrompt) return;

        installPrompt.prompt();
        await installPrompt.userChoice;

        setInstallPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
        } catch {
            console.warn('Failed to save PWA prompt dismissal to localStorage');
        }
    };

    if (!isVisible || isStandalone) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    zIndex: 99999,
                    maxWidth: '450px',
                    margin: '0 auto'
                }}
            >
                <div style={{
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '1.25rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    position: 'relative'
                }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'var(--gold-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 8px 16px rgba(212,175,55,0.2)'
                    }}>
                        <Smartphone size={28} color="#000" />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Oficial</span>
                            <Zap size={12} color="#D4AF37" fill="#D4AF37" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#000', margin: 0 }}>
                            {isIOS ? 'Adiciona ao teu iPhone' : 'Instala a nossa App'}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>
                            {isIOS ? 'Clica em partilhar e "Ecrã Principal"' : 'Acesso rápido aos teus livros e eventos.'}
                        </p>
                    </div>

                    <button
                        onClick={handleInstallClick}
                        style={{
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 16px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isIOS ? 'Instruções' : <><Download size={16} /> Instalar</>}
                    </button>

                    <button
                        onClick={handleDismiss}
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#fff',
                            border: '1px solid #eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        <X size={14} color="#666" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
