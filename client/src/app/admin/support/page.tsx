"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    Trash2,
    Search,
    Mail,
    User,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';

interface SupportMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    response?: string;
    respondedAt?: string;
    createdAt: string;
}

interface Stats {
    total: number;
    pending: number;
    resolved: number;
    closed: number;
}

export default function SupportDashboard() {
    const { t } = useTranslate();
    const router = useRouter();
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, resolved: 0, closed: 0 });
    const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
    const [response, setResponse] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'closed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = filter === 'all'
                ? `${process.env.NEXT_PUBLIC_API_URL}/support/public/messages`
                : `${process.env.NEXT_PUBLIC_API_URL}/support/public/messages?status=${filter}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error(t('support.toasts.errorLoading'));

            const data = await res.json();
            setMessages(data.messages);
            setStats(data.stats);
        } catch (error) {
            toast.error(t('support.toasts.errorLoading'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filter, t]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleSendResponse = async () => {
        if (!selectedMessage || !response.trim()) {
            toast.error(t('support.toasts.enterResponse'));
            return;
        }

        try {
            setSending(true);
            const token = localStorage.getItem('token');

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/support/public/messages/${selectedMessage._id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: 'resolved',
                        response
                    })
                }
            );

            if (!res.ok) throw new Error(t('support.toasts.errorSending'));

            toast.success(t('support.toasts.responseSuccess'));
            setResponse('');
            setSelectedMessage(null);
            fetchMessages();
        } catch (error) {
            toast.error(t('support.toasts.errorSending'));
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('token');

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/support/public/messages/${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            if (!res.ok) throw new Error(t('support.toasts.errorUpdating'));

            toast.success(t('support.toasts.statusUpdated'));
            fetchMessages();
        } catch (error) {
            toast.error(t('support.toasts.errorUpdating'));
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('support.toasts.deleteConfirm'))) return;

        try {
            const token = localStorage.getItem('token');

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/support/public/messages/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) throw new Error(t('support.toasts.errorDeleting'));

            toast.success(t('support.toasts.deleteSuccess'));
            setSelectedMessage(null);
            fetchMessages();
        } catch (error) {
            toast.error(t('support.toasts.errorDeleting'));
            console.error(error);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'resolved': return '#10b981';
            case 'closed': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'resolved': return <CheckCircle size={16} />;
            case 'closed': return <XCircle size={16} />;
            default: return <MessageSquare size={16} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '24px' }}>
            {/* Header */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                        {t('support.adminSupportMessages')}
                    </h1>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: t('support.stats.total'), value: stats.total, color: '#3b82f6', icon: <MessageSquare /> },
                        { label: t('support.stats.pending'), value: stats.pending, color: '#f59e0b', icon: <Clock /> },
                        { label: t('support.stats.resolved'), value: stats.resolved, color: '#10b981', icon: <CheckCircle /> },
                        { label: t('support.stats.closed'), value: stats.closed, color: '#6b7280', icon: <XCircle /> }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: '#fff',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <div style={{
                                background: `${stat.color}15`,
                                color: stat.color,
                                padding: '12px',
                                borderRadius: '10px',
                                display: 'flex'
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder={t('support.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                outline: 'none'
                            }}
                        />
                    </div>
                    {['all', 'pending', 'resolved', 'closed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as 'all' | 'pending' | 'resolved' | 'closed')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: filter === f ? 'none' : '1px solid #e5e7eb',
                                background: filter === f ? '#171A20' : '#fff',
                                color: filter === f ? '#fff' : '#171A20',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}
                        >
                            {f === 'all' ? t('categories.all') : f === 'pending' ? t('support.stats.pending') : f === 'resolved' ? t('support.stats.resolved') : t('support.stats.closed')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 1fr' : '1fr', gap: '24px' }}>
                {/* Messages List */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                            {t('common.loading')}
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                            {t('support.noMessages')}
                        </div>
                    ) : (
                        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {filteredMessages.map((msg) => (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setSelectedMessage(msg)}
                                    style={{
                                        padding: '16px',
                                        borderBottom: '1px solid #f3f4f6',
                                        cursor: 'pointer',
                                        background: selectedMessage?._id === msg._id ? '#f9fafb' : '#fff',
                                        transition: 'background 0.2s'
                                    }}
                                    whileHover={{ background: '#f9fafb' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{msg.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Mail size={14} />
                                                {msg.email}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: `${getStatusColor(msg.status)}15`,
                                            color: getStatusColor(msg.status),
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {getStatusIcon(msg.status)}
                                            {msg.status === 'pending' ? t('support.stats.pending') : msg.status === 'resolved' ? t('support.stats.resolved') : t('support.stats.closed')}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.9rem' }}>{msg.subject}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {msg.message}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} />
                                        {new Date(msg.createdAt).toLocaleString('pt-BR')}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                <AnimatePresence>
                    {selectedMessage && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{
                                background: '#fff',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '24px',
                                maxHeight: '70vh',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
                                            {selectedMessage.subject}
                                        </h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem', color: '#6b7280' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <User size={14} />
                                                {selectedMessage.name}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Mail size={14} />
                                                {selectedMessage.email}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(selectedMessage._id)}
                                        style={{
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            border: 'none',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>{t('support.messageLabel')}</div>
                                    <div style={{ lineHeight: 1.6 }}>{selectedMessage.message}</div>
                                </div>

                                {selectedMessage.response && (
                                    <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '8px', fontWeight: 600 }}>
                                            {t('support.responseSent')}
                                        </div>
                                        <div style={{ lineHeight: 1.6 }}>{selectedMessage.response}</div>
                                        {selectedMessage.respondedAt && (
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>
                                                {new Date(selectedMessage.respondedAt).toLocaleString('pt-BR')}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                    {['pending', 'resolved', 'closed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedMessage._id, status)}
                                            disabled={selectedMessage.status === status}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: selectedMessage.status === status ? 'none' : '1px solid #e5e7eb',
                                                background: selectedMessage.status === status ? getStatusColor(status) : '#fff',
                                                color: selectedMessage.status === status ? '#fff' : '#171A20',
                                                cursor: selectedMessage.status === status ? 'default' : 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                opacity: selectedMessage.status === status ? 1 : 0.7
                                            }}
                                        >
                                            {status === 'pending' ? t('support.stats.pending') : status === 'resolved' ? t('support.stats.resolved') : t('support.stats.closed')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Response Form */}
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
                                    {t('support.sendResponseEmail')}
                                </label>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder={t('support.typeResponsePlaceholder')}
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        marginBottom: '12px'
                                    }}
                                />
                                <button
                                    onClick={handleSendResponse}
                                    disabled={sending || !response.trim()}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: sending || !response.trim() ? '#9ca3af' : '#10b981',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: sending || !response.trim() ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Send size={18} />
                                    {sending ? t('supportPage.sending') : t('support.sendResponseButton')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
