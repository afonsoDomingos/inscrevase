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
                return { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' };
            case 'left':
                return { top: '50%', right: '100%', transform: 'translateY(-50%) translateX(-8px)' };
            case 'right':
                return { top: '50%', left: '100%', transform: 'translateY(-50%) translateX(8px)' };
            default: // top
                return { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' };
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
                        initial={{ opacity: 0, scale: 0.8, ...getPositionStyles() }}
                        animate={{ opacity: 1, scale: 1, ...getPositionStyles() }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        style={{
                            position: 'absolute',
                            zIndex: 1000,
                            padding: '6px 12px',
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {content}
                        <div style={{
                            position: 'absolute',
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            [position === 'bottom' ? 'bottom' : 'top']: position === 'bottom' ? '100%' : 'auto',
                            [position === 'top' ? 'top' : 'bottom']: position === 'top' ? '100%' : 'auto',
                            ...((position === 'top' || position === 'bottom') ? {
                                borderTop: position === 'top' ? '5px solid rgba(0,0,0,0.85)' : 'none',
                                borderBottom: position === 'bottom' ? '5px solid rgba(0,0,0,0.85)' : 'none',
                                left: '50%',
                                transform: 'translateX(-50%)'
                            } : {})
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
