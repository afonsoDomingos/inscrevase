/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, Send, Loader2, LifeBuoy, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supportService, Ticket } from '@/lib/supportService';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'user' | 'admin';
}

export default function SupportModal({ isOpen, onClose, mode = 'user' }: SupportModalProps) {
    const [view, setView] = useState<'list' | 'new' | 'chat'>('list');
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    // New Ticket State
    const [subject, setSubject] = useState('');
    const [initialMessage, setInitialMessage] = useState('');

    // Chat State
    const [reply, setReply] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadTickets();
        }
    }, [isOpen]);

    useEffect(() => {
        if (view === 'chat') {
            scrollToBottom();
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
            await supportService.createTicket(subject, initialMessage, attachment || undefined);
            toast.success('Ticket criado com sucesso!');
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
                        maxWidth: '900px',
                        background: '#fff',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        height: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#000', color: '#FFD700', padding: '8px', borderRadius: '8px' }}>
                                <LifeBuoy size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                    {mode === 'admin' ? 'Central de Suporte (Admin)' : 'Suporte & Ajuda'}
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {mode === 'admin' ? 'Gerencie os chamados dos mentores' : 'Fale diretamente com nossa equipe'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', overflow: 'hidden' }}>
                        {/* Sidebar */}
                        <div style={{ background: '#f8f9fa', borderRight: '1px solid #eee', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            {mode === 'user' && (
                                <button
                                    onClick={() => { setView('new'); setSelectedTicket(null); }}
                                    className="btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem', borderRadius: '12px', marginBottom: '2rem', width: '100%' }}
                                >
                                    <Plus size={18} /> Novo Ticket
                                </button>
                            )}

                            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#999', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                {mode === 'admin' ? 'Todos os Tickets' : 'Seus Tickets'}
                            </h3>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {loading && view === 'list' ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>
                                ) : tickets.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginTop: '2rem' }}>Nenhum ticket encontrado.</p>
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
                                            {mode === 'admin' && ticket.user && (
                                                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Por: {ticket.user.name || 'Mentor'}</div>
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
                                                    {ticket.status === 'open' ? 'Aberto' : (ticket.status === 'answered' ? 'Respondido' : 'Fechado')}
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

                        {/* Main Content */}
                        <div style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
                            {view === 'new' && (
                                <div style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Abrir novo chamado</h2>
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Assunto</label>
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="Resumo do problema"
                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Mensagem</label>
                                            <textarea
                                                rows={6}
                                                value={initialMessage}
                                                onChange={(e) => setInitialMessage(e.target.value)}
                                                placeholder="Descreva detalhadamente sua dúvida ou problema..."
                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', resize: 'none' }}
                                            />
                                        </div>

                                        {/* File Attachment */}
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Anexo (Opcional)</label>
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
                                                        <><Loader2 className="animate-spin" size={18} /> Enviando...</>
                                                    ) : (
                                                        <><Paperclip size={18} /> Anexar imagem ou PDF</>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleCreateTicket}
                                            disabled={loading}
                                            className="btn-primary"
                                            style={{ padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1rem' }}
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <>Enviar Solicitação <Send size={18} /></>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'chat' && selectedTicket && (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    {/* Chat Header */}
                                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', background: '#fff' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedTicket.subject}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                            Ticket #{selectedTicket._id.slice(-6)}
                                            {selectedTicket.user && mode === 'admin' && ` • ${selectedTicket.user.name}`}
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8f9fa' }}>
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
                                                                    <span style={{ fontSize: '0.85rem' }}>Ver PDF</span>
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
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div style={{ padding: '1.5rem', background: '#fff', borderTop: '1px solid #eee' }}>
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

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingFile}
                                                style={{ background: '#f8f9fa', color: '#666', border: '1px solid #ddd', width: '50px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                {uploadingFile ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                                            </button>
                                            <input
                                                type="text"
                                                value={reply}
                                                onChange={(e) => setReply(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                                placeholder="Digite sua resposta..."
                                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
                                            />
                                            <button
                                                onClick={handleReply}
                                                style={{ background: '#000', color: '#fff', border: 'none', width: '50px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {view === 'list' && !selectedTicket && (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>Selecione um ticket ou abra um novo chamado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
