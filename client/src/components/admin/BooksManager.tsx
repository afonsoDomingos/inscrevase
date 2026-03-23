/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Trash2, 
    Edit, 
    ExternalLink, 
    Save, 
    X, 
    Loader2, 
    Search,
    BarChart
} from 'lucide-react';
import { bookService, BookModel } from '@/lib/bookService';
import { toast } from 'sonner';

export default function BooksManager() {
    const [books, setBooks] = useState<BookModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Partial<BookModel> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<Partial<BookModel>>({
        title: '',
        author: '',
        description: '',
        coverImage: '',
        affiliateLink: '',
        category: 'Empreendedorismo',
        rating: 5,
        status: 'approved',
        isActive: true
    });

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const data = await bookService.adminGetAllBooks();
            setBooks(data);
        } catch (error: any) {
            toast.error(error.message || 'Erro ao carregar livros');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBook?._id) {
                await bookService.updateBook(editingBook._id, formData);
                toast.success('Livro atualizado com sucesso');
            } else {
                await bookService.createBook(formData);
                toast.success('Livro adicionado com sucesso');
            }
            setIsModalOpen(false);
            setEditingBook(null);
            setFormData({
                title: '',
                author: '',
                description: '',
                coverImage: '',
                affiliateLink: '',
                category: 'Empreendedorismo',
                rating: 5,
                status: 'approved',
                isActive: true
            });
            loadBooks();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao guardar livro');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem a certeza que deseja eliminar este livro?')) return;
        try {
            await bookService.deleteBook(id);
            toast.success('Livro removido');
            loadBooks();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao remover');
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await bookService.updateBookStatus(id, status);
            toast.success(`Livro ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`);
            loadBooks();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar estado');
        }
    };

    const openEdit = (book: BookModel) => {
        setEditingBook(book);
        setFormData(book);
        setIsModalOpen(true);
    };

    const filteredBooks = books.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#333' }}>Gestão de Livros & Afiliados</h2>
                    <p style={{ color: '#666' }}>Faz a curadoria de livros recomendados para a plataforma.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingBook(null);
                        setFormData({ title: '', author: '', description: '', coverImage: '', affiliateLink: '', category: 'Empreendedorismo', rating: 5, isActive: true });
                        setIsModalOpen(true);
                    }}
                    style={{
                        padding: '12px 24px',
                        background: '#000',
                        color: '#FFD700',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                >
                    <Plus size={20} /> Adicionar Novo Livro
                </button>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eee' }}>
                    <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Total de Livros</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{books.length}</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eee' }}>
                    <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Total de Cliques</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>{books.reduce((acc, b) => acc + (b.clicks || 0), 0)}</div>
                </div>
            </div>

            {/* List */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #eee', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                    <div style={{ position: 'relative', maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input 
                            type="text" 
                            placeholder="Procurar livros..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid #eee', outline: 'none' }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={30} color="#FFD700" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#888' }}>CAPA</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#888' }}>TÍTULO / AUTOR</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#888' }}>CATEGORIA</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#888' }}>ESTADO</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#888' }}>CLIQUES</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: '#888' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.map(book => (
                                <tr key={book._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                    <td style={{ padding: '10px 15px' }}>
                                        <img src={book.coverImage} alt="" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 700 }}>{book.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{book.author}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', background: '#f0f0f0', borderRadius: '6px' }}>{book.category}</span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            background: book.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : book.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: book.status === 'approved' ? '#22c55e' : book.status === 'pending' ? '#eab308' : '#ef4444'
                                        }}>
                                            {book.status === 'approved' ? 'Aprovado' : book.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <BarChart size={14} color="#D4AF37" /> {book.clicks || 0}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            {book.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(book._id!, 'approved')} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Aprovar</button>
                                                    <button onClick={() => handleUpdateStatus(book._id!, 'rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Rejeitar</button>
                                                </>
                                            )}
                                            <button onClick={() => openEdit(book)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1' }}><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(book._id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                                            <a href={book.affiliateLink} target="_blank" rel="noreferrer" style={{ color: '#888' }}><ExternalLink size={18} /></a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(5px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: '#fff',
                                width: '100%',
                                maxWidth: '600px',
                                borderRadius: '24px',
                                padding: '30px',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingBook ? 'Editar Livro' : 'Novo Livro de Afiliado'}</h3>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Título do Livro</label>
                                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Autor</label>
                                        <input required type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Link de Afiliado (Ex: Amazon)</label>
                                    <input required type="url" value={formData.affiliateLink} onChange={e => setFormData({...formData, affiliateLink: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Link da Imagem de Capa (URL)</label>
                                    <input required type="url" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Categoria</label>
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                                            <option>Empreendedorismo</option>
                                            <option>Investimentos</option>
                                            <option>Espiritualidade</option>
                                            <option>Finanças</option>
                                            <option>Desenvolvimento Pessoal</option>
                                            <option>Marketing</option>
                                            <option>Vendas</option>
                                            <option>Liderança</option>
                                            <option>Tecnologia & IA</option>
                                            <option>Biografias</option>
                                            <option>Produtividade</option>
                                            <option>Comunicação</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Estado</label>
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                                            <option value="pending">Pendente</option>
                                            <option value="approved">Aprovado</option>
                                            <option value="rejected">Rejeitado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Avaliação (1-5)</label>
                                        <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Descrição Curta</label>
                                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', height: '80px' }} />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: '#000',
                                        color: '#FFD700',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        marginTop: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <Save size={20} /> Guardar Recomendação
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
