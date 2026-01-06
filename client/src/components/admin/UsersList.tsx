"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import { Trash2, UserX, UserCheck, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsersList() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
            await userService.updateUser(user.id || (user as any)._id, { status: newStatus });
            loadUsers();
        } catch (error: unknown) {
            console.error(error);
            alert('Erro ao atualizar status');
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
                            <th style={{ padding: '1rem', color: '#666' }}>Cargo</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Plano</th>
                            <th style={{ padding: '1rem', color: '#666' }}>Status</th>
                            <th style={{ padding: '1rem', color: '#666', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <motion.tr
                                layout
                                key={user.id || (user as any)._id}
                                style={{ borderBottom: '1px solid #f9f9f9' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
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
                                    <span style={{ fontWeight: 500, color: user.plan === 'premium' ? '#38a169' : '#666' }}>
                                        {user.plan === 'premium' ? 'Premium' : 'Grátis'}
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
                                            onClick={() => handleToggleStatus(user)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: user.status === 'active' ? '#e53e3e' : '#38a169' }}
                                            title={user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                                        >
                                            {user.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id || (user as any)._id)}
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
        </div>
    );
}
