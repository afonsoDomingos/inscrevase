'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, CheckCircle, Video, X } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';

import Cookies from 'js-cookie';

interface Lesson {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    category: 'basico' | 'intermediario' | 'avancado';
    isCompleted?: boolean;
    views: number;
    order?: number;
    targetAudience?: 'mentors' | 'participants' | 'both';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ParticipantLessons() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const token = Cookies.get('token');
            // Assuming participants use the same endpoint as mentors for learning
            const response = await axios.get(`${API_URL}/lessons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessons(response.data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonComplete = async (lessonId: string) => {
        try {
            const token = Cookies.get('token');
            await axios.post(`${API_URL}/lessons/${lessonId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLessons(prev => prev.map(l =>
                l._id === lessonId ? { ...l, isCompleted: true } : l
            ));
        } catch (error) {
            console.error('Error marking lesson as complete:', error);
        }
    };

    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || lesson.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getCategoryBadge = (category: string) => {
        const badges = {
            basico: { label: 'Básico', color: 'bg-green-100 text-green-700' },
            intermediario: { label: 'Intermediário', color: 'bg-yellow-100 text-yellow-700' },
            avancado: { label: 'Avançado', color: 'bg-red-100 text-red-700' }
        };
        return badges[category as keyof typeof badges] || badges.basico;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Premium */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    borderRadius: '24px',
                    padding: '3rem 2.5rem',
                    marginBottom: '2.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 215, 0, 0.1)'
                }}
            >
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', opacity: 0.05 }}>
                    <Video size={200} color="#FFD700" />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                        <div style={{
                            background: 'var(--gold-gradient)',
                            padding: '10px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Video size={24} color="#000" />
                        </div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-playfair)',
                            color: '#fff',
                            margin: 0
                        }}>
                            Aulas & Treinamentos
                        </h1>
                    </div>
                    <p style={{ color: '#FFD700', fontSize: '1.1rem', fontWeight: 500, margin: 0, opacity: 0.9 }}>
                        Aprimore suas habilidades com nosso conteúdo exclusivo.
                    </p>
                </div>
            </motion.div>

            {/* Filters Premium */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    marginBottom: '2.5rem',
                    background: 'var(--paper)',
                    padding: '1.5rem',
                    borderRadius: '20px',
                    border: '1px solid var(--border)'
                }}
            >
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
                    <input
                        type="text"
                        placeholder="Buscar aulas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            paddingLeft: '3rem',
                            paddingRight: '1rem',
                            paddingTop: '0.875rem',
                            paddingBottom: '0.875rem',
                            borderRadius: '12px',
                            border: '2px solid #e0e0e0',
                            background: '#fff',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            color: '#1a1a1a'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#FFD700';
                            e.target.style.boxShadow = '0 0 0 4px rgba(255, 215, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e0e0e0';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="no-scrollbar">
                    {['all', 'basico', 'intermediario', 'avancado'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            style={{
                                padding: '0.625rem 1.25rem',
                                borderRadius: '50px',
                                whiteSpace: 'nowrap',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                border: categoryFilter === cat ? '2px solid #FFD700' : '2px solid #e0e0e0',
                                background: categoryFilter === cat ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : '#fff',
                                color: categoryFilter === cat ? '#000' : '#666',
                                boxShadow: categoryFilter === cat ? '0 4px 12px rgba(255, 215, 0, 0.3)' : 'none'
                            }}
                            onMouseOver={(e) => {
                                if (categoryFilter !== cat) {
                                    e.currentTarget.style.background = '#f8f8f8';
                                    e.currentTarget.style.borderColor = '#FFD700';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (categoryFilter !== cat) {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                }
                            }}
                        >
                            {cat === 'all' ? 'Todas' : cat === 'basico' ? 'Básico' : cat === 'intermediario' ? 'Intermediário' : 'Avançado'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Lessons Grid Premium */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {filteredLessons.map((lesson, index) => (
                    <motion.div
                        key={lesson._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedLesson(lesson)}
                        style={{
                            background: 'var(--paper)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 215, 0, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                        }}
                    >
                        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                            {lesson.thumbnailUrl ? (
                                <Image src={lesson.thumbnailUrl} alt={lesson.title} fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                                }}>
                                    <Video size={48} color="#FFD700" style={{ opacity: 0.3 }} />
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                            }}
                                className="lesson-overlay"
                                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
                            >
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'var(--gold-gradient)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)'
                                }}>
                                    <Play size={28} fill="#000" color="#000" />
                                </div>
                            </div>
                            <span style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                background: lesson.category === 'basico' ? '#10b981' : lesson.category === 'intermediario' ? '#f59e0b' : '#ef4444',
                                color: '#fff',
                                backdropFilter: 'blur(10px)'
                            }}>
                                {getCategoryBadge(lesson.category).label}
                            </span>
                            {lesson.isCompleted && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: '#10b981',
                                    color: '#fff',
                                    padding: '6px',
                                    borderRadius: '50%',
                                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)'
                                }}>
                                    <CheckCircle size={20} />
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    AULA {lesson.order || (lessons.indexOf(lesson) + 1)}
                                </span>
                            </div>
                            <h3 style={{
                                fontWeight: 800,
                                fontSize: '1.15rem',
                                marginBottom: '0.75rem',
                                lineHeight: 1.3,
                                color: 'var(--foreground)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {lesson.title}
                            </h3>
                            <p style={{
                                color: '#666',
                                fontSize: '0.9rem',
                                lineHeight: 1.5,
                                marginBottom: '1rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {lesson.description}
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: '1rem',
                                borderTop: '1px solid #eee',
                                fontSize: '0.8rem',
                                color: '#999',
                                fontWeight: 600
                            }}>
                                <span>{Math.floor(lesson.duration / 60)}:{(Math.floor(lesson.duration % 60)).toString().padStart(2, '0')}</span>
                                <span>{lesson.views} visualizações</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredLessons.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'var(--paper)',
                        borderRadius: '24px',
                        border: '2px dashed var(--border)'
                    }}
                >
                    <div style={{
                        background: 'rgba(255, 215, 0, 0.1)',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <Video size={50} color="#FFD700" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                        Nenhuma aula encontrada
                    </h3>
                    <p style={{ color: '#666', fontSize: '1rem' }}>
                        Tente ajustar os filtros ou buscar por outro termo.
                    </p>
                </motion.div>
            )}

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedLesson && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLesson(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-black rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedLesson(null)}
                                className="absolute top-4 right-4 z-10 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="aspect-video bg-black">
                                {(selectedLesson.videoUrl.includes('youtube') || selectedLesson.videoUrl.includes('youtu.be') || selectedLesson.videoUrl.includes('vimeo') || selectedLesson.videoUrl.includes('drive.google.com')) ? (
                                    <iframe
                                        src={selectedLesson.videoUrl.includes('youtube') || selectedLesson.videoUrl.includes('youtu.be')
                                            ? selectedLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                                            : selectedLesson.videoUrl.includes('vimeo.com/')
                                                ? selectedLesson.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')
                                                : selectedLesson.videoUrl.includes('drive.google.com')
                                                    ? selectedLesson.videoUrl.replace('/view', '/preview').replace('/edit', '/preview').replace('usp=sharing', '')
                                                    : selectedLesson.videoUrl}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        src={selectedLesson.videoUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full"
                                        onEnded={() => handleLessonComplete(selectedLesson._id)}
                                    />
                                )}
                            </div>

                            <div className="p-6 bg-white">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
                                        <p className="text-gray-600">{selectedLesson.description}</p>
                                    </div>
                                    {selectedLesson.isCompleted && (
                                        <span className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full whitespace-nowrap">
                                            <CheckCircle size={18} />
                                            Concluída
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

