/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    Loader2,
    ExternalLink,
    Upload,
    Link as LinkIcon,
    FileText,
    Image as ImageIcon,
    CreditCard,
    DollarSign,
    Search
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookService, BookModel } from '@/lib/bookService';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function BooksPage() {
    const router = useRouter();
    const [books, setBooks] = useState<BookModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);

    // Form States
    const [submissionForm, setSubmissionForm] = useState({
        title: '',
        author: '',
        description: '',
        coverImage: '',
        affiliateLink: '',
        category: 'Empreendedorismo',
        pdfUrl: '',
        price: '',
        sellerPaypalEmail: ''
    });

    // Upload Helper States
    const [coverType, setCoverType] = useState<'link' | 'upload'>('link');
    const [pdfType, setPdfType] = useState<'link' | 'upload'>('link');
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

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
        } catch {
            toast.error('Erro ao carregar livros');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'cover' | 'pdf') => {
        const isCover = type === 'cover';
        const setterStatus = isCover ? setUploadingCover : setUploadingPdf;
        
        try {
            setterStatus(true);
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const url = response.data.url;
            if (isCover) {
                setSubmissionForm(prev => ({ ...prev, coverImage: url }));
            } else {
                setSubmissionForm(prev => ({ ...prev, pdfUrl: url }));
            }
            toast.success(`${isCover ? 'Capa' : 'PDF'} carregado com sucesso!`);
        } catch {
            toast.error('Erro no upload. Tente usar um link direto.');
        } finally {
            setterStatus(false);
        }
    };

    const categories = ['Todos', ...Array.from(new Set(books.map(b => b.category)))];

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || book.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAction = async (book: BookModel) => {
        try {
            await bookService.recordClick(book._id);
        } catch {
            // Silently fail if recordClick fails
        }
        
        // Se for um link de afiliado, abre o link
        if (book.affiliateLink && !book.isUserSubmission) {
            window.open(book.affiliateLink, '_blank');
            return;
        }

        // Se for uma submissão de utilizador com preço, redireciona para o checkout ou paypal
        if (book.isUserSubmission && book.price && book.sellerPaypalEmail) {
            const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(book.sellerPaypalEmail)}&item_name=${encodeURIComponent(book.title)}&amount=${book.price}&currency_code=USD`;
            window.open(paypalUrl, '_blank');
            return;
        }

        // Se tiver apenas o PDF disponível para download gratuito ou link externo
        if (book.pdfUrl) {
            window.open(book.pdfUrl, '_blank');
        } else if (book.affiliateLink) {
            window.open(book.affiliateLink, '_blank');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{ 
                padding: '120px 20px 60px', 
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
                        padding: '6px 12px', 
                        borderRadius: '20px',
                        color: '#D4AF37',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                        <Library size={14} /> RECOMENDAÇÕES DA INSCRIVA-SE
                    </div>
                    
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1, color: '#fff' }}>
                        Conhecimento que <span style={{ color: '#D4AF37' }}>Transforma</span>
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Uma curadoria exclusiva de livros essenciais para mentores e especialistas.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!userToken) {
                                    toast.info('Para publicar o seu livro, precisa de ter uma conta. Vamos entrar?');
                                    router.push('/entrar');
                                    return;
                                }
                                setIsSubmitModalOpen(true);
                            }}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--gold-gradient)',
                                color: '#000',
                                borderRadius: '10px',
                                border: 'none',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            <Send size={16} /> Publicar o meu Livro
                        </motion.button>
                    </div>

                    <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                        <input 
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 42px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Categories */}
            <section style={{ padding: '0 20px 40px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', minWidth: 'max-content' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: selectedCategory === cat ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                                background: selectedCategory === cat ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                color: selectedCategory === cat ? '#D4AF37' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 700
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
                        <Loader2 size={30} className="animate-spin" color="#D4AF37" />
                    </div>
                ) : filteredBooks.length > 0 ? (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                        gap: '24px' 
                    }}>
                        {filteredBooks.map((book, idx) => (
                            <motion.div
                                key={book._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                whileHover={{ y: -8, borderColor: 'rgba(212, 175, 55, 0.2)', background: 'rgba(255,255,255,0.04)' }}
                                onClick={() => handleAction(book)}
                            >
                                <div style={{ 
                                    position: 'relative', 
                                    width: '100%', 
                                    aspectRatio: '2/3', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                                }}>
                                    <img 
                                        src={book.coverImage || 'https://via.placeholder.com/300x450?text=Livro'} 
                                        alt={book.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '10px', 
                                        left: '10px', 
                                        background: 'rgba(0,0,0,0.7)', 
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        color: '#D4AF37'
                                    }}>
                                        {book.category}
                                    </div>
                                    {book.price && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            bottom: '10px', 
                                            right: '10px', 
                                            background: '#D4AF37', 
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 900,
                                            color: '#000',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                        }}>
                                            ${book.price}
                                        </div>
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>{book.title}</h3>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>por {book.author}</div>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {book.description}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAction(book);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        background: book.isUserSubmission && book.price ? '#1A73E8' : '#D4AF37',
                                        color: '#fff',
                                        border: 'none',
                                        fontWeight: 900,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {book.isUserSubmission && book.price ? (
                                        <><CreditCard size={16} /> COMPRAR (PAYPAL)</>
                                    ) : (
                                        <><ShoppingCart size={16} /> VER NA AMAZON <ExternalLink size={14} /></>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Library size={40} style={{ opacity: 0.2, marginBottom: '15px' }} />
                        <h3>Nenhum livro encontrado</h3>
                    </div>
                )}
            </section>

            <Footer />

            {/* Submission Modal - COMPACT WITH CHECKOUT */}
            <AnimatePresence>
                {isSubmitModalOpen && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '15px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: '#0D0D0D',
                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                borderRadius: '20px',
                                padding: '25px',
                                width: '100%',
                                maxWidth: '750px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                position: 'relative',
                                color: '#fff'
                            }}
                        >
                            <button onClick={() => setIsSubmitModalOpen(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={20} /></button>
                            
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#D4AF37', marginBottom: '5px' }}>
                                    <BookOpen size={20} /> <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>MARKETPLACE DE LIVROS</span>
                                </div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Submeter a Minha Obra</h2>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    setIsSubmitting(true);
                                    await bookService.submitBook(submissionForm);
                                    toast.success('Obra enviada com sucesso! Aguarde a aprovação.');
                                    setIsSubmitModalOpen(false);
                                } catch (error: any) {
                                    toast.error(error.message || 'Erro ao enviar. Verifique os campos.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D4AF37', marginBottom: '5px', display: 'block' }}>TÍTULO DA OBRA</label>
                                    <input required type="text" value={submissionForm.title} onChange={e => setSubmissionForm({...submissionForm, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }} />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D4AF37', marginBottom: '5px', display: 'block' }}>AUTOR</label>
                                    <input required type="text" value={submissionForm.author} onChange={e => setSubmissionForm({...submissionForm, author: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }} />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D4AF37', marginBottom: '5px', display: 'block' }}>CATEGORIA</label>
                                    <select value={submissionForm.category} onChange={e => setSubmissionForm({...submissionForm, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}>
                                        <option value="Empreendedorismo">Empreendedorismo</option>
                                        <option value="Investimentos">Investimentos</option>
                                        <option value="Finanças">Finanças</option>
                                        <option value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Tecnologia & IA">Tecnologia & IA</option>
                                        <option value="Espiritualidade">Espiritualidade</option>
                                    </select>
                                </div>

                                {/* Preço e PayPal */}
                                <div style={{ padding: '12px', background: 'rgba(26, 115, 232, 0.05)', borderRadius: '12px', border: '1px solid rgba(26, 115, 232, 0.1)' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1A73E8', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <DollarSign size={14} /> PREÇO (USD)
                                    </label>
                                    <input type="number" step="0.01" value={submissionForm.price} onChange={e => setSubmissionForm({...submissionForm, price: e.target.value})} placeholder="0.00" style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }} />
                                </div>

                                <div style={{ padding: '12px', background: 'rgba(26, 115, 232, 0.05)', borderRadius: '12px', border: '1px solid rgba(26, 115, 232, 0.1)' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1A73E8', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CreditCard size={14} /> E-MAIL PAYPAL
                                    </label>
                                    <input type="email" value={submissionForm.sellerPaypalEmail} onChange={e => setSubmissionForm({...submissionForm, sellerPaypalEmail: e.target.value})} placeholder="seu.vendedor@gmail.com" style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }} />
                                </div>

                                {/* Cape Section */}
                                <div style={{ gridColumn: 'span 2', padding: '15px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D4AF37' }}>CAPA DO LIVRO</label>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button type="button" onClick={() => setCoverType('link')} style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: coverType === 'link' ? '#D4AF37' : 'transparent', color: coverType === 'link' ? '#000' : '#fff', cursor: 'pointer' }}><LinkIcon size={12} /> Link</button>
                                            <button type="button" onClick={() => setCoverType('upload')} style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: coverType === 'upload' ? '#D4AF37' : 'transparent', color: coverType === 'upload' ? '#000' : '#fff', cursor: 'pointer' }}><Upload size={12} /> Upload</button>
                                        </div>
                                    </div>
                                    {coverType === 'link' ? (
                                        <input type="url" value={submissionForm.coverImage} onChange={e => setSubmissionForm({...submissionForm, coverImage: e.target.value})} placeholder="URL da imagem..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem' }} />
                                    ) : (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <label style={{ flex: 1, height: '40px', border: '1px dashed rgba(212, 175, 55, 0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem' }}>
                                                {uploadingCover ? <Loader2 size={16} className="animate-spin" /> : <><ImageIcon size={14} style={{ marginRight: '5px' }} /> Escolher Imagem</>}
                                                <input type="file" hidden accept="image/*" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'cover')} />
                                            </label>
                                            {submissionForm.coverImage && <div style={{ background: '#333', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', color: '#0f0' }}>✓ Pronto</div>}
                                        </div>
                                    )}
                                </div>

                                {/* PDF Section */}
                                <div style={{ gridColumn: 'span 2', padding: '15px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D4AF37' }}>CONTEÚDO DA OBRA (PDF)</label>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button type="button" onClick={() => setPdfType('link')} style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: pdfType === 'link' ? '#D4AF37' : 'transparent', color: pdfType === 'link' ? '#000' : '#fff', cursor: 'pointer' }}><LinkIcon size={12} /> Link</button>
                                            <button type="button" onClick={() => setPdfType('upload')} style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: pdfType === 'upload' ? '#D4AF37' : 'transparent', color: pdfType === 'upload' ? '#000' : '#fff', cursor: 'pointer' }}><Upload size={12} /> Upload</button>
                                        </div>
                                    </div>
                                    {pdfType === 'link' ? (
                                        <input type="url" value={submissionForm.pdfUrl} onChange={e => setSubmissionForm({...submissionForm, pdfUrl: e.target.value})} placeholder="URL do ficheiro PDF..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem' }} />
                                    ) : (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <label style={{ flex: 1, height: '40px', border: '1px dashed rgba(255, 255, 255, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem' }}>
                                                {uploadingPdf ? <Loader2 size={16} className="animate-spin" /> : <><FileText size={14} style={{ marginRight: '5px' }} /> Carregar PDF</>}
                                                <input type="file" hidden accept="application/pdf" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'pdf')} />
                                            </label>
                                            {submissionForm.pdfUrl && <div style={{ background: '#333', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', color: '#0f0' }}>✓ Selecionado</div>}
                                        </div>
                                    )}
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D4AF37', marginBottom: '5px', display: 'block' }}>RESUMO DA OBRA</label>
                                    <textarea required value={submissionForm.description} onChange={e => setSubmissionForm({...submissionForm, description: e.target.value})} placeholder="O que vamos aprender?" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', height: '60px', resize: 'none', fontSize: '0.8rem' }} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || uploadingCover || uploadingPdf}
                                    style={{
                                        gridColumn: 'span 2',
                                        padding: '12px',
                                        background: 'var(--gold-gradient)',
                                        color: '#000',
                                        borderRadius: '10px',
                                        border: 'none',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '0.9rem',
                                        opacity: (isSubmitting || uploadingCover || uploadingPdf) ? 0.7 : 1
                                    }}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> SUBMETER AGORA</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
