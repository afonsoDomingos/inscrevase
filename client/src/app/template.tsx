"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ position: 'relative' }}>
            {/* Left Gate - Abre para a esquerda */}
            <motion.div
                initial={{ x: "0%" }}
                animate={{ x: "-100%" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '50.1vw', // Leve sobreposição
                    height: '100vh',
                    background: '#050505',
                    zIndex: 9999,
                    borderRight: '1px solid #D4AF37', // Linha Dourada
                    boxShadow: '10px 0 40px rgba(0,0,0,0.8)',
                    pointerEvents: 'none'
                }}
            />

            {/* Right Gate - Abre para a direita */}
            <motion.div
                initial={{ x: "0%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '50.1vw', // Leve sobreposição
                    height: '100vh',
                    background: '#050505',
                    zIndex: 9999,
                    borderLeft: '1px solid #D4AF37', // Linha Dourada
                    boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
                    pointerEvents: 'none'
                }}
            />

            {/* Conteúdo - Blur Reveal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
}
