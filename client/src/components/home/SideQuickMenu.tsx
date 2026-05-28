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
    { id: 'impact', icon: <BarChart3 size={20} />, label: 'Impacto Global', target: 'impact-section' },
    { id: 'milestones', icon: <Trophy size={20} />, label: 'Meus Marcos', target: 'milestones-section' },
    { id: 'tutorials', icon: <PlayCircle size={20} />, label: 'Tutoriais', target: 'tutorials-section' },
    { id: 'plans', icon: <CreditCard size={20} />, label: 'Planos Premium', target: 'plans-section' },
    { id: 'faq', icon: <HelpCircle size={20} />, label: 'Dúvidas', target: 'faq-section' },
    { id: 'support', icon: <MessageCircle size={20} />, label: 'Suporte', target: '/suporte', isLink: true },
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', target: '/dashboard', isLink: true },
];

export default function SideQuickMenu() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const handleAction = (item: typeof menuItems[0]) => {
        if (item.isLink) {
            window.location.href = item.target;
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
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        }} className="hidden-mobile">
            <style jsx>{`
                @media (max-width: 768px) {
                    .hidden-mobile {
                        display: none !important;
                    }
                }
            `}</style>

            {menuItems.map((item) => (
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
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: item.id === 'milestones' ? '#D4AF37' : '#555',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        {item.icon}
                    </motion.button>

                    <AnimatePresence>
                        {hoveredId === item.id && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={{
                                    position: 'absolute',
                                    left: '60px',
                                    background: '#111',
                                    color: '#fff',
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                }}
                            >
                                {item.label}
                                {/* Tooltip Triangle */}
                                <div style={{
                                    position: 'absolute',
                                    left: '-4px',
                                    top: '50%',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    width: '8px',
                                    height: '8px',
                                    background: '#111',
                                }} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}

            {/* Premium Indicator / Logo at the bottom of the bar */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.4,
                    marginTop: '10px'
                }}
            >
                <Zap size={16} color="#D4AF37" fill="#D4AF37" />
            </motion.div>
        </div>
    );
}
