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
    const mainColor = isAlert ? "#ef4444" : "#eab308";
    const glowColor = isAlert ? "rgba(239, 68, 68, 0.6)" : "rgba(234, 179, 8, 0.6)";

    return (
        <div style={{ 
            position: 'relative', 
            width: '140px', 
            height: '110px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
        }}>
            {/* Brilho Atmosférico Interno */}
            <motion.div
                animate={{
                    opacity: isThinking || isSpeaking ? [0.4, 0.8, 0.4] : 0.3,
                    scale: isThinking ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    width: '60%',
                    height: '60%',
                    background: mainColor,
                    filter: 'blur(30px)',
                    borderRadius: '50%',
                    zIndex: 0
                }}
            />

            <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ zIndex: 1 }}>
                <defs>
                    <radialGradient id="brain-depth" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={isAlert ? "#ef4444" : "#facc15"} />
                        <stop offset="70%" stopColor={isAlert ? "#991b1b" : "#a16207"} />
                        <stop offset="100%" stopColor="#1a1a1a" />
                    </radialGradient>
                    
                    <filter id="inner-shadow">
                        <feOffset dx="0" dy="2" />
                        <feGaussianBlur stdDeviation="3" result="offset-blur" />
                        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                        <feFlood floodColor="black" floodOpacity="0.8" result="color" />
                        <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                        <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                    </filter>
                </defs>

                {/* Hemisfério Esquerdo */}
                <motion.path
                    d="M100 25 C 50 25, 20 50, 20 95 C 20 135, 60 145, 100 145 C 90 120, 85 80, 100 25"
                    fill="url(#brain-depth)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                    filter="url(#inner-shadow)"
                    animate={isThinking ? { x: [-1, 1, -1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.1 }}
                />

                {/* Hemisfério Direito */}
                <motion.path
                    d="M100 25 C 150 25, 180 50, 180 95 C 180 135, 140 145, 100 145 C 110 120, 115 80, 100 25"
                    fill="url(#brain-depth)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                    filter="url(#inner-shadow)"
                    animate={isThinking ? { x: [1, -1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.1 }}
                />

                {/* Convoluções Anatómicas Detalhadas */}
                <g fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round">
                    {/* Sulcos Frontais */}
                    <path d="M60 45 Q 80 55, 75 75" />
                    <path d="M140 45 Q 120 55, 125 75" />
                    {/* Sulcos Parietais */}
                    <path d="M40 85 Q 70 80, 65 105" />
                    <path d="M160 85 Q 130 80, 135 105" />
                    {/* Sulcos Temporais */}
                    <path d="M70 120 Q 100 130, 130 120" />
                    <path d="M100 40 L 100 135" strokeWidth="0.8" opacity="0.3" />
                    {/* Micro Detalhes */}
                    <path d="M45 60 Q 55 65, 50 75" strokeWidth="0.5" />
                    <path d="M155 60 Q 145 65, 150 75" strokeWidth="0.5" />
                </g>

                {/* Rede Neural de Alta Frequência */}
                <g>
                    {[...Array(20)].map((_, i) => (
                        <motion.circle
                            key={i}
                            cx={30 + Math.random() * 140}
                            cy={40 + Math.random() * 95}
                            r={Math.random() * 2 + 0.5}
                            fill="#fff"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: isThinking ? [0, 1, 0] : isSpeaking || isListening ? [0, 0.6, 0] : [0, 0.2, 0],
                                scale: isThinking ? [0.5, 1.5, 0.5] : 1
                            }}
                            transition={{
                                duration: isThinking ? 0.2 + Math.random() * 0.4 : 1.5 + Math.random(),
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                            style={{ filter: `drop-shadow(0 0 5px ${mainColor})` }}
                        />
                    ))}
                </g>

                {/* Impulsos Elétricos (Sinapses) */}
                {(isThinking || isSpeaking) && (
                    <g stroke="#fff" strokeWidth="0.8" opacity="0.6">
                        <motion.path
                            d="M50 70 Q 100 40, 150 70"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.path
                            d="M40 100 Q 100 140, 160 100"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
                        />
                    </g>
                )}
            </svg>

            {/* Aura de Expansão Neural */}
            {(isThinking || isAlert) && (
                <motion.div
                    animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                        border: `1px solid ${mainColor}`,
                        borderRadius: '50%',
                        zIndex: 2
                    }}
                />
            )}
        </div>
    );
}
