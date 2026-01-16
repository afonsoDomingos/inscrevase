"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type Currency = 'MZN' | 'USD';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (mznAmount: number, usdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('MZN');

    useEffect(() => {
        const savedCurrency = Cookies.get('NEXT_CURRENCY') as Currency;
        if (savedCurrency && (savedCurrency === 'MZN' || savedCurrency === 'USD')) {
            setCurrencyState(savedCurrency);
        }
    }, []);

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        Cookies.set('NEXT_CURRENCY', newCurrency, { expires: 365 });
    };

    const formatPrice = (mznAmount: number, usdAmount: number) => {
        if (currency === 'MZN') {
            return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' })
                .format(mznAmount)
                .replace('MTn', 'MT');
        } else {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                .format(usdAmount);
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
