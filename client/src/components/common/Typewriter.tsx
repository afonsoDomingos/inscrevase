"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface TypewriterProps {
    text: string;
    delay?: number;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function Typewriter({ text, delay = 0, duration = 2, className, style }: TypewriterProps) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) => text.slice(0, latest));
    const [done, setDone] = useState(false);

    useEffect(() => {
        const controls = animate(count, text.length, {
            type: "tween",
            duration: duration,
            delay: delay,
            ease: "linear",
            onComplete: () => setDone(true),
        });
        return controls.stop;
    }, [text, delay, duration, count]);

    return (
        <span className={className} style={style}>
            <motion.span>{displayText}</motion.span>
            {!done && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ marginLeft: '2px', borderLeft: '2px solid currentColor' }}
                />
            )}
        </span>
    );
}
