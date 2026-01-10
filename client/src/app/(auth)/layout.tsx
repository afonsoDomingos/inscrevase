"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="bg-auth" style={{ padding: '0.5rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', overflow: 'hidden' }}>
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
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Voltar para o Início
                </Link>
            </div>
            {children}
        </main>
    );
}
