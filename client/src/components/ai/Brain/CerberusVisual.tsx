"use client";

import { motion } from 'framer-motion';

export default function CerberusVisual({ isListening = false }: { isListening?: boolean }) {
    // Definimos cores premium baseadas no design atual (Preto, Ouro, Vermelho sutil)
    const goldColor = "#FFD700";
    const darkGold = "#D4AF37";
    const eyeColor = isListening ? "#FFD700" : "#ff4d4d"; // Ouro quando ouve, Vermelho quando "dorme"

    // Variantes de animação orgânica (respiração e oscilação)
    const headVariants = {
        idle: (i: number) => ({
            y: [0, -5, 0],
            rotate: i === 0 ? [-2, 2, -2] : i === 2 ? [2, -2, 2] : 0,
            transition: {
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }),
        listening: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 0.5,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Cabeça Esquerda */}
            <motion.div
                custom={0}
                variants={headVariants}
                animate={isListening ? "listening" : "idle"}
                className="absolute left-0 top-4"
            >
                <HeadSVG color={goldColor} eyeColor={eyeColor} side="left" />
            </motion.div>

            {/* Cabeça Direita */}
            <motion.div
                custom={2}
                variants={headVariants}
                animate={isListening ? "listening" : "idle"}
                className="absolute right-0 top-4"
            >
                <HeadSVG color={goldColor} eyeColor={eyeColor} side="right" />
            </motion.div>

            {/* Cabeça Central (A mais importante) */}
            <motion.div
                custom={1}
                variants={headVariants}
                animate={isListening ? "listening" : "idle"}
                className="absolute top-0 z-10"
            >
                <HeadSVG color={darkGold} eyeColor={eyeColor} side="center" />
            </motion.div>

            {/* Aura/Brilho de Atividade */}
            {isListening && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 rounded-full bg-yellow-400 blur-2xl z-0"
                />
            )}
        </div>
    );
}

function HeadSVG({ color, eyeColor, side }: { color: string; eyeColor: string; side: 'left' | 'right' | 'center' }) {
    return (
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
            {/* Crânio Estilizado */}
            <path
                d="M50 10C30 10 15 25 15 45C15 65 30 85 50 90C70 85 85 65 85 45C85 25 70 10 50 10Z"
                fill="#1a1a1a"
                stroke={color}
                strokeWidth="2"
            />
            {/* Detalhes da Face */}
            <path d="M30 40Q35 35 40 40" stroke={color} strokeWidth="1" />
            <path d="M60 40Q65 35 70 40" stroke={color} strokeWidth="1" />
            
            {/* Olhos (A parte "viva") */}
            <motion.circle
                cx="35" cy="45" r="4"
                fill={eyeColor}
                animate={isListening 
                    ? { scale: [1, 1.5, 1], filter: "blur(1px)" } 
                    : { opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }
                }
                transition={isListening ? {} : { repeat: Infinity, duration: 4 }}
            />
            <motion.circle
                cx="65" cy="45" r="4"
                fill={eyeColor}
                animate={isListening 
                    ? { scale: [1, 1.5, 1], filter: "blur(1px)" } 
                    : { opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }
                }
                transition={isListening ? {} : { repeat: Infinity, duration: 4, delay: 0.5 }}
            />

            {/* Mandíbula/Dentes sutil */}
            <path d="M40 70H60" stroke={color} strokeWidth="1" opacity="0.5" />
            <path d="M45 70V75" stroke={color} strokeWidth="1" opacity="0.5" />
            <path d="M55 70V75" stroke={color} strokeWidth="1" opacity="0.5" />
        </svg>
    );
}
