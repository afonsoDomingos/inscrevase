"use client";

import { useEffect, useState } from 'react';
import { serviceService } from '@/lib/serviceService';
import { formService } from '@/lib/formService';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader2, Calendar, ArrowRight, Star, TrendingUp, Users, Sparkles, BookOpen, Briefcase } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslate } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { useCurrency } from '@/context/CurrencyContext';

interface UnifiedItem {
    id: string;
    type: 'event' | 'service';
    title: string;
    description: string;
    category: string;
    price?: number;
    currency: string;
    image: string;
    creator?: {
        name: string;
        profilePhoto?: string;
    };
    createdAt: string;
    stats: {
        views?: number;
        inquiries?: number;
        submissions?: number;
    };
    link: string;
    isCourse: boolean;
}

export default function ExploreEvents() {
    const { t } = useTranslate();
    const { formatPrice } = useCurrency();
    const [items, setItems] = useState<UnifiedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [mainFilter, setMainFilter] = useState<'all' | 'event' | 'service' | 'course'>('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_low' | 'price_high'>('newest');

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                const [servicesData, eventsData] = await Promise.all([
                    serviceService.getServices(),
                    formService.getExploreEvents()
                ]);

                const normalizedServices: UnifiedItem[] = (servicesData || []).map(s => ({
                    id: s._id,
                    type: 'service',
                    title: s.title,
                    description: s.description,
                    category: s.category,
                    price: s.price,
                    currency: s.currency,
                    image: s.images?.[0] || '',
                    creator: s.creator ? { name: s.creator.name, profilePhoto: s.creator.profilePhoto } : undefined,
                    createdAt: s.createdAt,
                    stats: { views: s.views, inquiries: s.inquiries },
                    link: `/hub/${s._id}`,
                    isCourse: s.category === 'Treinamento' || s.category === 'Educação'
                }));

                const normalizedEvents: UnifiedItem[] = (eventsData || []).map(e => ({
                    id: e._id,
                    type: 'event',
                    title: e.title,
                    description: e.description || '',
                    category: e.category || 'Eventos',
                    price: e.paymentConfig?.price,
                    currency: e.paymentConfig?.currency || 'USD',
                    image: e.coverImage || '',
                    creator: e.creator ? { name: e.creator.name, profilePhoto: e.creator.profilePhoto } : undefined,
                    createdAt: e.createdAt,
                    stats: { views: e.visits, submissions: e.submissionCount },
                    link: `/hub/${e._id}`,
                    isCourse: e.category === 'Treinamento' || e.category === 'Educação'
                }));

                setItems([...normalizedServices, ...normalizedEvents]);
            } catch (error) {
                console.error("Error fetching explorer data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    const categories = ['Negócios', 'Tecnologia', 'Treinamento', 'Educação', 'Design', 'Saúde & Bem-estar', 'Marketing', 'Networking', 'Outro'];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.creator?.name && item.creator.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesMainFilter = 
            mainFilter === 'all' || 
            (mainFilter === 'event' && item.type === 'event') ||
            (mainFilter === 'service' && item.type === 'service') ||
            (mainFilter === 'course' && item.isCourse);

        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

        return matchesSearch && matchesMainFilter && matchesCategory;
    }).sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'popular') return (b.stats.views || 0) - (a.stats.views || 0);
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

                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', fontFamily: 'var(--font-playfair)', color: '#fff' }}>
                        Descubra <span className="gold-text">Eventos, Serviços & Cursos</span> de Elite
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
                            placeholder="O que você procura hoje?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setFocusedField('search')}
                            onBlur={() => setFocusedField(null)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                padding: '0.8rem 1rem',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '1rem',
                                borderRadius: '100px'
                            }}
                        />
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                background: showFilters ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                                color: showFilters ? '#000' : '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '100px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginRight: '0.5rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Filter size={16} /> Filtros
                        </button>
                    </div>

                    {/* Elite Main Filters - SEMPRE VISÍVEIS */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '10px', 
                        marginTop: '2rem',
                        padding: '0 10px',
                        overflowX: 'auto',
                        scrollbarWidth: 'none'
                    }}>
                        {[
                            { id: 'all', label: 'Tudo', icon: <Sparkles size={16} /> },
                            { id: 'event', label: 'Eventos', icon: <Calendar size={16} /> },
                            { id: 'service', label: 'Serviços', icon: <Briefcase size={16} /> },
                            { id: 'course', label: 'Cursos', icon: <BookOpen size={16} /> }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setMainFilter(btn.id as 'all' | 'event' | 'service' | 'course')}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '100px',
                                    background: mainFilter === btn.id ? '#FFD700' : 'rgba(255,255,255,0.05)',
                                    color: mainFilter === btn.id ? '#000' : '#fff',
                                    border: `1px solid ${mainFilter === btn.id ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s',
                                    whiteSpace: 'nowrap',
                                    boxShadow: mainFilter === btn.id ? '0 10px 20px rgba(255,215,0,0.2)' : 'none'
                                }}
                            >
                                {btn.icon} {btn.label}
                            </button>
                        ))}
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
                                            onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'price_low' | 'price_high')}
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
                        {filteredItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <div style={{ 
                                    width: '80px', height: '80px', background: '#f5f5f5', 
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', margin: '0 auto 1.5rem' 
                                }}>
                                    <Star size={32} style={{ opacity: 0.2 }} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>Nenhum resultado encontrado</h3>
                                <p style={{ color: '#666' }}>Tente ajustar seus filtros ou selecionar outra categoria.</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '2rem'
                            }}>
                                {filteredItems.map((item, index) => (
                                    <motion.div
                                        key={`${item.type}-${item.id}`}
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
                                            transition: 'all 0.3s ease',
                                            position: 'relative'
                                        }}
                                        whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
                                    >
                                        {/* Image Header */}
                                        <div style={{ position: 'relative', height: '220px', background: '#000' }}>
                                            {item.image ? (
                                                <Image 
                                                    src={item.image} 
                                                    alt={item.title}
                                                    fill
                                                    style={{ objectFit: 'cover', opacity: 0.9 }}
                                                />
                                            ) : (
                                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a)' }}>
                                                    <Sparkles size={40} className="gold-text" style={{ opacity: 0.3 }} />
                                                </div>
                                            )}
                                            
                                            {/* Type Badge - ELITE STYLE */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                right: '1rem',
                                                background: item.type === 'event' ? '#000' : '#111',
                                                padding: '6px 14px',
                                                borderRadius: '12px',
                                                color: '#FFD700',
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: '2px',
                                                border: '1px solid #FFD700',
                                                zIndex: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                {item.isCourse ? <BookOpen size={12} /> : item.type === 'event' ? <Calendar size={12} /> : <Briefcase size={12} />}
                                                {item.isCourse ? 'CURSO' : item.type === 'event' ? 'EVENTO' : 'SERVIÇO'}
                                            </div>

                                            {/* Category Overlay */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                padding: '20px 1.5rem 1rem',
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-end'
                                            }}>
                                                <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>
                                                    {item.category}
                                                </div>
                                                <div style={{
                                                    background: 'var(--gold-gradient)',
                                                    padding: '4px 12px',
                                                    borderRadius: '8px',
                                                    color: '#000',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 800,
                                                    boxShadow: '0 4px 15px rgba(255,215,0,0.3)'
                                                }}>
                                                    {item.price ? formatPrice(item.price, item.currency) : 'Grátis'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                                <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '10px', overflow: 'hidden', background: '#f5f5f5', border: '1px solid #eee' }}>
                                                    {item.creator?.profilePhoto ? (
                                                        <Image src={item.creator.profilePhoto} alt={item.creator.name} fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={14} color="#ccc" /></div>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: '#111', fontWeight: 700 }}>{item.creator?.name}</span>
                                            </div>

                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.8rem', color: '#000', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                                                {item.title}
                                            </h3>
                                            
                                            <p style={{ 
                                                fontSize: '0.9rem', 
                                                color: '#666', 
                                                lineHeight: 1.6,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                marginBottom: '1.5rem',
                                                flex: 1
                                            }}>
                                                {item.description}
                                            </p>

                                            {/* Action Row */}
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                paddingTop: '1.2rem',
                                                borderTop: '1px solid #f2f2f2'
                                            }}>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>
                                                        <TrendingUp size={14} className="gold-text" /> 
                                                        {(item.stats.views || 0)} vistos
                                                    </div>
                                                </div>
                                                
                                                <Link 
                                                    href={item.link}
                                                    style={{
                                                        background: '#000',
                                                        color: '#fff',
                                                        padding: '10px 20px',
                                                        borderRadius: '12px',
                                                        fontWeight: 800,
                                                        fontSize: '0.8rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        textDecoration: 'none',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {item.type === 'service' ? 'Solicitar' : 'Inscrever-se'} <ArrowRight size={14} />
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
                    {!loading && items.length > 0 && (
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

