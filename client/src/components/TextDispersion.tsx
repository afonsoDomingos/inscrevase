"use client";
import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue, useVelocity } from 'framer-motion';

interface TextDispersionProps {
    text: string;
}

interface DispersedWordProps {
    word: string;
    index: number;
    progress: MotionValue<number>;
}

const DispersedWord: React.FC<DispersedWordProps> = ({ word, index, progress }) => {
    // We use velocity to increase the scattering intensity if the user scrolls fast
    const velocity = useVelocity(progress);

    const { xDir, yDir, rotateDir } = useMemo(() => {
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

    // Define base transforms based on progress
    const baseX = useTransform(progress, [0.4, 0.9], [0, xDir * 150]);
    const baseY = useTransform(progress, [0.4, 0.9], [0, yDir * 80]);
    const baseRotate = useTransform(progress, [0.4, 0.9], [0, rotateDir]);

    // Add velocity-based skew/offset for more "impact"
    // When velocity is high, we multiply the offset
    const velocityFactor = useTransform(velocity, [-2, 0, 2], [1.5, 1, 1.5]);

    const x = useTransform(() => baseX.get() * velocityFactor.get());
    const y = useTransform(() => baseY.get() * velocityFactor.get());
    const rotate = useTransform(() => baseRotate.get() * velocityFactor.get());

    const opacity = useTransform(progress, [0.5, 0.85], [1, 0]);
    const blur = useTransform(progress, [0.5, 0.85], ["0px", "8px"]);

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

    // We keep a light spring to avoid "jitter", but make it very stiff so it follows scroll tightly
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 40 });
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
