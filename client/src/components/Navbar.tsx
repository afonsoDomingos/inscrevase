"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogIn, LayoutDashboard, Linkedin, Youtube, Facebook, MessageCircle, Home, Users, Info, LifeBuoy, Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService, UserData } from '@/lib/authService';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslate } from '@/context/LanguageContext';
import InstallPrompt from './common/InstallPrompt';

export default function Navbar() {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    const currentUser = authService.getCurrentUser();
    setIsLoggedIn(!!token);
    setUser(currentUser);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/entrar';
    if (user.role === 'admin' || user.role === 'SuperAdmin') return '/dashboard/admin';
    if (user.role === 'participant') return '/dashboard/participant';
    return '/dashboard/mentor';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo Left */}
        <Link href="/" className="logo-container">
          <div className="logo-with-text">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="nav-logo-img"
            />
            <span className="tesla-logo-text">INSCREVA<span className="gold-text">-SE</span></span>
          </div>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="nav-center-links">
          <Link href="/mentores" className="nav-item">
            {t('nav.mentors')}
          </Link>
          <Link href="/sobre" className="nav-item">
            {t('nav.about')}
          </Link>
          <Link href="/blog" className="nav-item">
            {t('nav.blog')}
          </Link>
          <Link href="/suporte" className="nav-item">
            {t('dashboard.support')}
          </Link>
        </div>

        {/* Right Icons/Auth (Desktop) */}
        <div className="nav-right-section">
          <InstallPrompt />
          <LanguageSwitcher />
          {isLoggedIn ? (
            <Link href={getDashboardLink()} className="icon-link" title={t('nav.dashboard')}>
              <LayoutDashboard size={20} />
            </Link>
          ) : (
            <Link href="/entrar" className="icon-link" title={t('auth.login')}>
              <LogIn size={20} />
            </Link>
          )}
        </div>

        {/* Mobile Toggle Button (Visible only when closed) */}
        <button
          className={`mobile-toggle ${isOpen ? 'hidden' : ''}`}
          onClick={() => setIsOpen(true)}
        >
          <Menu color={scrolled ? "#000" : "#fff"} size={28} />
        </button>
      </div> {/* Close nav-container */}

      {/* Modern Full Screen Mobile Menu */}
      <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="logo-with-text">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="nav-logo-img"
            />
            <span className="tesla-logo-text">INSCREVA<span className="gold-text">-SE</span></span>
          </div>
          <button className="close-menu-btn" onClick={() => setIsOpen(false)}>
            <X size={32} color="#FFD700" />
          </button>
        </div>

        <div className="mobile-links">
          <div className="mobile-menu-section-title" style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', fontFamily: 'var(--font-poppins)' }}>{t('common.menu')}</div>

          <Link href="/" className="mobile-link" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#000', textDecoration: 'none' }}>
              <Home size={22} color="#000" />
              <span style={{ textDecoration: 'none', color: '#000' }}>{t('nav.home')}</span>
            </div>
          </Link>
          <Link href="/mentores" className="mobile-link" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#000', textDecoration: 'none' }}>
              <Users size={22} color="#000" />
              <span style={{ textDecoration: 'none', color: '#000' }}>{t('nav.mentors')}</span>
            </div>
          </Link>
          <Link href="/sobre" className="mobile-link" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#000', textDecoration: 'none' }}>
              <Info size={22} color="#000" />
              <span style={{ textDecoration: 'none', color: '#000' }}>{t('nav.about')}</span>
            </div>
          </Link>
          <Link href="/blog" className="mobile-link" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#000', textDecoration: 'none' }}>
              <Newspaper size={22} color="#000" />
              <span style={{ textDecoration: 'none', color: '#000' }}>{t('nav.blog')}</span>
            </div>
          </Link>
          <Link href="/suporte" className="mobile-link" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#000', textDecoration: 'none' }}>
              <LifeBuoy size={22} color="#000" />
              <span style={{ textDecoration: 'none', color: '#000' }}>{t('dashboard.support')}</span>
            </div>
          </Link>

          <InstallPrompt isMobile={true} />

          <div className="mobile-menu-spacer"></div>

          {isLoggedIn ? (
            <Link href={getDashboardLink()} className="mobile-action-btn" onClick={() => setIsOpen(false)} style={{ background: 'var(--gold-gradient)', color: '#fff', borderRadius: '15px', padding: '1.2rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', marginTop: 'auto', fontFamily: 'var(--font-poppins)', boxShadow: '0 10px 25px rgba(212, 175, 55, 0.4)' }}>
              {t('nav.dashboard')}
            </Link>
          ) : (
            <Link href="/entrar" className="mobile-action-btn" onClick={() => setIsOpen(false)} style={{ background: 'var(--gold-gradient)', color: '#fff', borderRadius: '15px', padding: '1.2rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', marginTop: 'auto', fontFamily: 'var(--font-poppins)', boxShadow: '0 10px 25px rgba(212, 175, 55, 0.4)' }}>
              {t('auth.login')}
            </Link>
          )}

          <div className="mobile-footer" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <a href="https://www.linkedin.com/company/inscreva-se" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', border: '1px solid #eee', padding: '10px', borderRadius: '12px', display: 'flex' }}><Linkedin size={20} /></a>
              <a href="https://www.youtube.com/@Inscreva-se-events" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', border: '1px solid #eee', padding: '10px', borderRadius: '12px', display: 'flex' }}><Youtube size={20} /></a>
              <a href="https://www.facebook.com/profile.php?id=61586427553486&locale=pt_BR" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', border: '1px solid #eee', padding: '10px', borderRadius: '12px', display: 'flex' }}><Facebook size={20} /></a>
              <a href="https://wa.me/258856079576" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', border: '1px solid #eee', padding: '10px', borderRadius: '12px', display: 'flex' }}><MessageCircle size={20} /></a>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          padding: 1.2rem 3rem;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          background: transparent;
        }
        .navbar.scrolled {
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 0.8rem 3rem;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        @media (max-width: 992px) {
          .navbar {
            padding: 1rem 1.5rem;
          }
          .navbar.scrolled {
            padding: 0.8rem 1.5rem;
          }
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }
        /* Mobile Toggle Logic */
        .mobile-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            z-index: 1001;
        }
        .mobile-toggle.hidden {
            opacity: 0;
            pointer-events: none;
        }

        /* Mobile Menu Overlay Styles */
        .mobile-menu-overlay {
            position: fixed;
            inset: 0;
            background: #ffffff;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            opacity: 0;
            pointer-events: none;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            transform: translateY(-10px);
        }
        .mobile-menu-overlay.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }

        .mobile-menu-header {
            padding: 2rem 2rem 1rem;
            display: flex;
            justify-content: flex-end;
            align-items: center;
        }
        .close-menu-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            color: #FFD700;
        }

        .mobile-links {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 0 2rem 3rem;
            overflow-y: auto;
        }

        .mobile-menu-section-title {
            color: #1a1a1a;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 3rem;
            font-family: 'Poppins', sans-serif;
        }

        .mobile-link {
            font-family: 'Poppins', sans-serif;
            font-size: 1.2rem;
            color: #000000 !important;
            text-decoration: none !important;
            padding: 2rem 0.5rem;
            transition: all 0.3s ease;
            font-weight: 500;
            margin-bottom: 2.5rem;
            display: flex;
            align-items: center;
            border: none !important;
            background: transparent !important;
        }

        .mobile-link span {
            text-decoration: none !important;
        }

        .mobile-link:active {
            opacity: 0.7;
            transform: translateX(5px);
        }



        .mobile-menu-spacer {
            flex: 1;
        }

        .mobile-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #4285f4;
            color: #fff !important;
            text-decoration: none !important;
            padding: 1rem;
            border-radius: 8px;
            font-family: 'Poppins', sans-serif;
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 2rem;
            transition: all 0.2s ease;
        }

        .mobile-action-btn:active {
            transform: scale(0.98);
            filter: brightness(1.1);
        }

        .mobile-footer {
          display: flex;
          justify-content: center;
          padding-top: 1rem;
        }

        @media (max-width: 992px) {
           .nav-center-links, .nav-right-section { display: none !important; }
           .nav-container { 
             display: flex !important; 
             justify-content: space-between !important; 
             width: 100% !important; 
             align-items: center !important;
           }
           .mobile-toggle { 
             display: block !important; 
             background: none !important;
             padding: 0.5rem !important;
             border: none !important;
             cursor: pointer;
           }
        }

        /* --- Existing Desktop Styles preserved below --- */
        .logo-container {
          text-decoration: none !important;
        }
        .logo-container:hover,
        .logo-container:active,
        .logo-container:focus,
        .logo-container:visited {
          text-decoration: none !important;
        }
        .logo-with-text {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .nav-logo-img {
          object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
          transition: all 0.5s ease;
        }
        .logo-container:hover .nav-logo-img {
          transform: scale(1.1) rotate(-5deg);
        }
        .tesla-logo-text {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 700 !important;
          letter-spacing: 4px;
          font-size: 1.2rem;
          color: #FFFFFF !important;
          text-decoration: none !important;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .tesla-logo-text {
            letter-spacing: 2px !important;
            font-size: 1.1rem !important;
          }
        }
        @media (max-width: 768px) {
          .tesla-logo-text {
            letter-spacing: 2px !important;
            font-size: 1rem !important;
          }
          .logo-with-text {
            gap: 0.4rem !important;
          }
          .nav-logo-img {
            width: 32px !important;
            height: 32px !important;
          }
        }
        .tesla-logo-text .gold-text {
          color: #FFD700 !important;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
          text-decoration: none !important;
        }
        .navbar.scrolled .tesla-logo-text {
          color: #FFFFFF !important;
        }
        .navbar.scrolled .tesla-logo-text .gold-text {
          color: #FFD700 !important;
        }
        /* Mobile Menu logo colors */
        .mobile-menu-overlay .tesla-logo-text {
            color: #FFFFFF !important;
        }
        .mobile-menu-overlay .tesla-logo-text .gold-text {
            color: #FFD700 !important;
        }

        /* Creative Shine Effect on Logo */
        .tesla-logo-text::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 215, 0, 0.15),
            transparent
          );
          transition: all 0.4s ease;
        }
        .logo-container:hover .tesla-logo-text::before {
          left: 100%;
        }
        /* Remove any underline that might appear */
        .logo-container:hover .tesla-logo-text::after {
          display: none;
        }
        .logo-container:hover .tesla-logo-text {
          transform: translateY(-2px);
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }
        .nav-center-links {
          display: flex;
          gap: 1rem;
        }
        :global(.nav-item) {
          font-family: 'Poppins', sans-serif !important;
          color: #FFD700 !important;
          text-decoration: none !important;
          font-size: 0.8rem;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transition: all 0.3s ease;
          padding: 0.8rem 1.5rem;
          position: relative;
          display: inline-block;
          overflow: hidden;
        }
        .navbar.scrolled :global(.nav-item) {
          color: #FFF !important;
        }
        /* Creative Background Hover Effect */
        :global(.nav-item)::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 215, 0, 0.1),
            transparent
          );
          transition: all 0.4s ease;
        }
        :global(.nav-item):hover::before {
          left: 100%;
        }
        /* Hover State */
        :global(.nav-item):hover {
          color: #FFD700 !important;
          transform: translateY(-3px);
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        }
        .navbar.scrolled :global(.nav-item):hover {
          color: #FFD700 !important;
        }
        /* Creative Floating Line */
        :global(.nav-item)::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #FFD700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform: translateX(-50%);
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
        }
        :global(.nav-item):hover::after {
          width: 50%;
        }
        .nav-right-section {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1.5rem;
        }
        :global(.icon-link) {
          color: #FFD700 !important;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none !important;
        }
        .navbar.scrolled :global(.icon-link) {
          color: #B8860B !important;
        }
        :global(.icon-link):hover {
          transform: scale(1.3) rotate(15deg);
          color: #FFFFFF !important;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
        }
      `}</style>
    </nav>
  );
}
