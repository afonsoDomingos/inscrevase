"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

export default function NotFound() {
    const { t } = useTranslate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050505',
            color: '#fff',
            fontFamily: 'var(--font-inter), sans-serif',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 style={{
                        fontSize: '12rem',
                        fontWeight: 900,
                        margin: 0,
                        lineHeight: 1,
                        background: 'linear-gradient(to bottom, #fff, #333)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        opacity: 0.2
                    }}>
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{ marginTop: '-40px' }}
                >
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        marginBottom: '15px',
                        fontFamily: 'var(--font-playfair), serif'
                    }}>
                        {t('common.pageNotFound') || 'Página Não Encontrada'}
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#888',
                        marginBottom: '40px',
                        lineHeight: 1.6
                    }}>
                        {t('common.pageNotFoundDesc') || 'Desculpe, o link que você seguiu pode estar quebrado ou a página pode ter sido removida.'}
                    </p>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px'
                    }}>
                        <Link href="/" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'var(--gold-gradient, linear-gradient(to right, #D4AF37, #F9D976))',
                            color: '#000',
                            padding: '12px 25px',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            transition: 'all 0.3s'
                        }}>
                            <Home size={18} /> {t('nav.home') || 'Início'}
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                padding: '12px 25px',
                                borderRadius: '100px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            <ArrowLeft size={18} /> {t('common.back') || 'Voltar'}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Background elements */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(212, 175, 55, 0.03)',
                    filter: 'blur(100px)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '5%',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    filter: 'blur(80px)',
                    borderRadius: '50%'
                }} />
            </div>
        </div>
    );
}
