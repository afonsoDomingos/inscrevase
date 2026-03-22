"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Calendar, UserCheck, UserMinus, ShieldCheck, Download, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import TableScrollWrapper from '../common/TableScrollWrapper';
import Tooltip from '../common/Tooltip';
import { useTranslate } from '@/context/LanguageContext';

interface Subscriber {
    _id: string;
    email: string;
    subscribedAt: string;
    status: 'active' | 'unsubscribed';
}

export default function NewsletterList() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useTranslate();

    const fetchSubscribers = async () => {
        try {
            const token = Cookies.get('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${API_URL}/newsletter/subscribers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscribers(response.data);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            toast.error(t('dashboard.adminNewsletter.messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Email', 'Data de Inscrição', 'Status'];
        const rows = filteredSubscribers.map(s => [
            s.email,
            new Date(s.subscribedAt).toLocaleDateString('pt-BR'),
            s.status === 'active' ? t('dashboard.adminNewsletter.status.active') : t('dashboard.adminNewsletter.status.unsubscribed')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 className="animate-spin" size={32} color="#FFD700" />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px', color: '#000' }}>{t('dashboard.adminNewsletter.title')}</h2>
                    <p style={{ color: '#333', fontWeight: 500 }}>{t('dashboard.adminNewsletter.subtitle')}</p>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder={t('dashboard.adminNewsletter.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #ddd', width: '250px', outline: 'none' }}
                        />
                    </div>
                    <button
                        onClick={exportToCSV}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#000', color: '#FFD700', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                        <Download size={18} /> {t('dashboard.adminNewsletter.export')}
                    </button>
                </div>
            </div>

            <TableScrollWrapper>
                <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '20px', fontWeight: 700, color: '#1a1a1a' }}>{t('dashboard.adminNewsletter.table.email')}</th>
                                <th style={{ padding: '20px', fontWeight: 700, color: '#1a1a1a' }}>{t('dashboard.adminNewsletter.table.date')}</th>
                                <th style={{ padding: '20px', fontWeight: 700, color: '#1a1a1a' }}>{t('dashboard.adminNewsletter.table.status')}</th>
                                <th style={{ padding: '20px', fontWeight: 700, color: '#1a1a1a' }}>{t('dashboard.adminNewsletter.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubscribers.length > 0 ? filteredSubscribers.map((subscriber) => (
                                <tr key={subscriber._id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Mail size={16} color="#64748b" />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{subscriber.email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px', color: '#666' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} />
                                            {new Date(subscriber.subscribedAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            background: subscriber.status === 'active' ? '#e6fffa' : '#fff5f5',
                                            color: subscriber.status === 'active' ? '#0694a2' : '#e02424',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}>
                                            {subscriber.status === 'active' ? <UserCheck size={12} /> : <UserMinus size={12} />}
                                            {subscriber.status === 'active' ? t('dashboard.adminNewsletter.status.active') : t('dashboard.adminNewsletter.status.unsubscribed')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <Tooltip content={t('dashboard.adminNewsletter.actions.sendIndividual')}>
                                            <button
                                                onClick={() => toast.info(t('dashboard.adminNewsletter.messages.funcSoon'))}
                                                style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', padding: '5px', borderRadius: '5px' }}
                                            >
                                                <ShieldCheck size={18} />
                                            </button>
                                        </Tooltip>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                        {t('common.noData')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </TableScrollWrapper>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                <p style={{ fontSize: '0.85rem', color: '#1a1a1a', fontWeight: 600 }}>{t('dashboard.adminNewsletter.stats.total', { count: subscribers.length })}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0694a2' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000' }}>{t('dashboard.adminNewsletter.stats.growth')}</span>
                </div>
            </div>
        </div>
    );
}
