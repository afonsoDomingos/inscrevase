"use client";

import { Globe } from 'lucide-react';
import { useState } from 'react';
import { useTranslate } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useTranslate();
    const [isOpen, setIsOpen] = useState(false);

    const switchLanguage = (newLocale: 'pt' | 'en') => {
        setLocale(newLocale);
        setIsOpen(false);
    };

    const languages = [
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ] as const;

    const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: 'var(--paper, #fff)',
                    border: '1px solid var(--border-color, #eee)',
                    borderRadius: '8px',
                    color: 'var(--foreground, #333)',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    whiteSpace: 'nowrap'
                }}
            >
                <Globe size={12} color="#D4AF37" />
                <span>{currentLanguage.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        right: 0,
                        background: 'var(--paper, #fff)',
                        border: '1px solid var(--border-color, #eee)',
                        borderRadius: '10px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                        minWidth: '130px',
                        zIndex: 1000,
                        padding: '4px'
                    }}>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: locale === lang.code ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: locale === lang.code ? 700 : 500,
                                    color: locale === lang.code ? '#D4AF37' : 'var(--foreground, #333)',
                                    transition: 'all 0.1s',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ fontSize: '1rem' }}>{lang.flag}</span>
                                <span style={{ flex: 1 }}>{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
