"use client";

import { useEffect, useState } from 'react';
import { blogService, BlogPost } from '@/lib/blogService';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';

export default function InternalBlogView() {
    const { t } = useTranslate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);

    const handleSelectPost = async (post: BlogPost) => {
        if (!post.content) {
            setFetchingDetail(true);
            try {
                const fullPost = await blogService.getPostBySlug(post.slug);
                setSelectedPost(fullPost);
            } catch (err) {
                console.error('Error fetching post detail:', err);
                setSelectedPost(post);
            } finally {
                setFetchingDetail(false);
            }
        } else {
            setSelectedPost(post);
        }
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

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

        return () => window.removeEventListener('resize', checkMobile);
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
                            <ArrowLeft size={18} /> {t('blog.backToArticles')}
                        </button>

                        <article className="luxury-card" style={{ padding: '0', overflow: 'visible', background: 'var(--paper)', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                            <div style={{ position: 'relative', width: '100%', height: isMobile ? '250px' : '400px', borderRadius: '32px 32px 0 0', overflow: 'hidden' }}>
                                <Image
                                    src={selectedPost.coverImage}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    alt={selectedPost.title}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                            </div>

                            <div style={{ padding: isMobile ? '1.5rem' : '3.5rem', position: 'relative' }}>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                                    <span style={{ background: 'var(--gold-gradient)', color: '#000', padding: '5px 15px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {selectedPost.category}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                        <Clock size={14} /> {selectedPost.readTime} {t('blog.readTime')}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                        <Eye size={14} /> {selectedPost.views} {t('blog.views')}
                                    </div>
                                </div>

                                <h1 style={{
                                    fontSize: isMobile ? '1.6rem' : '2.1rem',
                                    fontWeight: 900,
                                    marginBottom: '1rem',
                                    lineHeight: 1.15,
                                    fontFamily: 'var(--font-playfair)',
                                    color: 'var(--foreground)',
                                    letterSpacing: '-0.02em'
                                }}>
                                    {selectedPost.title}
                                </h1>

                                {selectedPost.excerpt && (
                                    <p style={{
                                        fontSize: '1.02rem',
                                        color: 'var(--text-muted)',
                                        lineHeight: 1.6,
                                        marginBottom: '2.5rem',
                                        fontWeight: 500,
                                        borderLeft: '3px solid var(--primary)',
                                        paddingLeft: '1.5rem',
                                        fontStyle: 'italic',
                                        maxWidth: '800px'
                                    }}>
                                        {selectedPost.excerpt}
                                    </p>
                                )}

                                <div
                                    className="blog-content-rendering"
                                    style={{
                                        fontSize: '0.96rem',
                                        lineHeight: 1.8,
                                        color: 'var(--foreground)',
                                        maxWidth: '850px',
                                        minHeight: '10vh',
                                        opacity: fetchingDetail ? 0.5 : 1
                                    }}
                                >
                                    {fetchingDetail ? (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '2rem 0', opacity: 0.5 }}>
                                            <Loader2 className="animate-spin" size={20} /> Carregando conteúdo completo...
                                        </div>
                                    ) : (
                                        <div
                                            style={{ whiteSpace: 'pre-line' }}
                                            dangerouslySetInnerHTML={{ __html: selectedPost.content || '' }}
                                        />
                                    )}
                                </div>
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
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
                            gap: isMobile ? '1.5rem' : '2.5rem',
                            justifyContent: 'center',
                            alignItems: 'start',
                            maxWidth: isMobile ? '450px' : 'none',
                            margin: '0 auto',
                            padding: isMobile ? '0 1rem' : '0'
                        }}
                    >
                        {posts.map((post, idx) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="luxury-card"
                                onClick={() => handleSelectPost(post)}
                                style={{
                                    padding: '0',
                                    cursor: 'pointer',
                                    background: 'var(--paper)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 'auto',
                                    border: '1px solid var(--border)',
                                    overflow: 'hidden',
                                    borderRadius: '24px'
                                }}
                            >
                                <div style={{ position: 'relative', height: isMobile ? '180px' : '200px', overflow: 'hidden' }}>
                                    <Image src={post.coverImage} fill style={{ objectFit: 'cover' }} alt={post.title} />
                                    <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', color: '#000', padding: '5px 12px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {post.category}
                                    </div>
                                </div>
                                <div style={{ padding: isMobile ? '1.5rem' : '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.35rem', fontWeight: 800, marginBottom: '0.8rem', lineHeight: 1.2, fontFamily: 'var(--font-playfair)' }}>{post.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.2rem', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#eee', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                                                {post.author.avatar && <Image src={post.author.avatar} alt={post.author.name} width={26} height={26} />}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{post.author.name}</span>
                                        </div>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem' }}>Ler Mais &rarr;</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .blog-content-rendering h2 { margin: 2.5rem 0 1.25rem; font-size: 1.4rem; font-weight: 850; color: var(--foreground); line-height: 1.2; letter-spacing: -0.3px; }
                .blog-content-rendering h3 { margin: 1.8rem 0 1rem; font-size: 1.2rem; font-weight: 800; color: var(--foreground); }
                .blog-content-rendering p { margin-bottom: 1.4rem; color: var(--foreground); opacity: 0.95; }
                .blog-content-rendering ul, .blog-content-rendering ol { margin: 1.2rem 0; padding-left: 1.5rem; }
                .blog-content-rendering li { margin-bottom: 0.7rem; }
                .blog-content-rendering img { max-width: 100%; border-radius: 16px; margin: 2rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .blog-content-rendering blockquote { border-left: 3px solid var(--primary); padding: 1.5rem; font-style: italic; color: var(--text-muted); margin: 2.2rem 0; font-size: 1rem; background: rgba(212, 175, 55, 0.03); border-radius: 0 12px 12px 0; }
                .blog-content-rendering a { color: var(--primary); font-weight: 700; text-decoration: underline; }
            `}</style>
        </div>
    );
}
