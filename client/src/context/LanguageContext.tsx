"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import pt from '../messages/pt.json';
import en from '../messages/en.json';
import Cookies from 'js-cookie';

type Locale = 'pt' | 'en';

const translations = { pt, en };

interface LanguageContextType {
    locale: Locale;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: (key: string, variables?: Record<string, string | number>, options?: { returnObjects?: boolean }) => any;
    setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('pt');

    useEffect(() => {
        const savedLocale = Cookies.get('NEXT_LOCALE') as Locale;
        if (savedLocale && (savedLocale === 'pt' || savedLocale === 'en')) {
            setLocaleState(savedLocale);
        } else {
            // Auto-detect based on geolocation
            const detectLocation = async () => {
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    const data = await res.json();
                    const country = data.country_code;

                    const englishSpeakingCountries = [
                        'NG', 'US', 'GB', 'CA', 'AU', 'ZA', 'IE', 'NZ', 'IN', 'GH', 'KE', 'UG', 'RW', 'BW', 'NA', 'ZW', 'ZM', 'MW', 'LS', 'SZ', 'LR', 'SL', 'GM'
                    ];
                    const portugueseSpeakingCountries = ['MZ', 'AO', 'PT', 'BR', 'GW', 'ST', 'CV', 'TL', 'GQ'];

                    if (englishSpeakingCountries.includes(country)) {
                        setLocale('en');
                    } else if (portugueseSpeakingCountries.includes(country)) {
                        setLocale('pt');
                    } else {
                        // Optional: fallback to browser language
                        const browserLang = navigator.language.split('-')[0];
                        if (browserLang === 'en' || browserLang === 'pt') {
                            setLocale(browserLang as Locale);
                        }
                    }
                } catch (error) {
                    console.error('Error detecting location:', error);
                }
            };
            detectLocation();
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 });
    };

    const t = (path: string, variables?: Record<string, string | number>, options?: { returnObjects?: boolean }) => {
        const keys = path.split('.');

        const getNestedValue = (obj: unknown, keysArray: string[]): unknown => {
            let current = obj;
            for (const key of keysArray) {
                if (current && typeof current === 'object' && !Array.isArray(current) && key in current) {
                    current = (current as Record<string, unknown>)[key];
                } else {
                    return undefined;
                }
            }
            return current;
        };

        let value = getNestedValue(translations[locale], keys);

        if (value === undefined && locale !== 'pt') {
            value = getNestedValue(translations['pt'], keys);
        }

        if (value === undefined) {
            return path;
        }

        // Return raw object/array if requested
        if (options?.returnObjects) {
            return value;
        }

        if (typeof value === 'string' && variables) {
            let result = value;
            Object.entries(variables).forEach(([key, val]) => {
                result = result.replace(new RegExp(`{${key}}`, 'g'), String(val));
            });
            return result;
        }

        return typeof value === 'string' ? value : path;
    };

    return (
        <LanguageContext.Provider value={{ locale, t, setLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslate() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslate must be used within a LanguageProvider');
    }
    return context;
}
