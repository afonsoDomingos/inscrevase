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
import SocialProof from "@/components/home/SocialProof";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/Footer";
import { Calendar, Users, TrendingUp, Star } from "lucide-react";

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

  // Video source is constant now
  const videoSrc = "/banner3.mp4";



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
          justifyContent: 'center',
          padding: '120px 1.5rem 60px'
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
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              width: '100%',
              maxWidth: '700px',
              margin: '0 auto'
            }} className="hero-actions">
              <Link href={isLoggedIn ? getDashboardLink() : "/entrar"} style={{
                flex: 1,
                minWidth: '220px',
                padding: '1.1rem 0',
                borderRadius: '10px',
                fontSize: '0.9rem',
                background: 'var(--gold-gradient)',
                color: '#000',
                textDecoration: 'none',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                textAlign: 'center',
                boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)'
              }} className="hero-btn primary">
                {isLoggedIn ? t('nav.dashboard') : t('common.getStarted')}
              </Link>
              <Link href="/mentores" style={{
                flex: 1,
                minWidth: '220px',
                padding: '1.1rem 0',
                borderRadius: '10px',
                fontSize: '0.9rem',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
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
              font-size: 0.75rem !important;
            }
            .hero-title {
              font-size: 2.5rem !important;
              letter-spacing: -1px !important;
              padding: 0 0.5rem;
            }
            .hero-description {
              font-size: 1rem !important;
              padding: 0 1rem !important;
              margin-bottom: 2.5rem !important;
            }
            .hero-actions {
              flex-direction: column !important;
              align-items: center !important;
              gap: 12px !important;
              padding: 0;
            }
            .hero-btn {
              width: 100% !important;
              min-width: unset !important;
              padding: 0.9rem 0 !important;
              border-radius: 12px !important;
              font-size: 0.85rem !important;
            }
            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 15px !important;
            }
            .stat-value {
              font-size: 1.8rem !important;
            }
            .stat-label {
              font-size: 0.65rem !important;
            }
            .dashboard-showcase {
              padding: 60px 0 !important;
            }
            .dashboard-actions {
              flex-direction: column !important;
              align-items: center !important;
              gap: 12px !important;
              margin-bottom: 3rem !important;
              padding: 0 1rem;
            }
            .dashboard-actions a {
              width: 100% !important;
              min-width: unset !important;
              padding: 12px 0 !important;
            }
            .payments-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 30px 15px !important;
            }
            .payment-card {
              min-width: unset !important;
            }
            .payment-icon {
              width: 70px !important;
              height: 70px !important;
              font-size: 1.5rem !important;
            }
            .hidden-mobile {
              display: none;
            }
          }
        `}</style>
      </section>

      {/* Infinite Scroll Gallery with Tilt/Luxury Feel */}
      <section style={{ padding: '80px 0', background: '#000', borderTop: '1px solid rgba(255,215,0,0.1)', borderBottom: '1px solid rgba(255,215,0,0.1)', transform: 'skewY(-2deg)', width: '100%', overflow: 'hidden' }}>
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

      {/* Stats Section - Luxury Dark Mode */}
      <section style={{ padding: '100px 0', background: '#050505', position: 'relative' }}>
        {/* Subtle background grid/mesh effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.2,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              color: '#fff',
              marginBottom: '1rem',
              fontFamily: 'var(--font-playfair)'
            }}>
              Resultados que <span className="gold-text">Falam</span>
            </h2>
            <p style={{ color: '#888', fontSize: '1.1rem' }}>
              Milhares de mentores confiam na Inscreva.se para escalar seus eventos
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '30px',
              textAlign: 'center'
            }}
          >
            {[
              { icon: Calendar, label: t('landing.stats.s1') || 'Eventos Criados', value: '2,500+', color: '#FFD700' },
              { icon: Users, label: t('landing.stats.s2') || 'Participantes', value: '150k+', color: '#00f2ea' },
              { icon: TrendingUp, label: t('landing.stats.s3') || 'Mentores Ativos', value: '450+', color: '#ff0080' },
              { icon: Star, label: t('landing.stats.s4') || 'Avaliação Média', value: '4.9', color: '#FFD700' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -10, scale: 1.02 }}
                className="stat-card-luxury"
                style={{
                  padding: '50px 30px',
                  background: 'rgba(20, 20, 20, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '30px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Hover Glow Effect */}
                <div
                  className="card-glow"
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `radial-gradient(circle at center, ${stat.color}15 0%, transparent 70%)`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none'
                  }}
                />

                <style jsx>{`
                  .stat-card-luxury:hover .card-glow { opacity: 1; }
                  .stat-card-luxury:hover { border-color: rgba(255,255,255,0.15) !important; }
                  .stat-icon-wrapper svg { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                  .stat-card-luxury:hover .stat-icon-wrapper svg { transform: scale(1.2) rotate(5deg); }
                `}</style>

                <div className="stat-icon-wrapper" style={{
                  marginBottom: '10px'
                }}>
                  <stat.icon size={48} color={stat.color} strokeWidth={1.5} />
                </div>

                <div>
                  <div className="stat-value" style={{
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '5px',
                    lineHeight: 1,
                    fontFamily: 'var(--font-inter)'
                  }}>{stat.value}</div>
                  <div className="stat-label" style={{
                    color: '#666',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dashboard Feature Showcase */}
      <section className="dashboard-showcase" style={{ padding: '90px 0', background: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background orbs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="aura-orb aura-orb-1"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="aura-orb aura-orb-2"
        />

        <style jsx>{`
  .aura-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  .aura-orb-1 {
    top: 10%;
    left: 5%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
    filter: blur(40px);
  }
  .aura-orb-2 {
    bottom: 10%;
    right: 5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
    filter: blur(50px);
  }
  @media (max-width: 768px) {
    .aura-orb-1 {
      top: 5%;
      left: 50%;
      transform: translateX(-50%) !important;
      width: 80vw;
      height: 80vw;
      max-width: 300px;
      max-height: 300px;
    }
    .aura-orb-2 {
      bottom: 5%;
      left: 50%;
      right: auto;
      transform: translateX(-50%) !important;
      width: 90vw;
      height: 90vw;
      max-width: 400px;
      max-height: 400px;
    }
  }
`}</style>

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 1.5rem' }}>
          <motion.div
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                fontWeight: 800,
                marginBottom: '1.5rem',
                color: '#1a1a1a',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                textShadow: '0 0 40px rgba(212, 175, 55, 0.1)'
              }}
            >
              Crie e Gerencie Seus Eventos <br className="hidden-mobile" />
              <motion.span
                initial={{ backgroundSize: '0% 100%' }}
                whileInView={{ backgroundSize: '100% 100%' }}
                transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                style={{
                  background: 'linear-gradient(120deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left bottom',
                  padding: '0 10px',
                  borderRadius: '4px'
                }}
                className="gold-text"
              >
                Digitais Ou Presenciais
              </motion.span> de Forma Clara e Simples
            </motion.h2>
            <motion.p
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              style={{
                color: '#666',
                fontSize: '1.25rem',
                maxWidth: '850px',
                margin: '0 auto 3.5rem',
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              {t('landing.dashboard.subtitle') || 'Uma interface intuitiva desenhada para mentores e organizadores que buscam excelência e profissionalismo na gestão de seus projetos.'}
            </motion.p>

            <div className="dashboard-actions" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '5.5rem' }}>
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

        </div>
      </section>

      {/* Payment Methods Section */}
      <section style={{ padding: '100px 0', background: '#fff', position: 'relative', overflow: 'hidden', borderTop: '1px solid #f0f0f0' }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 1.5rem' }}>
          <motion.div {...fadeIn}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '1.5rem',
              color: '#1a1a1a',
              letterSpacing: '-1.2px'
            }}>
              Receba Pagamentos de <span className="gold-text">Forma Simples</span>
            </h2>
            <p style={{ color: '#666', marginBottom: '5rem', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto 5rem', lineHeight: 1.6 }}>
              Integração completa com as principais carteiras móveis e métodos globais de pagamento: M-Pesa, E-Mola, PayPal e Stripe.
            </p>

            {/* Infinite Scroll Payments */}
            <div style={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              padding: '40px 0'
            }}>
              <motion.div
                animate={{ x: ["0%", "-33.33%"] }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  display: 'flex',
                  gap: 'clamp(40px, 8vw, 120px)',
                  width: 'fit-content',
                  alignItems: 'center'
                }}
              >
                {[...Array(3)].map((_, setIdx) => (
                  <div key={setIdx} style={{ display: 'flex', gap: 'clamp(40px, 8vw, 120px)' }}>
                    {[
                      { name: 'M-Pesa', color: '#e61c27', logo: '/payments/mpesa.png' },
                      { name: 'E-Mola', color: '#ff6600', logo: '/payments/emola.png' },
                      { name: 'PayPal', color: '#003087', logo: '/payments/paypal.png' },
                      { name: 'Stripe', color: '#635bff', logo: '/payments/stripe.png' }
                    ].map((method, idx) => (
                      <div key={`${setIdx}-${idx}`} className="payment-card" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        flexShrink: 0
                      }}>
                        <div className="payment-icon-wrapper" style={{ position: 'relative' }}>
                          <div className="payment-icon" style={{
                            width: 'clamp(80px, 12vw, 110px)',
                            height: 'clamp(80px, 12vw, 110px)',
                            borderRadius: '28px',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #f0f0f0',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            padding: '20px',
                            cursor: 'pointer',
                            zIndex: 2,
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <Image
                              src={method.logo}
                              alt={method.name}
                              width={80}
                              height={80}
                              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                            />
                          </div>
                          <div className="payment-glow" style={{
                            position: 'absolute',
                            inset: '-10px',
                            background: method.color,
                            opacity: 0,
                            filter: 'blur(30px)',
                            borderRadius: '40px',
                            transition: 'all 0.5s ease',
                            zIndex: 1
                          }} />
                        </div>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.5px' }}>{method.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>

            <style jsx>{`
              .payment-card:hover .payment-icon {
                transform: translateY(-10px) scale(1.05);
                border-color: rgba(0,0,0,0.05);
                box-shadow: 0 25px 50px rgba(0,0,0,0.1);
              }
              .payment-card:hover .payment-glow {
                opacity: 0.15;
              }
            `}</style>
          </motion.div>
        </div>
      </section>

      {/* Tesla-inspired Events Showcase (Original) */}
      <section style={{ padding: '0 20px 80px', background: '#fff' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          maxWidth: '1600px',
          margin: '0 auto',
          justifyContent: 'center'
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1600px',
          margin: '0 auto',
          justifyContent: 'center'
        }}>
          {/* Package 1: Free */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: 'relative',
              height: 'auto',
              minHeight: '520px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '30px',
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
              height: 'auto',
              minHeight: '540px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '30px',
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
              <p style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '1px' }}>
                {formatPrice(499)}<span style={{ fontSize: '0.9rem', opacity: 1, marginLeft: '4px' }}>{t('plans.perMonth')}</span>
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
              height: 'auto',
              minHeight: '520px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '30px',
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
                {formatPrice(4990)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('plans.perMonth')}</span>
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

      {/* Social Proof Section */}
      <SocialProof />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Tesla-inspired Minimalist Footer with Developer Credits */}
      <Footer />
    </main>
  );
}
