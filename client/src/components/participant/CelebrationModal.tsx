import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SubmissionModel } from '@/lib/submissionService';

interface CelebrationModalProps {
    submission: SubmissionModel | null;
    onClose: () => void;
}

export default function CelebrationModal({ submission, onClose }: CelebrationModalProps) {
    if (!submission) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '1.5rem'
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, y: 20, opacity: 0 }}
                    style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '450px',
                        borderRadius: '30px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header Image/Pattern */}
                    <div style={{
                        height: '160px',
                        background: 'linear-gradient(135deg, #000 0%, #1a1500 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            width: '200%',
                            height: '200%',
                            background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
                            top: '-50%',
                            left: '-50%'
                        }} />

                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                            style={{
                                width: '80px',
                                height: '80px',
                                background: 'var(--gold-gradient)',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000',
                                zIndex: 1,
                                boxShadow: '0 10px 30px rgba(255,215,0,0.3)'
                            }}
                        >
                            <Sparkles size={40} />
                        </motion.div>

                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#fff',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 2
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#000', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                                Inscrição Confirmada! 🎉
                            </h2>
                            <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.5, marginBottom: '2rem' }}>
                                A tua presença em <strong>{submission.form.title}</strong> acaba de ser aprovada pelo mentor.
                            </p>
                        </motion.div>

                        {submission.form.coverImage && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{
                                    width: '100%',
                                    height: '140px',
                                    position: 'relative',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    marginBottom: '2rem',
                                    border: '1px solid #f0f0f0'
                                }}
                            >
                                <Image
                                    src={submission.form.coverImage}
                                    alt={submission.form.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                        >
                            <Link
                                href={`/hub/${submission._id}`}
                                onClick={onClose}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    background: 'var(--gold-gradient)',
                                    color: '#000',
                                    padding: '1.1rem',
                                    borderRadius: '16px',
                                    fontWeight: 900,
                                    textDecoration: 'none',
                                    fontSize: '1rem',
                                    boxShadow: '0 10px 25px -5px rgba(218, 165, 32, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Aceder ao Hub do Evento <ArrowRight size={20} />
                            </Link>

                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#666',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: '0.5rem'
                                }}
                            >
                                Depois eu vejo
                            </button>
                        </motion.div>
                    </div>

                    {/* Celebration Particles (CSS-only approximation) */}
                    <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
                        {/* We could add actual particles, but for now the sparkles and animation give the feel */}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
