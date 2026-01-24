"use client";

import { useEffect, useState } from 'react';
import { blogService, BlogPost } from '@/lib/blogService';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function InternalBlogView() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await blogService.getPublishedPosts();
                setPosts(data);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#FFD700" />
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
                {selectedPost ? (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="blog-detail-view"
                    >
                        <button
                            onClick={() => setSelectedPost(null)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: 'none',
                                background: 'rgba(212, 175, 55, 0.1)',
                                color: 'var(--primary)',
                                padding: '10px 20px',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                marginBottom: '2.5rem',
                                fontWeight: 700,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
                        >
                            <ArrowLeft size={18} /> Voltar para Artigos
                        </button>

                        <article className="luxury-card" style={{ padding: '0', overflow: 'visible', background: 'var(--paper)', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                            <div style={{ position: 'relative', width: '100%', height: '450px', borderRadius: '32px 32px 0 0', overflow: 'hidden' }}>
                                <Image
                                    src={selectedPost.coverImage}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    alt={selectedPost.title}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                            </div>

                            <div style={{ padding: '4rem', position: 'relative' }}>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '2rem' }}>
                                    <span style={{ background: 'var(--gold-gradient)', color: '#000', padding: '5px 15px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {selectedPost.category}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        <Clock size={16} /> {selectedPost.readTime} min de leitura
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        <Eye size={16} /> {selectedPost.views} visualizações
                                    </div>
                                </div>

                                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '2.5rem', lineHeight: 1.1, fontFamily: 'var(--font-playfair)' }}>
                                    {selectedPost.title}
                                </h1>

                                <div
                                    className="blog-content-rendering"
                                    style={{
                                        fontSize: '1.25rem',
                                        lineHeight: 1.8,
                                        color: 'var(--foreground)',
                                        maxWidth: '900px'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                                />
                            </div>
                        </article>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                            gap: '2.5rem'
                        }}
                    >
                        {posts.map((post, idx) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="luxury-card"
                                onClick={() => setSelectedPost(post)}
                                style={{
                                    padding: '0',
                                    cursor: 'pointer',
                                    background: 'var(--paper)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                                    <Image src={post.coverImage} fill style={{ objectFit: 'cover' }} alt={post.title} />
                                    <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', color: '#000', padding: '5px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {post.category}
                                    </div>
                                </div>
                                <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2, fontFamily: 'var(--font-playfair)' }}>{post.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{post.excerpt}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                                                {post.author.avatar && <Image src={post.author.avatar} alt={post.author.name} width={30} height={30} />}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{post.author.name}</span>
                                        </div>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>Ligar &rarr;</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .blog-content-rendering h2 { margin: 3rem 0 1.5rem; font-size: 2.5rem; font-weight: 800; color: var(--foreground); }
                .blog-content-rendering p { margin-bottom: 1.5rem; }
                .blog-content-rendering img { max-width: 100%; border-radius: 20px; margin: 2rem 0; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                .blog-content-rendering blockquote { border-left: 5px solid var(--primary); padding-left: 2rem; font-style: italic; color: var(--text-muted); margin: 3rem 0; font-size: 1.5rem; }
            `}</style>
        </div>
    );
}
