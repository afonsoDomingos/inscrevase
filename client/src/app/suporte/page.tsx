"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Phone,
    Mail,
    MessageCircle,
    Send,
    Clock,
    CheckCircle,
    Loader2,
    ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';

export default function SuportePage() {
    const { t } = useTranslate();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t('supportPage.errorMessage'));
            }

            setSent(true);
            toast.success(data.message || t('supportPage.successMessage'));
            setFormData({ name: '', email: '', subject: '', message: '' });

            setTimeout(() => setSent(false), 3000);
        } catch (error) {
            console.error('[Support Form] Error:', error);
            const err = error as Error;

            if (err.name === 'AbortError') {
                toast.error(t('supportPage.timeoutError'));
            } else {
                toast.error(err.message || t('supportPage.errorMessage'));
            }
        } finally {
            setSending(false);
        }
    };

    const contactMethods = [
        {
            icon: <Phone size={24} />,
            title: t('supportPage.phoneWhatsApp'),
            value: '+258 85 607 9576',
            link: 'https://wa.me/258856079576',
            description: t('supportPage.whatsappUrgentDesc')
        },
        {
            icon: <Mail size={24} />,
            title: t('supportPage.email'),
            value: 'karinganastudio23@gmail.com',
            link: 'mailto:karinganastudio23@gmail.com',
            description: t('supportPage.emailDesc')
        },
        {
            icon: <MessageCircle size={24} />,
            title: t('supportPage.directWhatsApp'),
            value: t('supportPage.instantChat'),
            link: 'https://wa.me/258856079576?text=Olá!%20Preciso%20de%20ajuda%20com%20a%20plataforma%20Inscreva-se',
            description: t('supportPage.realtimeSupportDesc')
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f4f4f4', color: '#171A20' }}>
            {/* Header */}
            <nav style={{
                position: 'sticky',
                top: 0,
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                zIndex: 100,
                padding: isMobile ? '10px 16px' : '15px 24px',
                borderBottom: '1px solid #eee'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            fontSize: isMobile ? '0.85rem' : '0.9rem',
                            color: '#171A20'
                        }}
                    >
                        <ChevronLeft size={isMobile ? 20 : 18} /> {t('supportPage.back')}
                    </button>
                    <div style={{ fontWeight: 800, letterSpacing: isMobile ? '1px' : '2px', textTransform: 'uppercase', fontSize: isMobile ? '0.8rem' : '0.9rem', flex: 1, textAlign: 'center' }}>
                        {t('supportPage.title')}
                    </div>
                    <div style={{ width: isMobile ? '60px' : '80px' }}></div>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '40px 16px' : '60px 24px' }}>
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '60px' }}
                >
                    <h1 style={{
                        fontSize: isMobile ? '2rem' : 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: 700,
                        letterSpacing: isMobile ? '-1px' : '-2px',
                        marginBottom: '15px',
                        background: 'linear-gradient(135deg, #171A20 0%, #666 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1.1
                    }}>
                        {t('supportPage.heroTitle')}
                    </h1>
                    <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: '#5C5E62', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
                        {t('supportPage.heroSubtitle')}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? '30px' : '40px',
                    marginBottom: '60px',
                    alignItems: 'start',
                    justifyItems: isMobile ? 'center' : 'stretch'
                }} className="support-grid">
                    {/* Contact Methods */}
                    <div style={{ width: '100%', maxWidth: isMobile ? '500px' : 'none' }}>
                        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 700, marginBottom: isMobile ? '20px' : '30px' }}>{t('supportPage.contactChannels')}</h2>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {contactMethods.map((method, index) => (
                                <motion.a
                                    key={index}
                                    href={method.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    style={{
                                        background: '#fff',
                                        padding: isMobile ? '20px' : '30px',
                                        borderRadius: '20px',
                                        border: '1px solid #eee',
                                        textDecoration: 'none',
                                        color: '#171A20',
                                        display: 'flex',
                                        gap: isMobile ? '15px' : '20px',
                                        alignItems: 'start',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{
                                        background: '#f4f4f4',
                                        padding: isMobile ? '10px' : '15px',
                                        borderRadius: '12px',
                                        flexShrink: 0
                                    }}>
                                        {method.icon}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: '5px' }}>
                                            {method.title}
                                        </div>
                                        <div style={{
                                            fontSize: isMobile ? '1rem' : '1.1rem',
                                            fontWeight: 800,
                                            marginBottom: '5px',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}>
                                            {method.value}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.4 }}>
                                            {method.description}
                                        </div>
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        {/* Additional Info */}
                        <div style={{ marginTop: '30px', padding: isMobile ? '20px' : '25px', background: '#171A20', borderRadius: '20px', color: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <Clock size={20} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('supportPage.businessHours')}</h3>
                            </div>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.6 }}>
                                {t('supportPage.mondayFriday')}<br />
                                {t('supportPage.saturday')}<br />
                                {t('supportPage.whatsapp247')}
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: '#fff',
                            padding: isMobile ? '25px' : '40px',
                            borderRadius: '20px',
                            border: '1px solid #eee',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                            width: '100%',
                            maxWidth: isMobile ? '500px' : 'none'
                        }}
                    >
                        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 700, marginBottom: '10px' }}>{t('supportPage.sendMessageTitle')}</h2>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '30px' }}>
                            {t('supportPage.sendMessageSubtitle')}
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
                                    {t('supportPage.fullName')}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t('supportPage.namePlaceholder')}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #ddd',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'border 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#171A20'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
                                    {t('supportPage.email')}
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder={t('supportPage.emailPlaceholder')}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #ddd',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'border 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#171A20'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
                                    {t('supportPage.subject')}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder={t('supportPage.subjectHelpPlaceholder')}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #ddd',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'border 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#171A20'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
                                    {t('supportPage.message')}
                                </label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder={t('supportPage.messagePlaceholder')}
                                    rows={5}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #ddd',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        transition: 'border 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#171A20'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={sending || sent}
                                whileHover={{ scale: sending || sent ? 1 : 1.02 }}
                                whileTap={{ scale: sending || sent ? 1 : 0.98 }}
                                style={{
                                    background: sent ? '#10b981' : '#171A20',
                                    color: '#fff',
                                    padding: '16px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: sending || sent ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {sending ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        {t('supportPage.sending')}
                                    </>
                                ) : sent ? (
                                    <>
                                        <CheckCircle size={20} />
                                        {t('supportPage.sent')}
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        {t('supportPage.sendButton')}
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginTop: isMobile ? '40px' : '60px' }}
                >
                    <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, textAlign: 'center', marginBottom: isMobile ? '20px' : '40px' }}>
                        {t('supportPage.faqTitle')}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {[
                            {
                                q: t('supportPage.faq1Q'),
                                a: t('supportPage.faq1A')
                            },
                            {
                                q: t('supportPage.faq2Q'),
                                a: t('supportPage.faq2A')
                            },
                            {
                                q: t('supportPage.faq3Q'),
                                a: t('supportPage.faq3A')
                            },
                            {
                                q: t('supportPage.faq4Q'),
                                a: t('supportPage.faq4A')
                            }
                        ].map((faq, index) => (
                            <div key={index} style={{ background: '#fff', padding: isMobile ? '20px' : '25px', borderRadius: '16px', border: '1px solid #eee' }}>
                                <h3 style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, marginBottom: '10px' }}>{faq.q}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .support-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
