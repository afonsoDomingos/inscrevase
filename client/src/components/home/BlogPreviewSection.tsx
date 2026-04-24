"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { blogService, BlogPost } from '@/lib/blogService';

export default function BlogPreviewSection() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        const fetchPosts = async () => {
            try {
                const data = await blogService.getPublishedPosts();
                setPosts(data.slice(0, 10)); // Get top 10 for carousel
            } catch (error) {
                console.error('Error fetching blog posts for preview:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1 >= posts.length ? 0 : prev + 1));
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 < 0 ? posts.length - 1 : prev - 1));
    };

    if (loading) return (
        <section style={{ padding: '80px 20px', background: '#f8fafc', textAlign: 'center' }}>
            <div className="container">Carregando conteúdos...</div>
        </section>
    );
    if (posts.length === 0) return null;

    return (
        <section style={{ padding: '80px 20px', background: '#f8fafc', overflow: 'hidden' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.5rem', fontFamily: 'var(--font-playfair)' }}
                        >
                            Conteúdo <span className="gold-text">Exclusivo</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            style={{ color: '#666', fontSize: '1.1rem' }}
                        >
                            Estratégias, dicas e novidades sobre o mundo dos eventos.
                        </motion.p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={prev} style={{
                                width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #eee', background: '#fff', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s'
                            }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#FFD700'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}>
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={next} style={{
                                width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #eee', background: '#fff', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s'
                            }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#FFD700'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <Link href="/blog" style={{
                            display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a', fontWeight: 700, textDecoration: 'none', borderBottom: '2px solid #FFD700', paddingBottom: '4px', transition: 'all 0.3s'
                        }}>
                            Ver todos <ArrowRight size={18} color="#FFD700" />
                        </Link>
                    </div>
                </div>

                <div style={{ position: 'relative', width: '100%' }}>
                    <motion.div
                        animate={{ x: `-${currentIndex * (isMobile ? 100 : 33.333)}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{
                            display: 'flex',
                            gap: '30px',
                            width: '100%'
                        }}
                    >
                        {posts.map((post) => (
                            <div
                                key={post._id}
                                style={{
                                    flex: `0 0 ${isMobile ? '100%' : 'calc(33.333% - 20px)'}`,
                                    minWidth: isMobile ? '100%' : 'calc(33.333% - 20px)'
                                }}
                            >
                                <Link href={`/blog/${post.slug}`} style={{
                                    textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', transition: 'transform 0.3s'
                                }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
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
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px', lineHeight: 1.4, height: '3.4em', overflow: 'hidden' }}>{post.title}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{post.excerpt}</p>
                                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'flex-end' }}>
                                            <div style={{ color: '#000', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                                Ler Artigo <ArrowRight size={14} color="#FFD700" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </motion.div>
                </div>
                
                {/* Dots Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
                    {Array.from({ length: Math.ceil(posts.length / (isMobile ? 1 : 3)) }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i * (isMobile ? 1 : 3))}
                            style={{
                                width: currentIndex === i * (isMobile ? 1 : 3) ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: currentIndex === i * (isMobile ? 1 : 3) ? '#FFD700' : '#ddd',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
