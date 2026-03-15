"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import Tooltip from "./Tooltip";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Tooltip content={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
            <button
                onClick={toggleTheme}
                className={`theme-toggle ${theme === 'dark' ? 'dark-active' : ''}`}
                aria-label="Toggle Theme"
                style={{
                    width: 'var(--toggle-size, 36px)',
                    height: 'var(--toggle-size, 36px)',
                    borderRadius: '12px',
                    border: '1px solid #FFD700',
                    background: 'var(--paper)',
                    color: 'var(--foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                    <motion.div
                        initial={false}
                        animate={{
                            scale: theme === "light" ? 1 : 0,
                            rotate: theme === "light" ? 0 : 90,
                            opacity: theme === "light" ? 1 : 0
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <Sun size={24} color="#FDB813" />
                    </motion.div>

                    <motion.div
                        initial={false}
                        animate={{
                            scale: theme === "dark" ? 1 : 0,
                            rotate: theme === "dark" ? 0 : -90,
                            opacity: theme === "dark" ? 1 : 0
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <Moon size={24} color="#FFD700" />
                    </motion.div>
                </div>
            </button>
        </Tooltip>
    );
}
