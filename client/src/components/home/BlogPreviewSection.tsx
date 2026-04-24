"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { blogService, BlogPost } from '@/lib/blogService';

export default function BlogPreviewSection() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await blogService.getPublishedPosts();
                setPosts(data.slice(0, 3)); // Get top 3
            } catch (error) {
                console.error('Error fetching blog posts for preview:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return null;
    if (posts.length === 0) return null;

    return (
        <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.5rem', fontFamily: 'var(--font-playfair)' }}>
                            Conteúdo <span className="gold-text">Exclusivo</span>
                        </h2>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>
                            Estratégias, dicas e novidades sobre o mundo dos eventos.
                        </p>
                    </div>
                    <Link href="/blog" style={{
                        display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a', fontWeight: 700, textDecoration: 'none', borderBottom: '2px solid #FFD700', paddingBottom: '4px', transition: 'all 0.3s'
                    }}>
                        Ver todos os artigos <ArrowRight size={18} color="#FFD700" />
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                    {posts.map((post, index) => (
                        <motion.div
                            key={post._id}
                            whileHover={{ y: -8 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/blog/${post.slug}`} style={{
                                textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                            }}>
                                <div style={{ position: 'relative', height: '220px' }}>
                                    <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>
                                        {post.category}
                                    </div>
                                </div>
                                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '15px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {post.readTime} min</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Eye size={14} /> {post.views}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px', lineHeight: 1.4 }}>{post.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{post.excerpt}</p>
                                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'flex-end' }}>
                                        <div style={{ color: '#000', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                            Ler Artigo <ArrowRight size={14} color="#FFD700" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
