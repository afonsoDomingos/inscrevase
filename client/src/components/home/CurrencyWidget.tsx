"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, TrendingUp, X, Globe, Clock, RefreshCw, Calculator } from 'lucide-react';
import { useCurrency, Currency } from '@/context/CurrencyContext';
import { useTranslate } from '@/context/LanguageContext';

export default function CurrencyWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const { loading: currencyLoading } = useCurrency();
    const { t } = useTranslate();
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState<number>(1);
    const [isMobile, setIsMobile] = useState(false);

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

    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Listener para abrir o painel via Inteligência Artificial
        const openFromBrain = () => {
            setIsHidden(false);
            setIsOpen(true);
        };
        window.addEventListener('brain-action-cambio', openFromBrain);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('brain-action-cambio', openFromBrain);
        };
    }, []);

    const handleHide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsHidden(true);
    };

    const relevantCurrencies: { code: Currency, name: string, flag: string }[] = [
        { code: 'MZN', name: 'Metical', flag: '🇲🇿' },
        { code: 'AOA', name: 'Kwanza', flag: '🇦🇴' },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'ZAR', name: 'Rand', flag: '🇿🇦' },
        { code: 'CVE', name: 'Escudo', flag: '🇨🇻' },
        { code: 'XOF', name: 'Franco CFA', flag: '🇬🇼' },
        { code: 'XAF', name: 'Franco CFA (BEAC)', flag: '🇨🇲' },
    ];

    if (currencyLoading) return null;

    return (
        <>
            {/* Floating Trigger Button on the Left */}
            <AnimatePresence>
                {!isHidden && !isOpen && (
                    <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 999 }}>
                        {/* Botão de Fechar Absoluto por Cima */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.2, background: '#ff4444' }}
                            onClick={handleHide}
                            style={{
                                position: 'absolute',
                                top: '-15px',
                                right: '-5px',
                                width: '18px',
                                height: '18px',
                                background: '#333',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 1000,
                                border: '2px solid #FFD700',
                                color: '#fff',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }}
                        >
                            <X size={10} strokeWidth={4} />
                        </motion.div>

                        <motion.div
                            initial={{ x: -100 }}
                            animate={{ x: 0 }}
                            exit={{ x: -100 }}
                            whileHover={{ x: 5 }}
                            onClick={() => setIsOpen(true)}
                            style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                                padding: isMobile ? '8px 3px' : '10px 4px',
                                borderRadius: '0 10px 10px 0',
                                cursor: 'pointer',
                                boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed'
                            }}
                        >
                            <ArrowRightLeft size={isMobile ? 12 : 14} color="#000" style={{ transform: 'rotate(90deg)', marginBottom: '3px' }} />
                            <span style={{
                                color: '#000',
                                fontWeight: 900,
                                fontSize: isMobile ? '0.55rem' : '0.6rem',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}>
                                {t('home.widgets.currency.title')}
                            </span>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                maxWidth: isMobile ? '100%' : '320px',
                                height: '100dvh', // use dynamic viewport height to avoid browser chrome issues
                                background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 1) 100%)',
                                backdropFilter: 'blur(20px)',
                                borderRight: isMobile ? 'none' : '1px solid rgba(255, 215, 0, 0.3)',
                                zIndex: 1001,
                                padding: isMobile ? '0.75rem 1rem' : '1.5rem 1.25rem',
                                color: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '20px 0 50px rgba(0,0,0,0.5)',
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '0.4rem' : '1.25rem', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)', padding: isMobile ? '5px' : '8px', borderRadius: '12px' }}>
                                        <TrendingUp size={isMobile ? 16 : 20} color="#000" />
                                    </div>
                                    <h2 style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {t('home.widgets.currency.marketTitle')}
                                    </h2>
                                </div>
                                <X
                                    size={isMobile ? 24 : 28}
                                    style={{ cursor: 'pointer', opacity: 0.8, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '4px', flexShrink: 0 }}
                                    onClick={() => setIsOpen(false)}
                                />
                            </div>

                            {/* Last update bar */}
                            <div style={{
                                background: 'rgba(255, 215, 0, 0.05)',
                                border: '1px solid rgba(255, 215, 0, 0.1)',
                                padding: isMobile ? '5px 10px' : '12px',
                                borderRadius: '12px',
                                marginBottom: isMobile ? '0.4rem' : '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexShrink: 0
                            }}>
                                <Clock size={13} className="text-yellow-500" />
                                <div style={{ fontSize: isMobile ? '0.6rem' : '0.75rem', opacity: 0.8 }}>
                                    {t('home.widgets.currency.lastUpdate')}: <span style={{ fontWeight: 700, color: '#FFD700' }}>{lastUpdate}</span>
                                </div>
                                {loading && <RefreshCw size={11} className="animate-spin ml-auto" />}
                            </div>

                            {/* Calculator Input */}
                            <div style={{ marginBottom: isMobile ? '0.4rem' : '1.25rem', flexShrink: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px', fontSize: '0.6rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>
                                    <Calculator size={12} className="text-yellow-500" />
                                    {t('home.widgets.currency.enterAmount')}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        placeholder="1.00"
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 215, 0, 0.2)',
                                            borderRadius: '12px',
                                            padding: isMobile ? '7px 40px 7px 14px' : '12px 40px 12px 16px',
                                            color: '#fff',
                                            fontSize: isMobile ? '1rem' : '1.1rem',
                                            fontWeight: 700,
                                            outline: 'none',
                                            transition: 'border-color 0.3s ease',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)'}
                                    />
                                    <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#FFD700', fontSize: '0.75rem' }}>
                                        USD
                                    </div>
                                </div>
                            </div>

                            {/* Rates List — flex: 1 + overflow: hidden so it fills remaining space without scrolling */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isMobile ? '3px' : '8px',
                                flex: 1,
                                overflow: 'hidden',
                                minHeight: 0,
                            }}>
                                {relevantCurrencies.slice(0, isMobile ? 5 : 7).map((rel) => (
                                    <motion.div
                                        key={rel.code}
                                        whileHover={{ x: 5, background: 'rgba(255, 255, 255, 0.05)' }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: isMobile ? '7px 10px' : '10px 14px',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            transition: 'all 0.3s ease',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>{rel.flag}</span>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 800, fontSize: isMobile ? '0.78rem' : '0.85rem' }}>{rel.code}</span>
                                                <span style={{ fontSize: isMobile ? '0.5rem' : '0.6rem', opacity: 0.5 }}>{rel.name}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 900, fontSize: isMobile ? '0.85rem' : '0.95rem', color: '#FFD700' }}>
                                                {rates[rel.code] ? (rates[rel.code] * amount).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                                            </div>
                                            <div style={{ fontSize: '0.5rem', opacity: 0.4, fontWeight: 700 }}>{rel.code} TOTAL</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer CTA */}
                            <div style={{
                                paddingTop: isMobile ? '0.4rem' : '1rem',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                flexShrink: 0,
                                marginTop: isMobile ? '0.4rem' : '0',
                            }}>
                                <div style={{
                                    padding: isMobile ? '0.6rem 0.75rem' : '1rem',
                                    background: 'rgba(255, 215, 0, 0.1)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                    textAlign: 'center'
                                }}>
                                    <Globe size={isMobile ? 16 : 24} color="#FFD700" style={{ marginBottom: isMobile ? '2px' : '8px', margin: '0 auto 2px', display: 'block' }} />
                                    <h4 style={{ margin: isMobile ? '2px 0' : '0 0 4px 0', fontSize: isMobile ? '0.7rem' : '0.85rem', fontWeight: 800, color: '#fff' }}>{t('home.widgets.currency.convertNow')}</h4>
                                    {!isMobile && <p style={{ fontSize: '0.65rem', opacity: 0.8, margin: '0 0 10px 0', color: '#fff' }}>{t('home.widgets.currency.convertDesc')}</p>}
                                    <button
                                        onClick={() => window.location.href = '/dashboard/mentor?tab=earnings'}
                                        style={{
                                            width: '100%',
                                            padding: isMobile ? '7px' : '10px',
                                            borderRadius: '50px',
                                            background: '#FFD700',
                                            color: '#000',
                                            border: 'none',
                                            fontWeight: 900,
                                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                                            cursor: 'pointer',
                                            marginTop: isMobile ? '4px' : '0',
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
