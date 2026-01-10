import { useState, useEffect } from 'react';
import { notificationService, NotificationModel } from '@/lib/notificationService';
import { Bell, Check, ExternalLink, Mail, Clock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface NotificationCenterProps {
    onClose?: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<NotificationModel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getMyNotifications();
            setNotifications(data);
        } catch (_error) {
            console.error('Error loading notifications:', _error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch {
            toast.error('Erro ao marcar como lida');
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{
            width: '400px',
            maxHeight: '600px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #eee'
        }}>
            <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to right, #000, #1a1a1a)',
                color: '#fff'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={20} className="gold-text" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Notificações</h3>
                    {unreadCount > 0 && (
                        <span style={{
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: 900
                        }}>
                            {unreadCount} NOVAS
                        </span>
                    )}
                </div>
                {onClose && (
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}>
                        &times;
                    </button>
                )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="custom-scrollbar">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Carregandou...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <Mail size={48} style={{ color: '#eee', marginBottom: '1rem' }} />
                        <p style={{ color: '#999', margin: 0 }}>Você não tem notificações</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    padding: '1.2rem',
                                    borderRadius: '15px',
                                    background: notification.read ? '#fff' : 'rgba(255,215,0,0.05)',
                                    border: notification.read ? '1px solid #eee' : '1px solid rgba(255,215,0,0.2)',
                                    position: 'relative',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFD700',
                                        flexShrink: 0
                                    }}>
                                        {notification.type === 'welcome' ? <Bell size={18} /> : <MessageSquare size={18} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1a1a1a' }}>{notification.title}</h4>
                                            <span style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> {format(new Date(notification.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                                            {notification.content}
                                        </p>

                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#B8860B',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <Check size={14} /> Marcar como lida
                                                </button>
                                            )}
                                            {notification.actionUrl && (
                                                <a
                                                    href={notification.actionUrl}
                                                    style={{
                                                        color: '#000',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        textDecoration: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <ExternalLink size={14} /> Ver detalhes
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid #eee', textAlign: 'center', background: '#fcfcfc' }}>
                <button onClick={loadNotifications} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    Atualizar lista
                </button>
            </div>
        </div>
    );
}
