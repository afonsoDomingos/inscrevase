"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const switchLanguage = (newLocale: string) => {
        // Remove current locale from pathname if it exists
        const pathnameWithoutLocale = pathname.replace(/^\/(pt|en)/, '');

        // Build new path with new locale
        const newPath = newLocale === 'pt'
            ? pathnameWithoutLocale || '/'
            : `/${newLocale}${pathnameWithoutLocale || '/'}`;

        router.push(newPath);
        setIsOpen(false);
    };

    const languages = [
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ];

    const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
                <Globe size={18} />
                <span>{currentLanguage.flag}</span>
                <span>{currentLanguage.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    minWidth: '150px',
                    zIndex: 1000
                }}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => switchLanguage(lang.code)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                background: locale === lang.code ? '#f8f9fa' : '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: locale === lang.code ? 600 : 400,
                                color: locale === lang.code ? '#FFD700' : '#333',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                            onMouseOver={(e) => {
                                if (locale !== lang.code) {
                                    e.currentTarget.style.background = '#f8f9fa';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (locale !== lang.code) {
                                    e.currentTarget.style.background = '#fff';
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
