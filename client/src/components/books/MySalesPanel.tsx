/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { bookService } from '@/lib/bookService';
import { BookModel } from '@/lib/bookService';
import { 
    TrendingUp, 
    DollarSign, 
    ShoppingBag, 
    Users, 
    ChevronDown,
    ChevronUp,
    Loader2,
    BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SalesByBook {
    book: BookModel;
    sales: number;
    revenue: number;
    buyers: Array<{ name: string; email: string; date: string }>;
}

interface SalesData {
    totalSales: number;
    totalRevenue: string;
    salesByBook: SalesByBook[];
}

export default function MySalesPanel() {
    const [data, setData] = useState<SalesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedBook, setExpandedBook] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        bookService.getMySales()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 className="animate-spin" size={40} color="#D4AF37" />
        </div>
    );

    if (!data || data.totalSales === 0) return (
        <div style={{
            padding: '5rem 2rem',
            background: 'var(--paper)',
            borderRadius: '24px',
            textAlign: 'center',
            border: '1px dashed var(--border)'
        }}>
            <ShoppingBag size={60} color="#D4AF37" style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>Ainda sem vendas</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
                Submete o teu livro e começa a vender!
            </p>
            <button
                onClick={() => router.push('/books')}
                className="btn-primary"
                style={{ padding: '12px 30px', borderRadius: '50px' }}
            >
                Ir para Livros
            </button>
        </div>
    );

    return (
        <div>
            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {[
                    {
                        icon: <ShoppingBag size={24} color="#D4AF37" />,
                        label: 'Total de Vendas',
                        value: data.totalSales,
                        bg: 'rgba(212,175,55,0.08)'
                    },
                    {
                        icon: <DollarSign size={24} color="#22c55e" />,
                        label: 'Receita Total',
                        value: `$${data.totalRevenue}`,
                        bg: 'rgba(34,197,94,0.08)'
                    },
                    {
                        icon: <BookOpen size={24} color="#3b82f6" />,
                        label: 'Livros Publicados',
                        value: data.salesByBook.length,
                        bg: 'rgba(59,130,246,0.08)'
                    },
                    {
                        icon: <TrendingUp size={24} color="#a855f7" />,
                        label: 'Ticket Médio',
                        value: data.totalSales > 0 ? `$${(parseFloat(data.totalRevenue) / data.totalSales).toFixed(2)}` : '$0',
                        bg: 'rgba(168,85,247,0.08)'
                    }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                            background: stat.bg,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid var(--border)'
                        }}
                    >
                        <div style={{ marginBottom: '1rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--foreground)' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Sales by Book */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#D4AF37" /> Detalhes por Livro
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.salesByBook.map((item) => (
                    <div
                        key={item.book._id}
                        style={{
                            background: 'var(--paper)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Book Row */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.25rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => setExpandedBook(expandedBook === item.book._id ? null : item.book._id)}
                        >
                            <img
                                src={item.book.coverImage || '/placeholder.png'}
                                alt={item.book.title}
                                style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.book.title}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>por {item.book.author}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--foreground)' }}>{item.sales}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Vendas</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#22c55e' }}>${item.revenue.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Receita</div>
                                </div>
                                {expandedBook === item.book._id ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
                            </div>
                        </div>

                        {/* Buyers list (expandable) */}
                        {expandedBook === item.book._id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem' }}
                            >
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Compradores
                                </div>
                                {item.buyers.map((buyer, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.6rem 0',
                                        borderBottom: idx < item.buyers.length - 1 ? '1px solid var(--border)' : 'none',
                                        fontSize: '0.9rem'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{buyer.name}</span>
                                            <span style={{ color: '#888', marginLeft: '8px' }}>{buyer.email}</span>
                                        </div>
                                        <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                            {new Date(buyer.date).toLocaleDateString('pt-PT')}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
