"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, TrendingUp, X, Globe, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { useCurrency, Currency } from '@/context/CurrencyContext';
import { useTranslate } from '@/context/LanguageContext';

export default function CurrencyWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const { loading: currencyLoading } = useCurrency();
    const { t } = useTranslate();
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    const fetchRates = async () => {
        setLoading(true);
        try {
            // Using a public API for real-time rates (USD base)
            const res = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await res.json();
            if (data.result === 'success') {
                setRates(data.rates);
                setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }));
            }
        } catch (error) {
            console.error('Error fetching rates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const relevantCurrencies: { code: Currency, name: string, flag: string }[] = [
        { code: 'MZN', name: 'Metical', flag: '🇲🇿' },
        { code: 'AOA', name: 'Kwanza', flag: '🇦🇴' },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'CVE', name: 'Escudo', flag: '🇨🇻' },
        { code: 'XOF', name: 'Franco CFA', flag: '🇬🇼' },
    ];

    if (currencyLoading) return null;

    return (
        <>
            {/* Floating Trigger Button on the Left */}
            <motion.div
                initial={{ x: -100 }}
                animate={{ x: isOpen ? -100 : 0 }}
                whileHover={{ x: 5 }}
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 999,
                    background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                    padding: '12px 8px',
                    borderRadius: '0 15px 15px 0',
                    cursor: 'pointer',
                    boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed'
                }}
            >
                <ArrowRightLeft size={18} color="#000" style={{ transform: 'rotate(90deg)', marginBottom: '5px' }} />
                <span style={{
                    color: '#000',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>
                    {t('home.widgets.currency.title')}
                </span>
            </motion.div>

            {/* Side Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 1000
                            }}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '100%',
                                maxWidth: '320px',
                                background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
                                backdropFilter: 'blur(20px)',
                                borderRight: '1px solid rgba(255, 215, 0, 0.3)',
                                zIndex: 1001,
                                padding: '2rem 1.5rem',
                                color: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '20px 0 50px rgba(0,0,0,0.5)',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)', padding: '8px', borderRadius: '12px' }}>
                                        <TrendingUp size={20} color="#000" />
                                    </div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {t('home.widgets.currency.marketTitle')}
                                    </h2>
                                </div>
                                <X
                                    size={24}
                                    style={{ cursor: 'pointer', opacity: 0.6 }}
                                    onClick={() => setIsOpen(false)}
                                />
                            </div>

                            <div style={{
                                background: 'rgba(255, 215, 0, 0.05)',
                                border: '1px solid rgba(255, 215, 0, 0.1)',
                                padding: '15px',
                                borderRadius: '20px',
                                marginBottom: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <Clock size={16} className="text-yellow-500" />
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                    {t('home.widgets.currency.lastUpdate')}: <span style={{ fontWeight: 700, color: '#FFD700' }}>{lastUpdate}</span>
                                </div>
                                {loading && <RefreshCw size={14} className="animate-spin ml-auto" />}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem', opacity: 0.7 }}>
                                    <DollarSign size={16} />
                                    <span style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px' }}>{t('home.widgets.currency.base')}: 1.00 USD</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {relevantCurrencies.map((rel) => (
                                        <motion.div
                                            key={rel.code}
                                            whileHover={{ x: 5, background: 'rgba(255, 255, 255, 0.05)' }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>{rel.flag}</span>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{rel.code}</span>
                                                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{rel.name}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 900, fontSize: '1rem', color: '#FFD700' }}>
                                                    {rates[rel.code] ? rates[rel.code].toFixed(2) : '---'}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', opacity: 0.4, fontWeight: 700 }}>{t('home.widgets.currency.tax')}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                                <div style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255, 215, 0, 0.1)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                    textAlign: 'center'
                                }}>
                                    <Globe size={32} color="#FFD700" style={{ marginBottom: '12px', margin: '0 auto 12px' }} />
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 800 }}>{t('home.widgets.currency.convertNow')}</h4>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0 0 15px 0' }}>{t('home.widgets.currency.convertDesc')}</p>
                                    <button
                                        onClick={() => window.location.href = '/dashboard/mentor/finance'}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '50px',
                                            background: '#FFD700',
                                            color: '#000',
                                            border: 'none',
                                            fontWeight: 900,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t('home.widgets.currency.viewFinance')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
