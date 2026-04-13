"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { vacancyService, Vacancy } from '@/lib/vacancyService';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Loader2, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';

export default function VacanciesPage() {
    const router = useRouter();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const loadVacancies = async () => {
            try {
                const data = await vacancyService.getPublicVacancies();
                setVacancies(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadVacancies();
    }, []);

    const handlePostJob = () => {
        const user = authService.getCurrentUser();
        if (!user) {
            router.push('/entrar?redirect=/vagas');
            return;
        }

        // Redirect based on role
        if (user.role === 'admin' || user.role === 'SuperAdmin') {
            router.push('/dashboard/admin?tab=vacancies');
        } else if (user.role === 'participant') {
            // Participant can see jobs but usually can't post. 
            // If they want to post, maybe redirect to mentor registration or just dashboard.
            router.push('/dashboard/participant');
        } else {
            // mentor, company, specialist
            router.push('/dashboard/mentor?tab=vacancies');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 50, damping: 15 }
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ background: '#000', color: '#fff', padding: '100px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 70%)', zIndex: 0 }} />
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}
                >
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)', color: '#fff' }}>
                        Trabalhe com os <span style={{ color: '#FFD700' }}>Melhores</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                        Encontre a sua próxima oportunidade no ecossistema Inscreva-se. 
                        Conectamos talentos às melhores empresas, mentores e especialistas em toda a lusofonia.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePostJob}
                        style={{
                            background: 'var(--gold-gradient)',
                            color: '#fff',
                            padding: '1rem 2.5rem',
                            borderRadius: '50px',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(212, 175, 55, 0.2)',
                            fontFamily: 'var(--font-poppins)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        <Megaphone size={22} /> Divulgar Vaga
                    </motion.button>
                </motion.div>
            </div>

            {/* List */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 2rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                        <Loader2 className="animate-spin" size={48} color="#D4AF37" />
                    </div>
                ) : vacancies.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}
                    >
                        {vacancies.map((vacancy) => (
                            <motion.div
                                key={vacancy._id}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                style={{
                                    background: '#fff',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    padding: isMobile ? '0.5rem' : '0' // Add padding on mobile to contain inner elements
                                }}
                            >
                                {/* Image */}
                                <div style={{ height: '180px', position: 'relative', background: '#f1f5f9' }}>
                                    <Image
                                        src={vacancy.image || '/bg-organic.png'}
                                        alt={vacancy.title}
                                        fill
                                        style={{ 
                                            objectFit: vacancy.image ? 'cover' : 'contain', 
                                            opacity: vacancy.image ? 1 : 0.2,
                                            borderRadius: isMobile ? '18px' : '0'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(4px)',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: '#334155',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        {vacancy.category}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>
                                        {vacancy.title}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#64748b' }}>
                                            <MapPin size={isMobile ? 12 : 14} /> {vacancy.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#64748b' }}>
                                            <Clock size={isMobile ? 12 : 14} /> {vacancy.type}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {vacancy.description}
                                    </p>

                                    <div style={{ marginTop: 'auto' }}>
                                        <Link
                                            href={`/vagas/${vacancy.slug}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                padding: '0.8rem',
                                                width: '100%',
                                                background: '#000',
                                                color: '#fff',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                textDecoration: 'none',
                                                transition: 'all 0.2s ease'
                                            }}
                                            className="vacancy-btn"
                                        >
                                            Candidatar-se <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Briefcase size={32} color="#94a3b8" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Nenhuma vaga no momento</h2>
                        <p style={{ color: '#64748b' }}>Fique atento às nossas redes sociais para novas oportunidades.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .vacancy-btn:hover {
                    background: #222 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
        </>
    );
}
