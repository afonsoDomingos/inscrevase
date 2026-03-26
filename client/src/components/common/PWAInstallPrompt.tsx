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

    useEffect(() => {
        // Listen for the PWA install prompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            const promptEvent = e as BeforeInstallPromptEvent;
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            promptEvent.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(promptEvent);
            
            // Wait a few seconds before showing our custom UI
            const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!hasDismissed) {
                setTimeout(() => setIsVisible(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if already installed
        window.addEventListener('appinstalled', () => {
            setInstallPrompt(null);
            setIsVisible(false);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        
        // Show the native browser install prompt
        installPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setInstallPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Remember dismissal for 7 days
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isVisible) return null;

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
                    {/* Icon section */}
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

                    {/* Text section */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Oficial</span>
                            <Zap size={12} color="#D4AF37" fill="#D4AF37" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#000', margin: 0 }}>Instala a nossa App oficial</h3>
                        <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>Acesso rápido aos teus livros e eventos.</p>
                    </div>

                    {/* Action section */}
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
                        <Download size={16} /> Instalar
                    </button>

                    {/* Close button */}
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
