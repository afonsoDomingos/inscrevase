"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslate } from '@/context/LanguageContext';

export default function Navbar() {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <span className="tesla-logo-text">INSCR<span className="gold-text">EVA</span></span>
          </div>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="nav-center-links">
          <Link href="/mentores" className="nav-item">
            {t('nav.mentors')}
          </Link>
          <Link href="/dashboard/mentor" className="nav-item">
            {t('nav.events')}
          </Link>
          <Link href="/suporte" className="nav-item">
            {t('dashboard.support')}
          </Link>
        </div>

        {/* Right Icons/Auth (Desktop) */}
        <div className="nav-right-section">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <Link href="/dashboard/mentor" className="icon-link" title={t('nav.dashboard')}>
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
                <span className="tesla-logo-text">INSCR<span className="gold-text">EVA</span></span>
              </div>
              <button className="close-menu-btn" onClick={() => setIsOpen(false)}>
                  <X size={32} color="#FFD700" />
              </button>
          </div>

          <div className="mobile-links">
            <Link href="/" className="mobile-link" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/mentores" className="mobile-link" onClick={() => setIsOpen(false)}>{t('nav.mentors')}</Link>
            <Link href="/dashboard/mentor" className="mobile-link" onClick={() => setIsOpen(false)}>{t('nav.events')}</Link>
            <Link href="/suporte" className="mobile-link" onClick={() => setIsOpen(false)}>{t('dashboard.support')}</Link>

            <div className="mobile-divider"></div>

            {isLoggedIn ? (
                <Link href="/dashboard/mentor" className="mobile-link highlight" onClick={() => setIsOpen(false)}>
                    <LayoutDashboard size={24} style={{ marginRight: '10px' }} />
                    {t('nav.dashboard')}
                </Link>
            ) : (
                <Link href="/entrar" className="mobile-link highlight" onClick={() => setIsOpen(false)}>
                    <LogIn size={24} style={{ marginRight: '10px' }} />
                    {t('auth.login')}
                </Link>
            )}

            <div style={{ marginTop: '2rem' }}>
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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 0.7rem 3rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
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
            background: #000000;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            opacity: 0;
            pointer-events: none;
            transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
            transform: translateY(-20px);
        }
        .mobile-menu-overlay.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }

        .mobile-menu-header {
            padding: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,215,0, 0.1);
        }
        .close-menu-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            transition: transform 0.3s ease;
        }
        .close-menu-btn:hover {
            transform: rotate(90deg);
        }

        .mobile-links {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            padding-bottom: 4rem;
        }

        .mobile-link {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            color: #fff;
            text-decoration: none;
            transition: all 0.3s ease;
            position: relative;
        }
        .mobile-link:hover {
            color: #FFD700;
            transform: scale(1.05);
            letter-spacing: 1px;
        }

        .mobile-link.highlight {
            display: flex;
            align-items: center;
            color: #FFD700;
            font-family: 'Poppins', sans-serif;
            font-size: 1.5rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 1rem;
        }

        .mobile-divider {
            width: 40px;
            height: 2px;
            background: #333;
            margin: 1rem 0;
        }

        @media (max-width: 992px) {
           .nav-center-links, .nav-right-section { display: none; }
           .nav-container { display: flex; justify-content: space-between; }
           .mobile-toggle { display: block; }
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
          font-weight: 800 !important;
          letter-spacing: 5px;
          font-size: 1.3rem;
          color: #FFFFFF !important;
          text-decoration: none !important;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          display: inline-block;
          padding: 0.5rem 0;
        }
        .tesla-logo-text .gold-text {
          color: #FFD700 !important;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
          text-decoration: none !important;
        }
        .navbar.scrolled .tesla-logo-text {
          color: #000000 !important;
        }
        .navbar.scrolled .tesla-logo-text .gold-text {
          color: #B8860B !important;
        }
        /* Mobile Menu inherits text color from overlay background (black), so we force white for logo inside it */
        .mobile-menu-overlay .tesla-logo-text {
            color: #fff !important;
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
          color: #8B6508 !important;
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
          color: #fff !important;
          transform: translateY(-3px);
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        }
        .navbar.scrolled :global(.nav-item):hover {
          color: #000 !important;
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
