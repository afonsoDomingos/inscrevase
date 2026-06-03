"use client";

import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslate } from "@/context/LanguageContext";
import { useSpotlight } from "@/hooks/useSpotlight";
import { authService, UserData } from "@/lib/authService";
import { adService } from "@/lib/adService";
import Cookies from "js-cookie";
import SocialProof from "@/components/home/SocialProof";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/Footer";
import { Calendar, Users, TrendingUp, Star, Trophy } from "lucide-react";
import { TextDispersion } from "@/components/TextDispersion";
import TeamSection from "@/components/home/TeamSection";
import VideoTutorialsSection from "@/components/home/VideoTutorialsSection";
import MentorMilestonesSection from "@/components/home/MentorMilestonesSection";
import SideQuickMenu from "@/components/home/SideQuickMenu";
import { formService } from "@/lib/formService";
import SponsoredAdCard, { SponsoredItem } from '@/components/home/SponsoredAdCard';
import Typewriter from "@/components/common/Typewriter";
import { publicService, PublicImpactStats } from "@/lib/publicService";
import SectorsSection from "@/components/home/SectorsSection";
import CommunicationHubSection from "@/components/home/CommunicationHubSection";
import PlansSection from "@/components/common/PlansSection";
import FAQSection from "@/components/home/FAQSection";
import InstitutionalSection from "@/components/home/InstitutionalSection";
import BlogPreviewSection from "@/components/home/BlogPreviewSection";
import WeatherWidget from "@/components/home/WeatherWidget";
import CurrencyWidget from "@/components/home/CurrencyWidget";


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
  const { handleMouseMove } = useSpotlight();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  // Define admin switch for Motiva
  const [isMotivaEnabledAdmin] = useState(true);

  // Motiva Contest Floating Button State
  const [isMotivaVisible, setIsMotivaVisible] = useState(false);
  const [isScrollBelowHalf, setIsScrollBelowHalf] = useState(false);
  const [isBrainOpen, setIsBrainOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Listen for Brain visibility
    const handleBrainVisibility = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsBrainOpen(customEvent.detail?.visible ?? false);
    };
    window.addEventListener('brain-visibility-change', handleBrainVisibility);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Apresentar o botão após 3 segundos
    const showTimeout = setTimeout(() => setIsMotivaVisible(true), 3000);

    // Monitorizar o scroll para esconder o botão após 50% da página
    const checkScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrolled = window.scrollY;

      // Se passou de 50% da altura total navegável
      if (scrolled > (scrollHeight - clientHeight) / 2) {
        setIsScrollBelowHalf(true);
      } else {
        setIsScrollBelowHalf(false);
      }
    };

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Executar logo no início

    // Fazer desaparecer por breves momentos e reaparecer (Fade in / Fade out)
    const interval = setInterval(() => {
      setIsMotivaVisible(v => !v);
    }, 15000);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('brain-visibility-change', handleBrainVisibility);
      window.removeEventListener('resize', checkMobile);
      clearTimeout(showTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('motiva-visibility-change', {
      detail: { visible: isMotivaVisible }
    }));

    return () => {
      window.dispatchEvent(new CustomEvent('motiva-visibility-change', {
        detail: { visible: false }
      }));
    };
  }, [isMotivaVisible]);

  const [sponsoredItems, setSponsoredItems] = useState<SponsoredItem[]>([]);
  const [impactStats, setImpactStats] = useState<PublicImpactStats | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    const currentUser = authService.getCurrentUser();
    setIsLoggedIn(!!token);
    setUser(currentUser);

    const fetchSponsored = async () => {
      try {
        const [events, activeAds] = await Promise.all([
          formService.getExploreEvents(),
          adService.getActiveAds()
        ]);

        const sponsoredEvents = events.filter(e => e.isSponsored);

        const combined = [
          ...sponsoredEvents.map(e => ({
            _id: e._id,
            title: e.title,
            description: e.description,
            mediaUrl: e.coverImage,
            mediaType: 'image' as const,
            targetUrl: `/f/${e.slug}`,
            metadata: { date: e.eventDate, location: e.location }
          })),
          ...activeAds.map(ad => ({
            _id: ad._id,
            title: ad.title,
            description: ad.description,
            mediaUrl: ad.mediaUrl,
            mediaUrls: ad.mediaUrls,
            mediaType: ad.mediaType,
            productPrice: ad.productPrice,
            targetUrl: ad.targetUrl,
            metadata: { category: ad.category }
          }))
        ].sort(() => Math.random() - 0.5) as SponsoredItem[];

        setSponsoredItems(combined);
      } catch (error) {
        console.error("Error fetching sponsored items:", error);
      }
    };
    fetchSponsored();

    publicService.getImpactStats()
      .then(setImpactStats)
      .catch(err => console.error("Error fetching impact stats:", err));
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
      <SideQuickMenu userRole={user?.role} />
      <Navbar />
      <CurrencyWidget />

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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <WeatherWidget />
            </div>
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
              <Typewriter text={t('landing.hero.description')} duration={3} />
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
                padding: '1.2rem 0',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'var(--gold-gradient)',
                color: '#000',
                textDecoration: 'none',
                fontWeight: 800,
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }} className="hero-btn primary hover-glow">
                {isLoggedIn ? t('nav.dashboard') : t('common.getStarted')}
              </Link>
              <Link href="/experts" style={{
                flex: 1,
                minWidth: '220px',
                padding: '1.2rem 0',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }} className="hero-btn secondary hover-glow">
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
            .hero-btn.hover-glow:hover {
              transform: translateY(-5px) scale(1.05);
              filter: brightness(1.1);
              box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4);
            }
            .hero-btn.secondary.hover-glow:hover {
              background: rgba(255, 255, 255, 0.15);
              border-color: rgba(255, 255, 255, 0.5);
              box-shadow: 0 15px 40px rgba(255, 255, 255, 0.1);
            }
            .stats-section-mobile {
              padding-top: 10px !important;
              padding-bottom: 10px !important;
            }
            .stat-card-luxury {
              padding: 12px 8px !important;
              gap: 4px !important;
              border-radius: 20px !important;
            }
            .stat-value {
              font-size: 1.6rem !important;
            }
            .stat-label {
              font-size: 0.65rem !important;
              letter-spacing: 1px !important;
            }
            .stat-icon-wrapper svg {
              width: 32px !important;
              height: 32px !important;
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

      {/* Sponsored Ad System */}
      {sponsoredItems.length > 0 && !(isMobile && isBrainOpen) && (
        <SponsoredAdCard events={sponsoredItems} />
      )}

      {/* Stats Section - Luxury Dark Mode */}
      <section className="stats-section-mobile" style={{ paddingTop: '0px', paddingBottom: '0px', background: '#050505', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background grid/mesh effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.2,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '5px' }}
          >
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              color: '#fff',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-playfair)'
            }}>
              {t('home.stats.title')}
            </h2>
            <TextDispersion text={t('home.stats.description')} />
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
              gap: '20px',
              textAlign: 'center',
              marginTop: '10px'
            }}
          >
            {[
              {
                icon: Calendar,
                label: t('home.stats.createdEvents'),
                value: impactStats?.globalStats.totalEvents ? `${impactStats.globalStats.totalEvents}+` : '0k+',
                color: '#FFD700'
              },
              {
                icon: Users,
                label: t('home.stats.subscribers'),
                value: impactStats?.globalStats.totalSubmissions ?
                  (impactStats.globalStats.totalSubmissions >= 1000 ?
                    `${(impactStats.globalStats.totalSubmissions / 1000).toFixed(1)}k+` :
                    `${impactStats.globalStats.totalSubmissions}+`) :
                  '3k+', // Real fallback if 0 or loading
                color: '#00f2ea'
              },
              {
                icon: TrendingUp,
                label: t('home.stats.activeMentors'),
                value: impactStats?.globalStats.totalMentors ? `${impactStats.globalStats.totalMentors}+` : '45+',
                color: '#ff0080'
              },
              {
                icon: Star,
                label: t('home.stats.averageRating'),
                value: impactStats?.globalStats.averageRating?.toString() || '4.9',
                color: '#FFD700'
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -10, scale: 1.02 }}
                className="stat-card-luxury"
                style={{
                  padding: '15px 10px',
                  background: 'rgba(20, 20, 20, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '30px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
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
                  marginBottom: '5px'
                }}>
                  <stat.icon size={isMobile ? 32 : 48} color={stat.color} strokeWidth={1.5} />
                </div>

                <div>
                  <div className="stat-value" style={{
                    fontSize: isMobile ? '1.8rem' : '2.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '2px',
                    lineHeight: 1,
                    fontFamily: 'var(--font-inter)'
                  }}>{stat.value}</div>
                  <div className="stat-label" style={{
                    color: '#666',
                    fontWeight: 600,
                    fontSize: isMobile ? '0.65rem' : '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectorsSection />
      <CommunicationHubSection />



      {/* Dashboard Feature Showcase */}
      <section className="dashboard-showcase" style={{ padding: '50px 0 90px 0', background: '#fff', position: 'relative', overflow: 'hidden' }}>
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

        {/* Scattered Event Images for Visual Flair */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[
            { top: '10%', left: '5%', size: '120px', rotate: -15, delay: 0 },
            { top: '60%', left: '8%', size: '100px', rotate: 10, delay: 0.5 },
            { top: '15%', right: '5%', size: '110px', rotate: 12, delay: 1 },
            { top: '55%', right: '10%', size: '130px', rotate: -8, delay: 1.5 },
          ].map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 0.6, scale: 1, y: 0 }}
              animate={{
                y: [0, -15, 0],
                rotate: [img.rotate, img.rotate + 5, img.rotate]
              }}
              transition={{
                opacity: { duration: 1 },
                y: { duration: 4 + idx, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 5 + idx, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{
                position: 'absolute',
                top: img.top,
                left: img.left,
                right: img.right,
                width: img.size,
                height: img.size,
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                zIndex: 0
              }}
            >
              <Image
                src={`https://images.unsplash.com/photo-${idx === 0 ? '1540575467063-178a50c2df87' : idx === 1 ? '1505373877841-8d25f7d46678' : idx === 2 ? '1511795409834-ef04bbd61622' : '1556761175-5973dc0f32e7'}?auto=format&fit=crop&q=80&w=300`}
                alt="Evento"
                fill
                style={{ objectFit: 'cover' }}
              />
            </motion.div>
          ))}
        </div>

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
              {t('landing.dashboard.title')} <br className="hidden-mobile" />
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span className="gold-text relative z-10">{t('landing.dashboard.titleHighlight')}</span>
                <motion.span
                  initial={{ width: '0%' }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "cubicBezier(0.17, 0.55, 0.55, 1)" }}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: 0,
                    height: '14px',
                    background: 'rgba(255, 215, 0, 0.25)',
                    zIndex: -1,
                    borderRadius: '2px'
                  }}
                />
              </span> {t('landing.dashboard.titleEnd')}
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
              {t('landing.dashboard.subtitle') || 'An intuitive interface designed for mentors and organizers seeking excellence and professionalism in event management.'}
            </motion.p>

            <div className="dashboard-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
              <Link href={isLoggedIn ? getDashboardLink() : "/cadastro"} style={{
                padding: '16px 48px',
                borderRadius: '50px',
                background: 'var(--gold-gradient)',
                color: '#000',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} className="hover:scale-105 hover:-translate-y-1">
                {isLoggedIn ? t('nav.dashboard') : t('common.getStarted')}
              </Link>
              <Link href="/funcionalidades" style={{
                padding: '16px 48px',
                borderRadius: '50px',
                background: '#fff',
                color: '#1a1a1a',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }} className="hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg">
                {t('common.viewMore')}
              </Link>
            </div>

            {/* Dynamic Event Images Cloud */}
            <div style={{
              position: 'relative',
              height: '300px',
              marginTop: '40px',
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'center',
              perspective: '1000px'
            }}>
              {/* Image 1: Digital/Webinar */}
              <motion.div
                initial={{ opacity: 0, x: -50, rotate: -5 }}
                whileInView={{ opacity: 1, x: 0, rotate: -5 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  left: '10%',
                  top: '20%',
                  width: '280px',
                  height: '180px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  border: '4px solid #fff',
                  zIndex: 2
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"
                  alt="Evento Digital"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </motion.div>

              {/* Image 2: Presential/Auditorium (Center Main) */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  position: 'relative',
                  width: '320px',
                  height: '220px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
                  border: '4px solid #fff',
                  zIndex: 10
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop"
                  alt="Evento Presencial"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </motion.div>

              {/* Image 3: Hybrid/Laptop */}
              <motion.div
                initial={{ opacity: 0, x: 50, rotate: 5 }}
                whileInView={{ opacity: 1, x: 0, rotate: 5 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                style={{
                  position: 'absolute',
                  right: '10%',
                  top: '10%',
                  width: '260px',
                  height: '170px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  border: '4px solid #fff',
                  zIndex: 2
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop"
                  alt="Evento Híbrido"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </motion.div>
            </div>

          </motion.div>
        </div>

        {/* Modern Static Curved Divider - Sem movimento, fluido e orgânico */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', lineHeight: 0, zIndex: 10 }}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '80px' }}>
            <path d="M0,60 C480,120 960,0 1440,60 L1440,120 L0,120 Z" fill="#fff" />
            {/* The fill above matches the next section background which is white, effectively masking the content behind it. 
                However, looking at the layout, the next section is Payment Methods which has border-top. 
                Let's make sure the divider sits physically inside this section as a mask-like effect or just a separator.
                If the *next* section is white, filling this with white creates a transition from this section's content.
                Wait, this section has white background too. That won't show anything.
                
                Correction: Assuming the next section (Payment Methods) might have a slightly different tone or border. 
                Actually, the user wants a "curved line". A line suggests a stroke.
                Let's draw a nice golden curve that sits at the bottom.*/}
            <path d="M0,80 C320,130 1120,-30 1440,60" stroke="url(#goldLineGradient)" strokeWidth="3" fill="none" opacity="0.6" />
            <defs>
              <linearGradient id="goldLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFD700" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section >

      {/* Payment Methods Section */}
      < section id="payments-section" style={{ padding: '100px 0', background: '#fff', position: 'relative', overflow: 'hidden', borderTop: '1px solid #f0f0f0' }
      }>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 1.5rem' }}>
          <motion.div {...fadeIn}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '1.5rem',
              color: '#1a1a1a',
              letterSpacing: '-1.2px'
            }}>
              {t('home.payments.title')} <span className="gold-text">{t('home.payments.titleHighlight')}</span>
            </h2>
            <p style={{ color: '#666', marginBottom: '5rem', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto 5rem', lineHeight: 1.6 }}>
              {t('home.payments.description')}
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
                      { name: 'Stripe', color: '#635bff', logo: '/payments/stripe.png' },
                      { name: 'Visa', color: '#1a1f71', logo: '/payments/visa.jpg' },
                      { name: 'MasterCard', color: '#eb001b', logo: '/payments/mastercard.png' },
                      { name: 'Unitel Money', color: '#ef7d00', logo: '/payments/Unitel-Money.jpeg' }
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
      </section >

      {/* Tesla-inspired Events Showcase (Original) */}
      < section style={{ padding: '0 20px 80px', background: '#fff' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {/* Block 1: Masterclasses */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              flex: '1 1 280px',
              maxWidth: '340px',
              position: 'relative',
              height: '450px',
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
              src="/masterclass.png"
              alt="Masterclass"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>{t('landing.showcase.masterclasses.title')}</h2>
              <p style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 400 }}>{t('landing.showcase.masterclasses.description')}</p>
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
                <Link href="/experts" style={{
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
              flex: '1 1 280px',
              maxWidth: '340px',
              position: 'relative',
              height: '450px',
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
              src="/networking.png"
              alt="Networking"
              fill
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>{t('landing.showcase.gala.title')}</h2>
              <p style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 400 }}>{t('landing.showcase.gala.description')}</p>
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
                <Link href="/experts" style={{
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
      </section >

      {/* Tesla-inspired Packages Showcase */}
      <section style={{ padding: '80px 20px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div {...fadeIn}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', fontWeight: 700 }}>
              {t('landing.impact.title')}<span className="gold-text">{t('landing.impact.titleHighlight')}</span>
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>{t('landing.impact.subtitle')}</p>
          </motion.div>
        </div>

        <PlansSection showTitle={false} />
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
      < SocialProof />

      {/* Blog Preview Section */}
      < BlogPreviewSection />

      {/* Institutional Section */}
      < InstitutionalSection />

      {/* Mentor Milestones Section */}
      <MentorMilestonesSection />

      {/* Video Tutorials Section */}
      <VideoTutorialsSection />

      {/* FAQ Section */}
      < FAQSection />

      {/* Testimonials Section */}
      < Testimonials />

      {/* Team Section - Leadership Authority */}
      <div id="team-section">
        <TeamSection />
      </div>

      {/* Tesla-inspired Minimalist Footer with Developer Credits */}
      < Footer />

      {/* Strategic Floating MOTIVA Button (Only shows if Admin enabled) */}
      <AnimatePresence>
        {isMotivaEnabledAdmin && isMotivaVisible && !isScrollBelowHalf && !(isMobile && isBrainOpen) && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="motiva-floating-btn"
          >
            <Link href="/motiva" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="motiva-btn-content"
              >
                <Trophy size={20} />
                <span style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Prémio Motiva</span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>


    </main >
  );
}
