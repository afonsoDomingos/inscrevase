"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, Palette, Zap, ShieldCheck, BarChart3, MessageCircle } from "lucide-react";
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
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const [videoSrc, setVideoSrc] = useState("/banner3.mp4");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setVideoSrc("/banner.mp4");
      } else {
        setVideoSrc("/banner3.mp4");
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main style={{ backgroundColor: '#fff', overflow: 'hidden' }}>
      <Navbar />

      {/* Hero Section with Video Background */}
      <section className="hero" style={{
        position: 'relative',
        minHeight: '85vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 20px 40px',
        overflow: 'hidden'
      }}>
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          key={videoSrc}
          poster="/hero-bg.png"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            opacity: 0.6 // Controlled opacity for better text readability
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Gradient Overlay for Sophistication */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
          zIndex: 1
        }} />

        {/* Moving Spotlight Effect (Temporarily Disabled)
        <motion.div 
           animate={{ 
             x: ['-100%', '100%'],
             opacity: [0, 0.2, 0]
           }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           style={{ 
             position: 'absolute', 
             top: 0, 
             left: 0, 
             width: '50%', 
             height: '100%', 
             background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.1), transparent)',
             transform: 'skewX(-20deg)',
             pointerEvents: 'none',
             zIndex: 2
           }} 
        />
        */}

        {/* Animated Background Elements (Temporarily Disabled)
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', opacity: 0.5, zIndex: 1 }}>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', top: '-10%', left: '10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)', borderRadius: '50%' }}
          />
        </div>
        */}

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{
              color: '#FFD700',
              textTransform: 'uppercase',
              letterSpacing: '5px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'block',
              marginBottom: '1rem'
            }}>
              ✨ {t('landing.hero.subtitle') || 'A Nova Era de Eventos'}
            </span>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.8rem)', color: '#fff', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 300 }}>{t('landing.hero.title1')}</span>
              <span className="gold-text luxury-shimmer" style={{ display: 'block', fontWeight: 900 }}>{t('landing.hero.title2')}</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '800px',
              margin: '0 auto 3rem',
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              {t('landing.hero.description')}
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/entrar" className="btn-primary" style={{ padding: '1.2rem 3rem', borderRadius: '100px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {t('common.getStarted')} <ArrowRight size={20} />
              </Link>
              <Link href="/mentores" style={{ padding: '1.2rem 3rem', borderRadius: '100px', fontSize: '1.1rem', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', fontWeight: 600, backdropFilter: 'blur(10px)', transition: 'all 0.3s' }}>
                {t('common.seeExamples')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Infinite Scroll Gallery with Tilt/Luxury Feel */}
      <section style={{ padding: '80px 0', background: '#000', borderTop: '1px solid rgba(255,215,0,0.1)', borderBottom: '1px solid rgba(255,215,0,0.1)', transform: 'skewY(-2deg)', width: '110%', marginLeft: '-5%' }}>
        <div style={{ transform: 'skewY(2deg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', overflow: 'hidden' }}>
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "-50%" }}
              transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
              style={{ display: 'flex', gap: '2rem', flexShrink: 0 }}
            >
              {[...galleryImages, ...galleryImages].map((src, i) => (
                <motion.div
                  key={`row1-${i}`}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    position: 'relative',
                    width: '400px',
                    height: '250px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid rgba(255,215,0,0.2)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }}
                >
                  <Image src={src} alt="Evento" fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}
          >
            {[
              { label: t('landing.stats.s1') || 'Eventos Criados', value: '2,500+' },
              { label: t('landing.stats.s2') || 'Mentores Ativos', value: '450+' },
              { label: t('landing.stats.s3') || 'Inscrições Hoje', value: '1,200+' },
              { label: t('landing.stats.s4') || 'Suporte Online', value: '24/7' },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeIn} style={{ padding: '20px' }}>
                <div className="gold-text" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{stat.value}</div>
                <div style={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section with Glassmorphism Cards */}
      <section className="section" style={{
        background: '#fafafa',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Decorative elements */}
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,215,0,0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />

        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <motion.div {...fadeIn}>
              <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                {t('landing.features.title')} <br />
                <span className="gold-text">{t('landing.features.titleHighlight')}</span>
              </h2>
              <div style={{ width: '80px', height: '4px', background: 'var(--gold-gradient)', margin: '0 auto 2rem' }} />
              <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.2rem' }}>
                {t('landing.features.subtitle')}
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid"
          >
            {[
              { icon: <Palette size={32} />, title: t('landing.features.f1.title'), desc: t('landing.features.f1.description') },
              { icon: <CheckCircle size={32} />, title: t('landing.features.f2.title'), desc: t('landing.features.f2.description') },
              { icon: <Zap size={32} />, title: t('landing.features.f3.title'), desc: t('landing.features.f3.description') },
              { icon: <BarChart3 size={32} />, title: t('landing.features.f4.title'), desc: t('landing.features.f4.description') },
              { icon: <ShieldCheck size={32} />, title: t('landing.features.f5.title'), desc: t('landing.features.f5.description') },
              { icon: <MessageCircle size={32} />, title: t('landing.features.f6.title'), desc: t('landing.features.f6.description') }
            ].map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Sophisticated */}
      <section style={{ padding: '120px 0', background: '#000', position: 'relative' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)',
              padding: '6rem 3rem',
              borderRadius: '60px',
              border: '1px solid rgba(255,215,0,0.2)',
              textAlign: 'center',
              backdropFilter: 'blur(20px)'
            }}
          >
            <h2 style={{ fontSize: '3.5rem', marginBottom: '2rem', color: '#fff' }}>{t('landing.cta.title')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '3.5rem', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
              {t('landing.cta.description')}
            </p>
            <Link href="/cadastro" className="btn-primary" style={{ padding: '1.5rem 4rem', fontSize: '1.2rem', borderRadius: '100px' }}>
              {t('landing.cta.button')}
            </Link>
          </motion.div>
        </div>
      </section>

      <footer style={{ padding: '6rem 0', background: '#fafafa', textAlign: 'center', borderTop: '1px solid #eee' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, fontSize: '2rem' }}>
              Inscreva<span className="gold-text">.se</span>
            </span>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Link href="/mentores" style={{ color: '#666', textDecoration: 'none', fontWeight: 600 }}>Mentores</Link>
              <Link href="/cadastro" style={{ color: '#666', textDecoration: 'none', fontWeight: 600 }}>Começar</Link>
              <Link href="/suporte" style={{ color: '#666', textDecoration: 'none', fontWeight: 600 }}>Suporte</Link>
            </div>
            <p style={{ color: '#999', fontSize: '0.9rem', maxWidth: '500px' }}>
              &copy; {new Date().getFullYear()} Inscreva-se. {t('landing.footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -15, boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
      className="luxury-card"
      style={{
        textAlign: 'left',
        background: '#fff',
        borderRadius: '30px',
        padding: '3.5rem 2.5rem',
        border: '1px solid rgba(0,0,0,0.05)'
      }}
    >
      <div style={{
        marginBottom: '2rem',
        background: 'var(--gold-gradient)',
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        boxShadow: '0 10px 20px rgba(255,215,0,0.2)'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.6rem', marginBottom: '1.2rem', fontFamily: 'var(--font-playfair)', fontWeight: 800 }}>{title}</h3>
      <p style={{ color: '#777', lineHeight: 1.7, fontSize: '1rem' }}>{description}</p>
    </motion.div>
  );
}
