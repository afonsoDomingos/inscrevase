"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Briefcase, ArrowRight, Loader2, Globe, UserPlus, LogIn, Eye, EyeOff, Search, Check } from 'lucide-react';
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

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        businessName: '',
        country: '',
        role: initialRole
    });

    useEffect(() => {
        if (initialRole) {
            setFormData(prev => ({ ...prev, role: initialRole }));
        }
    }, [initialRole]);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.register(formData);
            toast.success(t('auth.registerSuccess'));

            // Meta Pixel Tracking
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

    const inputVariants = {
        initial: { scale: 1, boxShadow: "0px 0px 0px rgba(212, 175, 55, 0)" },
        focused: { scale: 1.01, boxShadow: "0px 0px 15px rgba(212, 175, 55, 0.12)" }
    };

    const iconVariants = {
        initial: { x: 0, color: "#888", scale: 1 },
        focused: { x: 3, color: "var(--primary)", scale: 1.15 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40, rotateY: 8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -40, rotateY: -8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{
                maxWidth: '500px',
                width: '100%',
                margin: '0 auto',
                padding: '1.8rem',
                perspective: '1000px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(16px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                minHeight: '540px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
        >
            <div style={{ display: 'flex', marginBottom: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Link href="/entrar" style={{ flex: 1, padding: '8px', borderRadius: '8px', color: '#888', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}>
                    <LogIn size={14} /> {t('auth.signIn')}
                </Link>
                <div style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--gold-gradient)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <UserPlus size={14} /> {t('auth.signUp')}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Image src="/logo.png" alt="Logo" width={36} height={36} style={{ margin: '0 auto 0.6rem' }} />
                </motion.div>
                <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#fff', fontWeight: 700 }}>{t('auth.registerTitle')}</h1>
                <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.2rem' }}>Comece sua jornada.</p>
            </div>

            {/* Role Selector */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div
                    onClick={() => setFormData({ ...formData, role: 'mentor' })}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        background: formData.role === 'mentor' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.03)',
                        border: formData.role === 'mentor' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}
                >
                    <Briefcase size={20} color={formData.role === 'mentor' ? '#D4AF37' : '#888'} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ color: formData.role === 'mentor' ? '#fff' : '#ccc', fontWeight: 600, fontSize: '0.9rem' }}>Sou Mentor</span>
                    <span style={{ color: '#666', fontSize: '0.7rem', marginTop: '0.2rem' }}>Quero criar eventos</span>
                </div>

                <div
                    onClick={() => setFormData({ ...formData, role: 'participant' })}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        background: formData.role === 'participant' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.03)',
                        border: formData.role === 'participant' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}
                >
                    <User size={20} color={formData.role === 'participant' ? '#D4AF37' : '#888'} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ color: formData.role === 'participant' ? '#fff' : '#ccc', fontWeight: 600, fontSize: '0.9rem' }}>Sou Participante</span>
                    <span style={{ color: '#666', fontSize: '0.7rem', marginTop: '0.2rem' }}>Quero me inscrever</span>
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(229, 62, 62, 0.15)', color: '#fc8181', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.8rem', textAlign: 'center', fontSize: '0.75rem', border: '1px solid rgba(229, 62, 62, 0.2)' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.7rem' }}>
                    {/* Full Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.75rem', color: '#ccc' }}>{t('auth.fullName')}</label>
                        <motion.div variants={inputVariants} animate={focusedField === 'name' ? 'focused' : 'initial'} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                            <motion.div
                                variants={iconVariants}
                                animate={focusedField === 'name' ? 'focused' : 'initial'}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ position: 'absolute', left: '0.8rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}
                            >
                                <User size={14} />
                            </motion.div>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} className="input-luxury" style={{ paddingLeft: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.85rem', border: focusedField === 'name' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', width: '100%' }} required disabled={loading} />
                            <AnimatePresence>{focusedField === 'name' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Business Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.75rem', color: '#ccc' }}>{t('auth.businessName')}</label>
                        <motion.div variants={inputVariants} animate={focusedField === 'business' ? 'focused' : 'initial'} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                            <motion.div variants={iconVariants} animate={focusedField === 'business' ? 'focused' : 'initial'} style={{ position: 'absolute', left: '0.8rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}>
                                <Briefcase size={14} />
                            </motion.div>
                            <input type="text" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} onFocus={() => setFocusedField('business')} onBlur={() => setFocusedField(null)} className="input-luxury" style={{ paddingLeft: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.85rem', border: focusedField === 'business' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', width: '100%' }} required disabled={loading} />
                            <AnimatePresence>{focusedField === 'business' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.7rem' }}>
                    {/* Country Searchable Picker */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.75rem', color: '#ccc' }}>{t('auth.country')}</label>
                        <motion.div
                            variants={inputVariants}
                            animate={showCountryPicker ? 'focused' : 'initial'}
                            onClick={() => !loading && setShowCountryPicker(!showCountryPicker)}
                            style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
                        >
                            <motion.div variants={iconVariants} animate={showCountryPicker ? 'focused' : 'initial'} style={{ position: 'absolute', left: '0.8rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}>
                                <Globe size={14} />
                            </motion.div>
                            <div className="input-luxury" style={{ paddingLeft: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.85rem', border: showCountryPicker ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                                <span style={{ color: formData.country ? '#fff' : '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formData.country || "Selecione..."}</span>
                            </div>
                            <AnimatePresence>{showCountryPicker && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                        </motion.div>

                        <AnimatePresence>
                            {showCountryPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{
                                        position: 'absolute',
                                        top: '105%',
                                        left: 0,
                                        right: 0,
                                        background: '#1a1a1a',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                        zIndex: 100,
                                        border: '1px solid #333',
                                        maxHeight: '260px',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #333', position: 'relative' }}>
                                        <Search size={12} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Pesquisar..."
                                            value={countrySearch}
                                            onChange={(e) => setCountrySearch(e.target.value)}
                                            style={{ width: '100%', padding: '0.4rem 0.4rem 0.4rem 1.8rem', borderRadius: '6px', border: '1px solid #333', fontSize: '0.8rem', background: '#222', color: '#fff' }}
                                        />
                                    </div>
                                    <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
                                        {filteredCountries.map(country => (
                                            <div
                                                key={country}
                                                onClick={() => {
                                                    setFormData({ ...formData, country });
                                                    setShowCountryPicker(false);
                                                    setCountrySearch('');
                                                }}
                                                style={{
                                                    padding: '0.5rem 0.7rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: formData.country === country ? '#333' : 'transparent',
                                                    transition: '0.2s',
                                                    color: '#ccc'
                                                }}
                                                className="country-option"
                                            >
                                                {country}
                                                {formData.country === country && <Check size={12} color="var(--primary)" />}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.75rem', color: '#ccc' }}>{t('auth.email')}</label>
                        <motion.div variants={inputVariants} animate={focusedField === 'email' ? 'focused' : 'initial'} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                            <motion.div variants={iconVariants} animate={focusedField === 'email' ? 'focused' : 'initial'} style={{ position: 'absolute', left: '0.8rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}>
                                <Mail size={14} />
                            </motion.div>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className="input-luxury" style={{ paddingLeft: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.85rem', border: focusedField === 'email' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', width: '100%' }} required disabled={loading} />
                            <AnimatePresence>{focusedField === 'email' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.75rem', color: '#ccc' }}>{t('auth.password')}</label>
                    <motion.div variants={inputVariants} animate={focusedField === 'password' ? 'focused' : 'initial'} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                        <motion.div variants={iconVariants} animate={focusedField === 'password' ? 'focused' : 'initial'} style={{ position: 'absolute', left: '0.8rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}>
                            <Lock size={14} />
                        </motion.div>
                        <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} className="input-luxury" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingBlock: '0.6rem', fontSize: '0.95rem', border: focusedField === 'password' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', width: '100%' }} required disabled={loading} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', zIndex: 3 }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        <AnimatePresence>{focusedField === 'password' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                    </motion.div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01, boxShadow: "0px 10px 30px rgba(255, 215, 0, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        borderRadius: '10px',
                        marginTop: '0.4rem',
                        background: 'var(--gold-gradient)',
                        color: '#000',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>{t('auth.createAccount')} <ArrowRight size={18} /></>}
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ padding: '0 10px', color: '#666', fontSize: '0.75rem' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <motion.button
                        whileHover={{ y: -2, background: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`}
                        style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg> Google
                    </motion.button>
                    <motion.button
                        whileHover={{ y: -2, background: 'rgba(0,119,181,0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`}
                        style={{ flex: 1, padding: '0.6rem', background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}
                    >
                        <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                    </motion.button>
                </div>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
                {t('auth.alreadyHaveAccount')} <Link href="/entrar" style={{ color: '#FFD700', fontWeight: 600, textDecoration: 'none' }}>{t('auth.loginNow')}</Link>
            </p>

            <style jsx global>{`
                .country-option:hover { background: #333 !important; color: var(--primary) !important; }
                .input-luxury { width: 100%; border-radius: 8px; outline: none; transition: 0.3s; }
            `}</style>
        </motion.div>
    );
}
