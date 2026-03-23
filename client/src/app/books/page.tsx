/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Library,
    X,
    BookOpen,
    Send,
    CheckCircle,
    ShoppingCart,
    Star,
    Search,
    Loader2,
    ExternalLink
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookService, BookModel } from '@/lib/bookService';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function BooksPage() {
    const router = useRouter();
    const [books, setBooks] = useState<BookModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);

    const [submissionForm, setSubmissionForm] = useState({
        title: '',
        author: '',
        description: '',
        coverImage: '',
        affiliateLink: '',
        category: 'Empreendedorismo',
        price: ''
    });

    useEffect(() => {
        const token = Cookies.get('token');
        setUserToken(token || null);
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const data = await bookService.getAllBooks();
            setBooks(data);
        } catch (_) {
            toast.error('Erro ao carregar livros');
        } finally {
            setLoading(false);
        }
    };

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
        } catch (_) {
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

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!userToken) {
                                    toast.info('Para publicar o seu livro, precisa de ter uma conta na nossa plataforma. Vamos criar uma?');
                                    router.push('/criar-conta');
                                    return;
                                }
                                setIsSubmitModalOpen(true);
                            }}
                            style={{
                                padding: '12px 24px',
                                background: 'var(--gold-gradient)',
                                color: '#000',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)'
                            }}
                        >
                            <Send size={18} /> Publicar o meu Livro
                        </motion.button>
                    </div>

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
                            <Library size={60} />
                        </div>
                        <h3>Nenhum livro encontrado</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Tente ajustar a sua pesquisa ou categoria.</p>
                    </div>
                )}
            </section>

            <Footer />

            {/* Submission Modal */}
            <AnimatePresence>
                {isSubmitModalOpen && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            style={{
                                background: '#111',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '24px',
                                padding: '40px',
                                width: '100%',
                                maxWidth: '600px',
                                position: 'relative',
                                color: '#fff'
                            }}
                        >
                            <button onClick={() => setIsSubmitModalOpen(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                            
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{ background: 'rgba(212, 175, 55, 0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#D4AF37' }}>
                                    <BookOpen size={30} />
                                </div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Submeter a Minha Obra</h2>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>A sua submissão será avaliada pela nossa equipa antes de ser publicada.</p>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    setIsSubmitting(true);
                                    await bookService.submitBook(submissionForm);
                                    toast.success('Livro submetido para avaliação com sucesso! Brevemente entrará na nossa vitrine.');
                                    setIsSubmitModalOpen(false);
                                    setSubmissionForm({ title: '', author: '', description: '', coverImage: '', affiliateLink: '', category: 'Empreendedorismo', price: '' });
                                } catch (_) {
                                    toast.error('Erro ao submeter livro. Tente novamente.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: '#D4AF37' }}>Título da Obra</label>
                                    <input required type="text" value={submissionForm.title} onChange={e => setSubmissionForm({...submissionForm, title: e.target.value})} placeholder="Título completo" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: '#D4AF37' }}>Autor</label>
                                    <input required type="text" value={submissionForm.author} onChange={e => setSubmissionForm({...submissionForm, author: e.target.value})} placeholder="Nome completo" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: '#D4AF37' }}>Categoria</label>
                                    <select value={submissionForm.category} onChange={e => setSubmissionForm({...submissionForm, category: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                        <option value="Empreendedorismo">Empreendedorismo</option>
                                        <option value="Investimentos">Investimentos</option>
                                        <option value="Finanças">Finanças</option>
                                        <option value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Tecnologia & IA">Tecnologia & IA</option>
                                        <option value="Espiritualidade">Espiritualidade</option>
                                    </select>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: '#D4AF37' }}>Link de Compra ou Site (URL)</label>
                                    <input required type="url" value={submissionForm.affiliateLink} onChange={e => setSubmissionForm({...submissionForm, affiliateLink: e.target.value})} placeholder="Ex: amzn.to/meu-livro" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: '#D4AF37' }}>Link da Capa (URL)</label>
                                    <input required type="url" value={submissionForm.coverImage} onChange={e => setSubmissionForm({...submissionForm, coverImage: e.target.value})} placeholder="URL da imagem da capa" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: '#D4AF37' }}>Breve Resumo</label>
                                    <textarea required value={submissionForm.description} onChange={e => setSubmissionForm({...submissionForm, description: e.target.value})} placeholder="O que os leitores podem esperar?" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', height: '100px', resize: 'none' }} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        gridColumn: 'span 2',
                                        padding: '15px',
                                        background: 'var(--gold-gradient)',
                                        color: '#000',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /> Submeter para Aprovação</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
