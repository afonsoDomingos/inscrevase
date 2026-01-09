"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckCircle, Palette, Zap, ShieldCheck, BarChart3, MessageCircle } from "lucide-react";
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
              display: 'block',
              marginBottom: '1rem'
            }}>
              {t('landing.hero.subtitle') || 'A Nova Era de Eventos'}
            </span>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', marginBottom: '1rem', letterSpacing: '-1.5px' }}>
              <span className="luxury-shimmer-hover" style={{ fontWeight: 600 }}>{t('landing.hero.title2')}</span>
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#fff',
              maxWidth: '800px',
              margin: '0 auto 2.5rem',
              fontWeight: 400
            }}>
              {t('landing.hero.description')}
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/entrar" style={{
                padding: '0.8rem 3.5rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                background: 'var(--gold-gradient)',
                color: '#000',
                textDecoration: 'none',
                fontWeight: 700,
                transition: 'all 0.3s',
                textTransform: 'none',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 15px rgba(218, 165, 32, 0.2)'
              }}>
                {t('common.getStarted')}
              </Link>
              <Link href="/mentores" style={{
                padding: '0.8rem 3.5rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                background: 'rgba(255,255,255,1)',
                color: '#393c41',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}>
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

      {/* Tesla-inspired Showcase Section */}
      <section style={{ padding: '0 20px 80px', background: '#fff' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '24px',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          {/* Block 1: Masterclasses */}
          <div style={{
            position: 'relative',
            height: '600px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px',
            textAlign: 'center'
          }}>
            <Image
              src="/masterclass.png"
              alt="Masterclass"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>Masterclasses</h2>
              <p style={{ color: '#fff', marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 400 }}>Aprenda com os melhores mentores do mercado.</p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/cadastro" style={{
                  padding: '12px 60px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  background: 'var(--gold-gradient)',
                  color: '#000',
                  textDecoration: 'none',
                  fontWeight: 700
                }}>
                  {t('common.getStarted')}
                </Link>
                <Link href="/mentores" style={{
                  padding: '12px 60px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#393c41',
                  textDecoration: 'none',
                  fontWeight: 600
                }}>
                  Ver Mais
                </Link>
              </div>
            </div>
          </div>

          {/* Block 2: VIP Events */}
          <div style={{
            position: 'relative',
            height: '600px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px',
            textAlign: 'center'
          }}>
            <Image
              src="/networking.png"
              alt="Networking"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>Gala & Networking</h2>
              <p style={{ color: '#fff', marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 400 }}>Conexões exclusivas em ambientes de elite.</p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/entrar" style={{
                  padding: '12px 60px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  background: 'var(--gold-gradient)',
                  color: '#000',
                  textDecoration: 'none',
                  fontWeight: 700
                }}>
                  Participar
                </Link>
                <Link href="/mentores" style={{
                  padding: '12px 60px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#393c41',
                  textDecoration: 'none',
                  fontWeight: 600
                }}>
                  Explorar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tesla-inspired Minimalist Footer with Developer Credits */}
      <footer style={{ padding: '60px 0 40px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          {/* Developer Credits Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
            paddingBottom: '40px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <a
              href="https://www.linkedin.com/in/afonso-domingos-6b59361a5/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                padding: '3px',
                background: 'var(--gold-gradient)',
                boxShadow: '0 10px 30px rgba(255, 215, 0, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <Image
                  src="/developer-vibe.jpg"
                  alt="Vibe - Developer"
                  width={80}
                  height={80}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #fff'
                  }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '0.7rem',
                  color: '#999',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '4px'
                }}>
                  Desenvolvido por
                </p>
                <p style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  background: 'var(--gold-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'var(--font-poppins)'
                }}>
                  Vibe
                </p>
              </div>
            </a>
          </div>

          {/* Footer Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '0.8rem',
            color: '#5c5e62',
            fontWeight: 600
          }}>
            <span>Inscreva-se © {new Date().getFullYear()}</span>
            <Link href="/privacidade" style={{ textDecoration: 'none', color: 'inherit' }}>Privacidade e Termos</Link>
            <Link href="/mentores" style={{ textDecoration: 'none', color: 'inherit' }}>Eventos</Link>
            <Link href="/suporte" style={{ textDecoration: 'none', color: 'inherit' }}>Suporte</Link>
            <Link href="/entrar" style={{ textDecoration: 'none', color: 'inherit' }}>Login</Link>
            <Link href="/cadastro" style={{ textDecoration: 'none', color: 'inherit' }}>Começar Agora</Link>
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
