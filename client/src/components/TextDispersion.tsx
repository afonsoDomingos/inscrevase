"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface TextDispersionProps {
    text: string;
}

export const TextDispersion: React.FC<TextDispersionProps> = ({ text }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Use a spring to make the movement smoother
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    const words = text.split(" ");

    return (
        <div ref={containerRef} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4em' }}>
            {words.map((word, i) => {
                // Create staggered transforms for each word based on its index
                // We alternate directions and vary the intensity to create a "scattering" effect
                const xDir = (i % 2 === 0 ? 1 : -1) * (Math.random() * 0.5 + 0.5);
                const yDir = (i % 3 === 0 ? -1 : 1) * (Math.random() * 0.5 + 0.5);
                const rotateDir = (i % 2 === 0 ? 1 : -1) * (Math.random() < 0.5 ? 20 : 40);

                const x = useTransform(smoothProgress, [0.4, 1], [0, xDir * 200]);
                const y = useTransform(smoothProgress, [0.4, 1], [0, yDir * 100]);
                const rotate = useTransform(smoothProgress, [0.4, 1], [0, rotateDir]);
                const opacity = useTransform(smoothProgress, [0.5, 0.9], [1, 0]);
                const blur = useTransform(smoothProgress, [0.5, 0.9], ["0px", "10px"]);

                return (
                    <motion.span
                        key={i}
                        style={{
                            display: 'inline-block',
                            x,
                            y,
                            rotate,
                            opacity,
                            filter: `blur(${blur})`,
                            color: '#888',
                            fontSize: '1.1rem',
                            position: 'relative' // Ensure transforms work correctly
                        }}
                    >
                        {word}
                    </motion.span>
                );
            })}
        </div>
    );
};
