"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslate } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSpotlight } from "@/hooks/useSpotlight";
import { authService, UserData } from "@/lib/authService";
import Cookies from "js-cookie";

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
  const { currency, setCurrency, formatPrice } = useCurrency();
  const { handleMouseMove } = useSpotlight();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    const currentUser = authService.getCurrentUser();
    setIsLoggedIn(!!token);
    setUser(currentUser);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/entrar';
    if (user.role === 'admin' || user.role === 'SuperAdmin') return '/dashboard/admin';
    if (user.role === 'participant') return '/dashboard/participant';
    return '/dashboard/mentor';
  };

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

        <div className="container" style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '120px 2rem 60px'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center' }}
          >
            <span style={{
              color: '#FFD700',
              textTransform: 'uppercase',
              letterSpacing: '6px',
              fontSize: '0.8rem',
              display: 'block',
              marginBottom: '0.8rem',
              fontWeight: 500
            }} className="hero-subtitle">
              {t('landing.hero.subtitle') || 'A Nova Era de Eventos'}
            </span>
            <h1 className="hero-title" style={{
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              color: '#fff',
              marginBottom: '1rem',
              letterSpacing: '-1.5px',
              fontWeight: 600
            }}>
              <span className="luxury-shimmer-hover">{t('landing.hero.title2')}</span>
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '600px',
              margin: '0 auto',
              fontWeight: 400,
              lineHeight: 1.6
            }} className="hero-description">
              {t('landing.hero.description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              width: '100%',
              maxWidth: '700px',
              margin: '0 auto 2rem'
            }} className="hero-actions">
              <Link href={isLoggedIn ? getDashboardLink() : "/entrar"} style={{
                flex: 1,
                minWidth: '240px',
                padding: '1rem 0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: 'var(--gold-gradient)',
                color: '#000',
                textDecoration: 'none',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }} className="hero-btn primary">
                {isLoggedIn ? t('nav.dashboard') : t('common.getStarted')}
              </Link>
              <Link href="/mentores" style={{
                flex: 1,
                minWidth: '240px',
                padding: '1rem 0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)'
              }} className="hero-btn secondary">
                {t('common.seeExamples')}
              </Link>
            </div>

            <div className="hero-scroll-indicator" style={{ textAlign: 'center', color: '#fff', opacity: 0.6 }}>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                ↓
              </motion.div>
            </div>
          </motion.div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            .hero-subtitle {
              letter-spacing: 4px !important;
              font-size: 0.7rem !important;
            }
            .hero-title {
              font-size: 2.8rem !important;
              letter-spacing: -1px !important;
            }
            .hero-description {
              font-size: 1rem !important;
              padding: 0 1.5rem !important;
            }
            .hero-actions {
              flex-direction: column !important;
              align-items: center !important;
              gap: 12px !important;
              padding: 0 1rem;
            }
            .hero-btn {
              width: 100% !important;
              min-width: unset !important;
              padding: 0.9rem 0 !important;
            }
          }
        `}</style>
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

      {/* Dashboard Feature Showcase */}
      <section style={{ padding: '120px 0', background: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div {...fadeIn}>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 800,
              marginBottom: '1.5rem',
              color: '#1a1a1a',
              letterSpacing: '-1px',
              lineHeight: 1.1
            }}>
              Crie e Gerencie Seus Eventos <br />
              <span className="gold-text">Digitais Ou Presenciais</span> de Forma Clara e Simples
            </h2>
            <p style={{
              color: '#666',
              fontSize: '1.25rem',
              maxWidth: '850px',
              margin: '0 auto 3.5rem',
              fontWeight: 400,
              lineHeight: 1.6
            }}>
              {t('landing.dashboard.subtitle') || 'Uma interface intuitiva desenhada para mentores e organizadores que buscam excelência e profissionalismo na gestão de seus projetos.'}
            </p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '5.5rem' }}>
              <Link href={isLoggedIn ? getDashboardLink() : "/cadastro"} style={{
                padding: '14px 45px',
                borderRadius: '8px',
                background: 'var(--gold-gradient)',
                color: '#000',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)',
                transition: 'all 0.3s ease'
              }} className="hover:scale-105 transform">
                {isLoggedIn ? t('nav.dashboard') : t('common.getStarted')}
              </Link>
              <Link href="/funcionalidades" style={{
                padding: '14px 45px',
                borderRadius: '8px',
                background: '#f8f8f8',
                color: '#333',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #eee',
                transition: 'all 0.3s ease'
              }} className="hover:bg-gray-100">
                {t('common.viewMore') || 'Saiba Mais'}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              maxWidth: '1200px',
              margin: '0 auto',
              borderRadius: '24px',
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 255, 255, 0.1))',
              boxShadow: '0 40px 80px -15px rgba(0,0,0,0.1), 0 20px 40px -20px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          >
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#fff',
              border: '1px solid rgba(212, 175, 55, 0.1)',
              lineHeight: 0,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.8)'
            }}>
              <Image
                src="/dashboard-preview.png"
                alt="Dashboard Inscreva-se"
                width={1400}
                height={875}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Soft decorative glow effects around the image */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '15%',
              right: '15%',
              height: '120px',
              background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.12), transparent)',
              filter: 'blur(35px)',
              zIndex: -1
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              height: '60px',
              background: 'rgba(212, 175, 55, 0.1)',
              filter: 'blur(40px)',
              zIndex: -1
            }} />
          </motion.div>
        </div>
      </section>



      {/* Tesla-inspired Events Showcase (Original) */}
      <section style={{ padding: '0 20px 80px', background: '#fff' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '24px',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          {/* Block 1: Masterclasses */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: 'relative',
              height: '600px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '60px',
              textAlign: 'center'
            }}
            className="gold-shimmer-sweep"
            onMouseMove={handleMouseMove}
          >
            <div className="spotlight" />
            <Image
              src="/masterclass.png"
              alt="Masterclass"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>{t('landing.showcase.masterclasses.title')}</h2>
              <p style={{ color: '#fff', marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 400 }}>{t('landing.showcase.masterclasses.description')}</p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={isLoggedIn ? getDashboardLink() : "/cadastro"} style={{
                  padding: '12px 60px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  background: 'var(--gold-gradient)',
                  color: '#000',
                  textDecoration: 'none',
                  fontWeight: 700
                }}>
                  {isLoggedIn ? t('nav.dashboard') : t('common.getStarted')}
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
                  {t('common.viewMore') || 'Ver Mais'}
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Block 2: VIP Events */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            style={{
              position: 'relative',
              height: '600px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '60px',
              textAlign: 'center'
            }}
            className="gold-shimmer-sweep"
            onMouseMove={handleMouseMove}
          >
            <div className="spotlight" />
            <Image
              src="/networking.png"
              alt="Networking"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>{t('landing.showcase.gala.title')}</h2>
              <p style={{ color: '#fff', marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 400 }}>{t('landing.showcase.gala.description')}</p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={isLoggedIn ? getDashboardLink() : "/entrar"} style={{
                  padding: '12px 60px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  background: 'var(--gold-gradient)',
                  color: '#000',
                  textDecoration: 'none',
                  fontWeight: 700
                }}>
                  {isLoggedIn ? t('nav.dashboard') : (t('common.participate') || 'Participar')}
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
                  {t('common.explore') || 'Explorar'}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tesla-inspired Packages Showcase */}
      <section style={{ padding: '40px 20px 80px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div {...fadeIn}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', fontWeight: 700 }}>
              {t('landing.impact.title')}<span className="gold-text">{t('landing.impact.titleHighlight')}</span>
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>{t('landing.impact.subtitle')}</p>

            {/* Currency Selector */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '2.5rem'
            }}>
              <button
                onClick={() => setCurrency('MZN')}
                style={{
                  padding: '10px 30px',
                  borderRadius: '30px',
                  border: '1px solid #e0e0e0',
                  background: currency === 'MZN' ? '#1a1a1b' : '#fff',
                  color: currency === 'MZN' ? '#fff' : '#1a1a1b',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: currency === 'MZN' ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {t('landing.showcase.currencyMzn')}
              </button>
              <button
                onClick={() => setCurrency('USD')}
                style={{
                  padding: '10px 30px',
                  borderRadius: '30px',
                  border: '1px solid #e0e0e0',
                  background: currency === 'USD' ? '#1a1a1b' : '#fff',
                  color: currency === 'USD' ? '#fff' : '#1a1a1b',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: currency === 'USD' ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {t('landing.showcase.currencyUsd')}
              </button>
            </div>
          </motion.div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          {/* Package 1: Free */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: 'relative',
              height: '700px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '40px',
              textAlign: 'center'
            }}
            className="gold-shimmer-sweep"
            onMouseMove={handleMouseMove}
          >
            <div className="spotlight" />
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000"
              alt="Free Plan"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>{t('plans.free.name')}</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1rem' }}>{t('plans.free.description')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                <span style={{ opacity: 0.9 }}>{t('plans.free.fee')}</span>
                <span style={{ opacity: 0.9 }}>{t('plans.free.f1')}</span>
                <span style={{ opacity: 0.9 }}>{t('plans.free.f2')}</span>
              </div>
              <Link href={isLoggedIn ? "/planos" : "/cadastro"} style={{
                display: 'inline-block',
                padding: '12px 0',
                borderRadius: '4px',
                fontSize: '0.85rem',
                background: 'rgba(255,255,255,0.9)',
                color: '#393c41',
                textDecoration: 'none',
                fontWeight: 600,
                width: '100%',
                maxWidth: '300px'
              }}>
                {t('plans.free.cta')}
              </Link>
            </div>
          </motion.div>

          {/* Package 2: Pro */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            style={{
              position: 'relative',
              height: '700px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '40px',
              textAlign: 'center'
            }}
            className="gold-shimmer-sweep"
            onMouseMove={handleMouseMove}
          >
            <div className="spotlight" />
            <Image
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
              alt="Pro Plan"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                background: 'var(--gold-gradient)',
                color: '#000',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 800,
                display: 'inline-block',
                marginBottom: '1rem',
                textTransform: 'uppercase'
              }}>
                {t('plans.pro.badge')}
              </div>
              <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontWeight: 600 }}>{t('plans.pro.name')}</h3>
              <p style={{ color: 'var(--gold-text)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {formatPrice(499, 7.99)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('plans.perMonth')}</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '1rem' }}>{t('plans.pro.description')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                <span style={{ opacity: 0.9 }}>{t('plans.pro.fee')}</span>
                <span style={{ opacity: 0.9 }}>{t('plans.pro.f1')}</span>
                <span style={{ opacity: 0.9 }}>{t('plans.pro.f2')}</span>
              </div>
              <Link href={isLoggedIn ? "/planos" : "/cadastro?plan=pro"} style={{
                display: 'inline-block',
                padding: '12px 0',
                borderRadius: '4px',
                fontSize: '0.85rem',
                background: 'var(--gold-gradient)',
                color: '#000',
                textDecoration: 'none',
                fontWeight: 700,
                width: '100%',
                maxWidth: '300px'
              }}>
                {t('plans.pro.cta')}
              </Link>
            </div>
          </motion.div>

          {/* Package 3: Enterprise */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            style={{
              position: 'relative',
              height: '700px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '40px',
              textAlign: 'center'
            }}
            className="gold-shimmer-sweep"
            onMouseMove={handleMouseMove}
          >
            <div className="spotlight" />
            <Image
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1000"
              alt="Enterprise Plan"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontWeight: 600 }}>{t('plans.enterprise.name')}</h3>
              <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {formatPrice(4990, 79.90)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('plans.perMonth')}</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '1rem' }}>{t('plans.enterprise.description')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 800, color: '#FFD700' }}>{t('plans.enterprise.fee')}</span>
                <span style={{ opacity: 0.9 }}>{t('plans.enterprise.f1')}</span>
                <span style={{ opacity: 0.9 }}>{t('plans.enterprise.f2')}</span>
              </div>
              <Link href={isLoggedIn ? "/planos" : "/cadastro?plan=enterprise"} style={{
                display: 'inline-block',
                padding: '12px 0',
                borderRadius: '4px',
                fontSize: '0.85rem',
                background: '#fff',
                color: '#000',
                textDecoration: 'none',
                fontWeight: 700,
                width: '100%',
                maxWidth: '300px'
              }}>
                {t('plans.enterprise.cta')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features CTA Section (Tesla Inspired) - Placed at the end */}
      <section style={{
        height: '70vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: -50,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/bio-organic.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          animation: 'float-bg 30s ease-in-out infinite alternate'
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div {...fadeIn}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', fontWeight: 600, letterSpacing: '-1px', color: '#fff' }}>
              {t('landing.premium.title')}<span className="gold-text">{t('landing.premium.titleHighlight')}</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '650px', margin: '0 auto 3.5rem', fontSize: '1.2rem', lineHeight: 1.6 }}>
              {t('landing.premium.description')}
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/cadastro" style={{
                padding: '12px 80px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                background: '#1a1a1b',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                width: '100%',
                maxWidth: '300px',
                transition: 'all 0.3s'
              }}>
                {t('landing.premium.cta1')}
              </Link>
              <Link href="/funcionalidades" style={{
                padding: '12px 80px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                background: 'rgba(255,255,255,1)',
                color: '#393c41',
                textDecoration: 'none',
                fontWeight: 600,
                width: '100%',
                maxWidth: '300px',
                border: '1px solid #e2e2e2',
                transition: 'all 0.3s'
              }}>
                {t('landing.premium.cta2')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section >

      {/* Tesla-inspired Minimalist Footer with Developer Credits */}
      < footer style={{ padding: '60px 0 40px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
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
                  {t('landing.footer.developedBy') || 'Desenvolvido por'}
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
            <Link href="/privacidade" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.privacyTerms')}</Link>
            <Link href="/mentores" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.events')}</Link>
            <Link href="/suporte" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.support')}</Link>
            <Link href="/entrar" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.login')}</Link>
            <Link href="/cadastro" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.startNow')}</Link>
          </div>
        </div>
      </footer >
    </main >
  );
}
