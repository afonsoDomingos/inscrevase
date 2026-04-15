"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useTranslate } from "@/context/LanguageContext";
import PlansSection from "@/components/common/PlansSection";
import Footer from "@/components/Footer";

export default function PlansPage() {
    const { t } = useTranslate();

    return (
        <main style={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{ padding: '120px 20px 60px', textAlign: 'center', background: '#000', color: '#fff' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '8px 20px',
                        borderRadius: '100px',
                        marginBottom: '20px'
                    }}>
                        <span style={{ color: '#FFD700', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ✨ {t('plans.limitedOffer') || 'Oferta por Tempo Limitado: 30 Dias Grátis no Pro'}
                        </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1rem', fontWeight: 800 }}>
                        {t('plans.titlePart1') || 'Planos e'} <span className="gold-text">{t('plans.titlePart2') || 'Preços'}</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', maxWidth: '700px', margin: '0 auto' }}>
                        {t('plans.subtitle') || 'Escolha o plano perfeito para o seu crescimento. Sem compromisso, cancele quando quiser.'}
                    </p>
                </motion.div>
            </section>

            {/* Reusable Plans Section */}
            <section style={{ padding: '60px 20px', background: '#fff', flex: 1 }}>
                <PlansSection showTitle={false} />
            </section>

            <Footer />
        </main>
    );
}
