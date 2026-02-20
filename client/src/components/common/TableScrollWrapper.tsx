"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TableScrollWrapperProps {
    children: React.ReactNode;
}

export default function TableScrollWrapper({ children }: TableScrollWrapperProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            // Using small threshold to avoid flicker
            setShowLeft(scrollLeft > 10);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            // Initial check
            checkScroll();
            // Handle window resize
            window.addEventListener('resize', checkScroll);

            // Re-check after a brief moment to catch dynamic content loading
            const timeout = setTimeout(checkScroll, 500);
            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
                clearTimeout(timeout);
            };
        }
    }, [children]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = Math.min(scrollRef.current.clientWidth * 0.8, 400);
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }} className="table-scroll-container">
            <AnimatePresence>
                {showLeft && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => scroll('left')}
                        style={{
                            position: 'absolute',
                            left: '5px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 50,
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            cursor: 'pointer',
                            color: '#B8860B'
                        }}
                        whileHover={{ scale: 1.1, background: '#fff' }}
                        whileTap={{ scale: 0.95 }}
                        title="Scroll Left"
                    >
                        <ChevronLeft size={20} strokeWidth={3} />
                    </motion.button>
                )}
            </AnimatePresence>

            <div
                ref={scrollRef}
                style={{
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxHeight: '600px',
                    scrollbarWidth: 'thin',
                    position: 'relative',
                    width: '100%',
                    WebkitOverflowScrolling: 'touch'
                }}
                className="table-wrapper-scroll"
            >
                {children}
            </div>

            <AnimatePresence>
                {showRight && (
                    <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => scroll('right')}
                        style={{
                            position: 'absolute',
                            right: '5px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 50,
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            cursor: 'pointer',
                            color: '#B8860B'
                        }}
                        whileHover={{ scale: 1.1, background: '#fff' }}
                        whileTap={{ scale: 0.95 }}
                        title="Scroll Right"
                    >
                        <ChevronRight size={20} strokeWidth={3} />
                    </motion.button>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                /* Table wrapper scrollbar styling */
                .table-wrapper-scroll::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .table-wrapper-scroll::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .table-wrapper-scroll::-webkit-scrollbar-thumb {
                    background: #FFD700;
                    border-radius: 10px;
                }
                .table-wrapper-scroll::-webkit-scrollbar-thumb:hover {
                    background: #B8860B;
                }
                
                /* Sticky table header */
                .table-wrapper-scroll table thead th {
                    position: sticky;
                    top: 0;
                    background: #fff;
                    z-index: 10;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .table-wrapper-scroll table thead th {
                        background: #1a1a1a;
                    }
                }
            `}</style>
        </div>
    );
}
