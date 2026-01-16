"use strict";
"use client";

import { useEffect, useState } from 'react';
import { authService, UserData } from '@/lib/authService';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    LogOut,
    Loader2,
    Ticket,
    Compass,
    User,
    Menu,
    ChevronLeft,
    Bell,
    MapPin,
    Calendar,
    Award
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'tickets' | 'explore' | 'certificates' | 'profile';

export default function ParticipantDashboard() {
    const { t } = useTranslate();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('tickets');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userProfile = await authService.getProfile();
                if (userProfile.role !== 'participant') {
                    router.push('/dashboard/mentor');
                    return;
                }
                setUser(userProfile);
            } catch (error) {
                console.error("Error loading profile:", error);
                router.push('/entrar');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [router]);

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Mock Event Card 1 */}
                                <div className="luxury-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ height: '200px', background: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800) center/cover' }} />
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#DAA520', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Masterclass</div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Workshop de Liderança 2024</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                            <Calendar size={16} /> 24 Out, 2024
                                        </div>
                                        <Link href="/f/exemplo-evento" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', background: '#1a1a1a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                                            Ver Detalhes
                                        </Link>
                                    </div>
                                </div>

                                {/* Mock Event Card 2 */}
                                <div className="luxury-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ height: '200px', background: 'url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800) center/cover' }} />
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#DAA520', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Networking</div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Gala de Empreendedores</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                            <Calendar size={16} /> 10 Nov, 2024
                                        </div>
                                        <Link href="/f/exemplo-evento" style={{ display: 'block', textAlign: 'center', padding: '0.8rem', background: '#1a1a1a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                                            Ver Detalhes
                                        </Link>
                                    </div>
                                </div>
                            </div>
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
                                        onClick={() => toast.info('Edição de perfil em breve!')}
                                        style={{ padding: '0.8rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Editar Perfil
                                    </button>
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
        </div>
    );
}
