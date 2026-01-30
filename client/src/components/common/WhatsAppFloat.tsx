"use client";

import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function WhatsAppFloat() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkScroll = () => {
            if (window.scrollY > 200 && !pathname?.startsWith('/hub/')) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener('scroll', checkScroll);
        return () => window.removeEventListener('scroll', checkScroll);
    }, [pathname]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.a
                    href="https://wa.me/258856079576" // Updated number from User context if available, using the one from Footer
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '25px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#25D366',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        zIndex: 9999,
                        cursor: 'pointer',
                        border: '2px solid #fff'
                    }}
                >
                    <MessageCircle size={24} fill="white" />
                </motion.a>
            )}
        </AnimatePresence>
    );
}
