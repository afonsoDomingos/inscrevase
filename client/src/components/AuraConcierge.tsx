"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslate } from '@/context/LanguageContext';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'aura';
    timestamp: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AuraConcierge() {
    const { t, locale } = useTranslate();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsTyping(true);

        try {
            console.log('Aura attempting to call:', `${API_URL}/ai/chat`);
            // Placeholder for AI API call
            // We'll implement the actual backend next
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text, locale })
            });

            const data = await response.json();

            const auraMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || t('aura.error'),
                sender: 'aura',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, auraMsg]);
        } catch (error) {
            console.error('Aura Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: t('aura.error'),
                sender: 'aura',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50, x: -50 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50, x: -50 }}
                        style={{
                            width: '380px',
                            height: '550px',
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
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
                            color: '#FFD700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--gold-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#000'
                                }}>
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '1px' }}>AURA</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>Luxury Concierge</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'rgba(255,215,0,0.1)', border: 'none', color: '#FFD700', padding: '5px', borderRadius: '50%', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%'
                                }}>
                                    <div style={{
                                        padding: '0.8rem 1.2rem',
                                        borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                        background: msg.sender === 'user' ? '#000' : '#fff',
                                        color: msg.sender === 'user' ? '#fff' : '#000',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
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
                                            msg.text
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#999', marginTop: '4px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('aura.placeholder')}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: '12px',
                                    border: '1px solid #eee',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    background: '#f8f9fa'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    background: '#000',
                                    color: '#FFD700',
                                    border: 'none',
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#000',
                    color: '#FFD700',
                    border: '2px solid #FFD700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(212,175,55,0.4)',
                    position: 'relative'
                }}
            >
                {isOpen ? <X size={28} /> : <Sparkles size={28} />}
                {!isOpen && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                            position: 'absolute',
                            inset: -5,
                            border: '2px solid #FFD700',
                            borderRadius: '50%'
                        }}
                    />
                )}
            </motion.button>
        </div>
    );
}
