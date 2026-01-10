"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Briefcase, ArrowRight, Loader2, Globe, UserPlus, LogIn, Eye, EyeOff, Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/authService';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/context/LanguageContext';

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
    const { t } = useTranslate();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        businessName: '',
        country: ''
    });
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
            router.push('/dashboard/mentor');
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
            className="luxury-card"
            style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '2rem', perspective: '1000px' }}
        >
            <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#f8f9fa', borderRadius: '12px', padding: '5px' }}>
                <Link href="/entrar" style={{ flex: 1, padding: '10px', borderRadius: '10px', color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', textDecoration: 'none' }}>
                    <LogIn size={16} /> {t('auth.signIn')}
                </Link>
                <div style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--gold-gradient)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <UserPlus size={16} /> {t('auth.signUp')}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Image src="/logo.png" alt="Logo" width={40} height={40} style={{ margin: '0 auto 0.8rem' }} />
                </motion.div>
                <h1 style={{ fontSize: '1.4rem', margin: 0 }}>{t('auth.registerTitle')}</h1>
            </div>

            {error && (
                <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.2rem', textAlign: 'center', fontSize: '0.85rem', border: '1px solid #fed7d7' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Full Name */}
                    <div style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem', color: '#444' }}>{t('auth.fullName')}</label>
                        <motion.div variants={inputVariants} animate={focusedField === 'name' ? 'focused' : 'initial'} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                variants={iconVariants}
                                animate={focusedField === 'name' ? 'focused' : 'initial'}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ position: 'absolute', left: '1.2rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}
                            >
                                <User size={16} />
                            </motion.div>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} className="input-luxury" style={{ paddingLeft: '3.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem', border: focusedField === 'name' ? '1px solid var(--primary)' : '1px solid #e0e0e0', background: '#fff' }} required disabled={loading} />
                            <AnimatePresence>{focusedField === 'name' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Business Name */}
                    <div style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem', color: '#444' }}>{t('auth.businessName')}</label>
                        <motion.div variants={inputVariants} animate={focusedField === 'business' ? 'focused' : 'initial'} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div variants={iconVariants} animate={focusedField === 'business' ? 'focused' : 'initial'} style={{ position: 'absolute', left: '1.2rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}>
                                <Briefcase size={16} />
                            </motion.div>
                            <input type="text" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} onFocus={() => setFocusedField('business')} onBlur={() => setFocusedField(null)} className="input-luxury" style={{ paddingLeft: '3.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem', border: focusedField === 'business' ? '1px solid var(--primary)' : '1px solid #e0e0e0', background: '#fff' }} required disabled={loading} />
                            <AnimatePresence>{focusedField === 'business' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Country Searchable Picker */}
                    <div style={{ marginBottom: '0.8rem', position: 'relative' }} ref={dropdownRef}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem', color: '#444' }}>{t('auth.country')}</label>
                        <motion.div
                            variants={inputVariants}
                            animate={showCountryPicker ? 'focused' : 'initial'}
                            onClick={() => !loading && setShowCountryPicker(!showCountryPicker)}
                            style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' }}
                        >
                            <motion.div variants={iconVariants} animate={showCountryPicker ? 'focused' : 'initial'} style={{ position: 'absolute', left: '1.2rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}>
                                <Globe size={16} />
                            </motion.div>
                            <div className="input-luxury" style={{ paddingLeft: '3.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem', border: showCountryPicker ? '1px solid var(--primary)' : '1px solid #e0e0e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: formData.country ? '#000' : '#888' }}>{formData.country || "Selecione o país"}</span>
                            </div>
                            <AnimatePresence>{showCountryPicker && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
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
                                        background: '#fff',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                        zIndex: 100,
                                        border: '1px solid #eee',
                                        maxHeight: '260px',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <div style={{ padding: '0.6rem', borderBottom: '1px solid #eee', position: 'relative' }}>
                                        <Search size={14} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Pesquisar país..."
                                            value={countrySearch}
                                            onChange={(e) => setCountrySearch(e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem' }}
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
                                                    padding: '0.6rem 0.8rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: formData.country === country ? '#f0f0f0' : 'transparent',
                                                    transition: '0.2s'
                                                }}
                                                className="country-option"
                                            >
                                                {country}
                                                {formData.country === country && <Check size={14} color="var(--primary)" />}
                                            </div>
                                        ))}
                                        {filteredCountries.length === 0 && (
                                            <div style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>Nenhum país encontrado</div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.8rem', color: '#444' }}>{t('auth.email')}</label>
                        <motion.div variants={inputVariants} animate={focusedField === 'email' ? 'focused' : 'initial'} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div variants={iconVariants} animate={focusedField === 'email' ? 'focused' : 'initial'} style={{ position: 'absolute', left: '1.2rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}>
                                <Mail size={16} />
                            </motion.div>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className="input-luxury" style={{ paddingLeft: '3.5rem', paddingBlock: '0.6rem', fontSize: '0.9rem', border: focusedField === 'email' ? '1px solid var(--primary)' : '1px solid #e0e0e0', background: '#fff' }} required disabled={loading} />
                            <AnimatePresence>{focusedField === 'email' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: '#444' }}>{t('auth.password')}</label>
                    <motion.div variants={inputVariants} animate={focusedField === 'password' ? 'focused' : 'initial'} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div variants={iconVariants} animate={focusedField === 'password' ? 'focused' : 'initial'} style={{ position: 'absolute', left: '1.2rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 2 }}>
                            <Lock size={18} />
                        </motion.div>
                        <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} className="input-luxury" style={{ paddingLeft: '3.5rem', paddingRight: '2.8rem', paddingBlock: '0.7rem', fontSize: '0.95rem', border: focusedField === 'password' ? '1px solid var(--primary)' : '1px solid #e0e0e0', background: '#fff' }} required disabled={loading} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', zIndex: 3 }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        <AnimatePresence>{focusedField === 'password' && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'var(--gold-gradient)', transformOrigin: 'left' }} />}</AnimatePresence>
                    </motion.div>
                </div>

                <motion.button whileHover={{ scale: 1.01, boxShadow: "0px 5px 15px rgba(212, 175, 55, 0.3)" }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', borderRadius: '12px', marginTop: '0.5rem' }} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>{t('auth.createAccount')} <ArrowRight size={20} /></>}
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    <span style={{ padding: '0 15px', color: '#888', fontSize: '0.8rem' }}>OU</span>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`} style={{ flex: 1, padding: '0.7rem', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={16} height={16} /> Google
                    </motion.button>
                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/linkedin`} style={{ flex: 1, padding: '0.7rem', background: '#0077b5', border: 'none', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={16} height={16} style={{ filter: 'brightness(0) invert(1)' }} /> LinkedIn
                    </motion.button>
                </div>
            </form>

            <p style={{ marginTop: '1.2rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                {t('auth.alreadyHaveAccount')} <Link href="/entrar" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{t('auth.loginNow')}</Link>
            </p>

            <style jsx global>{`
                .country-option:hover { background: #f8f9fa !important; color: var(--primary); }
                .input-luxury { width: 100%; border-radius: 8px; outline: none; transition: 0.3s; }
            `}</style>
        </motion.div>
    );
}
