"use client";

import { motion } from 'framer-motion';

export default function CerberusVisual({ 
    isListening = false, 
    isThinking = false, 
    isAlert = false,
    isSpeaking = false 
}: { 
    isListening?: boolean; 
    isThinking?: boolean; 
    isAlert?: boolean;
    isSpeaking?: boolean;
}) {
    // Cores dinâmicas baseadas no estado
    const mainColor = isAlert ? "#ef4444" : "#eab308";
    const glowColor = isAlert ? "rgba(239, 68, 68, 0.5)" : "rgba(234, 179, 8, 0.5)";

    return (
        <div style={{ 
            position: 'relative', 
            width: '120px', 
            height: '100px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            perspective: '1000px'
        }}>
            {/* Efeito de Brilho de Fundo (Aura) */}
            <motion.div
                animate={{
                    scale: isThinking ? [1, 1.2, 1] : isListening || isSpeaking ? [1, 1.1, 1] : 1,
                    opacity: isThinking || isListening || isSpeaking ? [0.2, 0.5, 0.2] : 0.1
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    width: '140%',
                    height: '140%',
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                    zIndex: 0
                }}
            />

            <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ zIndex: 1, filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                <defs>
                    <linearGradient id="brain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isAlert ? "#991b1b" : "#713f12"} />
                        <stop offset="50%" stopColor={isAlert ? "#ef4444" : "#eab308"} />
                        <stop offset="100%" stopColor={isAlert ? "#7f1d1d" : "#422006"} />
                    </linearGradient>
                    
                    <filter id="neural-glow">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Estrutura Principal do Cérebro (Lado Esquerdo) */}
                <motion.path
                    d="M100 30 C 60 30, 30 50, 30 90 C 30 130, 60 140, 100 140 C 95 120, 90 80, 100 30"
                    fill="url(#brain-grad)"
                    stroke={mainColor}
                    strokeWidth="1"
                    animate={isThinking ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                />

                {/* Estrutura Principal do Cérebro (Lado Direito) */}
                <motion.path
                    d="M100 30 C 140 30, 170 50, 170 90 C 170 130, 140 140, 100 140 C 105 120, 110 80, 100 30"
                    fill="url(#brain-grad)"
                    stroke={mainColor}
                    strokeWidth="1"
                    animate={isThinking ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                />

                {/* Convoluções e Sulcos (Detalhes Realistas) */}
                <g stroke="rgba(0,0,0,0.3)" fill="none" strokeWidth="1.5" strokeLinecap="round">
                    {/* Linhas de Textura Cerebral */}
                    <path d="M60 50 Q 80 60, 70 80" />
                    <path d="M140 50 Q 120 60, 130 80" />
                    <path d="M50 90 Q 75 95, 60 110" />
                    <path d="M150 90 Q 125 95, 140 110" />
                    <path d="M85 45 Q 100 55, 115 45" />
                    <path d="M85 125 Q 100 115, 115 125" />
                </g>

                {/* Redes Neurais Ativas (Pontos de Luz) */}
                <g filter="url(#neural-glow)">
                    {[...Array(12)].map((_, i) => (
                        <motion.circle
                            key={i}
                            cx={40 + Math.random() * 120}
                            cy={45 + Math.random() * 80}
                            r={isThinking ? 2.5 : 1.5}
                            fill={mainColor}
                            initial={{ opacity: 0.1 }}
                            animate={{
                                opacity: isThinking ? [0.2, 1, 0.2] : isListening ? [0.1, 0.6, 0.1] : 0.2,
                                scale: isThinking ? [1, 1.5, 1] : 1,
                            }}
                            transition={{
                                duration: isThinking ? 0.3 + Math.random() * 0.5 : 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </g>

                {/* Sinapses Cruzadas (Linhas de Energia) */}
                {isThinking && (
                    <g stroke={mainColor} strokeWidth="0.5" opacity="0.4">
                        <motion.path
                            d="M60 60 L 140 100"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        />
                        <motion.path
                            d="M140 60 L 60 100"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                        />
                    </g>
                )}
            </svg>

            {/* Pulsação de Processamento Central */}
            {isThinking && (
                <motion.div
                    animate={{
                        scale: [0.8, 1.5],
                        opacity: [0.5, 0]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        width: '40px',
                        height: '40px',
                        border: `2px solid ${mainColor}`,
                        borderRadius: '50%',
                        zIndex: 2
                    }}
                />
            )}
        </div>
    );
}
