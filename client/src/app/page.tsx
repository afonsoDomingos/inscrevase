"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslate } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

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

      {/* Tesla-inspired Packages Showcase */}
      <section style={{ padding: '40px 20px 80px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div {...fadeIn}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', fontWeight: 700 }}>
              Escolha seu <span className="gold-text">Nível de Impacto</span>
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>Soluções sob medida para cada etapa da sua jornada.</p>

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
                MT (Moçambique)
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
                USD (Global)
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
          <div style={{
            position: 'relative',
            height: '700px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '40px',
            textAlign: 'center'
          }}>
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000"
              alt="Free Plan"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>Plano Free</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1rem' }}>Comece sua jornada sem custos.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                <span style={{ opacity: 0.9 }}>• Taxa de 15% por inscrição</span>
                <span style={{ opacity: 0.9 }}>• Formulários Ilimitados</span>
                <span style={{ opacity: 0.9 }}>• Gestão de Conteúdo Base</span>
              </div>
              <Link href="/cadastro" style={{
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
                Começar Grátis
              </Link>
            </div>
          </div>

          {/* Package 2: Pro */}
          <div style={{
            position: 'relative',
            height: '700px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '40px',
            textAlign: 'center'
          }}>
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
                Mais Popular
              </div>
              <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontWeight: 600 }}>Plano Pro</h3>
              <p style={{ color: 'var(--gold-text)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {formatPrice(499, 7.99)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>/mês</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '1rem' }}>Para profissionais em ascensão.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                <span style={{ opacity: 0.9 }}>• Taxa reduzida de 10%</span>
                <span style={{ opacity: 0.9 }}>• Destaque no Showcase</span>
                <span style={{ opacity: 0.9 }}>• Analytics Avançado</span>
              </div>
              <Link href="/cadastro?plan=pro" style={{
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
                Assinar Pro
              </Link>
            </div>
          </div>

          {/* Package 3: Enterprise */}
          <div style={{
            position: 'relative',
            height: '700px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '40px',
            textAlign: 'center'
          }}>
            <Image
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1000"
              alt="Enterprise Plan"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontWeight: 600 }}>Enterprise</h3>
              <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {formatPrice(4990, 79.90)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>/mês</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '1rem' }}>O topo da performance.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 800, color: '#FFD700' }}>• TAXA 0% (Isenção Total)</span>
                <span style={{ opacity: 0.9 }}>• Suporte VIP 24/7</span>
                <span style={{ opacity: 0.9 }}>• Customização Total</span>
              </div>
              <Link href="/cadastro?plan=enterprise" style={{
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
                Contactar Vendas
              </Link>
            </div>
          </div>
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
        background: '#fff',
        borderTop: '1px solid #f0f0f0'
      }}>
        <div className="container">
          <motion.div {...fadeIn}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', fontWeight: 600, letterSpacing: '-1px' }}>
              Funcionalidades <span className="gold-text">Premium</span>
            </h2>
            <p style={{ color: '#5c5e62', maxWidth: '650px', margin: '0 auto 3.5rem', fontSize: '1.2rem', lineHeight: 1.6 }}>
              Tudo o que você precisa para gerir suas inscrições com profissionalismo.
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
                Criar Evento
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
                Ver Funcionalidades
              </Link>
            </div>
          </motion.div>
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
