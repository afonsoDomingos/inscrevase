'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Trophy,
    PlayCircle,
    CreditCard,
    HelpCircle,
    MessageCircle,
    LayoutDashboard,
    Zap,
    Users,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const menuItems = [
    { id: 'sectors', icon: <Zap size={12} />, label: 'Sectores', target: 'sectors-section' },
    { id: 'payments', icon: <CreditCard size={12} />, label: 'Pagamentos', target: 'payments-section' },
    { id: 'plans', icon: <CreditCard size={12} />, label: 'Planos Premium', target: 'plans-section' },
    { id: 'impact', icon: <BarChart3 size={12} />, label: 'Impacto Global', target: 'impact-section' },
    { id: 'milestones', icon: <Trophy size={12} />, label: 'Meus Marcos', target: 'milestones-section' },
    { id: 'tutorials', icon: <PlayCircle size={12} />, label: 'Tutoriais', target: 'tutorials-section' },
    { id: 'faq', icon: <HelpCircle size={12} />, label: 'Dúvidas', target: 'faq-section' },
    { id: 'team', icon: <Users size={12} />, label: 'Liderança', target: 'team-section' },
    { id: 'support', icon: <MessageCircle size={12} />, label: 'Suporte', target: '/suporte', isLink: true },
    { id: 'dashboard', icon: <LayoutDashboard size={12} />, label: 'Dashboard', target: '/dashboard', isLink: true },
];

export default function SideQuickMenu({ userRole }: { userRole?: string }) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isBrainOpen, setIsBrainOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const getDashboardPath = () => {
        if (!userRole) return '/entrar';
        if (userRole === 'admin' || userRole === 'SuperAdmin') return '/dashboard/admin';
        if (userRole === 'participant') return '/dashboard/participant';
        return '/dashboard/mentor';
    };

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleBrainVisibility = (e: Event) => {
            const customEvent = e as CustomEvent;
            setIsBrainOpen(customEvent.detail?.visible ?? false);
        };
        window.addEventListener('brain-visibility-change', handleBrainVisibility);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('brain-visibility-change', handleBrainVisibility);
        };
    }, []);

    const handleAction = (item: typeof menuItems[0]) => {
        if (item.isLink) {
            window.location.href = item.id === 'dashboard' ? getDashboardPath() : item.target;
        } else {
            const el = document.getElementById(item.target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    if (isMobile && isBrainOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            left: '10px',
            top: '75px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'center'
        }} className="side-menu-container">
            <style jsx>{`
                @media (max-width: 1024px) {
                    .side-menu-container {
                        left: 5px !important;
                        top: 15% !important;
                    }
                }
            `}</style>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1, background: '#fff' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    width: isMobile ? '16px' : '20px',
                    height: isMobile ? '16px' : '20px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    color: '#666',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
            >
                {isCollapsed ? <ChevronRight size={isMobile ? 10 : 12} /> : <ChevronLeft size={isMobile ? 10 : 12} />}
            </motion.button>

            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '4px' : '6px' }}
                    >
                        {menuItems.map((item) => {
                            const isDashboard = item.id === 'dashboard';
                            const label = isDashboard && !userRole ? 'Entrar / Criar Conta' : item.label;

                            return (
                                <div
                                    key={item.id}
                                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                                    onMouseEnter={() => setHoveredId(item.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.1,
                                            backgroundColor: '#fff',
                                            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.2)'
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAction(item)}
                                        style={{
                                            width: isMobile ? '20px' : '24px',
                                            height: isMobile ? '20px' : '24px',
                                            borderRadius: '5px',
                                            background: isDashboard && !userRole ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            border: isDashboard && !userRole ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(0, 0, 0, 0.08)',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: (hoveredId === item.id) || (isDashboard && !userRole) || (item.id === 'milestones') ? '#D4AF37' : '#555',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {React.cloneElement(item.icon as React.ReactElement, { size: isMobile ? 10 : 12 })}
                                    </motion.button>

                                    <AnimatePresence>
                                        {hoveredId === item.id && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                style={{
                                                    position: 'absolute',
                                                    left: '32px',
                                                    background: isDashboard && !userRole ? '#D4AF37' : '#111',
                                                    color: isDashboard && !userRole ? '#000' : '#fff',
                                                    padding: '4px 10px',
                                                    borderRadius: '5px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    whiteSpace: 'nowrap',
                                                    pointerEvents: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    zIndex: 1001,
                                                }}
                                            >
                                                {label}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-3px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%) rotate(45deg)',
                                                    width: '6px',
                                                    height: '6px',
                                                    background: isDashboard && !userRole ? '#D4AF37' : '#111',
                                                }} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        {/* Premium Indicator */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            style={{
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0.4,
                                marginTop: '4px'
                            }}
                        >
                            <Zap size={12} color="#D4AF37" fill="#D4AF37" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
