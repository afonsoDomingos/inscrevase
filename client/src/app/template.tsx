"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    // Variantes para as colunas da cortina
    const columnVariants = {
        initial: {
            height: "100vh",
        },
        animate: {
            height: "0vh",
            transition: {
                duration: 0.7,
                ease: [0.87, 0, 0.13, 1], // Ease "ExpoInOut" customizado
            },
        },
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Transition Overlay (Cortina Fatiada) */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    zIndex: 9999,
                    pointerEvents: 'none', // Permite clicar através depois que a animação termina (embora height 0 resolva, é bom garantir)
                }}
            >
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        variants={columnVariants}
                        initial="initial"
                        animate="animate"
                        style={{
                            width: '20%',
                            backgroundColor: '#0a0a0a', // Fundo Luxuoso Escuro
                            borderRight: i < 4 ? '1px solid rgba(212, 175, 55, 0.1)' : 'none', // Linha Dourada Sutil
                            position: 'relative',
                        }}
                        transition={{ delay: i * 0.05 }} // Efeito cascata rápido
                    >
                        {/* Detalhe dourado na ponta inferior da cortina */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #D4AF37, #FUD700)'
                        }} />
                    </motion.div>
                ))}
            </div>

            {/* Conteúdo da Página - Aparece suavemente enquanto a cortina sobe */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
}
