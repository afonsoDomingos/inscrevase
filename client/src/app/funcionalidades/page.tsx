"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
    Palette, Zap, BarChart3, ShieldCheck, MessageCircle, ArrowRight,
    BrainCircuit, Globe, CreditCard, Layout, Smartphone, Lock
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };

    return (
        <main style={{ backgroundColor: '#050505', minHeight: '100vh', overflowX: 'hidden', color: '#fff' }}>
            <Navbar />
            
            <style dangerouslySetInnerHTML={{__html: `
                .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; grid-auto-rows: minmax(300px, auto); }
                .bento-item { grid-column: span 12; }
                @media (min-width: 900px) {
                    .span-7 { grid-column: span 7; }
                    .span-5 { grid-column: span 5; }
                    .span-12 { grid-column: span 12; }
                }
            `}} />

            {/* Hero Section */}
            <section style={{
                padding: '180px 20px 100px',
                background: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #050505 70%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', opacity: 0.15, background: 'radial-gradient(circle, #FFD700 0%, transparent 60%)', filter: 'blur(100px)' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
                    <motion.div {...fadeIn}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '30px',
                            background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)', marginBottom: '2rem',
                            color: '#FFD700', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase'
                        }}>
                            <Zap size={14} fill="#FFD700" />
                            A plataforma completa para seus eventos
                        </div>

                        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, fontFamily: 'var(--font-playfair)', color: '#fff' }}>
                            Poder Absoluto <br />
                            <span className="gold-text">Em Suas Mãos</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#888', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                            Descubra como nossa tecnologia de ponta transforma a gestão de eventos complexos em uma experiência fluida, elegante e lucrativa.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section style={{ padding: '50px 0 100px' }}>
                <div className="container">
                    <div className="bento-grid">

                        {/* Feature 1: Aura AI */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bento-item span-7"
                            style={{
                                background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
                                borderRadius: '30px',
                                border: '1px solid #222',
                                padding: '40px',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                            <div>
                                <div style={{ marginBottom: '20px', width: '50px', height: '50px', background: '#FFD700', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BrainCircuit size={28} color="#000" />
                                </div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>Aura AI Integrada</h3>
                                <p style={{ color: '#888', maxWidth: '400px', lineHeight: 1.6 }}>
                                    Nossa inteligência artificial avançada cria descrições persuasivas, sugere estratégias de marketing e analisa recibos de pagamento automaticamente.
                                </p>
                            </div>
                            <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid #333', maxWidth: '400px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#00ff88', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.8rem', color: '#ccc' }}>Analise de Recibo M-Pesa em tempo real...</span>
                                </div>
                                <div style={{ height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        style={{ height: '100%', background: '#00ff88' }}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 2: Pagamentos Globais */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bento-item span-5"
                            style={{
                                background: '#0f0f0f',
                                borderRadius: '30px',
                                border: '1px solid #222',
                                padding: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(56, 161, 105, 0.1)', borderRadius: '50%' }}>
                                <CreditCard size={40} color="#38a169" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>Pagamentos Universais</h3>
                            <p style={{ color: '#888', marginBottom: '20px' }}>
                                Aceite M-Pesa, E-Mola e Cartões Internacionais (Stripe) sem fricção.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', opacity: 0.6 }}>
                                <div style={{ padding: '5px 10px', background: '#222', borderRadius: '5px', fontSize: '0.7rem' }}>VISA</div>
                                <div style={{ padding: '5px 10px', background: '#222', borderRadius: '5px', fontSize: '0.7rem' }}>M-PESA</div>
                                <div style={{ padding: '5px 10px', background: '#222', borderRadius: '5px', fontSize: '0.7rem' }}>PAYPAL</div>
                            </div>
                        </motion.div>

                        {/* Feature 3: Design Premium */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bento-item span-5"
                            style={{
                                background: '#0f0f0f',
                                borderRadius: '30px',
                                border: '1px solid #222',
                                padding: '40px',
                            }}
                        >
                            <Palette size={32} color="#fff" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>Customização Visual</h3>
                            <p style={{ color: '#888' }}>
                                Seus eventos com a sua cara. Personalize cores, fontes e layouts para refletir sua marca premium.
                            </p>
                        </motion.div>

                        {/* Feature 4: Dashboard em Tempo Real */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bento-item span-7"
                            style={{
                                background: 'linear-gradient(to right, #111, #0d0d0d)',
                                borderRadius: '30px',
                                border: '1px solid #222',
                                padding: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '30px',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <BarChart3 size={32} color="#805ad5" style={{ marginBottom: '20px' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>Métricas em Tempo Real</h3>
                                <p style={{ color: '#888' }}>
                                    Acompanhe conversões, receita e origem dos inscritos instantaneamente. Tome decisões baseadas em dados.
                                </p>
                            </div>
                            <div style={{ flex: 1, minWidth: '200px', display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
                                <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>100%</div>
                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>Uptime</div>
                                </div>
                                <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFD700' }}>+45%</div>
                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>Conversão</div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Detailed List Section */}
            <section style={{ padding: '100px 0', background: '#000' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>Tudo o que você precisa</h2>
                        <p style={{ color: '#888' }}>Ferramentas pensadas para cada etapa do seu evento.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
                        {[
                            { icon: <Globe size={24} />, title: "Páginas de Alta Conversão", desc: "Landing pages otimizadas para SEO e conversão, geradas automaticamente." },
                            { icon: <ShieldCheck size={24} />, title: "Segurança Bancária", desc: "Criptografia de ponta a ponta e conformidade com padrões internacionais." },
                            { icon: <Smartphone size={24} />, title: "100% Mobile Friendly", desc: "Interface perfeita em qualquer dispositivo, do desktop ao smartphone." },
                            { icon: <MessageCircle size={24} />, title: "Integração WhatsApp", desc: "Redirecione inscritos para grupos e inicie conversas automaticamente." },
                            { icon: <Layout size={24} />, title: "Hub do Participante", desc: "Área exclusiva para inscritos acessarem materiais, links e certificados." },
                            { icon: <Lock size={24} />, title: "Controle de Acesso", desc: "Gestão precisa de quem pode acessar seu evento e conteúdo." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ display: 'flex', gap: '20px' }}
                            >
                                <div style={{
                                    width: '50px', height: '50px', background: '#111', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    border: '1px solid #333', color: '#FFD700'
                                }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{item.title}</h4>
                                    <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '120px 0', textAlign: 'center', background: 'linear-gradient(to top, #000, #0a0a0a)' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'radial-gradient(circle at 50% 50%, #222 0%, #000 100%)',
                            padding: '80px 20px',
                            borderRadius: '40px',
                            border: '1px solid #333',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-playfair)', color: '#fff' }}>
                                Comece a criar <span className="gold-text">o extraordinário</span>.
                            </h2>
                            <p style={{ maxWidth: '600px', margin: '0 auto 40px', color: '#aaa', fontSize: '1.1rem' }}>
                                Junte-se a mentores de elite que já faturam mais com a Inscreva-se.
                            </p>
                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link href="/cadastro" style={{
                                    padding: '16px 40px',
                                    borderRadius: '50px',
                                    background: '#FFD700',
                                    color: '#000',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    boxShadow: '0 10px 25px rgba(255, 215, 0, 0.2)',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}>
                                    Criar Conta Premium <ArrowRight size={18} />
                                </Link>
                                <Link href="/entrar" style={{
                                    padding: '16px 40px',
                                    borderRadius: '50px',
                                    background: 'transparent',
                                    color: '#fff',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    border: '1px solid #333'
                                }}>
                                    Fazer Login
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
