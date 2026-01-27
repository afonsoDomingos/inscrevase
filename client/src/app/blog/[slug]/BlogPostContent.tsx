"use client";

import { useEffect, useState, useCallback } from 'react';
import { BlogPost, blogService } from '@/lib/blogService';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, ArrowLeft, Clock, Facebook, Twitter, Linkedin,
    Heart, MessageCircle, Copy, Check, Send, Lock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, useScroll, useSpring } from 'framer-motion';
import { authService, UserData } from '@/lib/authService';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BlogPostContent({ params }: { params: { slug: string } }) {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);
    const [copied, setCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Scroll progress bar
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const fetchPost = useCallback(async () => {
        try {
            const data = await blogService.getPostBySlug(params.slug);
            setPost(data);
            setLikeCount(data.likes?.length || 0);

            const currentUser = authService.getCurrentUser();
            if (currentUser && data.likes?.includes(currentUser.id)) {
                setIsLiked(true);
            }
        } catch {
            console.error('Error loading post');
        } finally {
            setLoading(false);
        }
    }, [params.slug]);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        fetchPost();
    }, [fetchPost]);

    const handleLike = async () => {
        const token = Cookies.get('token');
        if (!token) {
            toast.error('Você precisa estar logado para curtir artigos');
            return;
        }

        try {
            if (!post) return;
            // Optimistic update
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

            const response = await blogService.likePost(token, post._id);
            setLikeCount(response.likes.length);
        } catch {
            // Revert on error
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
            toast.error('Erro ao processar curtida');
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get('token');
        if (!token || !user) {
            toast.error('Você precisa estar logado para comentar');
            return;
        }

        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            if (!post) return;
            const commentsDisplay = await blogService.addComment(token, post._id, {
                text: commentText,
                userName: user.name,
                userAvatar: user.profilePhoto
            });

            // Update comments locally
            setPost(prev => prev ? { ...prev, comments: commentsDisplay } : null);
            setCommentText('');
            toast.success('Comentário enviado!');
        } catch {
            toast.error('Erro ao enviar comentário');
        } finally {
            setSubmittingComment(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Link copiado!');
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #FFD700', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Artigo não encontrado</h1>
                <Link href="/blog" style={{ color: '#FFD700', textDecoration: 'underline' }}>Voltar para o Blog</Link>
            </div>
        );
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <main style={{ background: '#fff', minHeight: '100vh', paddingBottom: '80px' }}>
            <Navbar />

            {/* Reading Progress Bar */}
            <motion.div
                style={{
                    scaleX,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#FFD700',
                    transformOrigin: '0%',
                    zIndex: 9999
                }}
            />

            {/* Header/Cover */}
            <header style={{ position: 'relative', height: '60vh', minHeight: '400px', width: '100%' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <Image
                        src={post.coverImage || 'https://images.unsplash.com/photo-1499750310159-5b600aaf0301?auto=format&fit=crop&q=80&w=1000'}
                        alt={post.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))' }} />
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '60px', maxWidth: '900px', margin: '0 auto', padding: '0 20px 60px' }}>
                    <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#fff', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', width: 'fit-content' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
                            <ArrowLeft size={16} />
                        </div>
                        Voltar para o Blog
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <span style={{
                                background: '#FFD700',
                                color: '#000',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {post.category}
                            </span>
                            {post.tags.map(tag => (
                                <span key={tag} style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    backdropFilter: 'blur(4px)'
                                }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 900,
                            color: '#fff',
                            lineHeight: 1.2,
                            marginBottom: '1.5rem',
                            fontFamily: 'var(--font-playfair)'
                        }}>
                            {post.title}
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', position: 'relative', border: '2px solid #fff' }}>
                                    <Image
                                        src={post.author.avatar || 'https://ui-avatars.com/api/?name=Admin'}
                                        alt={post.author.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <span style={{ fontWeight: 600 }}>{post.author.name}</span>
                            </div>
                            <div style={{ width: '4px', height: '4px', background: '#FFD700', borderRadius: '50%' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} />
                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div style={{ width: '4px', height: '4px', background: '#FFD700', borderRadius: '50%' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={16} />
                                {post.readTime} min de leitura
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <div className="blog-post-content-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '60px' }}>
                {/* Main Content */}
                <article>
                    <div className="blog-content" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#333', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: 500, color: '#555', marginBottom: '2rem', borderLeft: '4px solid #FFD700', paddingLeft: '20px', fontStyle: 'italic' }}>
                            {post.excerpt}
                        </p>

                        <ReactMarkdown
                            components={{
                                h2: ({ ...props }) => <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, margin: '2.5rem 0 1.5rem', color: '#000', fontFamily: 'var(--font-playfair)', lineHeight: 1.3 }} {...props} />,
                                h3: ({ ...props }) => <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '2rem 0 1rem', color: '#000' }} {...props} />,
                                p: ({ ...props }) => <p style={{ marginBottom: '1.5rem', maxWidth: '100%' }} {...props} />,
                                ul: ({ ...props }) => <ul style={{ marginBottom: '1.5rem', paddingLeft: '20px', maxWidth: '100%' }} {...props} />,
                                li: ({ ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                                img: ({ ...props }) => (
                                    <div style={{ margin: '2rem 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img style={{ width: '100%', height: 'auto', display: 'block' }} alt={props.alt || 'Blog image'} {...props} />
                                    </div>
                                ),
                                blockquote: ({ ...props }) => (
                                    <blockquote style={{ background: '#f9f9f9', borderLeft: '4px solid #FFD700', padding: '1.5rem', margin: '2rem 0', borderRadius: '0 8px 8px 0', fontStyle: 'italic', color: '#555', overflowWrap: 'break-word' }} {...props} />
                                ),
                                a: ({ ...props }) => <a style={{ color: '#000', textDecoration: 'underline', textDecorationColor: '#FFD700', textUnderlineOffset: '3px', fontWeight: 600, overflowWrap: 'break-word' }} {...props} />
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Interaction Bar */}
                    <div style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <button
                                onClick={handleLike}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: isLiked ? '#ffebee' : '#f5f5f5',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    color: isLiked ? '#e53e3e' : '#666',
                                    fontWeight: 700,
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                {likeCount}
                            </button>
                            <button
                                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#f5f5f5',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    color: '#666',
                                    fontWeight: 700,
                                    fontSize: '0.9rem'
                                }}
                            >
                                <MessageCircle size={18} />
                                {post.comments?.length || 0}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank')} className="social-share-btn"><Facebook size={18} /></button>
                            <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`, '_blank')} className="social-share-btn"><Twitter size={18} /></button>
                            <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank')} className="social-share-btn"><Linkedin size={18} /></button>
                            <button onClick={copyLink} className="social-share-btn" title="Copiar Link">
                                {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Author Bio */}
                    <div style={{ marginTop: '3rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0, border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <Image
                                src={post.author.avatar || 'https://ui-avatars.com/api/?name=Author'}
                                alt={post.author.name}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Escrito por {post.author.name}</h3>
                            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>Especialista em eventos e marketing digital na Inscreva-se. Apaixonado por ajudar organizadores a alcançarem seu potencial máximo.</p>
                        </div>
                    </div>

                    <style jsx>{`
                         @media (min-width: 768px) {
                            div[style*="flex-direction: column"] {
                                flex-direction: row !important;
                                text-align: left !important;
                            }
                         }
                    `}</style>

                    {/* Add Banner In-line */}
                    <div style={{ margin: '3rem 0', background: 'linear-gradient(135deg, #000 0%, #333 100%)', borderRadius: '20px', padding: '2rem 1.5rem', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFD700' }}>Organize eventos como um profissional</h3>
                            <p style={{ opacity: 0.9, marginBottom: '1.5rem', fontSize: '0.95rem' }}>Use a mesma plataforma que os maiores organizadores de Moçambique.</p>
                            <Link href="/cadastro" style={{ display: 'inline-block', background: '#FFD700', color: '#000', padding: '12px 30px', borderRadius: '50px', fontWeight: 700, textDecoration: 'none' }}>
                                Começar Agora
                            </Link>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div id="comments-section" style={{ marginTop: '4rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Comentários ({post.comments?.length || 0})</h3>

                        {/* Comment Form */}
                        {user ? (
                            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '3rem' }}>
                                <div className="comment-form-container" style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                                            <Image src={user.profilePhoto || 'https://ui-avatars.com/api/?name=User'} alt={user.name} fill style={{ objectFit: 'cover' }} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Participe da discussão..."
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '1px solid #eee',
                                                minHeight: '100px',
                                                resize: 'vertical',
                                                fontFamily: 'inherit',
                                                marginBottom: '10px'
                                            }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                type="submit"
                                                className="submit-btn"
                                                disabled={submittingComment || !commentText.trim()}
                                                style={{
                                                    background: '#000',
                                                    color: '#FFD700',
                                                    border: 'none',
                                                    padding: '10px 24px',
                                                    borderRadius: '8px',
                                                    fontWeight: 700,
                                                    cursor: submittingComment || !commentText.trim() ? 'not-allowed' : 'pointer',
                                                    opacity: submittingComment || !commentText.trim() ? 0.7 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    width: '100%',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {submittingComment ? 'Enviando...' : <><Send size={16} /> Publicar</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div style={{ background: '#f5f5f5', padding: '2rem', borderRadius: '12px', textAlign: 'center', marginBottom: '3rem' }}>
                                <Lock size={32} color="#999" style={{ marginBottom: '1rem' }} />
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Faça login para comentar</h4>
                                <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Junte-se à nossa comunidade.</p>
                                <Link href="/entrar" className="btn-primary" style={{ display: 'inline-block', width: '100%' }}>Entrar na minha conta</Link>
                            </div>
                        )}

                        {/* Comments List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {post.comments?.length === 0 && <p style={{ color: '#999', fontStyle: 'italic' }}>Seja o primeiro a comentar!</p>}
                            {post.comments?.map((comment, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                        <Image src={comment.user.avatar || 'https://ui-avatars.com/api/?name=' + comment.user.name} alt={comment.user.name} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 700 }}>{comment.user.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ color: '#444', lineHeight: 1.5, wordWrap: 'break-word' }}>{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .blog-post-content-container .social-share-btn {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        border: 1px solid #eee;
                        background: #fff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        color: #555;
                        transition: all 0.2s;
                    }
                    .blog-post-content-container .social-share-btn:hover {
                        background: #000;
                        color: #FFD700;
                        border-color: #000;
                        transform: translateY(-2px);
                    }
                    @media (min-width: 768px) {
                        .blog-post-content-container .comment-form-container {
                            flex-direction: row !important;
                        }
                        .blog-post-content-container .submit-btn {
                            width: auto !important;
                        }
                    }
                `}} />
            </div>
            <Footer />
        </main>
    );
}
