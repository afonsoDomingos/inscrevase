"use client";

import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export default function CerberusVisual({ isListening = false }: { isListening?: boolean }) {
    // Parallax effect values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    // Smooth transitions
    const springConfig = { damping: 20, stiffness: 150 };
    const dx = useSpring(mouseX, springConfig);
    const dy = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 20;
            const y = (e.clientY / innerHeight - 0.5) * 20;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    const goldGradient = "url(#gold-grad)";
    const eyeColor = isListening ? "#FFD700" : "#ff3333";

    const headVariants = {
        idle: (i: number) => ({
            y: [0, -8, 0],
            rotate: i === 0 ? [-3, 3, -3] : i === 2 ? [3, -3, 3] : 0,
            transition: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" }
        }),
        listening: {
            scale: [1, 1.08, 1],
            filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
            transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
        }
    };

    return (
        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px' }}>
            {/* Neural Mesh Background */}
            <motion.div 
                animate={{ opacity: isListening ? [0.1, 0.4, 0.1] : 0.1 }}
                style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.2 }}
            >
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                        <pattern id="hexagons" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M5 0L10 2.5V7.5L5 10L0 7.5V2.5L5 0Z" fill="none" stroke="gold" strokeWidth="0.1" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#hexagons)" />
                </svg>
            </motion.div>

            {/* Cabeça Esquerda */}
            <motion.div
                style={{ x: dx, y: dy, position: 'absolute', left: 0, top: '24px' }}
                custom={0}
                variants={headVariants}
                animate={isListening ? "listening" : "idle"}
            >
                <HeadSVG color={goldGradient} eyeColor={eyeColor} isListening={isListening} />
            </motion.div>

            {/* Cabeça Direita */}
            <motion.div
                style={{ x: dx, y: dy, position: 'absolute', right: 0, top: '24px' }}
                custom={2}
                variants={headVariants}
                animate={isListening ? "listening" : "idle"}
            >
                <HeadSVG color={goldGradient} eyeColor={eyeColor} isListening={isListening} />
            </motion.div>

            {/* Cabeça Central */}
            <motion.div
                style={{ x: dx, y: dy, position: 'absolute', top: '8px', zIndex: 10 }}
                custom={1}
                variants={headVariants}
                animate={isListening ? "listening" : "idle"}
            >
                <HeadSVG color={goldGradient} eyeColor={eyeColor} isListening={isListening} isMain />
            </motion.div>

            {/* Glow Aura */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 0.5, 0], scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(234, 179, 8, 0.2)', filter: 'blur(48px)' }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}


function HeadSVG({ color, eyeColor, isListening, isMain = false }: { color: string; eyeColor: string; isListening: boolean; isMain?: boolean }) {
    return (
        <svg width={isMain ? "80" : "65"} height={isMain ? "80" : "65"} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#B8860B" />
                    <stop offset="100%" stopColor="#8B4513" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            
            {/* Skull Structure */}
            <motion.path
                d="M50 15C32 15 18 28 18 45C18 62 30 82 50 88C70 82 82 62 82 45C82 28 68 15 50 15Z"
                fill="#0a0a0a"
                stroke={color}
                strokeWidth="2.5"
                filter="url(#glow)"
                animate={isListening ? { strokeWidth: [2.5, 4, 2.5] } : {}}
            />

            {/* Neural Lines on Skull */}
            <path d="M30 30L40 40M70 30L60 40" stroke={color} strokeWidth="0.5" opacity="0.3" />

            {/* Eyes */}
            <motion.circle
                cx="35" cy="45" r="5"
                fill={eyeColor}
                animate={{
                    scale: isListening ? [1, 1.4, 1] : [1, 0.9, 1],
                    opacity: isListening ? 1 : [0.6, 1, 0.6]
                }}
                transition={{ repeat: Infinity, duration: isListening ? 0.6 : 3 }}
                style={{ filter: `drop-shadow(0 0 8px ${eyeColor})` }}
            />
            <motion.circle
                cx="65" cy="45" r="5"
                fill={eyeColor}
                animate={{
                    scale: isListening ? [1, 1.4, 1] : [1, 0.9, 1],
                    opacity: isListening ? 1 : [0.6, 1, 0.6]
                }}
                transition={{ repeat: Infinity, duration: isListening ? 0.6 : 3, delay: 0.2 }}
                style={{ filter: `drop-shadow(0 0 8px ${eyeColor})` }}
            />

            {/* Mouth / Teeth Detail */}
            <path d="M42 75H58" stroke={color} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
            <motion.path 
                d="M45 75V80M50 75V82M55 75V80" 
                stroke={color} 
                strokeWidth="1" 
                opacity="0.4" 
                animate={isListening ? { opacity: [0.4, 0.8, 0.4] } : {}}
            />
        </svg>
    );
}
