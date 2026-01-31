"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Linkedin, Instagram, Globe } from "lucide-react";
import { useTranslate } from "@/context/LanguageContext";

export default function TeamSection() {
    const { t } = useTranslate();

    const team = [
        {
            id: "afonso-domingos",
            name: "Afonso Domingos",
            role: t('team.afonso.role'),
            summary: t('team.afonso.summary'),
            image: "/afonso-domingos.jpg",
            social: {
                linkedin: "https://linkedin.com",
                instagram: "https://instagram.com",
                website: "https://afonso-domingos.com"
            }
        },
        {
            id: "jose-faustino",
            name: "José Faustino",
            role: t('team.jose.role'),
            summary: t('team.jose.summary'),
            image: "/jose-faustino.png",
            social: {
                linkedin: "https://linkedin.com",
                instagram: "https://instagram.com",
                website: "https://afrobiznetwork.com"
            }
        }
    ];

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
                        {t('team.title')}
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
                        {t('team.subtitle').split('Impacto')[0]} <span className="gold-text">{t('team.subtitle').includes('Impacto') ? 'Impacto' : 'Impact'}</span>
                    </motion.h2>
                </div>

                <div style={{ display: 'grid', gap: '50px' }}>
                    {team.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                background: '#fff',
                                borderRadius: '40px',
                                padding: '50px',
                                border: '1px solid rgba(0,0,0,0.03)',
                                boxShadow: '0 40px 80px rgba(0,0,0,0.06)',
                                maxWidth: '1100px',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '50px',
                                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                                position: 'relative',
                                alignSelf: 'center',
                                margin: '0 auto'
                            }}
                            className="team-card-inner"
                        >
                            {/* Circular Image Container */}
                            <div style={{ flexShrink: 0, position: 'relative' }}>
                                <div style={{
                                    width: '280px',
                                    height: '280px',
                                    borderRadius: '50%',
                                    border: '6px solid #fff',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    zIndex: 2
                                }}>
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        style={{ objectFit: 'cover', objectPosition: member.id === 'jose-faustino' ? 'center 20%' : 'center center' }}
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

                            <div style={{ flex: 1, textAlign: index % 2 === 0 ? 'left' : 'right' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '5px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                                        {member.name}
                                    </h3>
                                    <div className="role-text" style={{
                                        display: 'inline-block',
                                        background: 'linear-gradient(90deg, #D4AF37, #F1D37E)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 800,
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {member.role}
                                    </div>
                                </div>

                                <p style={{
                                    color: '#555',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.6,
                                    marginBottom: '30px',
                                    position: 'relative'
                                }}>
                                    {member.summary}
                                </p>

                                <div className="social-links" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '25px',
                                    marginBottom: '35px',
                                    justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end'
                                }}>
                                    <a href={member.social.linkedin} style={{ color: '#aaa', transition: '0.3s' }} className="hover:text-blue-600"><Linkedin size={20} /></a>
                                    <a href={member.social.instagram} style={{ color: '#aaa', transition: '0.3s' }} className="hover:text-pink-600"><Instagram size={20} /></a>
                                    <a href={member.social.website} style={{ color: '#aaa', transition: '0.3s' }} className="hover:text-[#D4AF37]"><Globe size={20} /></a>
                                </div>

                                <Link
                                    href={`/equipe/${member.id}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        background: '#1a1a1a',
                                        color: '#fff',
                                        padding: '14px 28px',
                                        borderRadius: '50px',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                    }}
                                    className="read-more-btn"
                                >
                                    {t('team.viewBio')} <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 960px) {
                    section {
                        padding: 40px 0 !important;
                    }
                    .team-card-inner {
                        flex-direction: column !important;
                        padding: 25px 15px !important;
                        text-align: center !important;
                        gap: 15px !important;
                        border-radius: 24px !important;
                        width: 92% !important;
                        margin: 0 auto !important;
                    }
                    .team-card-inner > div:first-child {
                        width: 180px !important;
                        height: 180px !important;
                        margin: 0 auto !important;
                    }
                    .team-card-inner > div:first-child > div {
                        width: 180px !important;
                        height: 180px !important;
                    }
                    .team-card-inner > div:last-child {
                        text-align: center !important;
                        padding: 0 !important;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .team-card-inner h3 {
                        font-size: 1.6rem !important;
                        margin-bottom: 2px !important;
                    }
                    .team-card-inner .role-text {
                        font-size: 0.8rem !important;
                    }
                    .team-card-inner p {
                        font-size: 0.95rem !important;
                        margin-bottom: 15px !important;
                        line-height: 1.5 !important;
                    }
                    .team-card-inner .social-links {
                        gap: 15px !important;
                        margin-bottom: 20px !important;
                        justify-content: center !important;
                    }
                    .read-more-btn {
                        width: 100% !important;
                        max-width: 250px;
                        justify-content: center !important;
                        padding: 10px 20px !important;
                        font-size: 0.85rem !important;
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
