"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, ArrowRight, Loader2, Globe, UserPlus, LogIn, Eye, EyeOff, Check, Award, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/authService';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslate } from '@/context/LanguageContext';
import { Suspense } from 'react';

const COUNTRIES = [
    "Moçambique", "Angola", "Brasil", "Portugal", "Cabo Verde", "Guiné-Bissau", "São Tomé e Príncipe", "Timor-Leste",
    "Afeganistão", "África do Sul", "Albânia", "Alemanha", "Andorra", "Antígua e Barbuda", "Arábia Saudita", "Argélia",
    "Argentina", "Armênia", "Austrália", "Áustria", "Azerbaijão", "Bahamas", "Bahrein", "Bangladesh", "Barbados",
    "Bélgica", "Belize", "Benim", "Bielorrússia", "Bolívia", "Bósnia e Herzegovina", "Botswana", "Brunei", "Bulgária",
    "Burkina Faso", "Burundi", "Butão", "Camarões", "Camboja", "Canadá", "Catar", "Cazaquistão", "Chade", "Chile",
    "China", "Chipre", "Cingapura", "Colômbia", "Comores", "Congo-Brazzaville", "Congo-Kinshasa", "Coreia do Norte",
    "Coreia do Sul", "Costa do Marfim", "Costa Rica", "Croácia", "Cuba", "Dinamarca", "Djibuti", "Dominica", "Egito",
    "El Salvador", "Emirados Árabes Unidos", "Equador", "Eritreia", "Eslováquia", "Eslovênia", "Espanha", "Estados Unidos",
    "Estônia", "Eswatini", "Etiópia", "Fiji", "Filipinas", "Finlândia", "França", "Gabão", "Gâmbia", "Gana", "Geórgia",
    "Granada", "Grécia", "Guatemala", "Guiana", "Guiné", "Guiné Equatorial", "Haiti", "Honduras", "Hungria", "Iêmen",
    "Índia", "Indonésia", "Irã", "Iraque", "Irlanda", "Islândia", "Israel", "Itália", "Jamaica", "Japão", "Jordânia",
    "Kosovo", "Kuwait", "Laos", "Lesoto", "Letônia", "Líbano", "Libéria", "Líbia", "Liechtenstein", "Lituânia",
    "Luxemburgo", "Macedônia do Norte", "Madagascar", "Malásia", "Malawi", "Maldivas", "Mali", "Malta", "Marrocos",
    "Maurícia", "Mauritânia", "México", "Mianmar", "Moldávia", "Mônaco", "Mongólia", "Montenegro", "Namíbia", "Nauru",
    "Nepal", "Nicarágua", "Níger", "Nigéria", "Noruega", "Nova Zelândia", "Omã", "Países Baixos", "Palau", "Palestina",
    "Panamá", "Papua-Nova Guiné", "Paquistão", "Paraguai", "Peru", "Polônia", "Quênia", "Quirguistão", "Reino Unido",
    "República Centro-Africana", "República Checa", "República Dominicana", "Romênia", "Ruanda", "Rússia", "Samoa",
    "San Marino", "Santa Lúcia", "São Cristóvão e Neves", "São Vicente e Granadinas", "Senegal", "Serra Leoa",
    "Seicheles", "Síria", "Somália", "Sri Lanka", "Sudão", "Sudão do Sul", "Suécia", "Suíça", "Suriname", "Tailândia",
    "Taiwan", "Tanzânia", "Tajiquistão", "Togo", "Tonga", "Trindade e Tobago", "Tunísia", "Turcomenistão", "Turquia",
    "Tuvalu", "Ucrânia", "Uganda", "Uruguai", "Uzbequistão", "Vanuatu", "Vaticano", "Venezuela", "Vietnã", "Zâmbia", "Zimbábue"
].sort();

export default function Register() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>}>
            <RegisterContent />
        </Suspense>
    );
}

function RegisterContent() {
    const { t } = useTranslate();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');
    const initialRole = searchParams.get('role') || 'mentor';

    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        password: string;
        businessName: string;
        country: string;
        role: 'mentor' | 'participant' | 'company' | 'specialist';
    }>({
        name: '',
        email: '',
        password: '',
        businessName: '',
        country: '',
        role: (initialRole as 'mentor' | 'participant' | 'company' | 'specialist') || 'mentor'
    });

    useEffect(() => {
        if (initialRole) {
            setFormData(prev => ({ ...prev, role: initialRole as 'mentor' | 'participant' | 'company' | 'specialist' }));
        }
    }, [initialRole]);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Role Info State
    const [showRoleInfo, setShowRoleInfo] = useState<string | null>(null);

    interface RoleInfo {
        title: string;
        description: string;
        whenToChoose: string;
        features: string[];
    }

    const roleInfo: Record<string, RoleInfo> = {
        mentor: {
            title: String(t('auth.roles.mentor.title')),
            description: String(t('auth.roles.mentor.description')),
            whenToChoose: String(t('auth.roles.mentor.whenToChoose')),
            features: (t('auth.roles.mentor.features', undefined, { returnObjects: true }) || []) as string[]
        },
        participant: {
            title: String(t('auth.roles.participant.title')),
            description: String(t('auth.roles.participant.description')),
            whenToChoose: String(t('auth.roles.participant.whenToChoose')),
            features: (t('auth.roles.participant.features', undefined, { returnObjects: true }) || []) as string[]
        },
        company: {
            title: String(t('auth.roles.company.title')),
            description: String(t('auth.roles.company.description')),
            whenToChoose: String(t('auth.roles.company.whenToChoose')),
            features: (t('auth.roles.company.features', undefined, { returnObjects: true }) || []) as string[]
        },
        specialist: {
            title: String(t('auth.roles.specialist.title')),
            description: String(t('auth.roles.specialist.description')),
            whenToChoose: String(t('auth.roles.specialist.whenToChoose')),
            features: (t('auth.roles.specialist.features', undefined, { returnObjects: true }) || []) as string[]
        }
    };

    const RoleDetailModal = ({ role }: { role: string }) => {
        const info = roleInfo[role as keyof typeof roleInfo];
        if (!info) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                }}
                onClick={() => setShowRoleInfo(null)}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    style={{
                        background: '#1a1a1a',
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '2rem',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={() => setShowRoleInfo(null)}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '8px',
                            cursor: 'pointer',
                            color: '#888'
                        }}
                    >
                        <X size={20} />
                    </button>

                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)' }}>
                        <span className="gold-text">{info.title}</span>
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#D4AF37', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>O que significa?</h4>
                        <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: '0.95rem' }}>{info.description}</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#D4AF37', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Quando escolher?</h4>
                        <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: '0.95rem' }}>{info.whenToChoose}</p>
                    </div>

                    <div>
                        <h4 style={{ color: '#D4AF37', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Funcionalidades:</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                            {Array.isArray(info.features) ? info.features.map((feature, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '0.9rem' }}>
                                    <Check size={14} color="#D4AF37" /> {feature}
                                </div>
                            )) : null}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowRoleInfo(null)}
                        style={{
                            width: '100%',
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'var(--gold-gradient)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#000',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Entendi, continuar cadastro
                    </button>
                </motion.div>
            </motion.div>
        );
    };

    // Country Search State
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');

    const filteredCountries = useMemo(() => {
        return COUNTRIES.filter(c =>
            c.toLowerCase().includes(countrySearch.toLowerCase())
        );
    }, [countrySearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowCountryPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [shuffledImages, setShuffledImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const BACKGROUND_IMAGES = useMemo(() => [
        "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069",
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
        "https://images.unsplash.com/photo-1511578334221-d3033bc853b1?q=80&w=2070",
        "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070",
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070",
        "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=2070"
    ], []);

    useEffect(() => {
        const shuffled = [...BACKGROUND_IMAGES].sort(() => Math.random() - 0.5);
        setShuffledImages(shuffled);
    }, [BACKGROUND_IMAGES]);

    useEffect(() => {
        if (shuffledImages.length === 0) return;
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [shuffledImages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.register(formData);
            toast.success(t('auth.registerSuccess'));

            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'CompleteRegistration', {
                    content_name: formData.role,
                    status: 'success',
                    plan: searchParams.get('plan') || 'default'
                });
            }

            if (redirectUrl) {
                router.push(redirectUrl);
            } else if (formData.role === 'participant') {
                router.push('/dashboard/participant');
            } else {
                router.push('/dashboard/mentor');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            zIndex: 100,
            background: '#000'
        }}>
            <AnimatePresence>
                {showRoleInfo && <RoleDetailModal role={showRoleInfo} />}
            </AnimatePresence>

            {/* Left Side: Visual Slideshow */}
            <div style={{
                flex: 1.2,
                position: 'relative',
                display: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'none' : 'block',
                overflow: 'hidden'
            }}>
                <AnimatePresence mode="wait">
                    {shuffledImages.length > 0 && (
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            style={{ position: 'absolute', inset: 0 }}
                        >
                            <Image
                                src={shuffledImages[currentImageIndex]}
                                alt="Registration background"
                                fill
                                style={{ objectFit: 'cover', filter: 'brightness(0.5)' }}
                                priority
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '4rem',
                    color: '#fff',
                    zIndex: 2
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff 0%, #D4AF37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Nova Era dos Eventos
                        </h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '500px', lineHeight: 1.6 }}>
                            Junte-se à maior rede de conexões e eventos exclusivos. Comece sua transformação hoje.
                        </p>
                    </motion.div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>100%</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase' }}>Seguro e Verificado</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>Global</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase' }}>Presença Internacional</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div style={{
                flex: 1,
                background: '#0a0a0a',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                position: 'relative',
                overflowY: 'auto'
            }}>
                <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Home
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ width: '100%', maxWidth: '450px', padding: '1.5rem 0' }}
                >
                    <div style={{ marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Link href="/entrar" style={{ flex: 1, padding: '10px', borderRadius: '8px', color: '#888', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', textDecoration: 'none' }}>
                                <LogIn size={16} /> {t('auth.signIn')}
                            </Link>
                            <div style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--gold-gradient)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                <UserPlus size={16} /> {t('auth.signUp')}
                            </div>
                        </div>

                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
                            {t('auth.signUpTitle')}
                        </h1>
                        <p style={{ color: '#666' }}>{t('auth.signUpSubtitle')}</p>
                    </div>

                    {/* Role Selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', marginBottom: '1.2rem' }}>
                        {(['mentor', 'participant', 'company', 'specialist'] as const).map((role) => (
                            <div
                                key={role}
                                onClick={() => setFormData({ ...formData, role })}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    background: formData.role === role ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: formData.role === role ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative'
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowRoleInfo(role); }}
                                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#444', cursor: 'help' }}
                                >
                                    <HelpCircle size={14} />
                                </button>
                                {role === 'mentor' && <Briefcase size={20} color={formData.role === role ? '#D4AF37' : '#666'} />}
                                {role === 'participant' && <User size={20} color={formData.role === role ? '#D4AF37' : '#666'} />}
                                {role === 'company' && <Globe size={20} color={formData.role === role ? '#D4AF37' : '#666'} />}
                                {role === 'specialist' && <Award size={20} color={formData.role === role ? '#D4AF37' : '#666'} />}
                                <span style={{ color: formData.role === role ? '#fff' : '#ccc', fontWeight: 600, fontSize: '0.75rem', marginTop: '0.4rem' }}>
                                    {role === 'participant' ? 'Part.' : role.charAt(0).toUpperCase() + role.slice(1, 3) + '.'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#fc8181', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(229, 62, 62, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>{t('auth.fullName')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Negócio/Empresa</label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ position: 'relative' }} ref={dropdownRef}>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>{t('auth.country')}</label>
                                <div
                                    onClick={() => !loading && setShowCountryPicker(!showCountryPicker)}
                                    style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                    {formData.country || "Selecione..."}
                                </div>
                                <AnimatePresence>
                                    {showCountryPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: '#1a1a1a', borderRadius: '12px', zIndex: 100, border: '1px solid #333', maxHeight: '200px', overflowY: 'auto' }}
                                        >
                                            <div style={{ padding: '0.5rem', position: 'sticky', top: 0, background: '#1a1a1a' }}>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Pesquisar..."
                                                    value={countrySearch}
                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                    style={{ width: '100%', padding: '0.5rem 1.8rem', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                            {filteredCountries.map(country => (
                                                <div key={country} onClick={() => { setFormData({ ...formData, country }); setShowCountryPicker(false); }} style={{ padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: formData.country === country ? '#D4AF37' : '#ccc' }}>
                                                    {country}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>{t('auth.email')}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>{t('auth.password')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#444' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            style={{ width: '100%', padding: '1rem', background: 'var(--gold-gradient)', color: '#000', fontWeight: 800, borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>{t('auth.createAccount')} <ArrowRight size={20} /></>}
                        </motion.button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#444' }}>OU CONTINUE COM</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`} style={{ flex: 1, padding: '0.7rem', background: '#fff', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg> Google
                        </button>
                        <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`} style={{ flex: 1, padding: '0.7rem', background: '#0077b5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}>
                            <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={18} height={18} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                        </button>
                    </div>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                        {t('auth.alreadyHaveAccount')} <Link href="/entrar" style={{ color: '#D4AF37', fontWeight: 700, textDecoration: 'none' }}>{t('auth.loginNow')}</Link>
                    </p>
                </motion.div>

                <div style={{ padding: '1rem 0', color: '#333', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Inscreva-se &copy; 2026
                </div>
            </div>

            <style>{`
                .gold-text { background: var(--gold-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            `}</style>
        </div>
    );
}
