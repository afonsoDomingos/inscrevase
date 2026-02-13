"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Users, Target, Rocket, Heart, Globe, Award, CheckCircle, Zap } from 'lucide-react';
import { publicService, PublicImpactStats } from '@/lib/publicService';
import Typewriter from '@/components/common/Typewriter';

export default function SobreNos() {
    const [impactStats, setImpactStats] = useState<PublicImpactStats | null>(null);

    useEffect(() => {
        publicService.getImpactStats()
            .then(setImpactStats)
            .catch(err => console.error("Error fetching impact stats:", err));
    }, []);

    const values = [
        {
            icon: <Heart size={28} />,
            title: "Paixão por Eventos",
            description: "Acreditamos que cada evento tem o poder de transformar vidas e criar conexões significativas."
        },
        {
            icon: <Users size={28} />,
            title: "Foco no Cliente",
            description: "Desenvolvemos cada funcionalidade pensando nas necessidades reais dos organizadores de eventos."
        },
        {
            icon: <Zap size={28} />,
            title: "Inovação Contínua",
            description: "Estamos sempre a melhorar a plataforma com novas tecnologias e funcionalidades."
        },
        {
            icon: <Globe size={28} />,
            title: "Alcance Global",
            description: "Conectamos organizadores e participantes em Angola, Moçambique, Portugal e Brasil."
        }
    ];

    const stats = [
        {
            number: impactStats?.globalStats.totalEvents ? `${impactStats.globalStats.totalEvents}+` : '0k+',
            label: "Eventos Criados"
        },
        {
            number: impactStats?.globalStats.totalSubmissions ?
                (impactStats.globalStats.totalSubmissions >= 1000 ?
                    `${(impactStats.globalStats.totalSubmissions / 1000).toFixed(1)}k+` :
                    `${impactStats.globalStats.totalSubmissions}+`) :
                '3k+',
            label: "Participantes"
        },
        {
            number: impactStats?.globalStats.totalMentors ? `${impactStats.globalStats.totalMentors}+` : '45+',
            label: "Mentores Ativos"
        },
        {
            number: impactStats?.globalStats.totalCountries?.toString() || '4',
            label: "Países"
        }
    ];

    const team = [
        {
            name: "Equipa de Desenvolvimento",
            role: "Tecnologia & Inovação",
            description: "Engenheiros dedicados a criar a melhor experiência de gestão de eventos."
        },
        {
            name: "Equipa de Suporte",
            role: "Atendimento ao Cliente",
            description: "Disponíveis 24/7 para ajudar organizadores e participantes."
        },
        {
            name: "Equipa de Marketing",
            role: "Crescimento & Parcerias",
            description: "Trabalhando para expandir o alcance da plataforma em toda a lusofonia."
        }
    ];

    return (
        <main style={{ background: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.6) 0%, rgba(26, 26, 46, 0.7) 100%), url(/header-bg-new.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#fff',
                padding: '140px 20px 100px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(20, 82, 173, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '50px',
                        padding: '8px 20px',
                        marginBottom: '30px',
                        fontSize: '0.85rem',
                        color: '#FFE55C'
                    }}>
                        <Award size={16} />
                        Plataforma Líder em Gestão de Eventos
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 900,
                        marginBottom: '25px',
                        fontFamily: 'var(--font-playfair, serif)',
                        lineHeight: 1.1,
                        color: '#ffffff',
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}>
                        Sobre o <span style={{
                            background: 'linear-gradient(135deg, #FFD700, #FFE55C)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Inscreva-se</span>
                    </h1>

                    <div style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                        color: 'rgba(255,255,255,0.9)',
                        maxWidth: '800px',
                        margin: '0 auto',
                        lineHeight: 1.7,
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        minHeight: '4.5rem'
                    }}>
                        <Typewriter
                            text="Plataforma completa para criar e gerenciar eventos."
                            duration={3}
                        />
                        <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '10px' }}>
                            Somos a plataforma que está a revolucionar a forma como eventos são criados,
                            geridos e vivenciados em toda a comunidade lusófona.
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section style={{
                background: 'transparent',
                padding: '0 20px',
                marginTop: '-50px',
                position: 'relative',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                        background: '#fff',
                        borderRadius: '24px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        padding: '40px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '30px',
                        textAlign: 'center'
                    }}
                >
                    {stats.map((stat, index) => (
                        <div key={index}>
                            <div style={{
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #1452AD, #0d3a7d)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '5px'
                            }}>
                                {stat.number}
                            </div>
                            <div style={{ color: '#666', fontSize: '0.95rem', fontWeight: 500 }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Mission Section */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px', overflowX: 'hidden' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '60px',
                    alignItems: 'center'
                }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#1452AD',
                            fontWeight: 700,
                            marginBottom: '20px',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            <Target size={20} />
                            Nossa Missão
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 800,
                            color: '#0a0a0a',
                            marginBottom: '25px',
                            lineHeight: 1.2
                        }}>
                            Democratizar a criação de eventos de qualidade
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#555',
                            lineHeight: 1.8,
                            marginBottom: '20px'
                        }}>
                            O Inscreva-se nasceu da observação de uma necessidade real: organizadores de eventos
                            em Angola, Moçambique e outros países lusófonos precisavam de uma ferramenta simples,
                            poderosa e adaptada às suas realidades locais.
                        </p>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#555',
                            lineHeight: 1.8
                        }}>
                            Nossa missão é capacitar mentores, palestrantes, formadores e organizadores
                            a criar experiências memoráveis sem barreiras tecnológicas ou burocráticas.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'linear-gradient(135deg, #1452AD 0%, #0d3a7d 100%)',
                            borderRadius: '32px',
                            padding: 'clamp(30px, 5vw, 50px)',
                            color: '#fff',
                            width: '100%'
                        }}
                    >
                        <Rocket size={50} style={{ marginBottom: '25px', opacity: 0.9 }} />
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '20px' }}>
                            Nossa Visão
                        </h3>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.8, opacity: 0.9 }}>
                            Ser a plataforma de referência para gestão de eventos em toda a comunidade
                            lusófona, conectando milhões de pessoas através de experiências transformadoras
                            e tornando a organização de eventos acessível a todos.
                        </p>
                        <div style={{
                            marginTop: '30px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            {['Angola', 'Moçambique', 'Portugal', 'Brasil'].map((country) => (
                                <span key={country} style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    {country}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section style={{ background: '#f8fafc', padding: '100px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                    >
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 800,
                            color: '#0a0a0a',
                            marginBottom: '15px'
                        }}>
                            Nossos Valores
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                            Os princípios que guiam cada decisão e funcionalidade da plataforma.
                        </p>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '25px'
                    }}>
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    background: '#fff',
                                    padding: '40px',
                                    borderRadius: '24px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    border: '1px solid #eee'
                                }}
                            >
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(20, 82, 173, 0.1), rgba(20, 82, 173, 0.05))',
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1452AD',
                                    marginBottom: '20px'
                                }}>
                                    {value.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    fontWeight: 700,
                                    color: '#0a0a0a',
                                    marginBottom: '12px'
                                }}>
                                    {value.title}
                                </h3>
                                <p style={{ color: '#666', lineHeight: 1.7 }}>
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: '60px' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: 800,
                        color: '#0a0a0a',
                        marginBottom: '15px'
                    }}>
                        O que Oferecemos
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                        Uma plataforma completa para todo o ciclo de vida do seu evento.
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {[
                        "Criação de formulários de inscrição personalizados",
                        "Venda de bilhetes com múltiplos métodos de pagamento",
                        "Gestão completa de participantes e check-in",
                        "QR Codes únicos para verificação de bilhetes",
                        "Dashboard com analytics em tempo real",
                        "Integração com Multicaixa Express e M-Pesa",
                        "Certificados automáticos para participantes",
                        "Suporte dedicado 24/7 via WhatsApp"
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '20px 25px',
                                background: '#f8fafc',
                                borderRadius: '16px',
                                border: '1px solid #eee'
                            }}
                        >
                            <CheckCircle size={22} color="#1452AD" style={{ flexShrink: 0 }} />
                            <span style={{ color: '#333', fontWeight: 500 }}>{feature}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Team Section */}
            <section style={{ background: '#0a0a0a', color: '#fff', padding: '100px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                    >
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '15px'
                        }}>
                            Nossa Equipa
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
                            Profissionais dedicados a criar a melhor experiência para você.
                        </p>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '25px'
                    }}>
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '24px',
                                    padding: '40px',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #1452AD, #0d3a7d)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px'
                                }}>
                                    <Users size={35} />
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '5px' }}>
                                    {member.name}
                                </h3>
                                <div style={{
                                    color: '#1452AD',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    marginBottom: '15px'
                                }}>
                                    {member.role}
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                                    {member.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                background: 'linear-gradient(135deg, #1452AD 0%, #0d3a7d 100%)',
                padding: '80px 20px',
                textAlign: 'center',
                color: '#fff'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ maxWidth: '700px', margin: '0 auto' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                        fontWeight: 800,
                        marginBottom: '20px'
                    }}>
                        Pronto para criar o seu próximo evento?
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        opacity: 0.9,
                        marginBottom: '30px'
                    }}>
                        Junte-se a milhares de organizadores que já confiam no Inscreva-se.
                    </p>
                    <a
                        href="/cadastro"
                        style={{
                            display: 'inline-block',
                            background: '#fff',
                            color: '#1452AD',
                            padding: '16px 40px',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            textDecoration: 'none',
                            transition: 'transform 0.3s'
                        }}
                    >
                        Começar Gratuitamente
                    </a>
                </motion.div>
            </section>

            <Footer />
        </main>
    );
}
