"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main style={{ backgroundColor: '#050505', minHeight: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Solid Background - Clean & Lighter */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                background: '#0a0a0a', // Solid dark elegant background
                backgroundImage: 'radial-gradient(circle at top right, #1a1a1a 0%, #050505 40%)', // Subtle gradient for depth without clutter
                zIndex: 0
            }} />

            <div className="back-to-home-container" style={{ position: 'absolute', top: '20px', left: '25px', zIndex: 1000 }}>
                <Link href="/" className="back-to-home-link" style={{
                    color: '#fff',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <ArrowRight className="back-to-home-icon" size={16} style={{ transform: 'rotate(180deg)' }} /> 
                    <span className="back-to-home-text">Voltar para o Início</span>
                </Link>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .back-to-home-container {
                        top: 15px !important;
                        left: 15px !important;
                    }
                    .back-to-home-link {
                        padding: 6px 10px !important;
                        font-size: 0.75rem !important;
                        border-radius: 8px !important;
                    }
                    .back-to-home-icon {
                        width: 14px !important;
                        height: 14px !important;
                    }
                    .back-to-home-text {
                        font-size: 0.7rem !important;
                    }
                }
            `}</style>

            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                {children}
            </div>
        </main>
    );
}
