"use client";

import { useEffect, useState, useCallback } from 'react';
import { authService, UserData } from '@/lib/authService';
import { formService, FormModel } from '@/lib/formService';
import { financeService } from '@/lib/financeService';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    LogOut,
    Loader2,
    Ticket,
    Compass,
    User,
    Menu,
    ChevronLeft,
    Bell,
    Calendar,
    Award,
    Search,
    MapPin,
    Zap,
    MessageCircle,
    LifeBuoy
} from 'lucide-react';
import ProfileModal from '@/components/mentor/ProfileModal';
import SupportModal from '@/components/mentor/SupportModal';
import OnboardingTour, { Step } from '@/components/mentor/OnboardingTour';
import { supportService } from '@/lib/supportService';

type Tab = 'tickets' | 'explore' | 'certificates' | 'profile';
const CATEGORIES = ['Todos', 'Negócios', 'Tecnologia', 'Arte & Música', 'Educação', 'Saúde & Bem-estar', 'Outros'];

export default function ParticipantDashboard() {
    const { t } = useTranslate();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('tickets');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Explore State
    const [exploreEvents, setExploreEvents] = useState<FormModel[]>([]);
    const [exploreLoading, setExploreLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');

    // Upgrade State
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [unreadSupport, setUnreadSupport] = useState(0);
    const [targetMentor, setTargetMentor] = useState<{ id: string, name: string } | null>(null);

    const participantSteps: Step[] = [
        {
            targetId: 'welcome-modal',
            title: t('dashboard.settings.participantTour.welcome.title'),
            description: t('dashboard.settings.participantTour.welcome.desc'),
            position: 'center'
        },
        {
            targetId: 'participant-nav-explore',
            title: t('dashboard.settings.participantTour.explore.title'),
            description: t('dashboard.settings.participantTour.explore.desc'),
            position: 'right'
        },
        {
            targetId: 'participant-nav-tickets',
            title: t('dashboard.settings.participantTour.tickets.title'),
            description: t('dashboard.settings.participantTour.tickets.desc'),
            position: 'right'
        },
        {
            targetId: 'participant-nav-certificates',
            title: t('dashboard.settings.participantTour.certificates.title'),
            description: t('dashboard.settings.participantTour.certificates.desc'),
            position: 'right'
        },
        {
            targetId: 'participant-nav-profile',
            title: t('dashboard.settings.participantTour.profile.title'),
            description: t('dashboard.settings.participantTour.profile.desc'),
            position: 'right'
        }
    ];

    const handleUpgrade = async (plan: string) => {
        if (plan === 'enterprise') {
            toast.info('Para o plano Enterprise, entre em contacto com a nossa equipa de vendas.');
            return;
        }

        setUpgradeLoading(true);
        try {
            const response = await financeService.createSubscription(plan);
            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error: unknown) {
            console.error('Upgrade Error:', error);
            const message = error instanceof Error ? error.message : 'Erro ao processar assinatura';
            toast.error(message);
        } finally {
            setUpgradeLoading(false);
        }
    };

    const handleRestoreMentor = async () => {
        setUpgradeLoading(true);
        try {
            await authService.restoreMentor();
            toast.success('Modo Mentor restaurado!');
            router.push('/dashboard/mentor');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro ao restaurar modo mentor';
            toast.error(message);
        } finally {
            setUpgradeLoading(false);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userProfile = await authService.getProfile();
                if (userProfile.role !== 'participant') {
                    router.push('/dashboard/mentor');
                    return;
                }
                setUser(userProfile);

                // Fetch unread support
                const supportData = await supportService.getUnreadCount();
                setUnreadSupport(supportData.count);
            } catch (error) {
                console.error("Error loading profile:", error);
                router.push('/entrar');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();

        // Poll for unread count
        const interval = setInterval(async () => {
            try {
                const data = await supportService.getUnreadCount();
                setUnreadSupport(data.count);
            } catch { }
        }, 30000);

        return () => clearInterval(interval);
    }, [router]);

    const fetchExploreEvents = useCallback(async () => {
        setExploreLoading(true);
        try {
            const data = await formService.getExploreEvents(selectedCategory, searchQuery);
            setExploreEvents(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar eventos');
        } finally {
            setExploreLoading(false);
        }
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        if (activeTab === 'explore') {
            fetchExploreEvents();
        }
    }, [activeTab, selectedCategory, fetchExploreEvents]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchExploreEvents();
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
            {/* Sidebar */}
            <aside style={{
                width: isSidebarCollapsed ? '80px' : '280px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                zIndex: 1000,
                boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
                overflowX: 'hidden'
            }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', borderBottom: '1px solid #333' }}>
                    {!isSidebarCollapsed && (
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}
                        >
                            Vibe<span className="gold-text">.Part</span>
                        </motion.h2>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: isSidebarCollapsed ? '#FFD700' : '#666',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            transition: 'color 0.2s'
                        }}
                    >
                        {isSidebarCollapsed ? <Menu size={24} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav style={{ padding: '1rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { id: 'tickets', label: 'Meus Ingressos', icon: <Ticket size={20} /> },
                        { id: 'explore', label: 'Explorar Eventos', icon: <Compass size={20} /> },
                        { id: 'certificates', label: 'Meus Certificados', icon: <Award size={20} /> },
                        { id: 'profile', label: 'Minha Conta', icon: <User size={20} /> },
                    ].map((item) => (
                        <button
                            key={item.id}
                            id={`participant-nav-${item.id}`}
                            onClick={() => setActiveTab(item.id as Tab)}
                            title={isSidebarCollapsed ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: '12px 16px',
                                background: activeTab === item.id ? 'var(--gold-gradient)' : 'transparent',
                                color: activeTab === item.id ? '#000' : '#aaa',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: activeTab === item.id ? 700 : 500,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ opacity: activeTab === item.id ? 1 : 0.7, minWidth: '24px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                            {!isSidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </button>
                    ))}
                </nav>

                <div style={{ padding: '1.5rem' }}>
                    <button
                        onClick={() => authService.logout()}
                        title={isSidebarCollapsed ? t('common.logout') : ""}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: '#2a2a2a',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            color: '#e53e3e',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={18} />
                        {!isSidebarCollapsed && t('common.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: isSidebarCollapsed ? '80px' : '280px',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flex: 1,
                padding: '2.5rem',
                minHeight: '100vh',
                maxWidth: `calc(100vw - ${isSidebarCollapsed ? '80px' : '280px'})`
            }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', lineHeight: 1.1, color: '#1a1a1a' }}
                        >
                            Olá, <span className="gold-text">{user.name.split(' ')[0]}</span>
                        </motion.h1>
                        <p style={{ color: '#666', marginTop: '0.4rem', fontSize: '1.05rem', fontWeight: 500 }}>
                            Explore eventos incríveis e gerencie suas inscrições.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div
                            onClick={() => { setTargetMentor(null); setIsSupportOpen(true); }}
                            style={{
                                width: '40px',
                                height: '40px',
                                background: '#fff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #eee',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                        >
                            <LifeBuoy size={20} color="#333" />
                            {unreadSupport > 0 && (
                                <span style={{ position: 'absolute', top: -5, right: -5, background: '#e53e3e', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '2px solid #fff' }}>
                                    {unreadSupport}
                                </span>
                            )}
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #eee',
                            cursor: 'pointer'
                        }}>
                            <Bell size={20} color="#333" />
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #FFD700' }}>
                            {user.profilePhoto ? (
                                <Image src={user.profilePhoto} alt={user.name} width={48} height={48} style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#000', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'tickets' && (
                        <motion.div
                            key="tickets"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div style={{
                                padding: '3rem',
                                background: '#fff',
                                borderRadius: '20px',
                                textAlign: 'center',
                                border: '1px dashed #ddd'
                            }}>
                                <div style={{ background: 'rgba(255,215,0,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <Ticket size={40} color="#DAA520" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Você ainda não tem ingressos</h3>
                                <p style={{ color: '#666', marginBottom: '2rem' }}>Inscreva-se em eventos para vê-los aqui.</p>
                                <button
                                    onClick={() => setActiveTab('explore')}
                                    className="btn-primary"
                                    style={{ padding: '0.8rem 2rem', borderRadius: '50px' }}
                                >
                                    Explorar Eventos
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'explore' && (
                        <motion.div
                            key="explore"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Search and Filters */}
                            <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={20} color="#666" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Buscar eventos..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1rem 1rem 3rem',
                                                borderRadius: '12px',
                                                border: '1px solid #ddd',
                                                outline: 'none',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ borderRadius: '12px', padding: '0 2rem' }}>
                                        Buscar
                                    </button>
                                </form>

                                {/* Categories */}
                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' }}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: selectedCategory === cat ? '1px solid #FFD700' : '1px solid #ddd',
                                                background: selectedCategory === cat ? '#FFF8E1' : '#fff',
                                                color: selectedCategory === cat ? '#B8860B' : '#666',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.9rem',
                                                fontWeight: selectedCategory === cat ? 600 : 400,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Events Grid */}
                            {exploreLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                    <Loader2 className="animate-spin" size={40} color="#FFD700" />
                                </div>
                            ) : exploreEvents.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                                    <Compass size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <h3>Nenhum evento encontrado</h3>
                                    <p>Tente buscar por outro termo ou categoria.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {exploreEvents.map(event => (
                                        <div key={event._id} className="luxury-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div style={{ height: '200px', background: '#f0f0f0', position: 'relative' }}>
                                                {event.coverImage ? (
                                                    <Image src={event.coverImage} alt={event.title} fill style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
                                                        <Ticket size={40} color="#333" />
                                                    </div>
                                                )}
                                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#FFD700', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    {event.eventType === 'modeOnline' ? 'ONLINE' : 'PRESENCIAL'}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#DAA520', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {event.category || 'Geral'}
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3, flex: 1 }}>{event.title}</h3>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                                    {event.eventDate && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Calendar size={14} /> {new Date(event.eventDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {event.location && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            <MapPin size={14} /> {event.location}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <User size={14} /> {event.creator?.businessName || event.creator?.name || 'Organizador'}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <Link href={`/f/${event.slug}`} style={{ flex: 1, textAlign: 'center', padding: '0.8rem', background: '#1a1a1a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, transition: 'transform 0.2s' }}>
                                                        Ver Detalhes
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setTargetMentor({
                                                                id: event.creator?._id || '',
                                                                name: event.creator?.businessName || event.creator?.name || 'Mentor'
                                                            });
                                                            setIsSupportOpen(true);
                                                        }}
                                                        style={{ background: '#FFF8E1', border: '1px solid #FFD700', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Conversar com Mentor"
                                                    >
                                                        <MessageCircle size={20} color="#DAA520" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="luxury-card">
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Minha Conta</h3>
                                <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f0f0', overflow: 'hidden' }}>
                                            {user.profilePhoto ? <Image src={user.profilePhoto} alt="" width={80} height={80} style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={30} /></div>}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{user.name}</h4>
                                            <p style={{ color: '#666', margin: 0 }}>{user.email}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Tipo de Conta</p>
                                        <p style={{ margin: 0, fontWeight: 700, textTransform: 'capitalize' }}>{user.role}</p>
                                    </div>

                                    <button
                                        onClick={() => setIsProfileModalOpen(true)}
                                        style={{ padding: '0.8rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Editar Perfil
                                    </button>
                                </div>
                            </div>

                            {/* Upgrade to Mentor Section */}
                            <div className="luxury-card" style={{ marginTop: '2rem', border: '1px solid #FFD700', background: 'linear-gradient(135deg, #fff 0%, #FFF8E1 100%)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--gold-gradient)', padding: '12px', borderRadius: '12px' }}>
                                        <Award size={24} color="#000" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Torne-se um Mentor</h3>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Crie seus próprios eventos e monetize seu conhecimento.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: user && user.plan && user.plan !== 'free' ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                    {user && user.plan && user.plan !== 'free' ? (
                                        /* Restore Access if already has a plan */
                                        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #FFD700', textAlign: 'center', width: '100%' }}>
                                            <Zap size={32} color="#DAA520" style={{ marginBottom: '1rem' }} />
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Assinatura Ativa detetada!</h4>
                                            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                                                Vimos que já possui um plano <b>{user.plan}</b> ativo.
                                                Deseja voltar para as suas ferramentas de mentor?
                                            </p>
                                            <button
                                                onClick={handleRestoreMentor}
                                                disabled={upgradeLoading}
                                                className="btn-primary"
                                                style={{ padding: '0.8rem 2.5rem', borderRadius: '50px' }}
                                            >
                                                {upgradeLoading ? <Loader2 className="animate-spin" size={20} /> : 'Restaurar Modo Mentor'}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Pro Plan */}
                                            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Plano Pro</span>
                                                    <span style={{ background: '#E3F2FD', color: '#1976D2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>POPULAR</span>
                                                </div>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>499 MT</span>
                                                    <span style={{ color: '#666', fontSize: '0.9rem' }}>/mês</span>
                                                </div>
                                                <ul style={{ padding: 0, listStyle: 'none', margin: '0 0 2rem 0', flex: 1 }}>
                                                    <li style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> Eventos Ilimitados
                                                    </li>
                                                    <li style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> Taxa de plataforma: 10%
                                                    </li>
                                                    <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> Suporte Prioritário
                                                    </li>
                                                </ul>
                                                <button
                                                    onClick={() => handleUpgrade('pro')}
                                                    disabled={upgradeLoading}
                                                    className="btn-primary"
                                                    style={{ width: '100%', borderRadius: '8px', padding: '0.8rem' }}
                                                >
                                                    {upgradeLoading ? <Loader2 className="animate-spin" size={20} /> : 'Assinar Pro'}
                                                </button>
                                            </div>

                                            {/* Enterprise Plan */}
                                            <div style={{ background: '#1a1a1a', color: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Enterprise</span>
                                                </div>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>4.990 MT</span>
                                                    <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>/mês</span>
                                                </div>
                                                <ul style={{ padding: 0, listStyle: 'none', margin: '0 0 2rem 0', flex: 1 }}>
                                                    <li style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> Taxa de plataforma: 0%
                                                    </li>
                                                    <li style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> Gestor de Conta Dedicado
                                                    </li>
                                                    <li style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700' }} /> Customização Avançada
                                                    </li>
                                                </ul>
                                                <button
                                                    onClick={() => handleUpgrade('enterprise')}
                                                    disabled={upgradeLoading}
                                                    style={{ width: '100%', borderRadius: '8px', padding: '0.8rem', background: '#fff', color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    {upgradeLoading ? <Loader2 className="animate-spin" size={20} /> : 'Falar com Vendas'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'certificates' && (
                        <motion.div
                            key="certificates"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                background: '#fff',
                                borderRadius: '20px',
                                color: '#666'
                            }}>
                                <Award size={48} style={{ marginBottom: '1rem', color: '#DAA520', opacity: 0.5 }} />
                                <h3>Nenhum certificado disponível</h3>
                                <p>Participe de eventos que emitem certificados para vê-los aqui.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals & Tour */}
            {user && (
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={user}
                    onSuccess={() => {
                        toast.success('Perfil atualizado!');
                        authService.getProfile().then(setUser);
                    }}
                />
            )}

            <SupportModal
                isOpen={isSupportOpen}
                onClose={() => { setIsSupportOpen(false); setTargetMentor(null); }}
                mode="user"
                targetMentorId={targetMentor?.id}
                targetMentorName={targetMentor?.name}
            />

            <OnboardingTour
                steps={participantSteps}
                storageKey="participant-tour-seen"
            />
        </div>
    );
}
