/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, Send, Loader2, LifeBuoy, Paperclip, FileText, Image as ImageIcon, User as UserIcon, Headphones, GraduationCap, CheckCircle2 as CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supportService, Ticket } from '@/lib/supportService';
import { useTranslate } from '@/context/LanguageContext';
import { authService } from '@/lib/authService';

interface MentorInfo {
    _id: string;
    name: string;
    businessName?: string;
}

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'user' | 'admin' | 'mentor';
    initialTicket?: Ticket | null;
    targetMentorId?: string;
    targetMentorName?: string;
    availableMentors?: MentorInfo[];
}

export default function SupportModal({ isOpen, onClose, mode = 'user', initialTicket, targetMentorId, targetMentorName, availableMentors = [] }: SupportModalProps) {
    const { t } = useTranslate();
    const [view, setView] = useState<'list' | 'new' | 'chat'>('list');
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // New Ticket State
    const [subject, setSubject] = useState('');
    const [initialMessage, setInitialMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<string>('platform');

    // Chat State
    const [reply, setReply] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadTickets();
            const user = authService.getCurrentUser();
            if (user) setUserId(user.id);

            // If targetMentorId is provided, automatically switch to 'new' view
            if (targetMentorId) {
                setView('new');
                setSubject(targetMentorName ? `Conversa com ${targetMentorName}` : '');
                setSelectedRecipient(targetMentorId);
            } else if (initialTicket) {
                setSelectedTicket(initialTicket);
                setView('chat');
            } else {
                setView('list');
                setSelectedRecipient('platform'); // Default to platform
            }
        }
    }, [isOpen, initialTicket, targetMentorId, targetMentorName]);

    useEffect(() => {
        if (view === 'chat' && selectedTicket) {
            scrollToBottom();
            // Mark ticket as read when viewing
            supportService.markAsRead(selectedTicket._id).catch(err => {
                console.error('Error marking as read:', err);
            });
        }
    }, [view, selectedTicket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = mode === 'admin'
                ? await supportService.getAllTickets()
                : await supportService.getMyTickets();
            setTickets(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!subject || !initialMessage) {
            toast.error('Preencha o assunto e a mensagem');
            return;
        }

        setLoading(true);
        try {
            const mentorId = selectedRecipient === 'platform' ? undefined : selectedRecipient;
            await supportService.createTicket(subject, initialMessage, attachment || undefined, mentorId);
            toast.success(mentorId ? 'Mensagem enviada ao mentor!' : 'Ticket criado com sucesso!');
            setSubject('');
            setInitialMessage('');
            setAttachment(null);
            await loadTickets();
            setView('list');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!reply || !selectedTicket) return;

        try {
            const updatedTicket = await supportService.addMessage(selectedTicket._id, reply, attachment || undefined);
            setSelectedTicket(updatedTicket);
            setReply('');
            setAttachment(null);
            // Update in list as well
            setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar resposta');
        }
    };

    // ... (rest of handleFileUpload) ...

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error('Arquivo muito grande. Máximo: 10MB');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Tipo de arquivo não permitido. Use imagens (JPEG, PNG, GIF, WEBP) ou PDF');
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Erro no upload');

            const data = await response.json();
            setAttachment(data.url);
            toast.success('Arquivo anexado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao fazer upload do arquivo');
        } finally {
            setUploadingFile(false);
        }
    };

    if (!isOpen) return null;

    const isMyMessage = (sender: string) => {
        if (mode === 'admin') return sender === 'admin';

        // If we have a selected ticket and know the user ID
        if (selectedTicket && userId) {
            // If I am the mentor of this ticket
            if (selectedTicket.mentor?._id === userId) return sender === 'mentor';
            // If I am the creator of this ticket
            if (selectedTicket.user?._id === userId || (typeof selectedTicket.user === 'string' && selectedTicket.user === userId)) return sender === 'user';
        }

        // Fallback to mode
        if (mode === 'mentor') return sender === 'mentor';
        return sender === 'user';
    };

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: isMobile ? '100%' : '900px',
                        background: '#fff',
                        borderRadius: isMobile ? '0' : '24px',
                        overflow: 'hidden',
                        height: isMobile ? '100dvh' : '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: isMobile ? '1rem' : '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isMobile && view !== 'list' && (
                                <button
                                    onClick={() => setView('list')}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px', marginRight: '5px' }}
                                >
                                    <X size={20} style={{ transform: 'rotate(90deg)' }} />
                                </button>
                            )}
                            <div style={{ background: '#000', color: '#FFD700', padding: isMobile ? '4px' : '8px', borderRadius: '8px' }}>
                                <LifeBuoy size={isMobile ? 20 : 24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 700, fontFamily: 'var(--font-playfair)' }}>
                                    {mode === 'admin' ? t('support.adminTitle') : (mode === 'mentor' ? 'Mensagens' : t('support.title'))}
                                </h3>
                                {!isMobile && (
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                        {mode === 'admin' ? t('support.adminSubtitle') : (mode === 'mentor' ? 'Gerencie as conversas com seus alunos' : t('support.userSubtitle'))}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={isMobile ? 24 : 20} /></button>
                    </div>

                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', overflow: 'hidden' }}>
                        {/* Sidebar */}
                        {(view === 'list' || !isMobile) && (
                            <div style={{ background: '#f8f9fa', borderRight: '1px solid #eee', padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                {mode === 'user' && (
                                    <button
                                        onClick={() => { setView('new'); setSelectedTicket(null); setSelectedRecipient('platform'); setSubject(''); setInitialMessage(''); }}
                                        className="btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem', borderRadius: '12px', marginBottom: '2rem', width: '100%' }}
                                    >
                                        <Plus size={18} /> {t('support.newTicket')}
                                    </button>
                                )}

                                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#999', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                    {mode === 'admin' ? t('support.allTickets') : t('support.yourTickets')}
                                </h3>

                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {loading && view === 'list' ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>
                                    ) : tickets.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginTop: '2rem' }}>{t('support.noTickets')}</p>
                                    ) : (
                                        tickets.map(ticket => (
                                            <button
                                                key={ticket._id}
                                                onClick={() => { setSelectedTicket(ticket); setView('chat'); }}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '1rem',
                                                    borderRadius: '12px',
                                                    background: selectedTicket?._id === ticket._id ? '#fff' : 'transparent',
                                                    border: selectedTicket?._id === ticket._id ? '1px solid #ddd' : 'none',
                                                    boxShadow: selectedTicket?._id === ticket._id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.95rem' }}>{ticket.subject}</div>
                                                {/* Admin View */}
                                                {mode === 'admin' && ticket.user && (
                                                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>{t('support.by')}: {ticket.user.name || t('common.mentor')}</div>
                                                )}

                                                {/* Mentor/User View */}
                                                {mode !== 'admin' && userId && (
                                                    <>
                                                        {/* If I am the mentor */}
                                                        {ticket.mentor?._id === userId && ticket.user && (
                                                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Participante: {ticket.user.name}</div>
                                                        )}
                                                        {/* If I am the creator and talking to a mentor */}
                                                        {ticket.user?._id === userId && ticket.mentor && (
                                                            <div style={{ fontSize: '0.75rem', color: '#DAA520', marginBottom: '4px', fontWeight: 600 }}>Mentor: {ticket.mentor.businessName || ticket.mentor.name}</div>
                                                        )}
                                                        {/* If I am the creator and talking to Admin */}
                                                        {ticket.user?._id === userId && !ticket.mentor && (
                                                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Suporte Técnico (Admin)</div>
                                                        )}
                                                    </>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        background: ticket.status === 'answered' ? '#d1fae5' : (ticket.status === 'closed' ? '#eee' : '#fff3cd'),
                                                        color: ticket.status === 'answered' ? '#047857' : (ticket.status === 'closed' ? '#666' : '#b45309'),
                                                        fontWeight: 600
                                                    }}>
                                                        {ticket.status === 'open' ? t('support.statusOpen') : (ticket.status === 'answered' ? t('support.statusAnswered') : t('support.statusClosed'))}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#999' }}>
                                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Main Content */}
                        {(view !== 'list' || !isMobile) && (
                            <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
                                {view === 'new' && (
                                    <div style={{ padding: isMobile ? '1.5rem' : '3rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                                        <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700, marginBottom: isMobile ? '1.5rem' : '2rem' }}>{t('support.openNewTicket')}</h2>
                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            {/* Recipient Selection - Visual Cards */}
                                            {mode === 'user' && !targetMentorId && (
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem', color: '#111' }}>
                                                        Para quem você quer enviar?
                                                    </label>

                                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                                        {/* Platform Support Card */}
                                                        <motion.button
                                                            type="button"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setSelectedRecipient('platform')}
                                                            style={{
                                                                padding: '1.5rem',
                                                                borderRadius: '16px',
                                                                border: selectedRecipient === 'platform' ? '3px solid #FFD700' : '2px solid #e5e7eb',
                                                                background: selectedRecipient === 'platform' ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : '#fff',
                                                                cursor: 'pointer',
                                                                textAlign: 'left',
                                                                position: 'relative',
                                                                transition: 'all 0.3s ease',
                                                                boxShadow: selectedRecipient === 'platform' ? '0 8px 20px rgba(218, 165, 32, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
                                                            }}
                                                        >
                                                            {selectedRecipient === 'platform' && (
                                                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#059669', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <CheckCircle size={16} />
                                                                </div>
                                                            )}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                                <div style={{
                                                                    width: '48px',
                                                                    height: '48px',
                                                                    borderRadius: '12px',
                                                                    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                }}>
                                                                    <Headphones size={24} color="#FFD700" />
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', marginBottom: '2px' }}>
                                                                        Suporte da Plataforma
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                                                                        Equipe Inscreva.se
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5' }}>
                                                                💡 Problemas técnicos, pagamentos, bugs ou dúvidas sobre a plataforma
                                                            </div>
                                                        </motion.button>

                                                        {/* Mentors Card - Only show if there are mentors */}
                                                        {availableMentors.length > 0 && (
                                                            <motion.button
                                                                type="button"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => {
                                                                    // If only one mentor, select them directly
                                                                    if (availableMentors.length === 1) {
                                                                        setSelectedRecipient(availableMentors[0]._id);
                                                                    } else {
                                                                        // Show mentor selection (we'll set to first mentor by default)
                                                                        setSelectedRecipient(availableMentors[0]._id);
                                                                    }
                                                                }}
                                                                style={{
                                                                    padding: '1.5rem',
                                                                    borderRadius: '16px',
                                                                    border: selectedRecipient !== 'platform' ? '3px solid #FFD700' : '2px solid #e5e7eb',
                                                                    background: selectedRecipient !== 'platform' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : '#fff',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'left',
                                                                    position: 'relative',
                                                                    transition: 'all 0.3s ease',
                                                                    boxShadow: selectedRecipient !== 'platform' ? '0 8px 20px rgba(218, 165, 32, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
                                                                }}
                                                            >
                                                                {selectedRecipient !== 'platform' && (
                                                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#059669', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <CheckCircle size={16} />
                                                                    </div>
                                                                )}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                                    <div style={{
                                                                        width: '48px',
                                                                        height: '48px',
                                                                        borderRadius: '12px',
                                                                        background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        boxShadow: '0 4px 12px rgba(180, 83, 9, 0.3)'
                                                                    }}>
                                                                        <GraduationCap size={24} color="#FFD700" />
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', marginBottom: '2px' }}>
                                                                            Meus Mentores
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                                                                            {availableMentors.length} {availableMentors.length === 1 ? 'mentor disponível' : 'mentores disponíveis'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5' }}>
                                                                    📚 Dúvidas sobre aulas, conteúdo, eventos ou certificados
                                                                </div>
                                                            </motion.button>
                                                        )}
                                                    </div>

                                                    {/* Mentor Selection Dropdown - Show only if mentor option is selected and there are multiple mentors */}
                                                    {selectedRecipient !== 'platform' && availableMentors.length > 1 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            style={{ overflow: 'hidden' }}
                                                        >
                                                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '12px', border: '2px solid #fde68a' }}>
                                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: '#92400e' }}>
                                                                    👨‍🏫 Selecione o mentor:
                                                                </label>
                                                                <select
                                                                    value={selectedRecipient}
                                                                    onChange={(e) => setSelectedRecipient(e.target.value)}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '0.875rem',
                                                                        borderRadius: '10px',
                                                                        border: '2px solid #fbbf24',
                                                                        outline: 'none',
                                                                        background: '#fff',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.95rem',
                                                                        fontWeight: 600,
                                                                        color: '#111'
                                                                    }}
                                                                >
                                                                    {availableMentors.map(mentor => (
                                                                        <option key={mentor._id} value={mentor._id}>
                                                                            {mentor.businessName || mentor.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {/* Preview Card - Shows who will receive the ticket */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                        style={{
                                                            marginTop: '1rem',
                                                            padding: '1rem',
                                                            background: '#f0fdf4',
                                                            borderRadius: '12px',
                                                            border: '2px solid #86efac',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '8px',
                                                            background: '#059669',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}>
                                                            {selectedRecipient === 'platform' ? (
                                                                <Headphones size={20} color="#fff" />
                                                            ) : (
                                                                <GraduationCap size={20} color="#fff" />
                                                            )}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, marginBottom: '2px' }}>
                                                                📨 Seu ticket será enviado para:
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#065f46', fontWeight: 700 }}>
                                                                {selectedRecipient === 'platform'
                                                                    ? 'Equipe de Suporte Inscreva.se'
                                                                    : availableMentors.find(m => m._id === selectedRecipient)?.businessName || availableMentors.find(m => m._id === selectedRecipient)?.name || 'Mentor'}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            )}

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>{t('support.subject')}</label>
                                                <input
                                                    type="text"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    placeholder={t('support.subjectPlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>{t('support.message')}</label>
                                                <textarea
                                                    rows={6}
                                                    value={initialMessage}
                                                    onChange={(e) => setInitialMessage(e.target.value)}
                                                    placeholder={t('support.messagePlaceholder')}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', resize: 'none' }}
                                                />
                                            </div>

                                            {/* File Attachment */}
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>{t('support.attachmentOptional')}</label>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                                    style={{ display: 'none' }}
                                                />

                                                {attachment ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', background: '#f8f9fa' }}>
                                                        {attachment.endsWith('.pdf') ? (
                                                            <FileText size={24} color="#ef4444" />
                                                        ) : (
                                                            <ImageIcon size={24} color="#10b981" />
                                                        )}
                                                        <span style={{ flex: 1, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {attachment.split('/').pop()}
                                                        </span>
                                                        <button
                                                            onClick={() => setAttachment(null)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={uploadingFile}
                                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px dashed #ddd', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#666' }}
                                                    >
                                                        {uploadingFile ? (
                                                            <><Loader2 className="animate-spin" size={18} /> {t('common.sending')}...</>
                                                        ) : (
                                                            <><Paperclip size={18} /> {t('support.attachImageOrPdf')}</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleCreateTicket}
                                                disabled={loading}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px',
                                                    marginTop: '1rem',
                                                    background: '#1a1a1a',
                                                    color: '#fff',
                                                    border: 'none',
                                                    fontWeight: 700,
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    opacity: loading ? 0.7 : 1
                                                }}
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : <> Enviar Mensagem <Send size={18} /></>}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {view === 'chat' && selectedTicket && (
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                                        {/* Chat Header */}
                                        <div style={{ padding: isMobile ? '1rem' : '1.5rem', borderBottom: '1px solid #eee', background: '#fff' }}>
                                            <div style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700 }}>{selectedTicket.subject}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>#{selectedTicket._id.slice(-6).toUpperCase()}</span>

                                                {/* Mentor View: Showing Participant Name */}
                                                {mode === 'mentor' && selectedTicket.user && (
                                                    <span style={{ color: '#000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.75rem' : '0.9rem' }}>
                                                        <UserIcon size={14} /> {isMobile ? '' : 'Participante:'} <span style={{ fontWeight: 400 }}>{selectedTicket.user.name ?? 'Usuário'}</span>
                                                    </span>
                                                )}

                                                {/* User View: Showing Mentor Name */}
                                                {mode === 'user' && (
                                                    <span style={{ color: '#000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.75rem' : '0.9rem' }}>
                                                        {selectedTicket.mentor ? (
                                                            <><UserIcon size={14} /> {isMobile ? '' : 'Mentor:'} <span style={{ fontWeight: 400 }}>{selectedTicket.mentor.businessName || selectedTicket.mentor.name}</span></>
                                                        ) : (
                                                            <><LifeBuoy size={14} /> {isMobile ? '' : 'Suporte:'} <span style={{ fontWeight: 400 }}>Equipe Inscreva.se</span></>
                                                        )}
                                                    </span>
                                                )}

                                                {/* Admin View */}
                                                {mode === 'admin' && selectedTicket.user && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '0.75rem' : '0.9rem' }}>
                                                        <UserIcon size={14} /> {isMobile ? '' : 'De:'} {selectedTicket.user.name}
                                                        {selectedTicket.mentor && <span style={{ marginLeft: '8px', color: '#666' }}>Para: {selectedTicket.mentor.businessName || selectedTicket.mentor.name}</span>}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8f9fa' }}>
                                            {selectedTicket.messages.map((msg, idx) => {
                                                const myMsg = isMyMessage(msg.sender);
                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            alignSelf: myMsg ? 'flex-end' : 'flex-start',
                                                            maxWidth: '70%',
                                                            background: myMsg ? '#000' : '#fff',
                                                            color: myMsg ? '#fff' : '#000',
                                                            padding: '1rem',
                                                            borderRadius: '16px',
                                                            borderBottomRightRadius: myMsg ? '4px' : '16px',
                                                            borderBottomLeftRadius: !myMsg ? '4px' : '16px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                                        }}
                                                    >
                                                        <p style={{ lineHeight: 1.5, fontSize: '0.95rem' }}>{msg.content}</p>

                                                        {msg.attachment && (
                                                            <div style={{ marginTop: '0.75rem' }}>
                                                                {msg.attachment.endsWith('.pdf') ? (
                                                                    <a
                                                                        href={msg.attachment}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: myMsg ? 'rgba(255,255,255,0.1)' : '#f8f9fa', color: myMsg ? '#fff' : '#000', textDecoration: 'none' }}
                                                                    >
                                                                        <FileText size={20} />
                                                                        <span style={{ fontSize: '0.85rem' }}>{t('common.viewPdf')}</span>
                                                                    </a>
                                                                ) : (
                                                                    <img
                                                                        src={msg.attachment}
                                                                        alt="Anexo"
                                                                        style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '0.5rem', cursor: 'pointer' }}
                                                                        onClick={() => msg.attachment && window.open(msg.attachment, '_blank')}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}

                                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '8px', textAlign: 'right' }}>
                                                            {(() => {
                                                                const date = new Date(msg.createdAt);
                                                                const today = new Date();
                                                                const isToday = date.getDate() === today.getDate() &&
                                                                    date.getMonth() === today.getMonth() &&
                                                                    date.getFullYear() === today.getFullYear();

                                                                return isToday
                                                                    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                    : date.toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                                                            })()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input */}
                                        <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', background: '#fff', borderTop: '1px solid #eee' }}>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />

                                            {attachment && (
                                                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f8f9fa' }}>
                                                    {attachment.endsWith('.pdf') ? (
                                                        <FileText size={20} color="#ef4444" />
                                                    ) : (
                                                        <ImageIcon size={20} color="#10b981" />
                                                    )}
                                                    <span style={{ flex: 1, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {attachment.split('/').pop()}
                                                    </span>
                                                    <button
                                                        onClick={() => setAttachment(null)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingFile}
                                                    style={{ background: '#f8f9fa', color: '#666', border: '1px solid #ddd', width: isMobile ? '44px' : '50px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {uploadingFile ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={reply}
                                                    onChange={(e) => setReply(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                                    placeholder={isMobile ? "Escreva..." : t('support.typeYourReply')}
                                                    style={{ flex: 1, padding: isMobile ? '0.8rem' : '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', fontSize: isMobile ? '0.9rem' : '1rem' }}
                                                />
                                                <button
                                                    onClick={handleReply}
                                                    style={{ background: '#000', color: '#fff', border: 'none', width: isMobile ? '44px' : '50px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Send size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {view === 'list' && !selectedTicket && (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999', padding: '2rem', textAlign: 'center' }}>
                                        <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                        <p>Selecione um ticket ou abra um novo chamado para começar.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
