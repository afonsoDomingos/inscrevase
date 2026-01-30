"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    MessageCircle,
    Lock,
    UserPlus,
    Users,
    X,
    ChevronDown,
    ShieldCheck,
    Sparkles,
    MoreVertical,
    Trash2
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { useTranslate } from '@/context/LanguageContext';
import { authService, UserData } from '@/lib/authService';
import Image from 'next/image';
import { toast } from 'sonner';
import PremiumBadge from '../common/PremiumBadge';

interface Message {
    _id: string;
    text: string;
    sender: {
        _id: string;
        name: string;
        profilePhoto?: string;
        isVerified?: boolean;
        role: string;
    };
    createdAt: string;
}

interface CommunityChatProps {
    formId: string;
    isApproved: boolean;
    primaryColor: string;
    eventTitle: string;
}

export default function CommunityChat({ formId, isApproved, primaryColor, eventTitle }: CommunityChatProps) {
    const { t } = useTranslate();
    const { socket } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setCurrentUser(authService.getCurrentUser());
        fetchHistory();
    }, [formId]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setUnreadCount(0);
        }
    }, [isOpen, messages]);

    useEffect(() => {
        if (!socket || !formId) return;

        socket.emit('join_community', formId);

        const handleNewMessage = (message: Message) => {
            setMessages(prev => [...prev, message]);
            if (!isOpen) {
                setUnreadCount(count => count + 1);
            }
        };

        socket.on('community_message', handleNewMessage);

        return () => {
            socket.emit('leave_community', formId);
            socket.off('community_message', handleNewMessage);
        };
    }, [socket, formId, isOpen]);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const token = authService.getToken();
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${formId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (!isApproved) {
            toast.error(t('hub.chatSubscribersOnly') || 'Apenas participantes inscritos podem interagir no chat.');
            return;
        }

        try {
            const token = authService.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    formId,
                    text: newMessage
                })
            });

            if (response.ok) {
                setNewMessage('');
            } else {
                const error = await response.json();
                toast.error(error.message || t('common.error'));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(t('common.error'));
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(true)}
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '20px',
                                background: '#111',
                                color: '#fff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                position: 'relative'
                            }}
                        >
                            <Users size={24} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    background: '#ff3b30',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '3px solid #fff'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '400px',
                            maxWidth: '100vw',
                            background: '#fff',
                            boxShadow: '-10px 0 50px rgba(0,0,0,0.1)',
                            zIndex: 1001,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '25px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor }}>
                                    <MessageCircle size={22} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{t('hub.communityTitle')}</h3>
                                    <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>{eventTitle}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: '#f5f5f5', border: 'none', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#fcfcfc' }}>
                            {isLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ border: '3px solid #f0f0f0', borderTop: `3px solid ${primaryColor}`, borderRadius: '50%', width: '30px', height: '30px' }} />
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                                    <div style={{ marginBottom: '15px', color: '#eee' }}><Users size={48} style={{ margin: '0 auto' }} /></div>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t('hub.chatEmpty') || 'Comece a conversa! Seja o primeiro a enviar uma mensagem.'}</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender._id === currentUser?.id || msg.sender._id === currentUser?._id;
                                    const showHeader = idx === 0 || messages[idx - 1].sender._id !== msg.sender._id;

                                    return (
                                        <div key={msg._id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', gap: '10px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                            {!isMe && showHeader && (
                                                <div style={{ width: '35px', height: '35px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <Image
                                                        src={msg.sender.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.name)}&background=random`}
                                                        alt={msg.sender.name}
                                                        width={35}
                                                        height={35}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                            {isMe && !showHeader && <div style={{ width: '35px' }} />}
                                            {!isMe && !showHeader && <div style={{ width: '35px' }} />}

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                {showHeader && !isMe && (
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '4px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        {msg.sender.name}
                                                        {msg.sender.isVerified && <PremiumBadge type="verified" size="sm" showLabel={false} />}
                                                        {msg.sender.role === 'admin' && <span style={{ fontSize: '0.6rem', background: '#000', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>ADMIN</span>}
                                                    </div>
                                                )}
                                                <div style={{
                                                    padding: '12px 16px',
                                                    borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                                    background: isMe ? primaryColor : '#fff',
                                                    color: isMe ? '#fff' : '#111',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                                                    border: isMe ? 'none' : '1px solid #f0f0f0',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.5',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {msg.text}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: '#bbb', marginTop: '4px', fontWeight: 600 }}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                            {!isApproved ? (
                                <div style={{ padding: '20px', background: '#fff8f0', border: '1px solid #ffe8cc', borderRadius: '16px', textAlign: 'center' }}>
                                    <div style={{ color: '#f59e0b', marginBottom: '8px' }}><Lock size={20} style={{ margin: '0 auto' }} /></div>
                                    <h4 style={{ margin: '0 0 5px', fontSize: '0.9rem', fontWeight: 800 }}>{t('hub.chatLockedTitle') || 'Chat Restrito'}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', lineHeight: 1.4 }}>
                                        {!currentUser ? (
                                            <>
                                                {t('hub.chatLoginRequired') || 'Crie uma conta como participante para interagir com a comunidade.'}
                                                <div style={{ marginTop: '12px' }}>
                                                    <button
                                                        onClick={() => window.location.href = `/register?role=participant&redirect=${encodeURIComponent(window.location.pathname)}`}
                                                        style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                                    >
                                                        {t('auth.registerNow')}
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            t('hub.chatSubscribersOnly') || 'Apenas participantes inscritos podem interagir neste chat.'
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={t('hub.chatPlaceholder') || 'Escreva algo para a comunidade...'}
                                        style={{ flex: 1, padding: '14px 20px', borderRadius: '14px', border: '1px solid #eee', background: '#f9f9f9', fontSize: '0.9rem', outline: 'none', transition: '0.2s' }}
                                        onFocus={(e) => e.target.style.borderColor = primaryColor}
                                        onBlur={(e) => e.target.style.borderColor = '#eee'}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={!newMessage.trim()}
                                        type="submit"
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '14px',
                                            background: newMessage.trim() ? primaryColor : '#f5f5f5',
                                            color: newMessage.trim() ? '#fff' : '#ccc',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: newMessage.trim() ? 'pointer' : 'default'
                                        }}
                                    >
                                        <Send size={20} />
                                    </motion.button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
