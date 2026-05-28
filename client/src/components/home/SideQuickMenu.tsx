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
    Zap
} from 'lucide-react';

const menuItems = [
    { id: 'plans', icon: <CreditCard size={20} />, label: 'Planos Premium', target: 'plans-section' },
    { id: 'sectors', icon: <Zap size={20} />, label: 'Sectores', target: 'sectors-section' },
    { id: 'impact', icon: <BarChart3 size={20} />, label: 'Impacto Global', target: 'impact-section' },
    { id: 'payments', icon: <CreditCard size={20} />, label: 'Pagamentos', target: 'payments-section' },
    { id: 'milestones', icon: <Trophy size={20} />, label: 'Meus Marcos', target: 'milestones-section' },
    { id: 'tutorials', icon: <PlayCircle size={20} />, label: 'Tutoriais', target: 'tutorials-section' },
    { id: 'faq', icon: <HelpCircle size={20} />, label: 'Dúvidas', target: 'faq-section' },
    { id: 'support', icon: <MessageCircle size={20} />, label: 'Suporte', target: '/suporte', isLink: true },
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', target: '/dashboard', isLink: true },
];

export default function SideQuickMenu({ userRole }: { userRole?: string }) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const getDashboardPath = () => {
        if (!userRole) return '/entrar';
        if (userRole === 'admin' || userRole === 'SuperAdmin') return '/dashboard/admin';
        if (userRole === 'participant') return '/dashboard/participant';
        return '/dashboard/mentor';
    };

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

    return (
        <div style={{
            position: 'fixed',
            left: '10px',
            top: '130px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
        }} className="side-menu-container">
            <style jsx>{`
                @media (max-width: 1024px) {
                    .side-menu-container {
                        display: none !important;
                    }
                }
            `}</style>

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
                            whileHover={{ scale: 1.1, backgroundColor: '#fff' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction(item)}
                            style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                background: isDashboard && !userRole ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: isDashboard && !userRole ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(0, 0, 0, 0.08)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: isDashboard && !userRole ? '#D4AF37' : (item.id === 'milestones' ? '#D4AF37' : '#555'),
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {React.cloneElement(item.icon as React.ReactElement, { size: 16 })}
                        </motion.button>

                        <AnimatePresence>
                            {hoveredId === item.id && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    style={{
                                        position: 'absolute',
                                        left: '42px',
                                        background: isDashboard && !userRole ? '#D4AF37' : '#111',
                                        color: isDashboard && !userRole ? '#000' : '#fff',
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        whiteSpace: 'nowrap',
                                        pointerEvents: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        zIndex: 1001,
                                    }}
                                >
                                    {label}
                                    {/* Tooltip Triangle */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-4px',
                                        top: '50%',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        width: '8px',
                                        height: '8px',
                                        background: isDashboard && !userRole ? '#D4AF37' : '#111',
                                    }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {/* Premium Indicator / Logo at the bottom of the bar */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.4,
                    marginTop: '5px'
                }}
            >
                <Zap size={14} color="#D4AF37" fill="#D4AF37" />
            </motion.div>
        </div>
    );
}
