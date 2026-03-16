"use client";

import { useCurrency, Currency } from "@/context/CurrencyContext";
import { Coins } from 'lucide-react';
import { useState } from 'react';

export default function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();
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
                <Coins size={12} color="#D4AF37" />
                <span>{currentCurrency.code}</span>
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
                        overflowY: 'auto',
                        maxHeight: '300px',
                        minWidth: '150px',
                        zIndex: 9999,
                        padding: '4px'
                    }} className="custom-scrollbar">
                        {currencies.map((c) => (
                            <button
                                key={c.code}
                                onClick={() => {
                                    setCurrency(c.code as Currency);
                                    setIsOpen(false);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: currency === c.code ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: currency === c.code ? 700 : 500,
                                    color: currency === c.code ? '#D4AF37' : 'var(--foreground, #333)',
                                    transition: 'all 0.1s',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{c.code}</span>
                                    <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{c.name}</span>
                                </div>
                                <span style={{ fontWeight: 800, color: '#D4AF37', fontSize: '0.8rem' }}>{c.symbol}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
