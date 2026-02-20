"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, Megaphone, AlertCircle, User, Sparkles, ExternalLink, BellOff } from 'lucide-react';
import { notificationService, NotificationModel } from '@/lib/notificationService';
import Cookies from 'js-cookie';
import Link from 'next/link';

const POLL_INTERVAL = 30000; // 30 seconds polling

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora mesmo';
    if (mins < 60) return `${mins}m atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d atrás`;
    return new Date(dateStr).toLocaleDateString('pt-PT');
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'announcement': return <Megaphone size={14} />;
        case 'alert': return <AlertCircle size={14} />;
        case 'personal': return <User size={14} />;
        case 'welcome': return <Sparkles size={14} />;
        default: return <Bell size={14} />;
    }
}

function getTypeColor(type: string): string {
    switch (type) {
        case 'announcement': return '#3b82f6';
        case 'alert': return '#ef4444';
        case 'personal': return '#8b5cf6';
        case 'welcome': return '#f59e0b';
        default: return '#D4AF37';
    }
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationModel[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const token = Cookies.get('token');
        setIsLoggedIn(!!token);
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await notificationService.getUnreadCount();
            setUnreadCount(data.count);
        } catch {
            // silently fail
        }
    }, []);

    // Poll for unread count
    useEffect(() => {
        if (!isLoggedIn) return;
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [isLoggedIn, fetchUnreadCount]);

    // Load notifications when opened
    const loadNotifications = useCallback(async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const data = await notificationService.getMyNotifications();
            setNotifications(data);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (open) loadNotifications();
    }, [open, loadNotifications]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                bellRef.current && !bellRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleMarkRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // silently fail
        }
    };

    const handleMarkAllRead = async () => {
        const unread = notifications.filter(n => !n.read);
        await Promise.all(unread.map(n => notificationService.markAsRead(n._id)));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    if (!isLoggedIn) return null;

    return (
        <div style={{ position: 'relative' }}>
            {/* Bell Button */}
            <button
                ref={bellRef}
                onClick={() => setOpen(!open)}
                aria-label="Notificações"
                id="notification-bell-button"
                style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#FFD700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    padding: 0,
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.3) rotate(15deg)';
                    (e.currentTarget as HTMLButtonElement).style.filter = 'drop-shadow(0 0 10px rgba(255,215,0,0.8))';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLButtonElement).style.filter = 'none';
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid transparent',
                        animation: 'pulse 2s infinite',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div
                    ref={panelRef}
                    id="notification-panel"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 12px)',
                        right: '-20px',
                        width: '380px',
                        maxHeight: '520px',
                        background: '#fff',
                        borderRadius: '20px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
                        border: '1px solid rgba(212,175,55,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        animation: 'slideDown 0.2s ease',
                        zIndex: 10000,
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.2rem 1.5rem',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                background: 'rgba(255,215,0,0.15)',
                                borderRadius: '10px',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Bell size={16} color="#FFD700" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                                    Notificações
                                </p>
                                {unreadCount > 0 && (
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                                        {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    title="Marcar todas como lidas"
                                    style={{
                                        background: 'rgba(255,215,0,0.1)',
                                        border: '1px solid rgba(255,215,0,0.2)',
                                        borderRadius: '8px',
                                        padding: '0.4rem 0.6rem',
                                        cursor: 'pointer',
                                        color: '#FFD700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    <CheckCheck size={13} />
                                    Todas lidas
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.4rem',
                                    cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.6)',
                                    display: 'flex',
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ overflowY: 'auto', flex: 1, maxHeight: '400px' }}>
                        {loading ? (
                            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    border: '3px solid #f0f0f0',
                                    borderTop: '3px solid #D4AF37',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    margin: '0 auto 1rem',
                                }} />
                                <p style={{ color: '#999', fontSize: '0.8rem', margin: 0 }}>A carregar...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    background: '#f8f9fa',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                }}>
                                    <BellOff size={24} color="#ccc" />
                                </div>
                                <p style={{ color: '#999', fontWeight: 700, margin: '0 0 0.25rem' }}>Tudo em dia!</p>
                                <p style={{ color: '#bbb', fontSize: '0.8rem', margin: 0 }}>Ainda não tens notificações</p>
                            </div>
                        ) : (
                            notifications.map((notif, index) => (
                                <div
                                    key={notif._id}
                                    style={{
                                        display: 'flex',
                                        gap: '0.9rem',
                                        padding: '1rem 1.25rem',
                                        borderBottom: index < notifications.length - 1 ? '1px solid #f8f9fa' : 'none',
                                        background: notif.read ? '#fff' : 'rgba(212,175,55,0.04)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        alignItems: 'flex-start',
                                        position: 'relative',
                                    }}
                                    onClick={() => !notif.read && handleMarkRead(notif._id)}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                                    onMouseLeave={e => (e.currentTarget.style.background = notif.read ? '#fff' : 'rgba(212,175,55,0.04)')}
                                >
                                    {/* Unread dot */}
                                    {!notif.read && (
                                        <div style={{
                                            position: 'absolute', top: '1.1rem', right: '1.1rem',
                                            width: '6px', height: '6px',
                                            borderRadius: '50%',
                                            background: '#ef4444',
                                        }} />
                                    )}

                                    {/* Icon */}
                                    <div style={{
                                        width: '36px', height: '36px',
                                        borderRadius: '10px',
                                        background: `${getTypeColor(notif.type)}18`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                        color: getTypeColor(notif.type),
                                    }}>
                                        {notif.sender?.profilePhoto ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={notif.sender.profilePhoto}
                                                alt={notif.sender.name}
                                                style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }}
                                            />
                                        ) : getTypeIcon(notif.type)}
                                    </div>

                                    {/* Text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: '0 0 0.2rem',
                                            fontWeight: notif.read ? 600 : 800,
                                            fontSize: '0.82rem',
                                            color: '#1a1a1a',
                                            lineHeight: 1.3,
                                            paddingRight: '0.5rem',
                                        }}>
                                            {notif.title}
                                        </p>
                                        <p style={{
                                            margin: '0 0 0.4rem',
                                            fontSize: '0.75rem',
                                            color: '#666',
                                            lineHeight: 1.4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {notif.content}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.65rem', color: '#bbb', fontWeight: 600 }}>
                                                {timeAgo(notif.createdAt)}
                                            </span>
                                            {notif.actionUrl && (
                                                <Link
                                                    href={notif.actionUrl}
                                                    onClick={() => { setOpen(false); if (!notif.read) handleMarkRead(notif._id); }}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '2px',
                                                        fontSize: '0.65rem', color: '#D4AF37', fontWeight: 700,
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    Ver <ExternalLink size={9} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div style={{
                            padding: '0.9rem 1.25rem',
                            borderTop: '1px solid #f0f0f0',
                            textAlign: 'center',
                        }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#bbb' }}>
                                {notifications.length} notificação{notifications.length !== 1 ? 'ões' : ''} no total
                            </p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
