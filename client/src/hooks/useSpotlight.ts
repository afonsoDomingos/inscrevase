"use client";

import { useCallback } from 'react';

export const useSpotlight = () => {
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
    }, []);

    return { handleMouseMove };
};
