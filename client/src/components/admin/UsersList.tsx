"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import { Trash2, UserX, UserCheck, Search, Pencil, Linkedin, Chrome, Mail, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import EditUserModal from './EditUserModal';

export default function UsersList() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            <th style={{ padding: '1rem', color: '#666', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <motion.tr
                                layout
                                key={user.id || user._id}
                                style={{ borderBottom: '1px solid #f9f9f9' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
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
                                            <Chrome size={14} /> Google
                                        </div>
                                    )}
                                    {(user.authProvider === 'native' || !user.authProvider) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.8rem', fontWeight: 600 }}>
                                            <Mail size={14} /> E-mail
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: user.role === 'SuperAdmin' ? '#000' : (user.role === 'admin' ? '#FFD70015' : '#eee'),
                                        color: user.role === 'SuperAdmin' ? '#FFD700' : (user.role === 'admin' ? '#B8860B' : '#666')
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ fontWeight: 500, color: user.plan !== 'free' ? '#D4AF37' : '#666' }}>
                                        {user.plan === 'enterprise' ? 'Enterprise' : (user.plan === 'pro' ? 'Pro' : 'Grátis')}
                                    </span>
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
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
