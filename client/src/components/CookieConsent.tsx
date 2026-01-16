"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslate } from '@/context/LanguageContext';
import Cookies from 'js-cookie';
import { X, Shield, BarChart, Target } from 'lucide-react';

export default function CookieConsent() {
    const { t } = useTranslate();
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        essential: true,
        analytics: true,
        marketing: true
    });

    useEffect(() => {
        const consent = Cookies.get('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        } else {
            try {
                const savedSettings = JSON.parse(consent);
                setSettings(savedSettings);
            } catch {
                // If invalid JSON, just show the banner
                setIsVisible(true);
            }
        }
    }, []);

    const handleAcceptAll = () => {
        const fullConsent = { essential: true, analytics: true, marketing: true };
        Cookies.set('cookie-consent', JSON.stringify(fullConsent), { expires: 365 });
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleRejectAll = () => {
        const minimalConsent = { essential: true, analytics: false, marketing: false };
        Cookies.set('cookie-consent', JSON.stringify(minimalConsent), { expires: 365 });
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleSaveSettings = () => {
        Cookies.set('cookie-consent', JSON.stringify(settings), { expires: 365 });
        setIsVisible(false);
        setShowSettings(false);
    };

    if (!isVisible && !showSettings) return null;

    return (
        <>
            <AnimatePresence>
                {isVisible && !showSettings && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            padding: '1.5rem',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderTop: '1px solid #eee',
                            boxShadow: '0 -10px 25px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            maxWidth: '100%'
                        }}
                    >
                        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#111' }}>
                                    {t('cookies.title')}
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
                                    {t('cookies.description')}{' '}
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        style={{ background: 'none', border: 'none', padding: 0, color: '#000', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        {t('cookies.settings')}
                                    </button>
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleRejectAll}
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        background: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t('cookies.reject')}
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: '#000',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t('cookies.accept')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSettings && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setShowSettings(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                position: 'relative',
                                background: '#fff',
                                borderRadius: '24px',
                                width: '100%',
                                maxWidth: '500px',
                                padding: '2rem',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('cookies.modalTitle')}</h3>
                                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                {/* Essential */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                                        <Shield size={20} color="#111" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: 700 }}>{t('cookies.essential.title')}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Obrigatório</span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>{t('cookies.essential.desc')}</p>
                                    </div>
                                </div>

                                {/* Analytics */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                                        <BarChart size={20} color="#111" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: 700 }}>{t('cookies.analytics.title')}</span>
                                            <input
                                                type="checkbox"
                                                checked={settings.analytics}
                                                onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>{t('cookies.analytics.desc')}</p>
                                    </div>
                                </div>

                                {/* Marketing */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                                        <Target size={20} color="#111" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: 700 }}>{t('cookies.marketing.title')}</span>
                                            <input
                                                type="checkbox"
                                                checked={settings.marketing}
                                                onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>{t('cookies.marketing.desc')}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    onClick={handleRejectAll}
                                    style={{ border: '1px solid #ddd', background: '#fff', padding: '1rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
                                >
                                    {t('cookies.reject')}
                                </button>
                                <button
                                    onClick={handleSaveSettings}
                                    style={{ border: 'none', background: '#000', color: '#fff', padding: '1rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
                                >
                                    {t('cookies.save')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
