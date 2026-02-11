"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type Currency = 'MZN' | 'USD' | 'EUR' | 'AOA' | 'CVE' | 'XOF';

interface PlanPrices {
    MZN: number;
    USD: number;
    EUR?: number;
    AOA?: number;
    CVE?: number;
    XOF?: number;
}

interface Plan {
    name: string;
    prices: PlanPrices;
}

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (amount: number, fromCurrency?: string, targetCurrency?: string) => string;
    getPlanPrice: (planId: 'pro' | 'enterprise') => number;
    exchangeRate: number;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('USD');
    const [plans, setPlans] = useState<Record<string, Plan> | null>(null);
    const [exchangeRate, setExchangeRate] = useState(63.8);
    const [loading, setLoading] = useState(true);
    const [allRates, setAllRates] = useState<Record<Currency, number>>({
        USD: 1,
        EUR: 0.92,
        MZN: 63.8,
        AOA: 850,
        CVE: 100,
        XOF: 600
    });

    useEffect(() => {
        const savedCurrency = Cookies.get('NEXT_CURRENCY') as Currency;
        if (savedCurrency && ['MZN', 'USD', 'EUR', 'AOA', 'CVE', 'XOF'].includes(savedCurrency)) {
            setCurrencyState(savedCurrency);
        }

        // Fetch real-time exchange rates
        const fetchExchangeRates = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exchange-rates/current`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.rates) {
                        setAllRates(data.rates);
                        setExchangeRate(data.rates.MZN || 63.8);
                        console.log('✅ Exchange rates loaded:', data.rates);
                    }
                }
            } catch {
                console.warn('⚠️  Failed to fetch exchange rates, using fallback rates');
            }
        };

        fetchExchangeRates();

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
            // Fallbacks based on approximate exchange rates
            const basePriceUSD = planId === 'pro' ? 2.99 : 27.99;

            if (currency === 'MZN') return planId === 'pro' ? 175 : 1750;
            if (currency === 'EUR') return basePriceUSD;
            if (currency === 'AOA') return basePriceUSD * 850; // ~850 AOA per USD
            if (currency === 'CVE') return basePriceUSD * 100; // ~100 CVE per USD
            if (currency === 'XOF') return basePriceUSD * 600; // ~600 XOF per USD
            return basePriceUSD;
        }
        const plan = plans[planId];
        const rawAmount = plan.prices[currency] || plan.prices['USD'];
        return rawAmount / 100; // Convert cents to units
    };

    const formatPrice = (amount: number, fromCurrency: string = 'MZN', targetCurrency: string = currency) => {
        let displayAmount = amount;

        // Normalize input currencies
        const normalize = (c: string): Currency => {
            if (!c) return 'USD';
            const up = c.toString().toUpperCase().trim();
            if (up === 'MZN' || up === 'MT' || up === 'MTN' || up === 'METICAIS' || up === 'METICAL') return 'MZN';
            if (up === 'USD' || up === 'DOLAR' || up === 'DOLLAR' || up === '$') return 'USD';
            if (up === 'EUR' || up === 'EURO' || up === '€') return 'EUR';
            if (up === 'AOA' || up === 'KWANZA') return 'AOA';
            if (up === 'CVE' || up === 'ESCUDO') return 'CVE';
            if (up === 'XOF' || up === 'CFA' || up === 'FCFA') return 'XOF';
            return 'MZN';
        };

        const from = normalize(fromCurrency);
        const target = normalize(targetCurrency);

        // Currency conversion logic (using real-time rates from API)
        if (from !== target) {
            // Convert from source to USD, then to target
            const amountInUSD = amount / allRates[from];
            displayAmount = amountInUSD * allRates[target];
        }

        // Format based on target currency
        const formatOptions: Record<Currency, { locale: string; currency: string }> = {
            MZN: { locale: 'pt-MZ', currency: 'MZN' },
            USD: { locale: 'en-US', currency: 'USD' },
            EUR: { locale: 'pt-PT', currency: 'EUR' },
            AOA: { locale: 'pt-AO', currency: 'AOA' },
            CVE: { locale: 'pt-CV', currency: 'CVE' },
            XOF: { locale: 'fr-GN', currency: 'XOF' }
        };

        const config = formatOptions[target];
        let formatted = new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(displayAmount);

        // Clean up formatting quirks
        if (target === 'MZN') {
            formatted = formatted.replace('MTn', 'MT');
        }

        return formatted;
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
