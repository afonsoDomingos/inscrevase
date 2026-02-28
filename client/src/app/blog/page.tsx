"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, TrendingUp, Users, Lightbulb, Eye, ArrowRight, Megaphone, FileText, LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { blogService, BlogPost } from '@/lib/blogService';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/common/AdBanner';

const categoryIcons: Record<string, LucideIcon> = {
    guide: Calendar,
    marketing: TrendingUp,
    mentoring: Users,
    engagement: Lightbulb,
    event: Megaphone,
    'case-study': FileText,
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
            <Navbar />

            {/* Hero Section */}
            <section style={{
                height: '70vh',
                minHeight: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: '#000'
            }}>
                <Image
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                    alt="Blog Banner"
                    fill
                    style={{ objectFit: 'cover', opacity: 0.5 }}
                    priority
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)' }} />

                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1, padding: '0 20px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontSize: 'clamp(3.5rem, 10vw, 6rem)',
                            fontWeight: 900,
                            color: '#fff',
                            marginBottom: '1.5rem',
                            letterSpacing: '-2px',
                            fontFamily: 'var(--font-playfair, serif)',
                            lineHeight: 1
                        }}
                    >
                        Expanda seus <span style={{ color: '#FFD700' }}>Horizontes</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            fontSize: '1.5rem',
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: '1.8',
                            maxWidth: '750px',
                            margin: '0 auto',
                            fontWeight: 300
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

                        {/* Sidebar Ad Slot */}
                        <div style={{ marginTop: '30px' }}>
                            <AdBanner slot="1748533691" format="rectangle" />
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#f8fafc', borderRadius: '32px' }}>
                        <Users size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Nenhum artigo publicado ainda.</h3>
                        <p style={{ color: '#64748b' }}>Volte em breve para novos conteúdos exclusivos.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
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
                                        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%', background: '#1a1a1a', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
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
                                        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Icon size={14} />
                                                    <span>{post.readTime} min</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Eye size={14} />
                                                    <span>{post.views}</span>
                                                </div>
                                            </div>

                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '12px', lineHeight: '1.3', fontFamily: 'var(--font-playfair, serif)' }}>
                                                {post.title}
                                            </h2>

                                            <p style={{ fontSize: '1rem', color: '#ccc', lineHeight: '1.6', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                                                {post.excerpt}
                                            </p>

                                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', overflow: 'hidden', position: 'relative' }}>
                                                        <Image
                                                            src={(post.author.name === 'Equipe Inscreva.se' || !post.author.avatar) ? '/icon-192x192.png' : post.author.avatar}
                                                            alt={post.author.name}
                                                            width={30}
                                                            height={30}
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{post.author.name}</span>
                                                </div>

                                                <div style={{ color: '#FFD700', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    LER ARTIGO <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Blog Listing Ad Slot */}
                <div style={{ marginTop: '60px' }}>
                    <AdBanner slot="1748533691" format="horizontal" />
                </div>
            </section>

            <Footer />

            <style jsx>{`
                .post-card:hover {
                    border-color: #FFD700;
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                }
                .post-card:hover .post-image {
                    transform: scale(1.05);
                }
                @media (max-width: 768px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                        gap: 30px !important;
                    }
                    h1 { font-size: 2.5rem !important; }
                    section[style*="height: 70vh"] {
                        height: 50vh !important;
                        min-height: 400px !important;
                    }
                }
            `}</style>
        </main>
    );
}
