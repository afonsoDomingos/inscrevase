"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Paperclip, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslate } from '@/context/LanguageContext';
import { aiService } from '@/lib/aiService';
import Image from 'next/image';
import { toast } from 'sonner';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'aura';
    timestamp: Date;
    attachment?: string;
}


export default function AuraConcierge() {
    const { t, locale } = useTranslate();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [attachment, setAttachment] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    text: t('aura.welcome'),
                    sender: 'aura',
                    timestamp: new Date()
                }
            ]);
        }
    }, [isOpen, t, messages.length]);

    const handleSend = async (e?: React.FormEvent, overrideMessage?: string) => {
        e?.preventDefault();
        const finalMessage = overrideMessage || message;
        if (!finalMessage.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: finalMessage,
            sender: 'user',
            timestamp: new Date(),
            attachment: attachment || undefined
        };

        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setAttachment(null);
        setIsTyping(true);

        try {
            // If there's an attachment, we might want to tell Aura about it in the prompt
            const contextualMessage = attachment
                ? t('aura.attachmentInfo', { attachment })
                : finalMessage;

            const data = await aiService.chat(contextualMessage, locale);

            const auraMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply,
                sender: 'aura',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, auraMsg]);
        } catch (err: unknown) {
            console.error('Aura Error:', err);
            const error = err as Error;
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: error.message || t('aura.error'),
                sender: 'aura',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error(t('aura.fileTooLarge'));
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error(t('aura.uploadError'));

            const data = await response.json();
            setAttachment(data.url);
            toast.success(t('aura.uploadSuccess'));
        } catch (error) {
            console.error(error);
            toast.error(t('aura.uploadFailed'));
        } finally {
            setUploadingFile(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50, x: -50 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50, x: -50 }}
                        style={{
                            width: 'min(380px, calc(100vw - 40px))',
                            height: 'min(550px, 70vh)',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(15px)',
                            borderRadius: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            overflow: 'hidden',
                            marginBottom: '20px'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: isMobile ? '1rem' : '1.5rem',
                            background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
                            color: '#FFD700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: isMobile ? '32px' : '40px',
                                    height: isMobile ? '32px' : '40px',
                                    borderRadius: '50%',
                                    background: 'var(--gold-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#000'
                                }}>
                                    <Sparkles size={isMobile ? 14 : 20} color="#FFD700" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: isMobile ? '0.85rem' : '1rem', letterSpacing: '1px' }}>AURA</div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase' }}>Luxury Concierge</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'rgba(255,215,0,0.1)', border: 'none', color: '#FFD700', padding: '5px', borderRadius: '50%', cursor: 'pointer' }}
                            >
                                <X size={isMobile ? 18 : 20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%'
                                }}>
                                    <div style={{
                                        padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.2rem',
                                        borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                        background: msg.sender === 'user' ? '#000' : '#fff',
                                        color: msg.sender === 'user' ? '#fff' : '#000',
                                        fontSize: isMobile ? '0.85rem' : '0.9rem',
                                        lineHeight: '1.5',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                        border: msg.sender === 'aura' ? '1px solid #eee' : 'none',
                                    }}>
                                        {msg.sender === 'aura' ? (
                                            <div className="aura-markdown">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ children }) => <p style={{ marginBottom: '0.8rem' }}>{children}</p>,
                                                        h1: ({ children }) => <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '1rem 0 0.5rem', color: '#D4AF37' }}>{children}</h1>,
                                                        h2: ({ children }) => <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '1rem 0 0.5rem', color: '#D4AF37' }}>{children}</h2>,
                                                        h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '1rem 0 0.5rem', color: '#D4AF37' }}>{children}</h3>,
                                                        ul: ({ children }) => <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.8rem' }}>{children}</ul>,
                                                        li: ({ children }) => <li style={{ marginBottom: '0.4rem' }}>{children}</li>,
                                                        strong: ({ children }) => <strong style={{ color: msg.sender === 'aura' ? '#D4AF37' : 'inherit', fontWeight: 700 }}>{children}</strong>,
                                                        hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(212, 175, 55, 0.2)', margin: '1rem 0' }} />
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div>
                                                {msg.text}
                                                {msg.attachment && (
                                                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                                                        {msg.attachment.endsWith('.pdf') ? (
                                                            <a href={msg.attachment} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD700', textDecoration: 'none', fontSize: '0.8rem' }}>
                                                                <FileText size={16} />
                                                                {t('aura.viewPdf')}
                                                            </a>
                                                        ) : (
                                                            <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => window.open(msg.attachment, '_blank')}>
                                                                <Image
                                                                    src={msg.attachment}
                                                                    alt="Anexo"
                                                                    fill
                                                                    style={{ objectFit: 'cover' }}
                                                                    unoptimized
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#999', marginTop: '4px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '0.8rem 1.2rem', borderRadius: '18px 18px 18px 2px', border: '1px solid #eee', display: 'flex', gap: '4px' }}>
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', background: '#FFD700', borderRadius: '50%' }} />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', background: '#FFD700', borderRadius: '50%' }} />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', background: '#FFD700', borderRadius: '50%' }} />
                                </div>
                            )}
                            <div ref={messagesEndRef} />

                            {messages.length === 1 && !isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    style={{
                                        marginTop: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.8rem'
                                    }}
                                >
                                    <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {t('aura.suggestions.title')}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {['q1', 'q2', 'q3', 'q4'].map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    const text = t(`aura.suggestions.${key}`);
                                                    handleSend(undefined, text);
                                                }}
                                                style={{
                                                    background: 'rgba(212, 175, 55, 0.1)',
                                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                                    color: '#000',
                                                    padding: isMobile ? '0.3rem 0.6rem' : '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    textAlign: 'left'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                                                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                                                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                                                }}
                                            >
                                                {t(`aura.suggestions.${key}`)}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: isMobile ? '1rem' : '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', background: '#fff' }}>
                            {attachment && (
                                <div style={{
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid #FFD700',
                                    background: 'rgba(255,215,0,0.05)',
                                    fontSize: '0.75rem'
                                }}>
                                    {attachment.endsWith('.pdf') ? <FileText size={14} color="#ef4444" /> : <ImageIcon size={14} color="#FFD700" />}
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {attachment.split('/').pop()}
                                    </span>
                                    <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                    style={{
                                        background: '#f8f9fa',
                                        color: '#666',
                                        border: '1px solid #eee',
                                        width: isMobile ? '34px' : '45px',
                                        height: isMobile ? '34px' : '45px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    {uploadingFile ? <Loader2 className="animate-spin" size={isMobile ? 16 : 20} /> : <Paperclip size={isMobile ? 16 : 20} />}
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t('aura.placeholder')}
                                    style={{
                                        flex: 1,
                                        padding: isMobile ? '0.4rem 0.8rem' : '0.8rem 1.2rem',
                                        borderRadius: '12px',
                                        border: '1px solid #eee',
                                        outline: 'none',
                                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                                        background: '#f8f9fa',
                                        height: isMobile ? '34px' : 'auto'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() && !attachment}
                                    style={{
                                        background: '#000',
                                        color: '#FFD700',
                                        border: 'none',
                                        width: isMobile ? '34px' : '45px',
                                        height: isMobile ? '34px' : '45px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        opacity: (!message.trim() && !attachment) ? 0.5 : 1
                                    }}
                                >
                                    <Send size={isMobile ? 16 : 20} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: '#000',
                    color: '#FFD700',
                    border: '1px solid #FFD700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    position: 'relative'
                }}
            >
                {isOpen ? <X size={20} /> : <Sparkles size={20} />}
                {!isOpen && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                            position: 'absolute',
                            inset: -3,
                            border: '1px solid #FFD700',
                            borderRadius: '50%'
                        }}
                    />
                )}
            </motion.button>
        </div>
    );
}
