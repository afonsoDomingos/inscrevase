"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Linkedin, Instagram, Globe } from "lucide-react";

const team = [
    {
        id: "jose-faustino",
        name: "José Faustino",
        role: "Fundador & Presidente - ABM & CCA",
        summary: "Especialista em Desenvolvimento Infantil e Liderança Juvenil com mais de 10 anos de experiência. Fundador da ODEI e Afrobiz Network, atuando em 11 países africanos para promover o empreendedorismo e a educação no continente.",
        image: "https://res.cloudinary.com/dff9fsh9k/image/upload/v1738233631/jose-faustino.png", // Using a stable link if possible, or reference the uploaded one
        social: {
            linkedin: "https://linkedin.com",
            instagram: "https://instagram.com",
            website: "https://afrobiznetwork.com"
        }
    }
];

export default function TeamSection() {
    return (
        <section style={{ padding: '120px 0', background: '#fafafa', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            color: '#D4AF37',
                            textTransform: 'uppercase',
                            letterSpacing: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            display: 'block',
                            marginBottom: '15px'
                        }}
                    >
                        Nossa Liderança
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                            fontWeight: 900,
                            color: '#1a1a1a',
                            fontFamily: 'var(--font-playfair)',
                            letterSpacing: '-1px'
                        }}
                    >
                        Mentes por trás do <span className="gold-text">Impacto</span>
                    </motion.h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {team.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                background: '#fff',
                                borderRadius: '40px',
                                padding: '60px',
                                border: '1px solid rgba(0,0,0,0.03)',
                                boxShadow: '0 40px 80px rgba(0,0,0,0.06)',
                                maxWidth: '1000px',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '60px',
                                position: 'relative'
                            }}
                            className="team-card-inner"
                        >
                            {/* Circular Image Container */}
                            <div style={{ flexShrink: 0, position: 'relative' }}>
                                <div style={{
                                    width: '320px',
                                    height: '320px',
                                    borderRadius: '50%',
                                    border: '8px solid #fff',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    zIndex: 2
                                }}>
                                    <Image
                                        src="/team_member_jose.png" // We'll map this correctly in the main page
                                        alt={member.name}
                                        fill
                                        style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                                    />
                                </div>
                                {/* Decorative Ring */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '-10px',
                                    right: '-10px',
                                    bottom: '-10px',
                                    borderRadius: '50%',
                                    border: '2px dashed #D4AF37',
                                    opacity: 0.3,
                                    zIndex: 1
                                }} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '25px' }}>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                                        {member.name}
                                    </h3>
                                    <div style={{
                                        display: 'inline-block',
                                        background: 'linear-gradient(90deg, #D4AF37, #F1D37E)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {member.role}
                                    </div>
                                </div>

                                <p style={{
                                    color: '#555',
                                    fontSize: '1.15rem',
                                    lineHeight: 1.7,
                                    marginBottom: '35px',
                                    position: 'relative'
                                }}>
                                    <span style={{ fontSize: '3rem', position: 'absolute', top: '-20px', left: '-15px', opacity: 0.1, color: '#D4AF37', fontFamily: 'serif' }}>"</span>
                                    {member.summary}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '45px' }}>
                                    <a href={member.social.linkedin} style={{ color: '#aaa', transition: '0.3s' }} className="hover:text-blue-600"><Linkedin size={22} /></a>
                                    <a href={member.social.instagram} style={{ color: '#aaa', transition: '0.3s' }} className="hover:text-pink-600"><Instagram size={22} /></a>
                                    <a href={member.social.website} style={{ color: '#aaa', transition: '0.3s' }} className="hover:text-[#D4AF37]"><Globe size={22} /></a>
                                </div>

                                <Link
                                    href={`/equipe/${member.id}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: '#1a1a1a',
                                        color: '#fff',
                                        padding: '16px 32px',
                                        borderRadius: '50px',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                    }}
                                    className="read-more-btn"
                                >
                                    Biografia Completa <ArrowRight size={18} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 960px) {
                    .team-card-inner {
                        flex-direction: column !important;
                        padding: 40px !important;
                        text-align: center !important;
                    }
                    .team-card-inner div {
                        justify-content: center !important;
                    }
                    .read-more-btn {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                }
                .read-more-btn:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important;
                    background: #000 !important;
                }
            `}</style>
        </section>
    );
}
