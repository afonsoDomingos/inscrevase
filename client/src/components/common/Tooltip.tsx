import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const getPositionStyles = () => {
        switch (position) {
            case 'bottom':
                return { top: 'calc(100% + 12px)', left: '50%', x: '-50%' };
            case 'left':
                return { top: '50%', right: 'calc(100% + 12px)', y: '-50%' };
            case 'right':
                return { top: '50%', left: 'calc(100% + 12px)', y: '-50%' };
            default: // top
                return { bottom: 'calc(100% + 12px)', left: '50%', x: '-50%' };
        }
    };

    const getInitialAndExit = () => {
        switch (position) {
            case 'bottom': return { opacity: 0, y: -8, scale: 0.9, x: '-50%' };
            case 'left': return { opacity: 0, x: 8, scale: 0.9, y: '-50%' };
            case 'right': return { opacity: 0, x: -8, scale: 0.9, y: '-50%' };
            default: return { opacity: 0, y: 8, scale: 0.9, x: '-50%' };
        }
    };

    const getArrowStyles = () => {
        switch (position) {
            case 'bottom':
                return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderBottomColor: 'rgba(255,215,0,0.3)' };
            case 'left':
                return { left: '100%', top: '50%', transform: 'translateY(-50%)', borderLeftColor: 'rgba(255,215,0,0.3)' };
            case 'right':
                return { right: '100%', top: '50%', transform: 'translateY(-50%)', borderRightColor: 'rgba(255,215,0,0.3)' };
            default:
                return { top: '100%', left: '50%', transform: 'translateX(-50%)', borderTopColor: 'rgba(255,215,0,0.3)' };
        }
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={getInitialAndExit()}
                        animate={{ opacity: 1, y: position === 'bottom' ? 0 : (position === 'top' ? 0 : '-50%'), x: (position === 'left' || position === 'right') ? 0 : '-50%', scale: 1 }}
                        exit={getInitialAndExit()}
                        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            padding: '8px 14px',
                            background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.98), rgba(0, 0, 0, 0.98))',
                            backdropFilter: 'blur(12px)',
                            color: '#fff',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 10px rgba(255,215,0,0.05)',
                            border: '1px solid rgba(255,215,0,0.2)',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            ...getPositionStyles()
                        }}
                    >
                        {content}
                        <div style={{
                            position: 'absolute',
                            width: 0,
                            height: 0,
                            border: '6px solid transparent',
                            ...getArrowStyles()
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
