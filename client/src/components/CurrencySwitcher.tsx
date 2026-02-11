"use client";

import { Coins } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslate } from '@/context/LanguageContext';

export default function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();
    const { t } = useTranslate();
    const [isOpen, setIsOpen] = useState(false);

    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'MZN', name: 'Metical Moz', symbol: 'MT' },
        { code: 'AOA', name: 'Kwanza Ang', symbol: 'Kz' },
        { code: 'CVE', name: 'Escudo CV', symbol: 'Esc' },
        { code: 'XOF', name: 'Franco CFA', symbol: 'CFA' }
    ] as const;

    const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.8rem',
                    background: '#f8f9fa',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#eee';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                }}
            >
                <Coins size={16} color="#B8860B" />
                <span>{currentCurrency.code}</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    minWidth: '180px',
                    zIndex: 1000,
                    padding: '5px'
                }}>
                    {currencies.map((c) => (
                        <button
                            key={c.code}
                            onClick={() => {
                                setCurrency(c.code as any);
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: currency === c.code ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: currency === c.code ? 700 : 500,
                                color: currency === c.code ? '#B8860B' : '#333',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem' }}>{c.code}</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{c.name}</span>
                            </div>
                            <span style={{ fontWeight: 800 }}>{c.symbol}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
