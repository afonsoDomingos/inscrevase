"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Palette, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslate } from "@/context/LanguageContext";

const galleryImages = [
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1561489413-985b06da5bee?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"
];

export default function Home() {
  const { t } = useTranslate();
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hero-title"
          >
            <motion.span
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'block' }}
            >
              {t('landing.hero.title1')}
            </motion.span>
            <motion.span
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'block' }}
              className="gold-text luxury-shimmer"
            >
              {t('landing.hero.title2')}
            </motion.span>
            <motion.span
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'block', fontSize: '2.5rem', marginTop: '1rem', fontWeight: 400 }}
            >
              {t('landing.hero.title3').split(' ')[0]} <span style={{ fontWeight: 800 }}>{t('landing.hero.title3').split(' ')[1]}</span>
            </motion.span>
          </motion.h1>
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t('landing.hero.description')}
          </motion.p>
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Link href="/entrar" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {t('common.getStarted')} <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Infinite Gallery Section */}
      <section style={{ overflow: 'hidden', padding: '0 0 4rem 0', background: '#fff' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', overflow: 'hidden' }}>
          {/* Row 1: Left Scroll */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            style={{ display: 'flex', gap: '1.5rem', flexShrink: 0, paddingRight: '1.5rem' }}
          >
            {[...galleryImages, ...galleryImages].map((src, i) => (
              <div key={`row1 - ${i} `} style={{
                position: 'relative',
                width: '350px',
                height: '220px',
                borderRadius: '16px',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <Image src={src} alt="Evento" fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
              </div>
            ))}
          </motion.div>

          {/* Row 2: Right Scroll (Reverse) */}
          <motion.div
            initial={{ x: "-50%" }}
            animate={{ x: 0 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
            style={{ display: 'flex', gap: '1.5rem', flexShrink: 0, paddingRight: '1.5rem' }}
          >
            {[...galleryImages, ...galleryImages].map((src, i) => (
              <div key={`row2 - ${i} `} style={{
                position: 'relative',
                width: '350px',
                height: '220px',
                borderRadius: '16px',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <Image src={src} alt="Evento" fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, rgba(250, 250, 250, 1) 70%)',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem' }}>{t('landing.features.title')} <span className="gold-text">{t('landing.features.titleHighlight')}</span></h2>
            <p style={{ color: '#666', maxWidth: '600px', margin: '1rem auto' }}>
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid">
            <FeatureCard
              icon={<Palette className="gold-text" />}
              title={t('landing.features.f1.title')}
              description={t('landing.features.f1.description')}
            />
            <FeatureCard
              icon={<CheckCircle className="gold-text" />}
              title={t('landing.features.f2.title')}
              description={t('landing.features.f2.description')}
            />
            <FeatureCard
              icon={<Zap className="gold-text" />}
              title={t('landing.features.f3.title')}
              description={t('landing.features.f3.description')}
            />
            <FeatureCard
              icon={<BarChart3 className="gold-text" />}
              title={t('landing.features.f4.title')}
              description={t('landing.features.f4.description')}
            />
            <FeatureCard
              icon={<ShieldCheck className="gold-text" />}
              title={t('landing.features.f5.title')}
              description={t('landing.features.f5.description')}
            />
            <FeatureCard
              icon={<Palette className="gold-text" />}
              title={t('landing.features.f6.title')}
              description={t('landing.features.f6.description')}
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="section">
        <div className="container">
          <div className="luxury-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{t('landing.cta.title')}</h2>
            <p style={{ color: '#666', marginBottom: '3rem', fontSize: '1.1rem' }}>
              {t('landing.cta.description')}
            </p>
            <Link href="/cadastro" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
              {t('landing.cta.button')}
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ padding: '4rem 0', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>
            Inscreva<span className="gold-text">.se</span>
          </p>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} Inscreva-se. {t('landing.footer.rights')}
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="luxury-card"
      style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '3rem 2rem'
      }}
    >
      <div style={{
        marginBottom: '1.5rem',
        background: 'rgba(255, 215, 0, 0.08)',
        padding: '1.2rem',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 215, 0, 0.2)'
      }}>
        <div style={{ transform: 'scale(1.2)' }}>
          {icon}
        </div>
      </div>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', fontFamily: 'var(--font-playfair)' }}>{title}</h3>
      <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.95rem' }}>{description}</p>
    </motion.div>
  );
}
