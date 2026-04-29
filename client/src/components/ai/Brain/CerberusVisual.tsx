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
                    d="M98 25 C 70 20, 40 35, 28 65 C 18 90, 22 120, 45 140 C 65 155, 85 148, 98 145 C 92 110, 95 60, 98 25"
                    fill="url(#brain-depth)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.8"
                    filter="url(#inner-shadow)"
                    animate={isThinking ? { x: [-1, 1, -1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                />

                {/* Hemisfério Direito */}
                <motion.path
                    d="M102 25 C 130 20, 160 35, 172 65 C 182 90, 178 120, 155 140 C 135 155, 115 148, 102 145 C 108 110, 105 60, 102 25"
                    fill="url(#brain-depth)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.8"
                    filter="url(#inner-shadow)"
                    animate={isThinking ? { x: [1, -1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                />

                {/* Convoluções Anatómicas Detalhadas (Aspecto Biológico) */}
                <g fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Sulcos Complexos Hemisfério Esquerdo */}
                    <path d="M90 30 Q 70 35, 65 50 T 40 60 T 35 85" />
                    <path d="M85 50 Q 60 65, 50 80 T 45 110 T 60 130" />
                    <path d="M75 75 Q 65 95, 70 115 T 90 135" />
                    <path d="M95 55 Q 80 80, 85 105" />
                    <path d="M98 35 Q 92 60, 95 85" />
                    <path d="M30 70 Q 50 75, 45 95" />
                    <path d="M55 40 Q 40 55, 35 75" />
                    <path d="M70 135 Q 80 120, 95 125" />
                    <path d="M50 100 Q 65 105, 60 125" />

                    {/* Sulcos Complexos Hemisfério Direito */}
                    <path d="M110 30 Q 130 35, 135 50 T 160 60 T 165 85" />
                    <path d="M115 50 Q 140 65, 150 80 T 155 110 T 140 130" />
                    <path d="M125 75 Q 135 95, 130 115 T 110 135" />
                    <path d="M105 55 Q 120 80, 115 105" />
                    <path d="M102 35 Q 108 60, 105 85" />
                    <path d="M170 70 Q 150 75, 155 95" />
                    <path d="M145 40 Q 160 55, 165 75" />
                    <path d="M130 135 Q 120 120, 105 125" />
                    <path d="M150 100 Q 135 105, 140 125" />

                    {/* Fissura Longitudinal (Centro) */}
                    <path d="M100 25 Q 98 50, 100 85 T 100 145" strokeWidth="2.5" stroke="rgba(0,0,0,0.8)" />
                    
                    {/* Micro Detalhes Opcionais */}
                    <path d="M45 60 Q 55 65, 50 75" strokeWidth="0.8" />
                    <path d="M155 60 Q 145 65, 150 75" strokeWidth="0.8" />
                    <path d="M60 110 Q 55 120, 65 125" strokeWidth="0.8" />
                    <path d="M140 110 Q 145 120, 135 125" strokeWidth="0.8" />
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

                {/* Impulsos Elétricos Multicolores (Sinapses / Energia) */}
                {(isThinking || isSpeaking || isListening) && (
                    <g fill="none" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}>
                        {[
                            { d: "M50 70 Q 100 40, 150 70", color: "#38bdf8", duration: 1.5, delay: 0 },       // Cyan
                            { d: "M40 100 Q 100 140, 160 100", color: "#f472b6", duration: 1.2, delay: 0.5 },    // Pink
                            { d: "M90 30 Q 70 35, 65 50 T 40 60", color: "#a78bfa", duration: 1.8, delay: 0.2 }, // Purple
                            { d: "M110 30 Q 130 35, 135 50 T 160 60", color: "#34d399", duration: 1.4, delay: 0.7 }, // Emerald
                            { d: "M75 75 Q 65 95, 70 115 T 90 135", color: "#fcd34d", duration: 1.6, delay: 0.3 }, // Yellow
                            { d: "M125 75 Q 135 95, 130 115 T 110 135", color: "#fb923c", duration: 1.7, delay: 0.6 }, // Orange
                            { d: "M100 35 L 100 125", color: "#eab308", duration: 1.0, delay: 0.8 }              // Ouro central
                        ].map((path, index) => (
                            <motion.path
                                key={index}
                                d={path.d}
                                stroke={isAlert ? "#ef4444" : path.color}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ 
                                    pathLength: [0, 1, 0],
                                    opacity: [0, 0.8, 0]
                                }}
                                transition={{ 
                                    duration: path.duration, 
                                    repeat: Infinity, 
                                    delay: path.delay,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
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
