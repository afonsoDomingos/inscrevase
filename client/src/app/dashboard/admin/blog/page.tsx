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

        setUploading(true);
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token não encontrado');

            const { url } = await blogService.uploadImage(token, file);
            setFormData({ ...formData, coverImage: url });
            toast.success('Imagem enviada com sucesso!');
        } catch {
            toast.error('Erro ao enviar imagem');
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
        } catch {
            toast.error('Erro ao salvar artigo');
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
                                borderRadius: '16px',
                                padding: '2rem',
                                maxWidth: '800px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'auto',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                                    {editingPost ? 'Editar Artigo' : 'Novo Artigo'}
                                </h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Título</label>
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
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Resumo</label>
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
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Conteúdo (Markdown)</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        required
                                        rows={12}
                                        placeholder="# Seu Título Aqui&#10;&#10;Escreva seu conteúdo usando Markdown..."
                                        style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.9rem' }}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Categoria</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as BlogPost['category'] })}
                                            style={{ ...inputStyle, cursor: 'pointer' }}
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
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Tempo de Leitura (min)</label>
                                        <input
                                            type="number"
                                            value={formData.readTime}
                                            onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
                                            min={1}
                                            style={inputStyle}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Imagem de Capa</label>
                                    {formData.coverImage && (
                                        <Image src={formData.coverImage} alt="Preview" width={300} height={150} style={{ marginBottom: '0.5rem', borderRadius: '8px' }} />
                                    )}
                                    <label
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem',
                                            border: '2px dashed #ddd',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: uploading ? '#f9f9f9' : 'transparent',
                                        }}
                                    >
                                        <Upload size={20} />
                                        <span>{uploading ? 'Enviando...' : 'Fazer Upload'}</span>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={uploading} />
                                    </label>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                        id="published"
                                    />
                                    <label htmlFor="published" style={{ fontWeight: 600 }}>
                                        Publicar imediatamente
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem',
                                            background: '#FFD700',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Save size={20} /> Salvar Artigo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#f3f4f6',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
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
        </div>
    );
}
