"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, TrendingUp, Users, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { blogService, BlogPost } from '@/lib/blogService';

const categoryIcons = {
    guide: Calendar,
    marketing: TrendingUp,
    mentoring: Users,
    engagement: Lightbulb,
};

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await blogService.getPublishedPosts();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <main style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
                padding: '120px 20px 80px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: 900,
                        color: '#fff',
                        marginBottom: '1.5rem',
                        letterSpacing: '-2px'
                    }}>
                        Blog Inscreva.se
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#aaa',
                        lineHeight: '1.8'
                    }}>
                        Dicas, estratégias e guias para você organizar eventos de sucesso e escalar sua mentoria
                    </p>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                        Carregando artigos...
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                        Nenhum artigo publicado ainda.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '40px'
                    }}>
                        {posts.map((post) => {
                            const Icon = categoryIcons[post.category];
                            return (
                                <Link
                                    key={post._id}
                                    href={`/blog/${post.slug}`}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        display: 'block',
                                        background: '#fff',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        border: '1px solid #eee',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}
                                    className="blog-post-card"
                                >
                                    {/* Image */}
                                    <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '15px',
                                            left: '15px',
                                            background: '#FFD700',
                                            color: '#000',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {post.category === 'guide' ? 'Guias' :
                                                post.category === 'marketing' ? 'Marketing' :
                                                    post.category === 'mentoring' ? 'Mentoria' : 'Engajamento'}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '30px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '15px',
                                            color: '#666',
                                            fontSize: '0.85rem'
                                        }}>
                                            <Icon size={16} />
                                            <span>{post.readTime} min de leitura</span>
                                        </div>

                                        <h2 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 800,
                                            color: '#000',
                                            marginBottom: '12px',
                                            lineHeight: '1.3'
                                        }}>
                                            {post.title}
                                        </h2>

                                        <p style={{
                                            fontSize: '1rem',
                                            color: '#666',
                                            lineHeight: '1.6'
                                        }}>
                                            {post.excerpt}
                                        </p>

                                        <div style={{
                                            marginTop: '20px',
                                            color: '#FFD700',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            Ler artigo →
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            <style jsx>{`
        .blog-post-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
        }
      `}</style>
        </main>
    );
}
