"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, TrendingUp, Users, Lightbulb, Eye, Heart, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { blogService, BlogPost } from '@/lib/blogService';
import { motion } from 'framer-motion';

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
                padding: '160px 20px 100px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,215,0,0.05) 0%, transparent 70%)' }} />

                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontSize: 'clamp(3rem, 8vw, 5rem)',
                            fontWeight: 900,
                            color: '#fff',
                            marginBottom: '1.5rem',
                            letterSpacing: '-2px',
                            fontFamily: 'var(--font-playfair, serif)'
                        }}
                    >
                        Expanda seus <span style={{ color: '#FFD700' }}>Horizontes</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: '1.3rem',
                            color: '#94a3b8',
                            lineHeight: '1.8',
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}
                    >
                        Estratégias exclusivas de mentoria, marketing e gestão de eventos para profissionais que buscam a excelência.
                    </motion.p>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section style={{ padding: '80px 20px', maxWidth: '1400px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ height: '450px', background: '#f8fafc', borderRadius: '32px', border: '1px solid #f1f5f9' }} className="animate-pulse" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#f8fafc', borderRadius: '32px' }}>
                        <Users size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Nenhum artigo publicado ainda.</h3>
                        <p style={{ color: '#64748b' }}>Volte em breve para novos conteúdos exclusivos.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '50px' }}>
                        {posts.map((post, index) => {
                            const Icon = categoryIcons[post.category];
                            return (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9', transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                                        className="post-card"
                                    >
                                        {/* Image Container */}
                                        <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
                                                className="post-image"
                                            />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />

                                            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', color: '#000', padding: '8px 16px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                                                {post.category}
                                            </div>
                                        </div>

                                        {/* Content Container */}
                                        <div style={{ padding: '35px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Icon size={16} />
                                                    <span>{post.readTime} min</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Eye size={16} />
                                                    <span>{post.views}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Heart size={16} />
                                                    <span>{post.likes?.length || 0}</span>
                                                </div>
                                            </div>

                                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '15px', lineHeight: '1.25', fontFamily: 'var(--font-playfair, serif)' }}>
                                                {post.title}
                                            </h2>

                                            <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.6', marginBottom: '25px', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                                                {post.excerpt}
                                            </p>

                                            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden' }}>
                                                        {post.author.avatar ? <Image src={post.author.avatar} alt={post.author.name} width={32} height={32} /> : <Users size={16} style={{ padding: '6px' }} />}
                                                    </div>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{post.author.name}</span>
                                                </div>

                                                <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    Ler <ArrowRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>

            <style jsx>{`
                .post-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px -12px rgba(50, 50, 93, 0.15), 0 18px 36px -18px rgba(0, 0, 0, 0.2);
                }
                .post-card:hover .post-image {
                    transform: scale(1.05);
                }
                .post-card:hover .text-gold {
                    color: #000;
                }
            `}</style>
        </main>
    );
}
