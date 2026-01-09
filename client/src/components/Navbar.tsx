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

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X color={scrolled ? "#000" : "#fff"} /> : <Menu color={scrolled ? "#000" : "#fff"} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <Link href="/mentores" onClick={() => setIsOpen(false)}>{t('nav.mentors')}</Link>
          <Link href="/dashboard/mentor" onClick={() => setIsOpen(false)}>{t('nav.dashboard')}</Link>
          <Link href="/entrar" onClick={() => setIsOpen(false)}>{t('auth.login')}</Link>
        </div>
      )}

      <style jsx>{`
        .navbar {
          padding: 1.2rem 3rem;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.3s ease;
          background: transparent;
        }
        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          padding: 0.8rem 3rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }
        .logo-container {
          text-decoration: none;
        }
        .logo-with-text {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .nav-logo-img {
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.3));
          transition: transform 0.3s ease;
        }
        .logo-container:hover .nav-logo-img {
          transform: scale(1.1);
        }
        .tesla-logo-text {
          font-family: var(--font-poppins), sans-serif;
          font-weight: 800;
          letter-spacing: 4px;
          font-size: 1.2rem;
          color: white;
          transition: color 0.3s;
        }
        .tesla-logo-text .gold-text {
          color: #FFD700;
        }
        .navbar.scrolled .tesla-logo-text {
          color: #000;
        }
        .navbar.scrolled .tesla-logo-text .gold-text {
          color: #B8860B;
        }
        .nav-center-links {
          display: flex;
          gap: 2rem;
        }
        .nav-item {
          font-family: var(--font-poppins), sans-serif !important;
          color: #FFD700 !important;
          text-decoration: none !important;
          font-size: 0.8rem;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transition: all 0.3s ease;
          padding: 0.5rem 1rem;
          position: relative;
          display: inline-block;
        }
        .navbar.scrolled .nav-item {
          color: #B8860B !important;
        }
        /* Creative Underline Effect */
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: #FFD700;
          transition: all 0.3s ease;
          transform: translateX(-50%);
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        .navbar.scrolled .nav-item::after {
          background: #B8860B;
        }
        .nav-item:hover::after {
          width: 70%;
        }
        .nav-item:hover {
          transform: translateY(-2px);
          text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
        }
        .nav-right-section {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1.5rem;
        }
        .icon-link {
          color: #FFD700 !important;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .navbar.scrolled .icon-link {
          color: #B8860B !important;
        }
        .icon-link:hover {
          transform: scale(1.2) rotate(5deg);
          color: #fff !important;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
        }
        @media (max-width: 992px) {
          .nav-center-links, .nav-right-section { display: none; }
          .nav-container { display: flex; justify-content: space-between; }
          .mobile-toggle { display: block; }
        }
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: white;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .mobile-menu a {
          color: #000;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
        }
      `}</style>
    </nav>
  );
}
