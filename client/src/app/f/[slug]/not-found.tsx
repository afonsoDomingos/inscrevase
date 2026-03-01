"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, CalendarX, ArrowLeft, Search, Bell, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EventNotFound() {
    const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);

    useEffect(() => {
        // Generate floating particles on mount (client-only)
        setParticles(
            Array.from({ length: 12 }, () => ({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 2,
                delay: Math.random() * 3,
            }))
        );
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #080808 0%, #0d0d0d 50%, #080808 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'var(--font-inter), sans-serif'
        }}>

            {/* Ambient glows */}
            <div style={{
                position: 'absolute', top: '15%', left: '10%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '5%',
                width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
            }} />

            {/* Floating particles */}
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: '50%',
                        background: 'rgba(212,175,55,0.3)',
                        pointerEvents: 'none'
                    }}
                    animate={{ y: [-15, 15, -15], opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 4 + p.delay, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                />
            ))}

            {/* Main content */}
            <div style={{ maxWidth: '680px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                {/* Broken calendar icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
                    style={{ marginBottom: '2rem' }}
                >
                    <div style={{
                        width: '110px', height: '110px',
                        borderRadius: '28px',
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))',
                        border: '1.5px solid rgba(212,175,55,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: '0 0 60px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                        position: 'relative'
                    }}>
                        <CalendarX size={50} color="rgba(212,175,55,0.8)" strokeWidth={1.5} />
                        {/* X badge */}
                        <div style={{
                            position: 'absolute', top: '-8px', right: '-8px',
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid #080808',
                            fontSize: '0.7rem', fontWeight: 900, color: '#fff'
                        }}>✕</div>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        padding: '6px 16px', borderRadius: '50px', marginBottom: '20px',
                        fontSize: '0.75rem', fontWeight: 700, color: '#fca5a5',
                        textTransform: 'uppercase', letterSpacing: '0.08em'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                        Evento Não Disponível
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                        fontWeight: 900,
                        marginBottom: '1.2rem',
                        lineHeight: 1.15,
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        background: 'linear-gradient(135deg, #ffffff 0%, #aaaaaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Este evento já não<br />está disponível
                    </h1>

                    <p style={{
                        fontSize: '1.05rem',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.7,
                        maxWidth: '480px',
                        margin: '0 auto 2.5rem',
                    }}>
                        O link que seguiste pode ter expirado, o evento pode ter sido cancelado ou removido pelo organizador.
                        Mas não te preocupes — há muito mais para descobrir!
                    </p>
                </motion.div>

                {/* Info cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '12px',
                        marginBottom: '2.5rem'
                    }}
                >
                    {[
                        { icon: '📅', title: 'Evento expirado', desc: 'O prazo de inscrição terminou' },
                        { icon: '🗑️', title: 'Evento removido', desc: 'O organizador eliminou o evento' },
                        { icon: '🔒', title: 'Evento privado', desc: 'O acesso pode ter sido restringido' },
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '16px',
                            padding: '18px 16px',
                            textAlign: 'left'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{item.icon}</div>
                            <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#ddd', marginBottom: '4px' }}>{item.title}</p>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{item.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}
                >
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            background: 'linear-gradient(135deg, #D4AF37, #F9D976)',
                            color: '#000',
                            padding: '14px 28px',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            boxShadow: '0 8px 30px rgba(212,175,55,0.25)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgba(212,175,55,0.4)';
                        }}
                        onMouseOut={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(212,175,55,0.25)';
                        }}
                    >
                        <Home size={18} />
                        Ir para a Página Inicial
                    </Link>

                    <Link
                        href="/calendario"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            padding: '14px 28px',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            border: '1px solid rgba(255,255,255,0.12)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseOut={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                        }}
                    >
                        <Search size={16} />
                        Ver Outros Eventos
                    </Link>
                </motion.div>

                {/* Separator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ margin: '2.5rem auto', display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '400px' }}
                >
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>Ou organiza o teu próprio evento</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                </motion.div>

                {/* Create event CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Link
                        href="/dashboard/mentor"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            padding: '10px 22px',
                            borderRadius: '50px',
                            border: '1px solid rgba(212,175,55,0.3)',
                            background: 'rgba(212,175,55,0.06)',
                            color: 'rgba(212,175,55,0.9)',
                            textDecoration: 'none',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.12)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.5)';
                        }}
                        onMouseOut={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.06)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.3)';
                        }}
                    >
                        <ExternalLink size={14} />
                        Criar o meu próprio evento
                    </Link>
                </motion.div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        marginTop: '3rem',
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.2)',
                        lineHeight: 1.6
                    }}
                >
                    Se acreditas que isto é um erro, contacta o organizador diretamente.<br />
                    A equipa <span style={{ color: 'rgba(212,175,55,0.5)', fontWeight: 700 }}>Inscreva-se</span> não tem acesso aos detalhes de eventos privados.
                </motion.p>
            </div>
        </div>
    );
}
