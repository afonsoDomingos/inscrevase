"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import pt from '../messages/pt.json';
import en from '../messages/en.json';
import Cookies from 'js-cookie';

type Locale = 'pt' | 'en';

const translations = { pt, en };

interface LanguageContextType {
    locale: Locale;
    t: (key: string) => string;
    setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('pt');

    useEffect(() => {
        const savedLocale = Cookies.get('NEXT_LOCALE') as Locale;
        if (savedLocale && (savedLocale === 'pt' || savedLocale === 'en')) {
            setLocaleState(savedLocale);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 });
    };

    const t = (path: string) => {
        const keys = path.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = translations[locale];

        for (const key of keys) {
            if (current[key] === undefined) {
                // Fallback to PT if key not found in EN
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let fallback: any = translations['pt'];
                for (const fbKey of keys) {
                    if (fallback[fbKey] === undefined) return path;
                    fallback = fallback[fbKey];
                }
                return fallback;
            }
            current = current[key];
        }

        return current;
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
