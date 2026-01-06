"use client";

import { useEffect, useState } from 'react';
import { authService, UserData } from '@/lib/authService';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, LogOut } from 'lucide-react';

export default function AdminDashboard() {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    if (!user) return null;

    const stats = [
        { label: 'Mentores Ativos', value: '12', icon: <Users size={24} />, color: '#FFD700' },
        { label: 'Formulários Criados', value: '48', icon: <FileText size={24} />, color: '#3182ce' },
        { label: 'Inscrições Aprovadas', value: '156', icon: <CheckCircle size={24} />, color: '#38a169' },
        { label: 'Crescimento Mensal', value: '+24%', icon: <TrendingUp size={24} />, color: '#805ad5' },
    ];

    return (
        <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '100px' }}>
            <Navbar />

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}
                        >
                            Olá, <span className="gold-text">{user.name}</span>
                        </motion.h1>
                        <p style={{ color: '#666' }}>Bem-vindo ao centro de comando da Inscreva-se</p>
                    </div>

                    <button
                        onClick={() => authService.logout()}
                        style={{ background: '#fff', border: '1px solid #ddd', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </header>

                <div className="grid">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="luxury-card"
                            style={{ background: '#fff', padding: '1.5rem', border: 'none' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ background: `${stat.color}15`, color: stat.color, padding: '0.8rem', borderRadius: '12px' }}>
                                    {stat.icon}
                                </div>
                                <span style={{ color: '#666', fontWeight: 500 }}>{stat.label}</span>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{stat.value}</h2>
                        </motion.div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="luxury-card"
                        style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: 'none' }}
                    >
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <FileText size={48} style={{ color: '#ddd', marginBottom: '1rem' }} />
                            <h3 style={{ color: '#999' }}>Lista de Formulários Recentes (Em breve)</h3>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
