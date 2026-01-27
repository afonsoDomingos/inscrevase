"use client";

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

export default function InstallPrompt({ isMobile = false }: { isMobile?: boolean }) {
    const { t } = useTranslate();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can add to home screen
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    if (isMobile) {
        return (
            <button
                onClick={handleInstallClick}
                className="mobile-link"
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    justifyContent: 'flex-start',
                    padding: '1.2rem 0',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '1.1rem',
                    color: '#000',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                <Download size={20} color="#000" />
                <span>{t('common.installApp') || 'Instalar App'}</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleInstallClick}
            className="icon-link"
            title={t('common.installApp') || 'Instalar Aplicativo'}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
            }}
        >
            <Download size={20} />
        </button>
    );
}
