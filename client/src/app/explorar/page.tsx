"use client";

import { useEffect, useState } from 'react';
import { serviceService, ServiceModel } from '@/lib/serviceService';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader2, Calendar, MapPin, Tag, ArrowRight, Star, Globe, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { useCurrency } from '@/context/CurrencyContext';

export default function ExploreEvents() {
    const { t } = useTranslate();
    const { formatPrice } = useCurrency();
    const [services, setServices] = useState<ServiceModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_low' | 'price_high'>('newest');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await serviceService.getServices();
                setServices(data || []);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const categories = ['Consultoria', 'Mentoria', 'Treinamento', 'Design', 'Desenvolvimento', 'Marketing', 'Outro'];

    const filteredServices = services.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.creator?.name && s.creator.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;

        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
        if (sortBy === 'price_low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price_high') return (b.price || 0) - (a.price || 0);
        return 0;
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fcfcfc' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{
                padding: '120px 20px 60px',
                background: '#0a0a0a',
                color: '#fff',
                textAlign: 'center',
                position: 'relative',
                borderBottom: '2px solid #FFD700'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.1) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,215,0,0.1)',
                        padding: '6px 16px',
                        borderRadius: '100px',
                        border: '1px solid rgba(255,215,0,0.3)',
                        marginBottom: '1.5rem'
                    }}>
                        <TrendingUp size={14} className="gold-text" />
                        <span style={{ color: '#FFD700', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t('common.explore')} Novas Oportunidades
                        </span>
                    </div>

                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', fontFamily: 'var(--font-playfair)' }}>
                        Descubra <span className="gold-text">Eventos & Serviços</span> de Elite
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Conecte-se com mentores, participe de workshops exclusivos e impulsione sua carreira com as melhores ofertas da nossa rede.
                    </p>

                    {/* Elite Search Bar */}
                    <div style={{
                        position: 'relative',
                        maxWidth: '600px',
                        margin: '0 auto',
                        background: '#151515',
                        borderRadius: '100px',
                        padding: '8px',
                        border: '1px solid #222',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Search style={{ marginLeft: '1rem', color: '#666' }} size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar por título, mentor ou categoria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                padding: '0.8rem 1rem',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        />
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '100px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginRight: '0.5rem'
                            }}
                        >
                            <Filter size={16} /> Filtros
                        </button>
                    </div>

                    {/* Advanced Filters Backdrop */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{
                                    maxWidth: '600px',
                                    margin: '1.5rem auto 0',
                                    background: '#151515',
                                    borderRadius: '24px',
                                    padding: '2rem',
                                    border: '1px solid #222',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                                            Categoria
                                        </label>
                                        <select 
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            style={{
                                                width: '100%',
                                                background: '#0a0a0a',
                                                border: '1px solid #333',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="all">Sua Categoria</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                                            Ordenar Por
                                        </label>
                                        <select 
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            style={{
                                                width: '100%',
                                                background: '#0a0a0a',
                                                border: '1px solid #333',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="newest">Mais Recentes</option>
                                            <option value="popular">Mais Relevantes</option>
                                            <option value="price_low">Preço: Menor para Maior</option>
                                            <option value="price_high">Preço: Maior para Menor</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* Results Grid */}
            <main style={{ flex: 1, padding: '80px 20px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
                        <Loader2 className="animate-spin" size={48} color="#FFD700" />
                    </div>
                ) : (
                    <>
                        {filteredServices.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <div style={{ 
                                    width: '80px', height: '80px', background: '#f5f5f5', 
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', margin: '0 auto 1.5rem' 
                                }}>
                                    <Star size={32} style={{ opacity: 0.2 }} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>Nenhum serviço disponível</h3>
                                <p style={{ color: '#666' }}>Tente ajustar seus filtros ou pesquisar por outro termo.</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '2rem'
                            }}>
                                {filteredServices.map((service, index) => (
                                    <motion.div
                                        key={service._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{
                                            background: '#fff',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            border: '1px solid #eee',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                                    >
                                        {/* Image Header */}
                                        <div style={{ position: 'relative', height: '200px', background: '#000' }}>
                                            {service.images && service.images[0] ? (
                                                <Image 
                                                    src={service.images[0]} 
                                                    alt={service.title}
                                                    fill
                                                    style={{ objectFit: 'cover', opacity: 0.9 }}
                                                />
                                            ) : (
                                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a)' }}>
                                                    <Sparkles size={40} className="gold-text" style={{ opacity: 0.3 }} />
                                                </div>
                                            )}
                                            
                                            {/* Category Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                left: '1rem',
                                                background: 'rgba(0,0,0,0.6)',
                                                backdropFilter: 'blur(10px)',
                                                padding: '4px 12px',
                                                borderRadius: '50px',
                                                color: '#FFD700',
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                border: '1px solid rgba(255,215,0,0.3)'
                                            }}>
                                                {service.category}
                                            </div>

                                            {/* Price Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '1rem',
                                                right: '1rem',
                                                background: 'var(--gold-gradient)',
                                                padding: '6px 16px',
                                                borderRadius: '50px',
                                                color: '#000',
                                                fontSize: '0.9rem',
                                                fontWeight: 800,
                                                boxShadow: '0 5px 15px rgba(255,215,0,0.3)'
                                            }}>
                                                {service.price ? formatPrice(service.price, service.currency) : 'Grátis'}
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                                                <div style={{ position: 'relative', width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: '#eee' }}>
                                                    {service.creator?.profilePhoto ? (
                                                        <Image src={service.creator.profilePhoto} alt={service.creator.name} fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <User style={{ padding: '4px' }} size={16} />
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>{service.creator?.name}</span>
                                            </div>

                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: '#111', lineHeight: 1.3 }}>
                                                {service.title}
                                            </h3>
                                            
                                            <p style={{ 
                                                fontSize: '0.9rem', 
                                                color: '#555', 
                                                lineHeight: 1.5,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                marginBottom: '1.5rem',
                                                flex: 1
                                            }}>
                                                {service.description}
                                            </p>

                                            {/* Stats Row */}
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                paddingTop: '1rem',
                                                borderTop: '1px solid #f5f5f5'
                                            }}>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#999' }}>
                                                        <Calendar size={14} /> {new Date(service.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#999' }}>
                                                        <Users size={14} /> {service.inquiries || 0}
                                                    </div>
                                                </div>
                                                
                                                <Link 
                                                    href={`/hub/${service._id}`}
                                                    style={{
                                                        color: '#111',
                                                        fontWeight: 700,
                                                        fontSize: '0.85rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    Detalhes <ArrowRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Premium Footer */}
            <footer style={{
                background: '#0a0a0a',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#fff',
                borderTop: '1px solid rgba(255,215,0,0.2)'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-playfair)' }}>
                        O evento que você procura está aqui.
                    </h2>
                    <p style={{ color: '#888', marginBottom: '2rem' }}>
                        Cadastre-se para receber notificações sobre novos treinamentos e oportunidades na sua área de interesse.
                    </p>
                    {!loading && services.length > 0 && (
                        <Link href="/entrar" style={{
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            padding: '1rem 2.5rem',
                            borderRadius: '100px',
                            fontWeight: 800,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)'
                        }}>
                            Começar Agora
                        </Link>
                    )}
                </div>
                <p style={{ marginTop: '4rem', opacity: 0.4, fontSize: '0.8rem', letterSpacing: '2px' }}>
                    © 2026 INSCREVA-SE • CONEXÕES QUE TRANSFORMAM
                </p>
            </footer>
        </div>
    );
}

function User(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
