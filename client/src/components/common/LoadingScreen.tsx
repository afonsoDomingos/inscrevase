"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslate } from "@/context/LanguageContext";

export default function LoadingScreen() {
    const { t } = useTranslate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Prevent showing loading screen every time they return to the app or switch pages
        const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
        if (hasSeenLoading) {
            setIsLoading(false);
            return;
        }

        // Priority 1: Window load event
        const handleLoad = () => {
            // Small delay for smooth transition even if load is instant
            setTimeout(() => {
                setIsLoading(false);
                sessionStorage.setItem('hasSeenLoading', 'true');
            }, 800);
        };

        if (document.readyState === "complete") {
            handleLoad();
        } else {
            window.addEventListener("load", handleLoad);

            // Priority 2: Fallback timeout (never stay stuck)
            const fallback = setTimeout(handleLoad, 3000);

            return () => {
                window.removeEventListener("load", handleLoad);
                clearTimeout(fallback);
            };
        }
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 100000,
                        background: "#000",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* Central Logo / Branding */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ marginBottom: "2rem", position: "relative" }}
                    >
                        <h1
                            style={{
                                fontFamily: "var(--font-playfair)",
                                fontSize: "2.5rem",
                                fontWeight: 900,
                                color: "#fff",
                                letterSpacing: "8px",
                                textTransform: "uppercase",
                                margin: 0,
                                whiteSpace: "nowrap",
                            }}
                        >
                            INSCREVA<span style={{ color: "var(--gold-primary, #D4AF37)" }}>-SE</span>
                        </h1>

                        {/* Elegant Loading bar */}
                        <motion.div
                            style={{
                                height: "2px",
                                background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
                                width: "100%",
                                marginTop: "10px",
                                borderRadius: "2px",
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>

                    {/* Luxury Text */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.5, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        style={{
                            color: "#fff",
                            fontSize: "0.8rem",
                            letterSpacing: "4px",
                            textTransform: "uppercase",
                            fontWeight: 500,
                        }}
                    >
                        {t('common.newEra')}
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
