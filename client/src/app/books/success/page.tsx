/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    CheckCircle, 
    Download, 
    ArrowLeft, 
    Loader2, 
    BookOpen,
    Mail
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookService, BookModel } from '@/lib/bookService';
import { toast } from 'sonner';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookId = searchParams.get('bookId');
    const [book, setBook] = useState<BookModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (bookId) {
            loadBook(bookId);
        } else {
            setLoading(false);
        }
    }, [bookId]);

    const loadBook = async (id: string) => {
        try {
            setLoading(true);
            // Reutilizamos o getAllBooks e filtramos para encontrar o livro específico
            const allBooks = await bookService.getAllBooks();
            const found = allBooks.find(b => b._id === id);
            if (found) setBook(found);
        } catch {
            toast.error('Erro ao verificar o pedido');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="#D4AF37" />
            </div>
        );
    }

    return (
        <section style={{ padding: '120px 20px 100px', textAlign: 'center' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '24px',
                    padding: '40px',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '20px', borderRadius: '50%' }}>
                        <CheckCircle size={60} color="#22c55e" />
                    </div>
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '10px' }}>Pagamento Confirmado!</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
                    Obrigado Ninja por investir no seu conhecimento. A sua transação foi concluída com sucesso.
                </p>

                {book && (
                    <div style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        borderRadius: '16px', 
                        padding: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '20px',
                        textAlign: 'left',
                        marginBottom: '30px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <img 
                            src={book.coverImage || '/placeholder.png'} 
                            alt="" 
                            style={{ width: '80px', height: '120px', borderRadius: '8px', objectFit: 'cover' }} 
                        />
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{book.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}>por {book.author}</div>
                            
                            {book.pdfUrl ? (
                                <button
                                    onClick={() => window.open(book.pdfUrl, '_blank')}
                                    style={{
                                        padding: '10px 15px',
                                        background: 'var(--gold-gradient)',
                                        color: '#000',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <Download size={16} /> DOWNLOAD DO PDF
                                </button>
                            ) : (
                                <div style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 700 }}>
                                    <Mail size={14} style={{ marginRight: '5px' }} /> Verifique o seu e-mail para o acesso.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                        onClick={() => router.push('/books')}
                        style={{
                            padding: '12px 25px',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <BookOpen size={18} /> Ver Mais Livros
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        style={{
                            padding: '12px 25px',
                            background: 'transparent',
                            color: 'rgba(255,255,255,0.5)',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <ArrowLeft size={18} /> Painel Ninja
                    </button>
                </div>
            </motion.div>
        </section>
    );
}

export default function BookSuccessPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Carregando...</div>}>
                <SuccessContent />
            </Suspense>
            <Footer />
        </div>
    );
}
