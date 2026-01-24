"use client";

import { useEffect, useState, useRef } from 'react';
import { BlogPost, blogService } from '@/lib/blogService';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, User, ArrowLeft, Clock, Facebook, Twitter, Linkedin,
    Heart, MessageCircle, Share2, Copy, Check, Eye, Send, Lock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { authService, UserData } from '@/lib/authService';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
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

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        fetchPost();
    }, [params.slug]);

    const fetchPost = async () => {
        try {
            const data = await blogService.getPostBySlug(params.slug);
            setPost(data);
            setLikeCount(data.likes?.length || 0);

            const currentUser = authService.getCurrentUser();
            if (currentUser && data.likes?.includes(currentUser.id)) {
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Error loading post:', error);
        } finally {
            setLoading(false);
        }
    };

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
        } catch (error) {
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
            const comments = await blogService.addComment(token, post._id, {
                text: commentText,
                userName: user.name,
                userAvatar: user.profilePhoto || ''
            });

            setPost(prev => prev ? { ...prev, comments } : null);
            setCommentText('');
            toast.success('Comentário enviado!');
        } catch (error) {
            toast.error('Erro ao enviar comentário');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Link copiado para a área de transferência!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTopColor: '#FFD700', borderRadius: '50%' }}
                />
            </div>
        );
    }

    if (!post) {
        notFound();
        return null;
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <main style={{ background: '#fff', minHeight: '100vh', position: 'relative' }}>
            {/* Reading Progress Bar */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#FFD700',
                    transformOrigin: '0%',
                    zIndex: 2000,
                    scaleX
                }}
            />

            {/* Sticky Interaction Bar (Desktop Side) */}
            <div style={{
                position: 'fixed',
                left: 'max(20px, calc(50% - 480px))',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                zIndex: 100,
                opacity: 0.8,
                visibility: typeof window !== 'undefined' && window.innerWidth < 1100 ? 'hidden' : 'visible'
            }}>
                <InteractionButton
                    icon={<Heart size={20} fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "#64748b"} />}
                    label={likeCount.toString()}
                    onClick={handleLike}
                    active={isLiked}
                />
                <InteractionButton
                    icon={<MessageCircle size={20} color="#64748b" />}
                    label={post.comments?.length.toString() || '0'}
                    onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                />
                <InteractionButton
                    icon={copied ? <Check size={20} color="#10b981" /> : <Copy size={20} color="#64748b" />}
                    onClick={handleCopyLink}
                />
            </div>

            {/* Hero Header */}
            <div style={{ position: 'relative', height: '70vh', minHeight: '500px', width: '100%', overflow: 'hidden' }}>
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    style={{ position: 'absolute', inset: 0 }}
                >
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.8) 100%)' }} />
                </motion.div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '60px 20px', color: '#fff' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#FFD700', textDecoration: 'none', marginBottom: '25px', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <ArrowLeft size={18} /> Voltar para Artigos
                            </Link>

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <span style={{ padding: '5px 15px', background: 'var(--gold-gradient, #FFD700)', color: '#000', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {post.category}
                                </span>
                            </div>

                            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '25px', textShadow: '0 2px 10px rgba(0,0,0,0.3)', fontFamily: 'var(--font-playfair, serif)' }}>
                                {post.title}
                            </h1>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', alignItems: 'center', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '2px solid #FFD700', overflow: 'hidden' }}>
                                        {post.author.avatar ? <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}><User size={20} color="#000" /></div>}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{post.author.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={18} className="text-gold" />
                                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={18} />
                                    <span>{post.readTime} min de leitura</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Eye size={18} />
                                    <span>{post.views} visualizações</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 800px) 300px', gap: '60px', padding: '80px 20px' }}>

                {/* Long Form Article */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <article className="blog-content">
                        <ReactMarkdown
                            components={{
                                h2: ({ ...props }) => <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1.2rem', color: '#0f172a' }} {...props} />,
                                h3: ({ ...props }) => <h3 style={{ fontSize: '1.7rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }} {...props} />,
                                p: ({ ...props }) => <p style={{ fontSize: '1.25rem', lineHeight: '1.9', marginBottom: '1.8rem', color: '#334155' }} {...props} />,
                                img: ({ ...props }) => <img {...props} style={{ maxWidth: '100%', borderRadius: '16px', margin: '2rem 0', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />,
                                blockquote: ({ ...props }) => (
                                    <blockquote style={{ borderLeft: '6px solid #FFD700', padding: '30px', fontStyle: 'italic', fontSize: '1.4rem', color: '#475569', margin: '3rem 0', background: '#f8fafc', borderRadius: '0 16px 16px 0' }} {...props} />
                                )
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </article>

                    {/* Like & Share (Mobile & Bottom) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '60px', padding: '30px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <button
                                onClick={handleLike}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: isLiked ? '#fee2e2' : '#fff', border: isLiked ? '1px solid #f87171' : '1px solid #e2e8f0', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, color: isLiked ? '#ef4444' : '#64748b' }}
                            >
                                <Heart size={20} fill={isLiked ? "#ef4444" : "none"} /> {likeCount} Curtidas
                            </button>
                            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> {post.views} pessoas leram este artigo
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="share-btn fb"><Facebook size={20} /></a>
                            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`} target="_blank" rel="noopener noreferrer" className="share-btn tw"><Twitter size={20} /></a>
                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="share-btn li"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <section id="comments" style={{ marginTop: '80px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Comentários</h2>
                            <span style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700 }}>{post.comments?.length || 0}</span>
                        </div>

                        {/* Comment Form */}
                        {user ? (
                            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '60px' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                        {user.profilePhoto ? <Image src={user.profilePhoto} alt={user.name} width={50} height={50} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} color="#94a3b8" /></div>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="O que você achou deste artigo? Compartilhe seus pensamentos..."
                                            style={{ width: '100%', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1.1rem', minHeight: '120px', resize: 'none', transition: 'all 0.2s', outline: 'none' }}
                                            onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                                            <button
                                                type="submit"
                                                disabled={submittingComment || !commentText.trim()}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 30px', background: !commentText.trim() ? '#cbd5e1' : '#FFD700', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: submittingComment ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                                            >
                                                {submittingComment ? 'Enviando...' : <><Send size={18} /> Publicar Comentário</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div style={{ marginBottom: '60px', padding: '40px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                                    <Lock size={24} color="#64748b" />
                                </div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>Quer participar da conversa?</h4>
                                <p style={{ color: '#64748b', marginBottom: '25px' }}>Inicie sessão na sua conta para deixar seu comentário e curtir este artigo.</p>
                                <Link href="/entrar" style={{ display: 'inline-block', padding: '12px 30px', background: '#000', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>Fazer Login</Link>
                            </div>
                        )}

                        {/* Comments List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <AnimatePresence>
                                {post.comments && post.comments.length > 0 ? (
                                    post.comments.map((comment, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            style={{ display: 'flex', gap: '20px', padding: '25px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '20px' }}
                                        >
                                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                                {comment.user.avatar ? <Image src={comment.user.avatar} alt={comment.user.name} width={45} height={45} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#94a3b8" /></div>}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{comment.user.name}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• {new Date(comment.createdAt).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '1.05rem' }}>{comment.text}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                                        <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
                                        <p>Seja o primeiro a comentar neste artigo!</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </motion.div>

                {/* Sidebar (Tablet/Desktop) */}
                <aside style={{ display: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'none' : 'block' }}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ padding: '30px', background: '#0f172a', borderRadius: '24px', color: '#fff', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '15px', color: '#FFD700' }}>Inscreva-se</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '25px' }}>
                                Receba as melhores estratégias de eventos e marketing direto no seu e-mail.
                            </p>
                            <input type="email" placeholder="Seu melhor e-mail" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', marginBottom: '15px', outline: 'none' }} />
                            <button style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#FFD700', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>Inscrição Premium</button>
                        </div>

                        {post.tags && post.tags.length > 0 && (
                            <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '24px' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Tags Relacionadas</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {post.tags.map((tag, i) => (
                                        <span key={i} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <style jsx>{`
                .blog-content {
                    font-family: 'Inter', sans-serif;
                }
                .text-gold { color: #FFD700; }
                .share-btn {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    display: flex;
                    alignItems: center;
                    justifyContent: center;
                    color: #fff;
                    transition: transform 0.2s;
                    text-decoration: none;
                }
                .share-btn:hover { transform: translateY(-3px); }
                .fb { background: #1877F2; }
                .tw { background: #000; }
                .li { background: #0077b5; }
                
                @media (max-width: 1024px) {
                    main { grid-template-columns: 1fr !important; }
                    aside { display: none !important; }
                }
                
                :global(.blog-content p) {
                    margin-bottom: 2rem !important;
                }
            `}</style>
        </main>
    );
}

function InteractionButton({ icon, label, onClick, active }: { icon: React.ReactNode, label?: string, onClick: () => void, active?: boolean }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '10px',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9'
            }}>
                {icon}
            </div>
            {label && <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{label}</span>}
        </button>
    );
}
