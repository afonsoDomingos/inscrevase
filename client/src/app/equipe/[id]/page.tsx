"use client";

import { useParams, useRouter } from 'next/navigation';
import {
    Instagram, Linkedin, Globe, Briefcase,
    ChevronLeft, MapPin,
    MessageCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useState } from 'react';

// Dados estáticos para a equipe (podem ser movidos para um arquivo de mock/config)
const teamData = {
    "afonso-domingos": {
        name: "Afonso Domingos",
        role: "Fundador - Inscreva-se & RPA Moçambique",
        bio: `Afonso Domingos é um profissional moçambicano de TI e autodidata em inovação com mais de 6 anos de experiência. Formado em Multimédia, lidera a RPA Moçambique e é especialista em IA e soluções digitais escaláveis.

Ao longo de sua jornada, Afonso tem se destacado na criação de ecossistemas tecnológicos que resolvem problemas reais. Como fundador do Inscreva-se, ele trouxe uma visão de simplificação e eficiência para o mercado africano de eventos, integrando inteligência artificial e processos automatizados para maximizar resultados.

Suas especialidades incluem desenvolvimento de software, automação de processos (RPA), estratégia de produto e liderança de equipes técnicas. Ele acredita que a tecnologia deve ser um facilitador do progresso humano e trabalha incansavelmente para democratizar o acesso a soluções de ponta.`,
        image: "/afonso-domingos.jpg",
        country: "Moçambique",
        businessName: "Inscreva-se & RPA Moçambique",
        socialLinks: {
            linkedin: "https://linkedin.com",
            instagram: "https://instagram.com",
            website: "https://afonso-domingos.com"
        },
        badges: [{ name: "Fundador", color: "#D4AF37" }, { name: "Elite", color: "#000" }]
    },
    "jose-faustino": {
        name: "José Faustino",
        role: "Presidente - ABN & CCA",
        bio: `José Faustino é Especialista em Desenvolvimento Infantil e Liderança Juvenil com mais de 10 anos de experiência. Fundador da ODEI e Afrobiz Network, ele atua em 11 países africanos, promovendo o empreendedorismo e o crescimento econômico no continente.

Com uma visão estratégica focada no potencial da juventude africana, José tem liderado iniciativas que conectam investidores, mentores e empreendedores. Sua atuação na Afrobiz Network tem sido fundamental para o fortalecimento do ecossistema de negócios em diversos países, criando pontes entre a África e a diáspora.

Ele é reconhecido por sua habilidade em liderar transformações sociais e por seu compromisso com a educação e o desenvolvimento de competências para o século XXI.`,
        image: "/jose-faustino.png",
        country: "África (Múltiplas Regiões)",
        businessName: "Afrobiz Network",
        socialLinks: {
            linkedin: "https://linkedin.com",
            instagram: "https://instagram.com",
            website: "https://afrobiznetwork.com"
        },
        badges: [{ name: "Presidente", color: "#D4AF37" }, { name: "Premium", color: "#000" }]
    }
};

export default function TeamProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const member = teamData[id as keyof typeof teamData];

    if (!member) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: '#fdfdfd' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem' }}>Membro não encontrado</h2>
                <button
                    onClick={() => router.push('/')}
                    style={{
                        background: '#000', color: '#FFD700', padding: '1rem 2.5rem',
                        borderRadius: '50px', border: 'none', fontWeight: 700, cursor: 'pointer'
                    }}
                >
                    Voltar ao Início
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f8f8' }}>
            <Navbar />

            {/* Cinematic Header */}
            <div style={{
                padding: '120px 0 40px',
                background: '#0a0a0a',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid #D4AF37',
                boxShadow: '0 5px 20px rgba(212,175,55,0.1)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.08) 0%, transparent 80%)',
                    zIndex: 1
                }} />

                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.05)', color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '50px',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                            backdropFilter: 'blur(10px)', transition: 'all 0.3s',
                            marginBottom: '2rem'
                        }}
                    >
                        <ChevronLeft size={18} /> Voltar
                    </motion.button>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3rem', flexWrap: 'wrap' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                width: '180px', height: '180px', borderRadius: '50%',
                                padding: '4px', background: 'var(--gold-gradient)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                flexShrink: 0, position: 'relative', top: '70px',
                                zIndex: 10,
                                cursor: 'zoom-in',
                                border: '6px solid #fff'
                            }}
                            onClick={() => setSelectedImage(member.image)}
                        >
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                overflow: 'hidden', background: '#111', position: 'relative'
                            }}>
                                <Image src={member.image} alt={member.name} fill style={{ objectFit: 'cover' }} priority />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ paddingBottom: '2rem', flex: 1, minWidth: '300px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1.2rem' }}>
                                {member.badges.map((badge, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            background: badge.color,
                                            color: badge.color === '#D4AF37' ? '#000' : '#fff',
                                            padding: '4px 14px',
                                            borderRadius: '100px',
                                            fontSize: '0.65rem',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        {badge.name}
                                    </div>
                                ))}
                            </div>
                            <h1 style={{
                                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                fontWeight: 900,
                                color: '#fff',
                                fontFamily: 'var(--font-playfair)',
                                lineHeight: 1.1,
                                marginBottom: '1rem'
                            }}>
                                {member.name}
                            </h1>
                            <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {member.role}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main style={{ maxWidth: '1200px', margin: '140px auto 80px', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>

                    {/* Bio Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                            <div style={{ width: '4px', height: '30px', background: 'var(--gold-gradient)' }} />
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', color: '#111' }}>Biografia</h2>
                        </div>
                        <div style={{ fontSize: '1.15rem', lineHeight: 2, color: '#444', whiteSpace: 'pre-line' }}>
                            {member.bio}
                        </div>
                    </motion.div>

                    {/* Sidebar / Stats */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{ background: '#fff', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #eee' }}
                        >
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888' }}>
                                Informações Estratégicas
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Base</span>
                                        <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.1rem' }}>{member.country}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Organização</span>
                                        <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.1rem' }}>{member.businessName}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '3.5rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888' }}>
                                    Rede Profissional
                                </h3>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#0077B5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} className="hover:scale-110">
                                        <Linkedin size={22} />
                                    </a>
                                    <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} className="hover:scale-110">
                                        <Instagram size={22} />
                                    </a>
                                    <a href={member.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#1a1a1a', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} className="hover:scale-110">
                                        <Globe size={22} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{
                                width: '100%', padding: '1.8rem',
                                background: '#1a1a1a', color: '#D4AF37', borderRadius: '24px',
                                fontWeight: 800, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                fontSize: '1.2rem', transition: '0.3s'
                            }}
                            className="hover:scale-105"
                        >
                            <MessageCircle size={26} /> Entrar em Contato
                        </motion.button>
                    </aside>
                </div>
            </main>

            {/* Footer */}
            <div style={{ padding: '60px', background: '#0a0a0a', color: 'rgba(255,255,255,0.3)', textAlign: 'center', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    © 2026 INSCRIVA-SE • LIDERANÇA & IMPACTO
                </p>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
                            zIndex: 10000, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)'
                        }}
                    >
                        <button style={{ position: 'absolute', top: '30px', right: '30px', background: '#fff', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={24} />
                        </button>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
                            <Image src={selectedImage} alt="Membro" width={800} height={800} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px' }} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
