"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo-container">
          <div className="nav-logo-wrapper">
            <Image
              src="/logo.png"
              alt="Inscreva-se"
              className="nav-logo"
              width={80}
              height={80}
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard/mentor" className="btn-luxury-icon" title="Dashboard">
                <LayoutDashboard size={20} color="#FFD700" />
              </Link>
              <Link href="/dashboard/mentor" className="btn-primary">Criar Evento</Link>
            </>
          ) : (
            <>
              <Link href="/entrar" className="btn-luxury-icon" title="Acesso Elite">
                <LogIn size={20} color="#FFD700" />
              </Link>
              <Link href="/entrar" className="btn-primary">Começar Agora</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard/mentor" onClick={() => setIsOpen(false)}>Meu Painel</Link>
              <Link href="/dashboard/mentor" className="btn-primary" onClick={() => setIsOpen(false)}>Criar Evento</Link>
            </>
          ) : (
            <>
              <Link href="/entrar" onClick={() => setIsOpen(false)}>Entrar</Link>
              <Link href="/entrar" className="btn-primary" onClick={() => setIsOpen(false)}>Começar Agora</Link>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: white;
          padding: 0.8rem 2rem;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          border-bottom: 1px solid #eee;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-decoration: none;
        }
        .nav-logo-wrapper {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .nav-logo {
          height: 120%; /* Scale up to crop out empty edges */
          width: auto;
          object-fit: contain;
          transform: scale(1.4); /* Zoom in to eliminate whitespace */
        }
        .logo-text {
          font-family: var(--font-playfair);
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -1.5px;
          color: #000;
          line-height: 1;
        }
        .logo-text span {
          color: var(--primary);
        }
        .btn-luxury-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #000;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border: 1px solid #000;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          position: relative;
          overflow: hidden;
        }
        .btn-luxury-icon::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--gold-gradient);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
        }
        .btn-luxury-icon :global(svg) {
          position: relative;
          z-index: 2;
          color: #FFD700; /* Forçando o Dourado no ícone */
          transition: transform 0.4s ease, color 0.4s ease;
        }
        .btn-luxury-icon:hover {
          transform: translateY(-3px) rotate(5deg);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
          border-color: var(--primary);
        }
        .btn-luxury-icon:hover::before {
          opacity: 1;
        }
        .btn-luxury-icon:hover :global(svg) {
          color: #000;
          transform: scale(1.1);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
        }
        .mobile-menu {
          display: none;
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .mobile-toggle { display: block; }
          .mobile-menu {
            display: flex;
            flex-direction: column;
            padding: 2rem;
            gap: 1.5rem;
            background: white;
            border-top: 1px solid #eee;
          }
        }
      `}</style>
    </nav>
  );
}
