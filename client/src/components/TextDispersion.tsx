"use client";
import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

interface TextDispersionProps {
    text: string;
}

interface DispersedWordProps {
    word: string;
    index: number;
    progress: MotionValue<number>;
}

const DispersedWord: React.FC<DispersedWordProps> = ({ word, index, progress }) => {
    // Generate constant random values for each word based on its index
    // This avoids random changes on re-renders while keeping the "random" feel
    const { xDir, yDir, rotateDir } = useMemo(() => {
        // Simple seedable-like random based on index
        const pseudoRandom = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        const r1 = pseudoRandom(index + 1);
        const r2 = pseudoRandom(index + 2);
        const r3 = pseudoRandom(index + 3);

        return {
            xDir: (index % 2 === 0 ? 1 : -1) * (r1 * 0.5 + 0.5),
            yDir: (index % 3 === 0 ? -1 : 1) * (r2 * 0.5 + 0.5),
            rotateDir: (index % 2 === 0 ? 1 : -1) * (r3 < 0.5 ? 20 : 40)
        };
    }, [index]);

    const x = useTransform(progress, [0.4, 1], [0, xDir * 200]);
    const y = useTransform(progress, [0.4, 1], [0, yDir * 100]);
    const rotate = useTransform(progress, [0.4, 1], [0, rotateDir]);
    const opacity = useTransform(progress, [0.5, 0.9], [1, 0]);
    const blur = useTransform(progress, [0.5, 0.9], ["0px", "10px"]);

    return (
        <motion.span
            style={{
                display: 'inline-block',
                x,
                y,
                rotate,
                opacity,
                filter: `blur(${blur})`,
                color: '#888',
                fontSize: '1.1rem',
                position: 'relative'
            }}
        >
            {word}
        </motion.span>
    );
};

export const TextDispersion: React.FC<TextDispersionProps> = ({ text }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const words = useMemo(() => text.split(" "), [text]);

    return (
        <div ref={containerRef} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4em' }}>
            {words.map((word, i) => (
                <DispersedWord
                    key={`${i}-${word}`}
                    word={word}
                    index={i}
                    progress={smoothProgress}
                />
            ))}
        </div>
    );
};
