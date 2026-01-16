"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useSpotlight } from '@/hooks/useSpotlight';

interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ 
  children, 
  className = "", 
  intensity = 'medium',
  ...props 
}) => {
  const { handleMouseMove } = useSpotlight();
  
  // Map intensity to opacity/size if needed, for now we use the global CSS defaults
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className={`luxury-card spotlight-card ${className}`}
      style={{ position: 'relative', overflow: 'hidden', ...props.style }}
      {...props}
    >
      <div className={`spotlight ${intensity !== 'medium' ? `spotlight-${intensity}` : ''}`} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
};
