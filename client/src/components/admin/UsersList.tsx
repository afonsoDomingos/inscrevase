"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import { Trash2, UserX, UserCheck, Search, Pencil, Linkedin, Mail, Lock, Unlock, MessageSquare, BadgeCheck, XOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import EditUserModal from './EditUserModal';
import PremiumBadge from '../common/PremiumBadge';
import { useSocket } from '@/context/SocketContext';

interface UsersListProps {
    onMessageUser?: (user: UserData) => void;
}

export default function UsersList({ onMessageUser }: UsersListProps) {
    const [users, setUsers] = useState<UserData[]>([]);
    const { onlineUsers } = useSocket();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Filters State
    const [filterOrigin, setFilterOrigin] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterVerified, setFilterVerified] = useState('all');
    const [filterOnline, setFilterOnline] = useState('all');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error: unknown) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: UserData) => {
        try {
            const newStatus = user.status === 'active' ? 'blocked' : 'active';
            await userService.updateUser(user.id || user._id || '', { status: newStatus });
            loadUsers();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao atualizar status');
        }
    };

    const handleToggleEvents = async (user: UserData) => {
        try {
            const newValue = user.canCreateEvents !== false ? false : true;
            await userService.updateUser(user.id || user._id || '', { canCreateEvents: newValue });
            loadUsers();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao atualizar permissão de eventos');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) return;
        try {
            await userService.deleteUser(id);
            loadUsers();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao excluir usuário');
        }
    };

    const handleVerify = async (user: UserData, approve: boolean) => {
        try {
            await userService.updateUser(user.id || user._id || '', {
                isVerified: approve,
                verificationStatus: approve ? 'verified' : (user.isVerified ? 'none' : 'rejected')
            });
            loadUsers();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao atualizar verificação');
        }
    };

    const filteredUsers = (users || []).filter(u => {
        const matchesSearch = u && u.name && u.email && (
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!matchesSearch) return false;

        if (filterOrigin !== 'all') {
            if (filterOrigin === 'native' && u.authProvider && u.authProvider !== 'native') return false;
            if (filterOrigin !== 'native' && u.authProvider !== filterOrigin) return false;
        }

        if (filterRole !== 'all') {
            if (u.role?.toLowerCase() !== filterRole.toLowerCase()) return false;
        }

        if (filterStatus !== 'all') {
            if (u.status !== filterStatus) return false;
        }

        if (filterVerified !== 'all') {
            if (filterVerified === 'verified' && !u.isVerified) return false;
            if (filterVerified === 'pending' && u.verificationStatus !== 'pending') return false;
            if (filterVerified === 'unverified' && (u.isVerified || u.verificationStatus === 'pending')) return false;
        }

        if (filterOnline !== 'all') {
            const isOnline = onlineUsers.includes(u.id || u._id || '');
            if (filterOnline === 'online' && !isOnline) return false;
            if (filterOnline === 'offline' && isOnline) return false;
        }

        return true;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando usuários...</div>;

    return (
        <div className="luxury-card" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gestão de Usuários</h3>
                <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                <select
                    value={filterOrigin}
                    onChange={(e) => setFilterOrigin(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none', color: '#555', background: '#fff' }}
                >
                    <option value="all">Todas Origens</option>
                    <option value="google">Google</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="native">E-mail Nativo</option>
                </select>

                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none', color: '#555', background: '#fff' }}
                >
                    <option value="all">Todos Cargos</option>
                    <option value="mentor">Mentor</option>
                    <option value="participant">Participante</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none', color: '#555', background: '#fff' }}
                >
                    <option value="all">Todos Status</option>
                    <option value="active">Ativo</option>
                    <option value="blocked">Bloqueado</option>
                </select>

                <select
                    value={filterVerified}
                    onChange={(e) => setFilterVerified(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none', color: '#555', background: '#fff' }}
                >
                    <option value="all">Verificação</option>
                    <option value="verified">Verificados</option>
                    <option value="pending">Pendentes</option>
                    <option value="unverified">Não Verificados</option>
                </select>

                <select
                    value={filterOnline}
                    onChange={(e) => setFilterOnline(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none', color: '#555', background: '#fff' }}
                >
                    <option value="all">Online/Offline</option>
                    <option value="online">Online Agora</option>
                    <option value="offline">Offline</option>
                </select>

                {(filterOrigin !== 'all' || filterRole !== 'all' || filterStatus !== 'all' || filterVerified !== 'all' || filterOnline !== 'all') && (
                    <button
                        onClick={() => {
                            setFilterOrigin('all');
                            setFilterRole('all');
                            setFilterStatus('all');
                            setFilterVerified('all');
                            setFilterOnline('all');
                            setSearchTerm('');
                        }}
                        style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: '#f5f5f5', color: '#666', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Limpar Filtros
                    </button>
                )}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1rem', color: '#666' }}>Nome</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Origem</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Cargo</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Plano</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Visibilidade</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Status</th>
                            <th style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>Online</th>
                            <th style={{ padding: '1rem', color: '#666', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((user) => (
                            <motion.tr
                                layout
                                key={user.id || user._id}
                                style={{ borderBottom: '1px solid #f9f9f9' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {user.name}
                                        {user.isVerified && <PremiumBadge type="verified" size="sm" showLabel={false} />}
                                        {user.verificationStatus === 'pending' && <PremiumBadge type="pending" size="sm" showLabel={false} />}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {user.authProvider === 'linkedin' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0077b5', fontSize: '0.8rem', fontWeight: 600 }}>
                                            <Linkedin size={14} /> LinkedIn
                                        </div>
                                    )}
                                    {user.authProvider === 'google' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#db4437', fontSize: '0.8rem', fontWeight: 600 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg> Google
                                        </div>
                                    )}
                                    {(user.authProvider === 'native' || !user.authProvider) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.8rem', fontWeight: 600 }}>
                                            <Mail size={14} /> E-mail
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <PremiumBadge
                                        type={
                                            user.role === 'SuperAdmin' ? 'superadmin' :
                                                user.role === 'admin' ? 'admin' :
                                                    user.role === 'mentor' ? 'mentor' : 'participant'
                                        }
                                        size="sm"
                                    />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <PremiumBadge type={(user.plan || 'free') as 'free' | 'pro' | 'enterprise'} size="sm" />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '6px',
                                        background: user.isPublic ? '#e6fffa' : '#fff5f5',
                                        color: user.isPublic ? '#2c7a7b' : '#c53030',
                                        border: `1px solid ${user.isPublic ? '#b2f5ea' : '#fed7d7'}`
                                    }}>
                                        {user.isPublic ? 'Publicado' : 'Privado'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.status === 'active' ? '#38a169' : '#e53e3e' }}></div>
                                        <span style={{ fontSize: '0.85rem' }}>{user.status === 'active' ? 'Ativo' : 'Bloqueado'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {onlineUsers.includes(user.id || user._id || '') ? (
                                        <span style={{ color: '#38a169', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0fff4', padding: '2px 8px', borderRadius: '12px', border: '1px solid #c6f6d5' }}>
                                            <span style={{ width: '8px', height: '8px', background: '#38a169', borderRadius: '50%', display: 'inline-block' }}></span>
                                            ON
                                        </span>
                                    ) : (
                                        <span style={{ color: '#cbd5e0', fontSize: '0.8rem', fontWeight: 500 }}>OFF</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        {/* Verification Controls */}
                                        {user.verificationStatus === 'pending' ? (
                                            <>
                                                <button onClick={() => handleVerify(user, true)} title="Aprovar Verificação" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38a169' }}>
                                                    <BadgeCheck size={18} />
                                                </button>
                                                <button onClick={() => handleVerify(user, false)} title="Rejeitar Solicitação" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}>
                                                    <XOctagon size={18} />
                                                </button>
                                            </>
                                        ) : user.isVerified ? (
                                            <button onClick={() => handleVerify(user, false)} title="Remover Verificação" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1877F2' }}>
                                                <BadgeCheck size={18} fill="#e2e8f0" />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleVerify(user, true)} title="Verificar Manualmente" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e0' }}>
                                                <BadgeCheck size={18} />
                                            </button>
                                        )}

                                        {onMessageUser && (
                                            <button
                                                onClick={() => onMessageUser(user)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B8860B' }}
                                                title="Enviar Mensagem"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggleEvents(user)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: user.canCreateEvents !== false ? '#38a169' : '#e53e3e' }}
                                            title={user.canCreateEvents !== false ? 'Bloquear Criação de Eventos' : 'Habilitar Criação de Eventos'}
                                        >
                                            {user.canCreateEvents !== false ? <Lock size={18} /> : <Unlock size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: user.status === 'active' ? '#e53e3e' : '#38a169' }}
                                            title={user.status === 'active' ? 'Bloquear Usuário' : 'Desbloquear Usuário'}
                                        >
                                            {user.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingUser(user);
                                                setIsEditModalOpen(true);
                                            }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3182ce' }}
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id || user._id || '')}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                <div>
                    Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuários
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            background: currentPage === 1 ? '#f5f5f5' : '#fff',
                            color: currentPage === 1 ? '#aaa' : '#333',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Anterior
                    </button>
                    {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: currentPage === i + 1 ? 'none' : '1px solid #ddd',
                                borderRadius: '6px',
                                background: currentPage === i + 1 ? '#FFD700' : '#fff',
                                color: currentPage === i + 1 ? '#000' : '#333',
                                fontWeight: currentPage === i + 1 ? 700 : 400,
                                cursor: 'pointer'
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}
                        disabled={indexOfLastItem >= filteredUsers.length}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            background: indexOfLastItem >= filteredUsers.length ? '#f5f5f5' : '#fff',
                            color: indexOfLastItem >= filteredUsers.length ? '#aaa' : '#333',
                            cursor: indexOfLastItem >= filteredUsers.length ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Próximo
                    </button>
                </div>
            </div>
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={editingUser}
                onSuccess={() => {
                    loadUsers();
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    );
}
