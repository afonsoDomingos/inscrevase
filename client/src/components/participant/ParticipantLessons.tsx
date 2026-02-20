'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, CheckCircle, Video, X } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useTranslate } from '@/context/LanguageContext';

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
    targetAudience?: 'mentors' | 'participants' | 'companies' | 'specialists' | 'both' | 'all';
    associatedEvents?: { _id: string; title: string }[];
    createdBy?: { _id: string; name: string; role: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ParticipantLessons() {
    const { t } = useTranslate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [courseFilter, setCourseFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('order');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const token = Cookies.get('token');
            // Fetch lessons
            const lessonsRes = await axios.get(`${API_URL}/lessons`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch progress
            const progressRes = await axios.get(`${API_URL}/lessons/progress/my-progress`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            interface ProgressItem {
                lesson: string | { _id: string };
                completed: boolean;
            }

            const progressMap = new Map<string, boolean>();
            progressRes.data.progress?.forEach((p: ProgressItem) => {
                const lessonId = typeof p.lesson === 'string' ? p.lesson : p.lesson?._id;
                if (lessonId) {
                    progressMap.set(lessonId, p.completed);
                }
            });

            const lessonsWithProgress = lessonsRes.data.map((l: Lesson) => ({
                ...l,
                isCompleted: progressMap.get(l._id) || false
            }));

            setLessons(lessonsWithProgress);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonComplete = async (lessonId: string) => {
        try {
            const token = Cookies.get('token');
            await axios.post(`${API_URL}/lessons/${lessonId}/progress`, { completed: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLessons(prev => prev.map(l =>
                l._id === lessonId ? { ...l, isCompleted: true } : l
            ));
        } catch (error) {
            console.error('Error marking lesson as complete:', error);
        }
    };

    // Extract unique courses for the filter
    const enrolledCourses = Array.from(new Set(
        lessons.flatMap(l => l.associatedEvents?.map(e => e.title) || [])
    )).sort();

    const filteredLessons = lessons
        .filter(lesson => {
            const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || lesson.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'completed' && lesson.isCompleted) ||
                (statusFilter === 'pending' && !lesson.isCompleted);
            const matchesCourse = courseFilter === 'all' ||
                lesson.associatedEvents?.some(e => e.title === courseFilter);

            return matchesSearch && matchesCategory && matchesStatus && matchesCourse;
        })
        .sort((a, b) => {
            if (sortBy === 'order') return (a.order || 9999) - (b.order || 9999);
            if (sortBy === 'az') return a.title.localeCompare(b.title);
            if (sortBy === 'duration') return (a.duration || 0) - (b.duration || 0);
            return 0; // 'recent' is default from API sort
        });

    // Grouping logic
    const courseLessons = filteredLessons.filter(l => l.associatedEvents && l.associatedEvents.length > 0);
    const mentorLessons = filteredLessons.filter(l => (!l.associatedEvents || l.associatedEvents.length === 0) && l.createdBy?.role === 'mentor');
    const adminLessons = filteredLessons.filter(l => (!l.associatedEvents || l.associatedEvents.length === 0) && (l.createdBy?.role === 'admin' || l.createdBy?.role === 'SuperAdmin'));

    // Further group course lessons by course title
    const groupedByCourse: Record<string, Lesson[]> = {};
    courseLessons.forEach(lesson => {
        lesson.associatedEvents?.forEach(event => {
            if (courseFilter !== 'all' && event.title !== courseFilter) return;

            if (!groupedByCourse[event.title]) {
                groupedByCourse[event.title] = [];
            }
            if (!groupedByCourse[event.title].find(l => l._id === lesson._id)) {
                groupedByCourse[event.title].push(lesson);
            }
        });
    });

    const getCategoryBadge = (category: string) => {
        const badges = {
            basico: { label: t('lessons.filters.basic'), color: '#10b981' },
            intermediario: { label: t('lessons.filters.intermediate'), color: '#f59e0b' },
            avancado: { label: t('lessons.filters.advanced'), color: '#ef4444' }
        };
        return badges[category as keyof typeof badges] || badges.basico;
    };

    const LessonCard = ({ lesson, index, type }: { lesson: Lesson, index: number, type: 'Course' | 'Mentor' | 'Admin' }) => (
        <motion.div
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
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
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

                {/* badges top */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: getCategoryBadge(lesson.category).color,
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        textTransform: 'uppercase'
                    }}>
                        {getCategoryBadge(lesson.category).label}
                    </span>
                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: type === 'Course' ? '#6366f1' : type === 'Mentor' ? '#f59e0b' : '#3b82f6',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        textTransform: 'uppercase'
                    }}>
                        {type}
                    </span>
                </div>

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

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#999',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {lesson.associatedEvents?.[0]?.title || t('lessons.card.platformContent')}
                    </span>
                </div>

                <h3 style={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
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
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    flex: 1,
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
                    borderTop: '1px solid var(--border)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#10b981' }}>●</span> {t('lessons.card.enrolled')}
                    </div>
                    <span>{Math.floor(lesson.duration / 60)}:{(Math.floor(lesson.duration % 60)).toString().padStart(2, '0')}</span>
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
            {/* Header Premium */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    borderRadius: '24px',
                    padding: '2.5rem',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.8rem' }}>
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
                            fontSize: '2rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-playfair)',
                            color: '#fff',
                            margin: 0
                        }}>
                            {t('lessons.title')}
                        </h1>
                    </div>
                    <p style={{ color: '#FFD700', fontSize: '1rem', fontWeight: 500, margin: 0, opacity: 0.9 }}>
                        {t('lessons.subtitle')}
                    </p>
                </div>
            </motion.div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '1.2rem',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
                background: 'var(--paper)',
                padding: '1.5rem',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '2 1 300px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={18} />
                    <input
                        type="text"
                        placeholder={t('lessons.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.8rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            color: 'var(--foreground)',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                </div>

                {/* Course Filter */}
                <div style={{ flex: '1 1 200px' }}>
                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            color: 'var(--foreground)',
                            fontSize: '0.95rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">{t('lessons.filters.allCourses')}</option>
                        {enrolledCourses.map(course => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div style={{ flex: '1 1 180px' }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            color: 'var(--foreground)',
                            fontSize: '0.95rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">{t('lessons.filters.allStatus')}</option>
                        <option value="pending">{t('lessons.filters.pending')}</option>
                        <option value="completed">{t('lessons.filters.completed')}</option>
                    </select>
                </div>

                {/* Sort Filter */}
                <div style={{ flex: '1 1 180px' }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            color: 'var(--foreground)',
                            fontSize: '0.95rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="order">{t('lessons.filters.order')}</option>
                        <option value="recent">{t('lessons.filters.recent')}</option>
                        <option value="az">{t('lessons.filters.az')}</option>
                        <option value="duration">{t('lessons.filters.duration')}</option>
                    </select>
                </div>

                {/* Category Filter Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', borderTop: '1px solid var(--border)', paddingTop: '1.2rem', marginTop: '0.5rem' }}>
                    {['all', 'basico', 'intermediario', 'avancado'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '20px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                border: '1px solid var(--border)',
                                background: categoryFilter === cat ? 'var(--gold-gradient)' : 'transparent',
                                color: categoryFilter === cat ? '#000' : 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {cat === 'all' ? t('lessons.filters.allLevels') : cat === 'basico' ? t('lessons.filters.basic') : cat === 'intermediario' ? t('lessons.filters.intermediate') : t('lessons.filters.advanced')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Info */}
            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || courseFilter !== 'all') && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Search size={16} />
                    <span>{t('lessons.filters.found')} <strong>{filteredLessons.length}</strong> {t('lessons.filters.foundSuffix')}</span>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setCategoryFilter('all');
                            setStatusFilter('all');
                            setCourseFilter('all');
                        }}
                        style={{ color: '#FFD700', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginLeft: '8px' }}
                    >
                        {t('lessons.filters.clear')}
                    </button>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

                {/* 1. Course Lessons Sections */}
                {Object.keys(groupedByCourse).length > 0 && Object.entries(groupedByCourse).map(([courseTitle, courseLessons]) => (
                    <section key={courseTitle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '2px', background: '#FFD700' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>
                                {courseTitle}
                            </h2>
                            <span style={{ fontSize: '0.9rem', color: '#999', background: 'rgba(255,215,0,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                                {courseLessons.length} {t('lessons.sections.lessons')}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '1.5rem',
                            overflowX: 'auto',
                            paddingBottom: '1.5rem',
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {courseLessons.map((lesson, idx) => (
                                <div key={lesson._id} style={{ minWidth: '320px', maxWidth: '320px' }}>
                                    <LessonCard lesson={lesson} index={idx} type="Course" />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* 2. Mentor Platform Lessons */}
                {mentorLessons.length > 0 && (
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '2px', background: '#f59e0b' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>
                                {t('lessons.sections.mentorTraining')}
                            </h2>
                            <span style={{ fontSize: '0.9rem', color: '#999', background: 'rgba(245,158,11,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                                {mentorLessons.length} {t('lessons.sections.mentorContent')}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '1.5rem',
                            overflowX: 'auto',
                            paddingBottom: '1.5rem',
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {mentorLessons.map((lesson, idx) => (
                                <div key={lesson._id} style={{ minWidth: '320px', maxWidth: '320px' }}>
                                    <LessonCard lesson={lesson} index={idx} type="Mentor" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Admin Platform Lessons */}
                {adminLessons.length > 0 && (
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '2px', background: '#3b82f6' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>
                                {t('lessons.sections.helpCenter')}
                            </h2>
                            <span style={{ fontSize: '0.9rem', color: '#999', background: 'rgba(59,130,246,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                                {adminLessons.length} {t('lessons.sections.guides')}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '1.5rem',
                            overflowX: 'auto',
                            paddingBottom: '1.5rem',
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {adminLessons.map((lesson, idx) => (
                                <div key={lesson._id} style={{ minWidth: '320px', maxWidth: '320px' }}>
                                    <LessonCard lesson={lesson} index={idx} type="Admin" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {filteredLessons.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '5rem 2rem',
                            background: 'var(--paper)',
                            borderRadius: '24px',
                            border: '1px dashed var(--border)'
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
                            {t('lessons.empty.title')}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                            {t('lessons.empty.desc')}
                        </p>
                    </motion.div>
                )}
            </div>

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

                            <div className="p-8 bg-white">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] bg-black px-2 py-1 rounded">
                                                {selectedLesson.associatedEvents?.[0]?.title || 'PLATFORM'}
                                            </span>
                                            {selectedLesson.isCompleted && (
                                                <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold uppercase">
                                                    <CheckCircle size={14} /> {t('lessons.card.completed')}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-3xl font-black text-black leading-tight">{selectedLesson.title}</h2>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-lg">{selectedLesson.description}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

