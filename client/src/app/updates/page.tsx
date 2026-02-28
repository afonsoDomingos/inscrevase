"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Rocket,
    Sparkles,
    Clock,
    ChevronLeft,
    CheckCircle2,
    Zap,
    Video,
    ShieldCheck,
    MessageSquare,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useTranslate } from '@/context/LanguageContext';

interface UpdateItem {
    id: string;
    date: string;
    version: string;
    title: { pt: string; en: string };
    type: 'new' | 'improved' | 'fixed';
    description: { pt: string; en: string };
    features: { pt: string; en: string }[];
    icon: React.ReactNode;
}

const updates: UpdateItem[] = [
    {
        id: 'update-4',
        date: '14 Fev 2026',
        version: 'v2.5.0',
        title: { pt: 'UX de Inscrição & Mensagens Globais', en: 'Registration UX & Global Messaging' },
        type: 'improved',
        description: {
            pt: 'Focamos na fluidez da experiência do participante e no alcance global da plataforma.',
            en: 'Focused on the participant experience fluidity and the platform\'s global reach.'
        },
        features: [
            { pt: 'Correção de rolagem (scroll) em formulários no computador', en: 'Fixed desktop form scrolling issues' },
            { pt: 'Novo sistema de mensagens de indicação com visão global', en: 'New global referral messaging system' },
            { pt: 'Remoção de validações de horário restritivas', en: 'Removed restrictive time format validations' },
            { pt: 'Aprimoramento dos rótulos e identificação de campos', en: 'Improved field labels and identification' }
        ],
        icon: <Zap className="text-yellow-500" />
    },
    {
        id: 'update-1',
        date: '09 Fev 2026',
        version: 'v2.4.0',
        title: { pt: 'Rebrand: De Mentores para Experts', en: 'Rebrand: From Mentors to Experts' },
        type: 'improved',
        description: {
            pt: 'Uma mudança estratégica para elevar o posicionamento de nossa comunidade profissional.',
            en: 'A strategic shift to elevate the positioning of our professional community.'
        },
        features: [
            { pt: 'Nova URL amigável: /experts', en: 'New friendly URL: /experts' },
            { pt: 'Interface refinada com foco em Elite Experts', en: 'Refined interface focusing on Elite Experts' },
            { pt: 'Atualização de termos em toda a plataforma', en: 'Global terminology update across the platform' }
        ],
        icon: <Sparkles className="text-amber-500" />
    },
    {
        id: 'update-2',
        date: '09 Fev 2026',
        version: 'v2.3.8',
        title: { pt: 'Academia de Experts: Dicas de Sucesso', en: 'Expert Academy: Success Tips' },
        type: 'new',
        description: {
            pt: 'Ferramentas educativas para ajudar nossos experts a crescerem mais rápido.',
            en: 'Educational tools to help our experts grow faster.'
        },
        features: [
            { pt: 'Cartões de consultoria na gestão de aulas', en: 'Advisory cards in lesson management' },
            { pt: 'Incentivo à criação de Vídeos de Introdução', en: 'Incentive for creating Introduction Videos' },
            { pt: 'Melhoria na navegação interna da Academia', en: 'Improved internal navigation in the Academy' }
        ],
        icon: <Video className="text-blue-500" />
    },
    {
        id: 'update-3',
        date: '05 Fev 2026',
        version: 'v2.3.5',
        title: { pt: 'Segurança & Performance', en: 'Security & Performance' },
        type: 'fixed',
        description: {
            pt: 'Aprimoramentos estruturais para uma experiência mais fluida.',
            en: 'Structural enhancements for a smoother experience.'
        },
        features: [
            { pt: 'Otimização de carregamento de imagens de perfil', en: 'Profile image loading optimization' },
            { pt: 'Reforço na validação de formulários de inscrição', en: 'Strengthened registration form validation' },
            { pt: 'Correção de bugs menores no dashboard administrativo', en: 'Minor bug fixes in the admin dashboard' }
        ],
        icon: <ShieldCheck className="text-green-500" />
    }
];

export default function UpdatesPage() {
    const { t, locale } = useTranslate();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getTypeStyles = (type: UpdateItem['type']) => {
        switch (type) {
            case 'new': return { bg: '#dcfce7', color: '#166534', label: t('updates.new') };
            case 'improved': return { bg: '#e0f2fe', color: '#0369a1', label: t('updates.improved') };
            case 'fixed': return { bg: '#fef3c7', color: '#92400e', label: t('updates.fixed') };
            default: return { bg: '#f3f4f6', color: '#4b5563', label: '' };
        }
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '5rem' }}>
            <Navbar />

            <main style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '160px 20px 20px' : '120px 20px 20px' }}>
                <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212, 175, 55, 0.1)', color: '#B8860B', padding: '8px 16px', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}
                    >
                        <Zap size={16} fill="#B8860B" />
                        Log de Atualizações
                    </motion.div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', color: '#1a1a1a', marginBottom: '1rem' }}>
                        {t('updates.title')}
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                        {t('updates.subtitle')}
                    </p>
                </div>

                <div style={{ position: 'relative' }}>
                    {/* Timeline vertical line */}
                    <div style={{ position: 'absolute', left: '20px', top: '0', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, #D4AF37, #f0f0f0)', zIndex: 0 }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {updates.map((update, index) => {
                            const styles = getTypeStyles(update.type);
                            return (
                                <motion.div
                                    key={update.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{ position: 'relative', paddingLeft: '60px' }}
                                >
                                    {/* Timeline dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '11px',
                                        top: '0',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: index === 0 ? '#111' : '#fff',
                                        border: index === 0 ? '4px solid #D4AF37' : '2px solid #D4AF37',
                                        zIndex: 1,
                                        boxShadow: index === 0 ? '0 0 15px rgba(212, 175, 55, 0.5)' : 'none'
                                    }} />

                                    <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D4AF37', background: 'rgba(212,175,55,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                                                        {update.version}
                                                    </span>
                                                    <span style={{ fontSize: '0.9rem', color: '#999', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Clock size={14} /> {update.date}
                                                    </span>
                                                    {index === 0 && (
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fff', background: '#e11d48', padding: '2px 8px', borderRadius: '5px' }}>
                                                            {t('updates.latest')}
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a' }}>
                                                    {locale === 'pt' ? update.title.pt : update.title.en}
                                                </h2>
                                            </div>
                                            <div style={{ background: styles.bg, color: styles.color, padding: '6px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
                                                {styles.label}
                                            </div>
                                        </div>

                                        <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                            {locale === 'pt' ? update.description.pt : update.description.en}
                                        </p>

                                        <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                                                Principais Mudanças
                                            </h4>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {update.features.map((feature, fIdx) => (
                                                    <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333', fontSize: '0.95rem' }}>
                                                        <CheckCircle2 size={16} className="text-green-500" />
                                                        {locale === 'pt' ? feature.pt : feature.en}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* ROADMAP SECTION */}
                <div style={{ marginTop: '6rem', marginBottom: '6rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '1rem' }}>
                            {t('feedback.roadmap.title')}
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                            {t('feedback.roadmap.subtitle')}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                            {
                                title: { pt: 'Integração Multipagamentos África', en: 'Multi-payment Africa Integration' },
                                desc: { pt: 'Novos gateways para M-Pesa e e-Mola automatizados.', en: 'New automated M-Pesa and e-Mola gateways.' },
                                status: 'progress',
                                icon: <Zap size={20} />
                            },
                            {
                                title: { pt: 'App Mobile Nativo (PWA+)', en: 'Native Mobile App (PWA+)' },
                                desc: { pt: 'Experiência de instalação aprimorada para iOS e Android.', en: 'Enhanced installation experience for iOS and Android.' },
                                status: 'planned',
                                icon: <Rocket size={20} />
                            },
                            {
                                title: { pt: 'IA para Gestão de Conteúdo', en: 'AI for Content Management' },
                                desc: { pt: 'Criação de resumos e legendas para aulas via IA.', en: 'Creation of summaries and captions for lessons via AI.' },
                                status: 'testing',
                                icon: <Sparkles size={20} />
                            }
                        ].map((item, idx) => {
                            const getStatusLabel = (status: string) => {
                                switch (status) {
                                    case 'planned': return { label: t('feedback.roadmap.status.planned'), color: '#666', bg: '#f3f4f6' };
                                    case 'progress': return { label: t('feedback.roadmap.status.progress'), color: '#0369a1', bg: '#e0f2fe' };
                                    case 'testing': return { label: t('feedback.roadmap.status.testing'), color: '#92400e', bg: '#fef3c7' };
                                    default: return { label: '', color: '#666', bg: '#f3f4f6' };
                                }
                            };
                            const status = getStatusLabel(item.status);
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <div style={{ color: '#D4AF37' }}>{item.icon}</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', background: status.bg, color: status.color, textTransform: 'uppercase' }}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                        {locale === 'pt' ? item.title.pt : item.title.en}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
                                        {locale === 'pt' ? item.desc.pt : item.desc.en}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s', marginBottom: '2rem' }} onMouseOver={(e) => e.currentTarget.style.color = '#000'} onMouseOut={(e) => e.currentTarget.style.color = '#666'}>
                        <ChevronLeft size={20} />
                        {t('updates.backHome')}
                    </Link>

                    {/* Feedback CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'linear-gradient(135deg, #111 0%, #222 100%)',
                            borderRadius: '24px',
                            padding: '3rem 2rem',
                            color: '#fff',
                            marginTop: '2rem',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(212, 175, 55, 0.3)'
                        }}
                    >
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>
                                O que achou destas novidades?
                            </h3>
                            <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                                Seu feedback é o que nos move. Conte-nos como podemos tornar a Inscreva-se ainda melhor para você.
                            </p>
                            <Link
                                href="/feedback"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                    color: '#000',
                                    padding: '14px 28px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)'
                                }}
                            >
                                <MessageSquare size={20} />
                                Deixar Feedback
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>

            <footer style={{ marginTop: '5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '3rem', paddingBottom: '3rem' }}>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>
                    © 2026 INSCRIVA-SE • LIDERANÇA & IMPACTO
                </p>
            </footer>

            <style jsx>{`
                .text-amber-500 { color: #f59e0b; }
                .text-blue-500 { color: #3b82f6; }
                .text-green-500 { color: #10b981; }
            `}</style>
        </div>
    );
}
