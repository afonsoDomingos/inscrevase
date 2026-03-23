/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book,
    ShoppingCart,
    Star,
    ArrowRight,
    Search,
    Filter,
    Loader2,
    ExternalLink,
    TrendingUp,
    Library
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookService, BookModel } from '@/lib/bookService';
import { toast } from 'sonner';

export default function BooksPage() {
    const [books, setBooks] = useState<BookModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await bookService.getAllBooks();
                setBooks(data);
            } catch (error) {
                console.error(error);
                toast.error('Erro ao carregar livros');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const categories = ['Todos', ...Array.from(new Set(books.map(b => b.category)))];

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || book.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleBookClick = async (book: BookModel) => {
        try {
            await bookService.recordClick(book._id);
            window.open(book.affiliateLink, '_blank');
        } catch (error) {
            window.open(book.affiliateLink, '_blank');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{ 
                padding: '120px 20px 80px', 
                textAlign: 'center',
                background: 'radial-gradient(circle at top, rgba(212, 175, 55, 0.08) 0%, transparent 70%)'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: 'rgba(212, 175, 55, 0.1)', 
                        padding: '8px 16px', 
                        borderRadius: '20px',
                        color: '#D4AF37',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                        <Library size={16} /> RECOMENDAÇÕES DA INSCRIVA-SE
                    </div>
                    
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, color: '#fff' }}>
                        Conhecimento que <span style={{ color: '#D4AF37' }}>Transforma</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '3rem', lineHeight: 1.6 }}>
                        Uma curadoria exclusiva de livros essenciais para mentores, especialistas e empreendedores que desejam escalar os seus resultados e o seu impacto.
                    </p>

                    {/* Search & Filter Bar */}
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '15px',
                        maxWidth: '700px',
                        margin: '0 auto'
                    }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input 
                                type="text"
                                placeholder="Pesquisar por título ou autor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '15px 15px 15px 45px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: '0.3s'
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Categories */}
            <section style={{ padding: '0 20px 60px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', minWidth: 'max-content' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: selectedCategory === cat ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                                background: selectedCategory === cat ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                color: selectedCategory === cat ? '#D4AF37' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                transition: '0.3s',
                                fontWeight: 700,
                                fontSize: '0.9rem'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Books Grid */}
            <section style={{ padding: '0 20px 100px', maxWidth: '1200px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <Loader2 size={40} className="animate-spin" color="#D4AF37" />
                    </div>
                ) : filteredBooks.length > 0 ? (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '30px' 
                    }}>
                        {filteredBooks.map((book, idx) => (
                            <motion.div
                                key={book._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    padding: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    transition: '0.3s',
                                    cursor: 'pointer'
                                }}
                                whileHover={{ y: -10, borderColor: 'rgba(212, 175, 55, 0.3)', background: 'rgba(255,255,255,0.05)' }}
                                onClick={() => handleBookClick(book)}
                            >
                                {/* Cover Image */}
                                <div style={{ 
                                    position: 'relative', 
                                    width: '100%', 
                                    aspectRatio: '2/3', 
                                    borderRadius: '16px', 
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                }}>
                                    <img 
                                        src={book.coverImage || 'https://via.placeholder.com/300x450?text=Livro'} 
                                        alt={book.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '12px', 
                                        left: '12px', 
                                        background: 'rgba(0,0,0,0.6)', 
                                        backdropFilter: 'blur(10px)',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        color: '#D4AF37',
                                        textTransform: 'uppercase'
                                    }}>
                                        {book.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} color={i < book.rating ? '#D4AF37' : 'rgba(255,255,255,0.2)'} fill={i < book.rating ? '#D4AF37' : 'transparent'} />
                                        ))}
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{book.title}</h3>
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>por {book.author}</div>
                                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {book.description}
                                    </p>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBookClick(book);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '14px',
                                        background: '#D4AF37',
                                        color: '#000',
                                        border: 'none',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <ShoppingCart size={18} /> VER NA AMAZON <ExternalLink size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ opacity: 0.3, marginBottom: '20px' }}>
                            <Book size={60} />
                        </div>
                        <h3>Nenhum livro encontrado</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Tente ajustar a sua pesquisa ou categoria.</p>
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}
