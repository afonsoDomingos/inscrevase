"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Palette, CheckCircle, Zap, BarChart3, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslate } from "@/context/LanguageContext";

export default function FeaturesPage() {
    const { t } = useTranslate();

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const features = [
        { icon: <Palette size={40} />, title: t('landing.features.f1.title'), desc: t('landing.features.f1.description') },
        { icon: <CheckCircle size={40} />, title: t('landing.features.f2.title'), desc: t('landing.features.f2.description') },
        { icon: <Zap size={40} />, title: t('landing.features.f3.title'), desc: t('landing.features.f3.description') },
        { icon: <BarChart3 size={40} />, title: t('landing.features.f4.title'), desc: t('landing.features.f4.description') },
        { icon: <ShieldCheck size={40} />, title: t('landing.features.f5.title'), desc: t('landing.features.f5.description') },
        { icon: <MessageCircle size={40} />, title: t('landing.features.f6.title'), desc: t('landing.features.f6.description') }
    ];

    return (
        <main style={{ backgroundColor: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{
                padding: '160px 20px 80px',
                background: '#000',
                color: '#fff',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, background: 'radial-gradient(circle at 50% 50%, #FFD700 0%, transparent 70%)' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div {...fadeIn}>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-2px' }}>
                            Funcionalidades <span className="gold-text">Premium</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#ccc', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                            Tudo o que você precisa para gerir suas inscrições com o mais alto padrão de profissionalismo e tecnologia.
                        </p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <Link href="/cadastro" style={{
                                padding: '14px 50px',
                                borderRadius: '4px',
                                background: 'var(--gold-gradient)',
                                color: '#000',
                                fontWeight: 700,
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s'
                            }}>
                                Começar Agora
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Detail Grid */}
            <section style={{ padding: '100px 0', background: '#fff' }}>
                <div className="container">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}
                    >
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                variants={fadeIn}
                                whileHover={{ y: -10 }}
                                style={{
                                    padding: '50px',
                                    borderRadius: '24px',
                                    background: '#fcfcfc',
                                    border: '1px solid #f0f0f0',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '70px',
                                    height: '70px',
                                    background: 'var(--gold-gradient)',
                                    borderRadius: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#000',
                                    marginBottom: '2rem',
                                    boxShadow: '0 10px 20px rgba(255,215,0,0.15)'
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#000' }}>{f.title}</h3>
                                <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '1.5rem' }}>{f.desc}</p>
                                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Disponível em todos os planos <ArrowRight size={14} />
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <footer style={{ padding: '80px 0 40px', background: '#000', color: '#fff', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Pronto para revolucionar seus eventos?</h2>
                    <Link href="/cadastro" style={{
                        display: 'inline-block',
                        padding: '16px 60px',
                        borderRadius: '4px',
                        background: '#fff',
                        color: '#000',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontSize: '1rem'
                    }}>
                        Criar Minha Conta Grátis
                    </Link>
                    <p style={{ marginTop: '4rem', opacity: 0.5, fontSize: '0.8rem' }}>
                        Inscreva-se © 2026 • Excelência & Tecnologia
                    </p>
                </div>
            </footer>
        </main>
    );
}
