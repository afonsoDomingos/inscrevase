"use client";

import { useState, useEffect } from 'react';
import { blogService, BlogPost } from '@/lib/blogService';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function BlogManagement() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'guide' as 'guide' | 'marketing' | 'mentoring' | 'engagement',
        coverImage: '',
        author: {
            name: 'Equipe Inscreva.se',
            avatar: '',
        },
        readTime: 5,
        tags: [] as string[],
        published: false,
    });
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) return;

            const data = await blogService.getAllPosts(token);
            setPosts(data);
        } catch {
            toast.error('Erro ao carregar artigos');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Imagem muito grande. Máximo 5MB.');
            return;
        }

        // Criar preview local imediato
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        setUploading(true);
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token não encontrado');

            const { url } = await blogService.uploadImage(token, file);
            setFormData(prev => ({ ...prev, coverImage: url }));
            toast.success('Imagem enviada com sucesso!');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erro ao enviar imagem');
            setPreviewUrl(null); // Limpar preview em caso de erro
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get('token');
        if (!token) return;

        try {
            if (editingPost) {
                await blogService.updatePost(token, editingPost._id, formData);
                toast.success('Artigo atualizado com sucesso!');
            } else {
                await blogService.createPost(token, formData);
                toast.success('Artigo criado com sucesso!');
            }

            setShowModal(false);
            setEditingPost(null);
            resetForm();
            fetchPosts();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erro ao salvar artigo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este artigo?')) return;

        const token = Cookies.get('token');
        if (!token) return;

        try {
            await blogService.deletePost(token, id);
            toast.success('Artigo deletado com sucesso!');
            fetchPosts();
        } catch {
            toast.error('Erro ao deletar artigo');
        }
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            coverImage: post.coverImage,
            author: post.author,
            readTime: post.readTime,
            tags: post.tags,
            published: post.published,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            category: 'guide',
            coverImage: '',
            author: {
                name: 'Equipe Inscreva.se',
                avatar: '',
            },
            readTime: 5,
            tags: [],
            published: false,
        });
        setPreviewUrl(null);
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        color: '#1e293b'
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFocus = (e: any) => {
        e.target.style.background = '#ffffff';
        e.target.style.borderColor = '#FFD700';
        e.target.style.boxShadow = '0 0 0 4px rgba(255, 215, 0, 0.1)';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBlur = (e: any) => {
        e.target.style.background = '#f8fafc';
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Gerenciar Blog</h1>
                    <p style={{ color: '#666' }}>Crie e publique artigos educativos</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingPost(null);
                        setShowModal(true);
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: '#FFD700',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={20} /> Novo Artigo
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Carregando...</div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                background: '#fff',
                                border: '1px solid #eee',
                                borderRadius: '12px',
                                padding: '1rem',
                                alignItems: 'center',
                            }}
                        >
                            {post.coverImage && (
                                <Image
                                    src={post.coverImage}
                                    alt={post.title}
                                    width={120}
                                    height={80}
                                    style={{ borderRadius: '8px', objectFit: 'cover' }}
                                />
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{post.title}</h3>
                                    {post.published ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                                            <Eye size={14} /> Publicado
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                                            <EyeOff size={14} /> Rascunho
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0' }}>{post.excerpt}</p>
                                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                    {post.category} • {post.readTime} min • {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleEdit(post)}
                                    style={{
                                        padding: '0.5rem',
                                        background: '#f3f4f6',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(post._id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '2rem',
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#fff',
                                borderRadius: '24px',
                                padding: '2rem',
                                maxWidth: '900px',
                                width: '95%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '2rem',
                                position: 'sticky',
                                top: 0,
                                background: '#fff',
                                zIndex: 10,
                                paddingBottom: '1rem',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                                        {editingPost ? '✏️ Editar Artigo' : '📝 Novo Artigo'}
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                        Preencha todos os campos para garantir a melhor experiência de leitura.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        background: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '50%',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <X size={24} color="#64748b" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                    {/* Lado Esquerdo: Conteúdo Principal */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>Título do Artigo</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                                placeholder="Ex: Como triplicar suas vendas de ingressos"
                                                style={inputStyle}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>Resumo (Excerpt)</label>
                                            <textarea
                                                value={formData.excerpt}
                                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                                required
                                                rows={3}
                                                maxLength={300}
                                                placeholder="Um breve resumo que aparecerá nos cards (máx 300 caracteres)..."
                                                style={{ ...inputStyle, resize: 'none' }}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>Conteúdo Completo (Markdown)</label>
                                            <textarea
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                required
                                                rows={15}
                                                placeholder="# Use Markdown para formatar seu texto..."
                                                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6' }}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                            />
                                        </div>
                                    </div>

                                    {/* Lado Direito: Metadados e Imagem */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{
                                            background: '#f8fafc',
                                            padding: '1.5rem',
                                            borderRadius: '16px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>Imagens e Mídia</h3>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Imagem de Capa</label>
                                                <div style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    aspectRatio: '16/9',
                                                    background: '#f1f5f9',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    marginBottom: '1rem',
                                                    border: '2px dashed #cbd5e1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {(previewUrl || formData.coverImage) ? (
                                                        <>
                                                            <Image
                                                                src={previewUrl || formData.coverImage}
                                                                alt="Preview"
                                                                fill
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                            <div style={{
                                                                position: 'absolute',
                                                                inset: 0,
                                                                background: 'rgba(0,0,0,0.4)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                opacity: 0,
                                                                transition: 'opacity 0.2s',
                                                                cursor: 'pointer'
                                                            }}
                                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                                                onClick={() => (document.getElementById('file-upload') as HTMLInputElement)?.click()}
                                                            >
                                                                <Upload color="#fff" size={32} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                                                            <Upload size={32} style={{ margin: '0 auto 0.5rem' }} />
                                                            <p style={{ fontSize: '0.8rem' }}>Recomendado: 1200x630px</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <label
                                                    className="upload-btn"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.75rem',
                                                        background: uploading ? '#e2e8f0' : '#fff',
                                                        border: '1px solid #cbd5e1',
                                                        borderRadius: '10px',
                                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {uploading ? 'Enviando...' : 'Alterar Imagem'}
                                                    <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={uploading} />
                                                </label>
                                            </div>
                                        </div>

                                        <div style={{
                                            background: '#f8fafc',
                                            padding: '1.5rem',
                                            borderRadius: '16px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1.25rem'
                                        }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Configurações</h3>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Categoria</label>
                                                    <select
                                                        value={formData.category}
                                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as BlogPost['category'] })}
                                                        style={{ ...inputStyle, padding: '0.75rem', border: '1px solid #cbd5e1' }}
                                                        onFocus={handleFocus}
                                                        onBlur={handleBlur}
                                                    >
                                                        <option value="guide">Guias</option>
                                                        <option value="marketing">Marketing</option>
                                                        <option value="mentoring">Mentoria</option>
                                                        <option value="engagement">Engajamento</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Tempo (min)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.readTime}
                                                        onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
                                                        min={1}
                                                        style={{ ...inputStyle, padding: '0.75rem', border: '1px solid #cbd5e1' }}
                                                        onFocus={handleFocus}
                                                        onBlur={handleBlur}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Tags (separadas por vírgula)</label>
                                                <input
                                                    type="text"
                                                    value={formData.tags.join(', ')}
                                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '') })}
                                                    placeholder="marketing, vendas, growth"
                                                    style={{ ...inputStyle, padding: '0.75rem', border: '1px solid #cbd5e1' }}
                                                    onFocus={handleFocus}
                                                    onBlur={handleBlur}
                                                />
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                background: '#fff',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                marginTop: '0.5rem'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.published}
                                                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                                    id="published"
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#FFD700' }}
                                                />
                                                <label htmlFor="published" style={{ fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b' }}>
                                                    Publicar imediatamente
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginTop: '2rem',
                                    paddingTop: '1.5rem',
                                    borderTop: '1px solid #f1f5f9',
                                    position: 'sticky',
                                    bottom: 0,
                                    background: '#fff',
                                    zIndex: 10
                                }}>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        style={{
                                            flex: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '1rem',
                                            background: uploading ? '#cbd5e1' : '#FFD700',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Save size={20} /> {editingPost ? 'Salvar Alterações' : 'Publicar Artigo'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: '#f1f5f9',
                                            color: '#64748b',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
