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

            <div style={{ position: 'absolute', top: '20px', left: '25px', zIndex: 10 }}>
                <Link href="/" style={{
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
                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Voltar para o Início
                </Link>
            </div>

            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                {children}
            </div>
        </main>
    );
}
