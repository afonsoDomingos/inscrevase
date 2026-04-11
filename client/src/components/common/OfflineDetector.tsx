"use client";

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineDetector() {
    const [isOnline, setIsOnline] = useState(true);
    const [isWeak, setIsWeak] = useState(false);

    useEffect(() => {
        // Initial state
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);
        }

        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Conexão restabelecida!', {
                icon: <Wifi size={16} className="text-green-500" />,
                description: 'Você está online novamente.'
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.error('Você está offline', {
                icon: <WifiOff size={16} className="text-red-500" />,
                description: 'Verifique sua conexão para continuar usando a plataforma.',
                duration: Infinity,
                id: 'offline-toast'
            });
        };

        // Network Quality Monitoring (Advanced)
        const checkConnectionQuality = () => {
            // @ts-expect-error - navigator.connection is not supported in all browsers
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            if (connection) {
                const updateQuality = () => {
                    const { downlink, rtt, effectiveType } = connection;
                    
                    // Logic for "Weak Connection"
                    // downlink < 1 Mbps OR rtt > 500ms OR effectiveType is 2g/3g
                    const isWeakNow = downlink < 1.0 || rtt > 600 || ['slow-2g', '2g', '3g'].includes(effectiveType);
                    
                    if (isWeakNow && !isWeak) {
                        setIsWeak(true);
                        toast.warning('Conexão instável detectada', {
                            icon: <AlertTriangle size={16} className="text-amber-500" />,
                            description: 'A plataforma pode carregar mais lentamente que o normal.',
                            id: 'weak-connection-toast'
                        });
                    } else if (!isWeakNow && isWeak) {
                        setIsWeak(false);
                        toast.dismiss('weak-connection-toast');
                    }
                };

                connection.addEventListener('change', updateQuality);
                updateQuality(); // Initial check
                return () => connection.removeEventListener('change', updateQuality);
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        const cleanupQuality = checkConnectionQuality();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (cleanupQuality) cleanupQuality();
            toast.dismiss('offline-toast');
        };
    }, [isWeak]);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    exit={{ y: -100 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        background: '#ef4444',
                        color: '#fff',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    <WifiOff size={16} /> Sem conexão com a internet. Algumas funcionalidades podem não estar disponíveis.
                </motion.div>
            )}
        </AnimatePresence>
    );
}
