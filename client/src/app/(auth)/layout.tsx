"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main style={{ backgroundColor: '#050505', minHeight: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes pan-zoom {
                    0% { transform: scale(1) translate(0, 0); }
                    50% { transform: scale(1.25) translate(-3%, -3%); }
                    100% { transform: scale(1) translate(0, 0); }
                }
            `}} />

            {/* Background Image with Animation */}
            <div style={{ 
                position: 'absolute', 
                top: 0, left: 0, width: '100%', height: '100%', 
                backgroundImage: "url('/auth-bg-gold.png')",
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                animation: 'pan-zoom 30s infinite ease-in-out alternate',
                filter: 'brightness(0.6)',
                zIndex: 0 
            }} />

            {/* Dark Overlay for readability */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
            
            {/* Golden Orb Effect */}
            <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', opacity: 0.1, background: 'radial-gradient(circle, #FFD700 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 1 }} />
            
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
