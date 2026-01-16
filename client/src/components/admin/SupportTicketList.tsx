/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { supportService, Ticket } from '@/lib/supportService';
import { toast } from 'sonner';
import { MessageSquare, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import SupportModal from '../mentor/SupportModal';

export default function SupportTicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all');

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await supportService.getAllTickets();
            setTickets(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleTicketClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'all') return true;
        return ticket.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#f59e0b';
            case 'answered': return '#10b981';
            case 'closed': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Aberto';
            case 'answered': return 'Respondido';
            case 'closed': return 'Fechado';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <Clock size={16} />;
            case 'answered': return <CheckCircle size={16} />;
            case 'closed': return <XCircle size={16} />;
            default: return <MessageSquare size={16} />;
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Central de Suporte</h1>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'open', 'answered', 'closed'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: filter === status ? '2px solid #FFD700' : '1px solid #ddd',
                                background: filter === status ? '#fff' : 'transparent',
                                cursor: 'pointer',
                                fontWeight: filter === status ? 600 : 400,
                                textTransform: 'capitalize'
                            }}
                        >
                            {status === 'all' ? 'Todos' : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando...</div>
            ) : filteredTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                    <MessageSquare size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                    <p>Nenhum ticket encontrado</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredTickets.map(ticket => (
                        <div
                            key={ticket._id}
                            onClick={() => handleTicketClick(ticket)}
                            style={{
                                background: '#fff',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid #eee',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {ticket.subject}
                                    </h3>
                                    {ticket.user && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                                            <User size={14} />
                                            <span>{ticket.user.name}</span>
                                            <span>•</span>
                                            <span>{ticket.user.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '20px', background: getStatusColor(ticket.status) + '20', color: getStatusColor(ticket.status), fontSize: '0.85rem', fontWeight: 600 }}>
                                    {getStatusIcon(ticket.status)}
                                    {getStatusLabel(ticket.status)}
                                </div>
                            </div>

                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                                {ticket.messages[0]?.content.substring(0, 150)}
                                {ticket.messages[0]?.content.length > 150 ? '...' : ''}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#999' }}>
                                <span>{ticket.messages.length} mensagem{ticket.messages.length !== 1 ? 's' : ''}</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')} às {new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedTicket && (
                <SupportModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTicket(null);
                        loadTickets(); // Reload to get updated data
                    }}
                    mode="admin"
                    initialTicket={selectedTicket}
                />
            )}
        </div>
    );
}
