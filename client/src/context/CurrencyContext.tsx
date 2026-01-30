"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type Currency = 'MZN' | 'USD';

interface PlanPrices {
    MZN: number;
    USD: number;
}

interface Plan {
    name: string;
    prices: PlanPrices;
}

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (amount: number, fromCurrency?: Currency, targetCurrency?: Currency) => string;
    getPlanPrice: (planId: 'pro' | 'enterprise') => number;
    exchangeRate: number;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('MZN');
    const [plans, setPlans] = useState<Record<string, Plan> | null>(null);
    const [exchangeRate, setExchangeRate] = useState(63.8);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedCurrency = Cookies.get('NEXT_CURRENCY') as Currency;
        if (savedCurrency && (savedCurrency === 'MZN' || savedCurrency === 'USD')) {
            setCurrencyState(savedCurrency);
        }

        const fetchPlans = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/plans`);
                const data = await response.json();
                if (data.success) {
                    setPlans(data.plans);
                    setExchangeRate(data.rate);
                }
            } catch (error) {
                console.error('Failed to fetch dynamic plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        Cookies.set('NEXT_CURRENCY', newCurrency, { expires: 365 });
    };

    const getPlanPrice = (planId: 'pro' | 'enterprise'): number => {
        if (!plans || !plans[planId]) {
            // Fallbacks
            if (planId === 'pro') return currency === 'MZN' ? 499 : 7.99;
            return currency === 'MZN' ? 4990 : 79.90;
        }
        const plan = plans[planId];
        const rawAmount = plan.prices[currency];
        return rawAmount / 100; // Convert cents to units
    };

    const formatPrice = (amount: number, fromCurrency: Currency = 'MZN', targetCurrency: Currency = currency) => {
        let displayAmount = amount;

        // If we are displaying in a different currency than the source, convert it
        if (fromCurrency !== targetCurrency) {
            if (fromCurrency === 'MZN' && targetCurrency === 'USD') {
                displayAmount = amount / exchangeRate;
            } else if (fromCurrency === 'USD' && targetCurrency === 'MZN') {
                displayAmount = amount * exchangeRate;
            }
        }

        if (targetCurrency === 'MZN') {
            return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' })
                .format(displayAmount)
                .replace('MTn', 'MT');
        } else {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                .format(displayAmount);
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, getPlanPrice, exchangeRate, loading }}>
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
