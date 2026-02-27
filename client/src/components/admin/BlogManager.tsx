"use client";

import { useState, useEffect } from 'react';
import { blogService, BlogPost } from '@/lib/blogService';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function BlogManager() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'guide' as 'guide' | 'marketing' | 'mentoring' | 'engagement' | 'event' | 'case-study',
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

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Imagem muito grande. Máximo 5MB.');
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        setUploading(true);
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token não encontrado');

            const { url } = await blogService.uploadImage(token, file);
            setFormData(prev => ({ ...prev, coverImage: url }));
            toast.success('Imagem enviada com sucesso!');
        } catch (error: unknown) {
            console.error(error);
            const axiosError = error as { response?: { data?: { message?: string } } };
            const message = axiosError.response?.data?.message || (error instanceof Error ? error.message : 'Erro ao enviar imagem');
            toast.error(message);
            setPreviewUrl(null);
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
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            console.error('Erro detalhado:', axiosError.response?.data);
            const message = axiosError.response?.data?.message || 'Erro ao salvar artigo';
            toast.error(message);
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

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.target.style.background = '#ffffff';
        e.target.style.borderColor = '#FFD700';
        e.target.style.boxShadow = '0 0 0 4px rgba(255, 215, 0, 0.1)';
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.target.style.background = '#f8fafc';
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px', color: '#000' }}>Gerenciar Blog</h2>
                    <p style={{ color: '#333', fontWeight: 500 }}>Crie e publique artigos educativos para sua audiência.</p>
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
                        padding: '12px 24px',
                        background: '#000',
                        color: '#FFD700',
                        border: 'none',
                        borderRadius: '12px',
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
                    {posts.length > 0 ? posts.map((post) => (
                        <div
                            key={post._id}
                            style={{
                                display: 'flex',
                                gap: '1.5rem',
                                background: '#fff',
                                border: '1px solid #eee',
                                borderRadius: '16px',
                                padding: '1.25rem',
                                alignItems: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            {post.coverImage && (
                                <div style={{ position: 'relative', width: '120px', height: '80px', flexShrink: 0 }}>
                                    <Image
                                        src={post.coverImage}
                                        alt={post.title}
                                        fill
                                        style={{ borderRadius: '8px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#000' }}>{post.title}</h3>
                                    {post.published ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#0694a2', fontWeight: 800, background: '#e6fffa', padding: '2px 8px', borderRadius: '12px' }}>
                                            <Eye size={12} /> PUBLICADO
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#b45309', fontWeight: 800, background: '#fffbeb', padding: '2px 8px', borderRadius: '12px' }}>
                                            <EyeOff size={12} /> RASCUNHO
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#333', margin: '0.25rem 0', fontWeight: 500 }}>{post.excerpt}</p>
                                <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>
                                    <span style={{ color: '#B8860B' }}>{post.category.toUpperCase()}</span> • {post.readTime} min • {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => handleEdit(post)}
                                    style={{
                                        padding: '10px',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        color: '#475569',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Editar artigo"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(post._id)}
                                    style={{
                                        padding: '10px',
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Excluir artigo"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '20px', border: '1px solid #eee' }}>
                            <p style={{ color: '#999' }}>Nenhum artigo publicado ainda.</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{
                                position: 'relative', width: '100%', maxWidth: '900px',
                                maxHeight: '90vh', background: '#fff', borderRadius: '24px',
                                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            <div style={{ padding: '1.5rem 2rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,215,0,0.2)' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingPost ? '✏️ Editar Artigo' : '📝 Novo Artigo'}</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 600 }}>Configure os detalhes da sua publicação</p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                                <form id="blog-form" onSubmit={handleSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.5rem', color: '#1a1a1a', fontSize: '0.9rem', textTransform: 'uppercase' }}>Título do Artigo</label>
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
                                                <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.5rem', color: '#1a1a1a', fontSize: '0.9rem', textTransform: 'uppercase' }}>Resumo (Excerpt)</label>
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
                                                <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.5rem', color: '#1a1a1a', fontSize: '0.9rem', textTransform: 'uppercase' }}>Conteúdo Completo (Markdown)</label>
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

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#000', textTransform: 'uppercase' }}>Imagens e Mídia</h4>
                                                <div>
                                                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#fff', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {(previewUrl || formData.coverImage) ? (
                                                            <>
                                                                <Image src={previewUrl || formData.coverImage} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                                                <div
                                                                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                                                    onClick={() => (document.getElementById('file-upload-dialog') as HTMLInputElement)?.click()}
                                                                >
                                                                    <Upload color="#fff" size={32} />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div style={{ textAlign: 'center', color: '#64748b' }}>
                                                                <Upload size={32} style={{ margin: '0 auto 0.5rem' }} />
                                                                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Recomendado: 1200x630px</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '12px', background: uploading ? '#e2e8f0' : '#000', color: uploading ? '#888' : '#FFD700', borderRadius: '10px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.2s' }}
                                                    >
                                                        {uploading ? 'ENVIANDO...' : 'UPLOAD CAPA'}
                                                        <input id="file-upload-dialog" type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={uploading} />
                                                    </label>
                                                </div>
                                            </div>

                                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#000', textTransform: 'uppercase' }}>Configurações</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.4rem', fontSize: '0.8rem', color: '#1a1a1a' }}>CATEGORIA</label>
                                                        <select
                                                            value={formData.category}
                                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as BlogPost['category'] })}
                                                            style={{ ...inputStyle, padding: '0.75rem', fontWeight: 600 }}
                                                        >
                                                            <option value="guide">Guias</option>
                                                            <option value="marketing">Marketing</option>
                                                            <option value="mentoring">Mentoria</option>
                                                            <option value="engagement">Engajamento</option>
                                                            <option value="event">Eventos</option>
                                                            <option value="case-study">Casos de Estudo</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.4rem', fontSize: '0.8rem', color: '#1a1a1a' }}>MINUTOS</label>
                                                        <input
                                                            type="number"
                                                            value={formData.readTime}
                                                            onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
                                                            min={1}
                                                            style={{ ...inputStyle, padding: '0.75rem', fontWeight: 600 }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.4rem', fontSize: '0.8rem', color: '#1a1a1a' }}>TAGS</label>
                                                    <input
                                                        type="text"
                                                        value={formData.tags.join(', ')}
                                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '') })}
                                                        placeholder="marketing, vendas"
                                                        style={{ ...inputStyle, padding: '0.75rem', fontWeight: 600 }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.published}
                                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                                        id="publish-check"
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#000' }}
                                                    />
                                                    <label htmlFor="publish-check" style={{ fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', color: '#000' }}>PUBLICAR JÁ</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', background: '#f8f9fa', borderTop: '1px solid #eee', display: 'flex', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    form="blog-form"
                                    disabled={uploading}
                                    style={{ flex: 2, padding: '1rem', background: uploading ? '#ccc' : '#000', color: '#FFD700', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                >
                                    <Save size={20} style={{ marginRight: '8px' }} /> {editingPost ? 'Salvar Alterações' : 'Publicar Artigo'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '1rem', background: '#fff', color: '#666', borderRadius: '12px', border: '1px solid #ddd', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
