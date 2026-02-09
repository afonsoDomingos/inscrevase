"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    ChevronLeft,
    Star,
    Send,
    CheckCircle2,
    AlertCircle,
    Heart,
    Lightbulb,
    Bug,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useTranslate } from '@/context/LanguageContext';

export default function FeedbackPage() {
    const router = useRouter();
    const { t } = useTranslate();
    const [isMobile, setIsMobile] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'suggestion',
        rating: 5,
        message: ''
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            // Using existing contact support endpoint for now, but with [FEEDBACK] prefix
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: `[FEEDBACK] ${formData.type.toUpperCase()} - Rating: ${formData.rating}/5`,
                    message: formData.message
                })
            });

            if (!response.ok) throw new Error('Failed to send');

            setSent(true);
            toast.success(t('feedback.form.success'));
            setFormData({ name: '', email: '', type: 'suggestion', rating: 5, message: '' });
        } catch (error) {
            toast.error(t('feedback.form.error'));
        } finally {
            setSending(false);
        }
    };

    const feedbackTypes = [
        { id: 'bug', icon: <Bug size={20} />, label: t('feedback.types.bug'), color: '#ef4444' },
        { id: 'suggestion', icon: <Lightbulb size={20} />, label: t('feedback.types.suggestion'), color: '#3b82f6' },
        { id: 'praise', icon: <Heart size={20} />, label: t('feedback.types.praise'), color: '#ec4899' },
        { id: 'other', icon: <MoreHorizontal size={20} />, label: t('feedback.types.other'), color: '#666' }
    ];

    const getRatingLabel = (rating: number) => {
        const labels = [
            t('feedback.ratings.terrible'),
            t('feedback.ratings.bad'),
            t('feedback.ratings.good'),
            t('feedback.ratings.great'),
            t('feedback.ratings.amazing')
        ];
        return labels[rating - 1];
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fff', color: '#1a1a1a' }}>
            <Navbar />

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 24px 60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: '60px', alignItems: 'center' }}>

                    {/* Left Side: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <button
                            onClick={() => router.back()}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#666',
                                fontWeight: 600,
                                cursor: 'pointer',
                                marginBottom: '2rem'
                            }}
                        >
                            <ChevronLeft size={20} /> {t('common.back')}
                        </button>

                        <h1 style={{
                            fontSize: isMobile ? '3rem' : '4rem',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            letterSpacing: '-2px',
                            marginBottom: '1.5rem',
                            fontFamily: 'var(--font-playfair)'
                        }}>
                            {t('feedback.title')}
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#666', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                            {t('feedback.subtitle')}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '12px' }}><CheckCircle2 size={24} color="#10b981" /></div>
                                <span style={{ fontWeight: 600, color: '#444' }}>{t('common.success')} garantido na evolução</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '12px' }}><AlertCircle size={24} color="#3b82f6" /></div>
                                <span style={{ fontWeight: 600, color: '#444' }}>Foco total na experiência do usuário</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: '#fff',
                            padding: isMobile ? '30px 20px' : '50px',
                            borderRadius: '32px',
                            border: '1px solid #eee',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)'
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {!sent ? (
                                <motion.form
                                    key="form"
                                    exit={{ opacity: 0, y: -20 }}
                                    onSubmit={handleSubmit}
                                    style={{ display: 'grid', gap: '24px' }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#333' }}>{t('feedback.form.name')}</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#333' }}>{t('feedback.form.email')}</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#333' }}>{t('feedback.form.type')}</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                                            {feedbackTypes.map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: '12px',
                                                        borderRadius: '12px',
                                                        border: `2px solid ${formData.type === type.id ? type.color : '#f3f4f6'}`,
                                                        background: formData.type === type.id ? `${type.color}08` : '#f9fafb',
                                                        color: formData.type === type.id ? type.color : '#666',
                                                        fontWeight: 700,
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {type.icon}
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#333' }}>{t('feedback.form.rating')}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        size={32}
                                                        fill={(hoverRating || formData.rating) >= star ? '#D4AF37' : 'none'}
                                                        color={(hoverRating || formData.rating) >= star ? '#D4AF37' : '#d1d5db'}
                                                        style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(null)}
                                                        onClick={() => setFormData({ ...formData, rating: star })}
                                                    />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#D4AF37', minWidth: '80px' }}>
                                                {getRatingLabel(hoverRating || formData.rating)}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#333' }}>{t('feedback.form.message')}</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder={t('feedback.form.placeholder')}
                                            style={{ width: '100%', padding: '16px 18px', borderRadius: '16px', border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb', resize: 'none', fontSize: '1rem' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        style={{
                                            background: '#111',
                                            color: '#fff',
                                            padding: '18px',
                                            borderRadius: '16px',
                                            border: 'none',
                                            fontWeight: 800,
                                            fontSize: '1.1rem',
                                            cursor: sending ? 'wait' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {sending ? t('feedback.form.sending') : (
                                            <>
                                                {t('feedback.form.submit')}
                                                <Send size={20} />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ textAlign: 'center', padding: '20px' }}
                                >
                                    <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '10px' }}>{t('feedback.form.success')}</h2>
                                    <p style={{ color: '#666', marginBottom: '30px' }}>Sua contribuição é fundamental para o nosso crescimento.</p>
                                    <button
                                        onClick={() => setSent(false)}
                                        style={{ background: 'transparent', border: '2px solid #111', color: '#111', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                                    >
                                        Enviar outra sugestão
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>

            {/* Bottom Section */}
            <div style={{ borderTop: '1px solid #eee', padding: '80px 24px', background: '#f9fafb' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>O que acontece com seu feedback?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '30px' }}>
                        {[
                            { title: 'Análise Direta', desc: 'Nossa equipe de produto lê cada mensagem enviada.' },
                            { title: 'Priorização', desc: 'Sugestões populares sobem no nosso roadmap de desenvolvimento.' },
                            { title: 'Ação', desc: 'Bugs são corrigidos em tempo recorde graças aos seus relatos.' }
                        ].map((item, i) => (
                            <div key={i} style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #eee' }}>
                                <h3 style={{ fontWeight: 800, marginBottom: '10px' }}>{item.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
