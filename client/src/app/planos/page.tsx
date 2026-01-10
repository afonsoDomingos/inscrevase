"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ShieldCheck, Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/context/CurrencyContext";

export default function PlansPage() {
    const { currency, setCurrency, formatPrice } = useCurrency();

    return (
        <main style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{ padding: '120px 20px 60px', textAlign: 'center', background: '#000', color: '#fff' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1rem', fontWeight: 800 }}>
                        Planos e <span className="gold-text">Preços</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
                        Encontre o nível de parceria ideal para elevar seu conteúdo e escalabilidade.
                    </p>

                    {/* Currency Selector */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px',
                        marginTop: '2.5rem'
                    }}>
                        <button
                            onClick={() => setCurrency('MZN')}
                            style={{
                                padding: '10px 30px',
                                borderRadius: '30px',
                                border: '1px solid #333',
                                background: currency === 'MZN' ? 'var(--gold-gradient)' : 'transparent',
                                color: currency === 'MZN' ? '#000' : '#fff',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            MT (Moçambique)
                        </button>
                        <button
                            onClick={() => setCurrency('USD')}
                            style={{
                                padding: '10px 30px',
                                borderRadius: '30px',
                                border: '1px solid #333',
                                background: currency === 'USD' ? 'var(--gold-gradient)' : 'transparent',
                                color: currency === 'USD' ? '#000' : '#fff',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            USD (Global)
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Tesla-inspired Packages Showcase */}
            <section style={{ padding: '80px 20px', background: '#fff' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '24px',
                    maxWidth: '1600px',
                    margin: '0 auto'
                }}>
                    {/* Package 1: Free */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            position: 'relative',
                            height: '750px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '60px',
                            textAlign: 'center'
                        }}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000"
                            alt="Free Plan"
                            fill
                            style={{ objectFit: 'cover', zIndex: 0 }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)', zIndex: 1 }} />

                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>Plano Free</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1rem' }}>Comece sua jornada sem custos.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="#FFD700" /> <span>Taxa de 15% por inscrição</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="#FFD700" /> <span>Formulários Ilimitados</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="#FFD700" /> <span>Gestão de Conteúdo Base</span></div>
                            </div>
                            <Link href="/cadastro" style={{
                                display: 'inline-block',
                                padding: '14px 0',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                background: 'rgba(255,255,255,0.9)',
                                color: '#393c41',
                                textDecoration: 'none',
                                fontWeight: 600,
                                width: '100%',
                                maxWidth: '320px',
                                transition: 'all 0.3s'
                            }}>
                                Começar Grátis
                            </Link>
                        </div>
                    </motion.div>

                    {/* Package 2: Pro */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{
                            position: 'relative',
                            height: '750px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '60px',
                            textAlign: 'center'
                        }}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                            alt="Pro Plan"
                            fill
                            style={{ objectFit: 'cover', zIndex: 0 }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)', zIndex: 1 }} />

                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{
                                background: 'var(--gold-gradient)',
                                color: '#000',
                                padding: '6px 16px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                display: 'inline-block',
                                marginBottom: '1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Mais Popular
                            </div>
                            <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontWeight: 600 }}>Plano Pro</h3>
                            <p style={{ color: '#FFD700', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                {formatPrice(499, 7.99)}<span style={{ fontSize: '0.9rem', opacity: 0.8 }}>/mês</span>
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '1rem' }}>Para profissionais em ascensão.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} color="#FFD700" /> <span>Taxa reduzida de 10%</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} color="#FFD700" /> <span>Destaque Premium no Showcase</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} color="#FFD700" /> <span>Analytics e Relatórios Avançados</span></div>
                            </div>
                            <Link href="/cadastro?plan=pro" style={{
                                display: 'inline-block',
                                padding: '14px 0',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                background: 'var(--gold-gradient)',
                                color: '#000',
                                textDecoration: 'none',
                                fontWeight: 700,
                                width: '100%',
                                maxWidth: '320px',
                                transition: 'all 0.3s'
                            }}>
                                Assinar Pro
                            </Link>
                        </div>
                    </motion.div>

                    {/* Package 3: Enterprise */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        style={{
                            position: 'relative',
                            height: '750px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '60px',
                            textAlign: 'center'
                        }}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1000"
                            alt="Enterprise Plan"
                            fill
                            style={{ objectFit: 'cover', zIndex: 0 }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)', zIndex: 1 }} />

                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontWeight: 600 }}>Enterprise</h3>
                            <p style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                {formatPrice(4990, 79.90)}<span style={{ fontSize: '0.9rem', opacity: 0.8 }}>/mês</span>
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '1rem' }}>O topo da performance estratégica.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '2rem', color: '#fff', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Crown size={18} color="#FFD700" /> <span style={{ fontWeight: 800, color: '#FFD700' }}>TAXA 0% (Isenção Total)</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={16} color="#FFD700" /> <span>Suporte VIP 24/7 com Account Manager</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={16} color="#FFD700" /> <span>Customização Total de Branding</span></div>
                            </div>
                            <Link href="/cadastro?plan=enterprise" style={{
                                display: 'inline-block',
                                padding: '14px 0',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                background: '#fff',
                                color: '#000',
                                textDecoration: 'none',
                                fontWeight: 700,
                                width: '100%',
                                maxWidth: '320px',
                                transition: 'all 0.3s'
                            }}>
                                Falar com Consultor
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Comparison Table Section (Optional/Minimalist) */}
            <section style={{ padding: '80px 20px', background: '#fcfcfc', borderTop: '1px solid #eee' }}>
                <div className="container" style={{ maxWidth: '1000px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Por que o <span className="gold-text">Enterprise</span>?</h2>
                        <p style={{ color: '#666' }}>A escolha estratégica para quem movimenta grandes volumes.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div style={{ padding: '30px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#000', fontWeight: 700 }}>Maximize seus Lucros</h4>
                            <p style={{ color: '#555', fontSize: '0.95rem' }}>Ao eliminar as taxas de transação, cada centavo das suas inscrições fica n o seu bolso. Ideal para eventos massivos ou produtos de alto valor.</p>
                        </div>
                        <div style={{ padding: '30px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#000', fontWeight: 700 }}>Infraestrutura Elite</h4>
                            <p style={{ color: '#555', fontSize: '0.95rem' }}>Acesso prioritário a novos recursos, integrações personalizadas e gestão completa de conformidade financeira.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ padding: '60px 0', background: '#000', color: '#fff', textAlign: 'center' }}>
                <p style={{ opacity: 0.5 }}>© 2026 Inscreva-se • A Excelência em Eventos</p>
            </footer>
        </main>
    );
}
