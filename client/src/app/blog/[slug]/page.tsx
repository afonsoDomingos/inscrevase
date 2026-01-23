"use client";

import { useEffect, useState } from 'react';
import { BlogPost, blogService } from '@/lib/blogService';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await blogService.getPostBySlug(params.slug);
                setPost(data);
            } catch (error) {
                console.error('Error loading post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.slug]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff'
            }}>
                <div className="animate-pulse">Carregando artigo...</div>
            </div>
        );
    }

    if (!post) {
        notFound();
        return null;
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <main style={{ background: '#fff', minHeight: '100vh' }}>
            {/* Hero Header */}
            <div style={{
                position: 'relative',
                height: '60vh',
                minHeight: '400px',
                width: '100%',
                background: '#000'
            }}>
                <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover', opacity: 0.6 }}
                    priority
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, #000 0%, transparent 100%)'
                }} />

                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '40px 20px',
                    color: '#fff'
                }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <Link
                            href="/blog"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#FFD700',
                                textDecoration: 'none',
                                marginBottom: '20px',
                                fontWeight: 600
                            }}
                        >
                            <ArrowLeft size={20} /> Voltar para o Blog
                        </Link>

                        <div style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            background: '#FFD700',
                            color: '#000',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            marginBottom: '16px'
                        }}>
                            {post.category}
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.2,
                            marginBottom: '20px'
                        }}>
                            {post.title}
                        </h1>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '20px',
                            alignItems: 'center',
                            fontSize: '0.9rem',
                            color: '#ccc'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {post.author.avatar ? (
                                        <Image src={post.author.avatar} alt={post.author.name} width={32} height={32} />
                                    ) : (
                                        <User size={16} color="#fff" />
                                    )}
                                </div>
                                <span>{post.author.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} />
                                <span>
                                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={16} />
                                <span>{post.readTime} min de leitura</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
                <article className="prose prose-lg prose-headings:font-bold prose-headings:text-black prose-p:text-gray-600 prose-a:text-yellow-600">
                    <ReactMarkdown
                        components={{
                            h2: ({ node, ...props }) => <h2 style={{ fontSize: '2rem', marginTop: '2em', marginBottom: '1em' }} {...props} />,
                            p: ({ node, ...props }) => <p style={{ fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '1.5em' }} {...props} />,
                            ul: ({ node, ...props }) => <ul style={{ marginLeft: '1.5em', marginBottom: '1.5em', listStyleType: 'disc' }} {...props} />,
                            li: ({ node, ...props }) => <li style={{ marginBottom: '0.5em' }} {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote style={{
                                    borderLeft: '4px solid #FFD700',
                                    paddingLeft: '1em',
                                    fontStyle: 'italic',
                                    color: '#444',
                                    margin: '2em 0',
                                    background: '#f9f9f9',
                                    padding: '20px'
                                }} {...props} />
                            )
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </article>

                <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Compartilhe este artigo</h3>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '10px', borderRadius: '50%', background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Facebook size={20} />
                        </a>
                        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '10px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Twitter size={20} />
                        </a>
                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '10px', borderRadius: '50%', background: '#0077b5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
