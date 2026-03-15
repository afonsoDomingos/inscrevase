"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
    Play,
    X,
    Search,
    CheckCircle,
    EyeOff,
    Eye,
    Plus,
    Video,
    Edit,
    Trash2,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    Lock,
    Shield,
    Heart,
    Award,
    Clock,
    Loader2,
    Info
} from 'lucide-react';
import LessonPlayerModal from '@/components/mentor/LessonPlayerModal';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import { authService, UserData } from '@/lib/authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LessonProgress {
    lesson: string | { _id: string };
    completed: boolean;
    watchTime: number;
    lastWatched: string;
}

interface Favorite {
    _id: string;
}

interface Lesson {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    category: 'basico' | 'intermediario' | 'avancado';
    isPublished: boolean;
    views: number;
    createdAt: string;
    order?: number;
    targetAudience?: 'mentors' | 'participants' | 'companies' | 'specialists' | 'both' | 'all';
    isCompleted?: boolean;
    isFavorite?: boolean;
    progress?: number;
    associatedEvents?: string[];
    isLocked?: boolean;
}

interface MentorEvent {
    _id: string;
    title: string;
}

interface Stats {
    total: number;
    published: number;
    unpublished: number;
    totalViews: number;
}

export default function AcademyView() {
    useTranslate();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'learn' | 'manage'>('learn');
    const [user, setUser] = useState<UserData | null>(null);

    const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'superadmin';

    // Learn Mode State
    const [learnLessons, setLearnLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [learnSearch, setLearnSearch] = useState('');
    const [learnCategory, setLearnCategory] = useState<string>('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Manage Mode State
    const [manageLessons, setManageLessons] = useState<Lesson[]>([]);
    const [manageStats, setManageStats] = useState<Stats>({ total: 0, published: 0, unpublished: 0, totalViews: 0 });
    const [showModal, setShowModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [manageSearch, setManageSearch] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [videoInputMethod, setVideoInputMethod] = useState<'upload' | 'url'>('upload');
    const [mentorEvents, setMentorEvents] = useState<MentorEvent[]>([]);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const isMobile = windowWidth < 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        duration: 0,
        category: 'basico' as 'basico' | 'intermediario' | 'avancado',
        isPublished: false,
        order: 0,
        targetAudience: 'mentors' as 'mentors' | 'participants' | 'companies' | 'specialists' | 'both' | 'all',
        associatedEvents: [] as string[],
        isLocked: false
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const profile = await authService.getProfile();
                setUser(profile);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUser();

        if (activeTab === 'learn') {
            fetchLearnLessons();
        } else {
            fetchManageLessons();
            fetchMentorEvents();
        }
    }, [activeTab]);

    const fetchMentorEvents = async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${API_URL}/forms/my-forms`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMentorEvents(data || []);
        } catch (error) {
            console.error('Error fetching mentor events:', error);
        }
    };

    const fetchLearnLessons = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            if (!token) return;

            const lessonsRes = await fetch(`${API_URL}/lessons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const lessonsData: Lesson[] = await lessonsRes.json();

            const progressRes = await fetch(`${API_URL}/lessons/progress/my-progress`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const progressData: { progress: LessonProgress[] } = await progressRes.json();
            const progressMap = new Map<string, LessonProgress>(
                (progressData.progress || []).map(p => {
                    const lessonId = typeof p.lesson === 'string' ? p.lesson : p.lesson._id;
                    return [lessonId, p];
                })
            );

            const favRes = await fetch(`${API_URL}/lessons/favorites/my-favorites`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const favData: Favorite[] = await favRes.json();
            const favSet = new Set(favData.map(l => l._id));

            const mergedLessons = (lessonsData || []).map(lesson => ({
                ...lesson,
                isCompleted: progressMap.get(lesson._id)?.completed || false,
                progress: progressMap.get(lesson._id)?.watchTime || 0,
                isFavorite: favSet.has(lesson._id)
            }));

            setLearnLessons(mergedLessons);
        } catch (error) {
            console.error('Error fetching lessons data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchManageLessons = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${API_URL}/lessons/manage/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setManageLessons((data.lessons || []).sort((a: Lesson, b: Lesson) => (a.order || 0) - (b.order || 0)));
            setManageStats(data.stats || { total: 0, published: 0, unpublished: 0, totalViews: 0 });
        } catch (error) {
            console.error('Error fetching managed lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const openLesson = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    };

    const closeLesson = () => {
        setSelectedLesson(null);
        fetchLearnLessons();
    };

    const getCategoryInfo = (category: string) => {
        const categories = {
            basico: { label: 'Básico', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', icon: '🌱' },
            intermediario: { label: 'Intermediário', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', icon: '🚀' },
            avancado: { label: 'Avançado', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', icon: '⚡' }
        };
        return categories[category as keyof typeof categories] || categories.basico;
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const formDataUpload = new FormData();
        formDataUpload.append('video', file);

        try {
            const token = Cookies.get('token');
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    // Progress tracking removed to satisfy ESLint as it was unused in UI
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    setFormData(prev => ({
                        ...prev,
                        videoUrl: result.videoUrl,
                        thumbnailUrl: result.thumbnailUrl,
                        duration: result.duration || 0
                    }));
                    setIsUploading(false);
                } else {
                    console.error('Upload failed');
                    setIsUploading(false);
                }
            });

            xhr.open('POST', `${API_URL}/lessons/upload-video`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formDataUpload);
        } catch (error) {
            console.error('Error uploading video:', error);
            setIsUploading(false);
        }
    };



    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            const url = editingLesson
                ? `${API_URL}/lessons/${editingLesson._id}`
                : `${API_URL}/lessons`;

            const method = editingLesson ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchManageLessons();
                closeModal();
            } else {
                const err = await response.json();
                alert(err.message || 'Erro ao salvar aula');
            }
        } catch (error) {
            console.error('Error saving lesson:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar esta aula?')) return;
        try {
            const token = Cookies.get('token');
            await fetch(`${API_URL}/lessons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchManageLessons();
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
    };

    const togglePublish = async (id: string) => {
        try {
            const token = Cookies.get('token');
            await fetch(`${API_URL}/lessons/${id}/toggle-publish`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchManageLessons();
        } catch (error) {
            console.error('Error toggling publish:', error);
        }
    };



    const moveLesson = async (index: number, direction: 'up' | 'down') => {
        const sortedLessons = [...manageLessons].sort((a, b) => (a.order || 0) - (b.order || 0));
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= sortedLessons.length) return;

        const currentLesson = sortedLessons[index];
        const targetLesson = sortedLessons[targetIndex];

        const currentOrder = currentLesson.order || 0;
        const targetOrder = targetLesson.order || 0;

        const token = Cookies.get('token');

        try {
            const newLessons = [...manageLessons];
            const realCurrentIndex = newLessons.findIndex(l => l._id === currentLesson._id);
            const realTargetIndex = newLessons.findIndex(l => l._id === targetLesson._id);

            if (realCurrentIndex !== -1) newLessons[realCurrentIndex].order = targetOrder;
            if (realTargetIndex !== -1) newLessons[realTargetIndex].order = currentOrder;

            setManageLessons(newLessons.sort((a, b) => (a.order || 0) - (b.order || 0)));

            await Promise.all([
                fetch(`${API_URL}/lessons/${currentLesson._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ ...currentLesson, order: targetOrder })
                }),
                fetch(`${API_URL}/lessons/${targetLesson._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ ...targetLesson, order: currentOrder })
                })
            ]);

            toast.success('Ordem atualizada!');
        } catch (error) {
            console.error('Error moving lesson:', error);
            toast.error('Erro ao mover aula');
            fetchManageLessons();
        }
    };

    const openModal = (lesson?: Lesson) => {
        if (lesson) {
            setEditingLesson(lesson);
            setFormData({
                title: lesson.title,
                description: lesson.description,
                videoUrl: lesson.videoUrl,
                thumbnailUrl: lesson.thumbnailUrl || '',
                duration: lesson.duration,
                category: lesson.category,
                isPublished: lesson.isPublished,
                order: lesson.order || 0,
                targetAudience: lesson.targetAudience || 'mentors',
                associatedEvents: lesson.associatedEvents || [],
                isLocked: lesson.isLocked || false
            });
        } else {
            setEditingLesson(null);
            setFormData({
                title: '',
                description: '',
                videoUrl: '',
                thumbnailUrl: '',
                duration: 0,
                category: 'basico',
                isPublished: false,
                order: 0,
                targetAudience: 'mentors',
                associatedEvents: [],
                isLocked: false
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLesson(null);
    };

    const generateCertificate = async () => {
        try {
            const token = Cookies.get('token');
            await axios.post(`${API_URL}/certificates/generate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Certificado gerado com sucesso! Você será redirecionado.');
            setTimeout(() => {
                router.push('/dashboard/mentor/certificates');
            }, 1000);
        } catch (error) {
            console.error(error);
            const err = error as { response?: { data?: { message?: string } } };
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Erro ao gerar certificado.');
            }
        }
    };

    if (loading && learnLessons.length === 0 && manageLessons.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #D4AF37', borderRadius: '50%' }}></div>
            </div>
        );
    }

    return (
        <div style={{ padding: isMobile ? '0rem 0.75rem' : '0rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 style={{
                        fontSize: isMobile ? '1.5rem' : '2.2rem',
                        fontWeight: 800,
                        marginBottom: '0',
                        color: 'var(--foreground)',
                        fontFamily: 'var(--font-playfair)'
                    }}>
                        🎓 Academia <span className="gold-text">Inscreva-se</span>
                    </h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', opacity: 0.8 }}>Aprenda com especialistas ou compartilhe seu conhecimento</p>
                </div>

                <div style={{
                    background: 'var(--paper)',
                    padding: '3px',
                    borderRadius: '14px',
                    display: 'flex',
                    gap: '2px',
                    width: isMobile ? '100%' : 'auto',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}>
                    <button
                        onClick={() => setActiveTab('learn')}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '10px 12px' : '10px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            cursor: 'pointer',
                            background: activeTab === 'learn' ? 'var(--gold-gradient)' : 'transparent',
                            color: activeTab === 'learn' ? '#000' : '#666',
                            boxShadow: activeTab === 'learn' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Aprender
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '10px 12px' : '10px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            cursor: 'pointer',
                            background: activeTab === 'manage' ? 'var(--gold-gradient)' : 'transparent',
                            color: activeTab === 'manage' ? '#000' : '#666',
                            boxShadow: activeTab === 'manage' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Gerir Aulas
                    </button>
                </div>
            </div>

            {/* LEARN TAB CONTENT */}
            {activeTab === 'learn' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    {/* Hero Section */}
                    <div style={{
                        background: 'var(--paper)',
                        borderRadius: '24px',
                        padding: isMobile ? '1.25rem' : '1.5rem',
                        marginBottom: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
                        gap: '2rem',
                        alignItems: 'center'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.4rem' }}>
                                <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--foreground)', margin: 0, fontFamily: 'var(--font-playfair)' }}>
                                    Área de Aprendizado
                                </h1>
                            </div>
                            <p style={{ fontSize: '0.95rem', color: '#666', maxWidth: '600px', lineHeight: '1.5', margin: 0 }}>
                                Domine a plataforma com cursos exclusivos. Configure eventos, gerencie mentorias e potencialize resultados.
                            </p>

                        </div>
                        {/* Overall Progress */}
                        <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '18px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--foreground)', fontWeight: '700', fontSize: '0.95rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Seu Progresso
                                </span>
                                <span style={{ color: '#D4AF37' }}>{Math.round((learnLessons.filter(l => l.isCompleted).length / (learnLessons.length || 1)) * 100)}%</span>
                            </div>
                            <div style={{ height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(learnLessons.filter(l => l.isCompleted).length / (learnLessons.length || 1)) * 100}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{ height: '100%', background: 'var(--gold-gradient)', borderRadius: '5px' }}
                                />
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                                {learnLessons.filter(l => l.isCompleted).length} de {learnLessons.length} aulas concluídas
                            </div>
                            {learnLessons.filter(l => l.isCompleted).length === 0 && learnLessons.length > 0 && (
                                <div style={{ marginTop: '1rem', padding: '8px 12px', background: 'var(--border)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--foreground)' }}>
                                    👋 <b>Bem-vindo!</b> Comece pela primeira aula para entender como usar a plataforma.
                                </div>
                            )}
                            {Math.round((learnLessons.filter(l => l.isCompleted).length / (learnLessons.length || 1)) * 100) === 100 && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={generateCertificate}
                                    style={{
                                        marginTop: '1.25rem',
                                        width: '100%',
                                        padding: '12px',
                                        background: '#111',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '0.95rem',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    whileHover={{ scale: 1.02, background: '#000' }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Award size={18} />
                                    Emitir Certificado
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Section Title */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--gold-gradient)', borderRadius: '2px' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>Explorar Conteúdo</h2>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
                        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : 1, minWidth: isMobile ? '100%' : '250px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Buscar aulas..."
                                value={learnSearch}
                                onChange={(e) => setLearnSearch(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', background: 'var(--paper)', color: 'var(--foreground)' }}
                            />
                        </div>
                        <select
                            value={learnCategory}
                            onChange={(e) => setLearnCategory(e.target.value)}
                            style={{ flex: isMobile ? 1 : 'none', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', cursor: 'pointer', background: 'var(--paper)', color: 'var(--foreground)' }}
                        >
                            <option value="all">{isMobile ? 'Categorias' : 'Todas Categorias'}</option>
                            <option value="basico">🌱 Básico</option>
                            <option value="intermediario">🚀 Intermediário</option>
                            <option value="avancado">⚡ Avançado</option>
                        </select>
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            style={{
                                flex: isMobile ? 1 : 'none',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: showFavoritesOnly ? '2px solid #ef4444' : '1px solid var(--border)',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                background: showFavoritesOnly ? '#fef2f2' : 'var(--paper)',
                                color: showFavoritesOnly ? '#ef4444' : '#666',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: showFavoritesOnly ? 'bold' : 'normal'
                            }}
                        >
                            <Heart size={18} fill={showFavoritesOnly ? '#ef4444' : 'none'} />
                            {isMobile ? 'Fav.' : 'Favoritas'}
                        </button>
                    </div>

                    {/* Lessons Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.5rem',
                        justifyContent: 'center'
                    }}>
                        {learnLessons.filter(l =>
                            (l.title.toLowerCase().includes(learnSearch.toLowerCase()) || l.description?.toLowerCase().includes(learnSearch.toLowerCase())) &&
                            (learnCategory === 'all' || l.category === learnCategory) &&
                            (!showFavoritesOnly || l.isFavorite)
                        ).map((lesson, idx) => {
                            const info = getCategoryInfo(lesson.category);
                            return (
                                <motion.div
                                    key={lesson._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                                    onClick={() => openLesson(lesson)}
                                    className="luxury-card"
                                    style={{ background: 'var(--paper)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid var(--border)', position: 'relative' }}
                                >
                                    {/* New Badge */}
                                    {new Date(lesson.createdAt).getTime() > new Date().getTime() - 7 * 24 * 60 * 60 * 1000 && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--gold-gradient)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                            NOVO
                                        </div>
                                    )}
                                    <div style={{ position: 'relative', paddingTop: '56.25%', background: info.gradient }}>
                                        {lesson.thumbnailUrl && (
                                            <div style={{ position: 'absolute', inset: 0 }}>
                                                <Image
                                                    src={lesson.thumbnailUrl}
                                                    alt={lesson.title}
                                                    fill
                                                    style={{ objectFit: 'cover', pointerEvents: 'none' }}
                                                    unoptimized
                                                />
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                                <Play size={24} color={info.color} fill={info.color} />
                                            </div>
                                        </div>

                                        {/* Lock indicator */}
                                        {lesson.isLocked && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                left: '12px',
                                                background: isAdmin ? 'rgba(245, 158, 11, 0.95)' : 'rgba(0,0,0,0.7)',
                                                padding: '8px',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                fontWeight: 900,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                backdropFilter: 'blur(4px)',
                                                zIndex: 10
                                            }}>
                                                {isAdmin ? <Shield size={14} /> : <Lock size={14} />}
                                                {lesson.isLocked && (isAdmin ? 'BLOQUEADA PARA USUÁRIOS' : 'BLOQUEADA')}
                                            </div>
                                        )}

                                        {lesson.isCompleted && (
                                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#10b981', padding: '6px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} title="Concluída">
                                                <CheckCircle size={20} color="white" />
                                            </div>
                                        )}
                                        {lesson.isFavorite && (
                                            <div style={{ position: 'absolute', top: lesson.isLocked ? '50px' : '12px', left: '12px', background: 'rgba(255, 255, 255, 0.9)', padding: '6px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} title="Favorita">
                                                <Heart size={20} color="#ef4444" fill="#ef4444" />
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} />
                                            {formatDuration(lesson.duration)}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: info.color, background: `${info.color}15`, padding: '4px 10px', borderRadius: '20px' }}>
                                                {info.icon} {info.label}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#666', background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                                                Aula {lesson.order || idx + 1}
                                            </span>
                                        </div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--foreground)', marginBottom: '0.5rem', lineHeight: '1.4' }}>{lesson.title}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999', fontSize: '0.875rem' }}>
                                            <Eye size={16} />
                                            <span>{lesson.views} visualizações</span>
                                        </div>
                                    </div>
                                    {/* Progress Bar for In-Progress Lessons */}
                                    {lesson.progress && lesson.progress > 0 && !lesson.isCompleted && (
                                        <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', width: '100%' }}>
                                            <div style={{ height: '100%', background: info.color, width: `${(lesson.progress / lesson.duration) * 100}%` }} />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}

                        {learnLessons.filter(l =>
                            (l.title.toLowerCase().includes(learnSearch.toLowerCase()) || l.description?.toLowerCase().includes(learnSearch.toLowerCase())) &&
                            (learnCategory === 'all' || l.category === learnCategory) &&
                            (!showFavoritesOnly || l.isFavorite)
                        ).length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'var(--paper)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--foreground)' }}>Nenhuma aula encontrada</h3>
                                    <p style={{ color: '#666' }}>Tente ajustar seus filtros ou termos de busca.</p>
                                </div>
                            )}
                    </div>

                    {/* Pro Tips Section */}
                    <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.01)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <TrendingUp size={20} className="gold-text" />
                            Dicas para Mentores de Elite
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
                            {[
                                { title: 'Conteúdo Curto', text: 'Vídeos de 5-10 min têm 80% mais taxa de conclusão.', icon: '⏱️' },
                                { title: 'Engajamento', text: 'Peça feedback nos primeiros minutos das lives.', icon: '💬' },
                                { title: 'Visual Premium', text: 'Use capas atraentes e títulos claros para suas aulas.', icon: '✨' }
                            ].map((tip, i) => (
                                <div key={i} className="luxury-card" style={{ background: 'var(--paper)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <h4 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>{tip.icon}</span> {tip.title}
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, lineHeight: '1.4' }}>{tip.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* MANAGE TAB CONTENT */}
            {activeTab === 'manage' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        {[
                            { icon: Video, label: 'Aulas', value: manageStats.total, color: '#D4AF37' },
                            { icon: CheckCircle, label: 'Ativas', value: manageStats.published, color: '#10b981' },
                            { icon: Clock, label: 'Drafts', value: manageStats.unpublished, color: '#f59e0b' },
                            { icon: TrendingUp, label: 'Views', value: manageStats.totalViews, color: '#3b82f6' }
                        ].map((stat, idx) => (
                            <div key={idx} className="luxury-card" style={{
                                background: 'var(--paper)',
                                padding: '1rem',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ background: `${stat.color}15`, padding: '8px', borderRadius: '10px', color: stat.color }}><stat.icon size={20} /></div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '2px' }}>{stat.label}</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)', fontFamily: 'var(--font-inter)' }}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Information Guide for Mentors */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.02) 100%)',
                        padding: '1.25rem',
                        borderRadius: '20px',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'center',
                        gap: '1.25rem'
                    }}>
                        <div style={{ background: 'var(--gold-gradient)', padding: '10px', borderRadius: '50%', color: '#000' }}>
                            <Award size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 2px 0', fontSize: '1rem', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Primeiros Passos</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
                                Clique em <b>+ Nova Aula</b> • Upload seu vídeo ou cole um link • Defina o <b>Público</b> • <b>Publique</b> para liberar o acesso.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '1.25rem'
                    }}>
                        <div style={{ position: 'relative', width: isMobile ? '100%' : '300px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Buscar minhas aulas..."
                                value={manageSearch}
                                onChange={(e) => setManageSearch(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--paper)', color: 'var(--foreground)' }}
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: 'var(--gold-gradient)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)',
                                width: isMobile ? '100%' : 'auto',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Plus size={18} /> Nova Aula
                        </button>
                    </div>

                    {/* Management Table */}
                    <div style={{
                        background: 'var(--paper)',
                        borderRadius: '16px',
                        overflowX: 'auto',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        border: '1px solid var(--border)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '800px' : 'auto' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666' }}>Aula</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666' }}>Categoria</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666' }}>Público</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: '#666' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {manageLessons
                                    .filter(l => l.title.toLowerCase().includes(manageSearch.toLowerCase()))
                                    .map((lesson, idx) => (
                                        <tr key={lesson._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Video size={20} color="#666" />
                                                    </div>
                                                    <div><p style={{ fontWeight: '600', color: 'var(--foreground)' }}>{lesson.title}</p></div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {(() => {
                                                    const info = getCategoryInfo(lesson.category);
                                                    return (
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', background: `${info.color}15`, color: info.color }}>
                                                            {info.icon} {info.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '4px 8px',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    background: lesson.targetAudience === 'both' ? '#fef3c7' :
                                                        lesson.targetAudience === 'mentors' ? '#e0f2fe' :
                                                            lesson.targetAudience === 'companies' ? '#f3e8ff' :
                                                                lesson.targetAudience === 'specialists' ? '#fae8ff' :
                                                                    lesson.targetAudience === 'all' ? '#dcfce7' : 'rgba(0,0,0,0.05)',
                                                    color: lesson.targetAudience === 'both' ? '#92400e' :
                                                        lesson.targetAudience === 'mentors' ? '#0369a1' :
                                                            lesson.targetAudience === 'companies' ? '#6b21a8' :
                                                                lesson.targetAudience === 'specialists' ? '#86198f' :
                                                                    lesson.targetAudience === 'all' ? '#166534' : '#4b5563'
                                                }}>
                                                    {lesson.targetAudience === 'both' ? '👥🎓 Ambos' :
                                                        lesson.targetAudience === 'mentors' ? '🎓 Mentor' :
                                                            lesson.targetAudience === 'companies' ? '🏢 Empresa' :
                                                                lesson.targetAudience === 'specialists' ? '⚡ Especialista' :
                                                                    lesson.targetAudience === 'all' ? '🌍 Todos' : '👥 Participante'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', background: lesson.isPublished ? '#dcfce7' : '#fef3c7', color: lesson.isPublished ? '#166534' : '#92400e' }}>
                                                    {lesson.isPublished ? 'Publicada' : 'Rascunho'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {!manageSearch && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <button
                                                                onClick={() => moveLesson(idx, 'up')}
                                                                disabled={idx === 0}
                                                                style={{ padding: '4px', border: 'none', background: 'transparent', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#ccc' : '#666' }}
                                                            >
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => moveLesson(idx, 'down')}
                                                                disabled={idx === manageLessons.length - 1}
                                                                style={{ padding: '4px', border: 'none', background: 'transparent', cursor: idx === manageLessons.length - 1 ? 'not-allowed' : 'pointer', color: idx === manageLessons.length - 1 ? '#ccc' : '#666' }}
                                                            >
                                                                <ArrowDown size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button onClick={() => togglePublish(lesson._id)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}>
                                                        {lesson.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                    <button onClick={() => openModal(lesson)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#3b82f6' }}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(lesson._id)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {manageLessons.filter(l => l.title.toLowerCase().includes(manageSearch.toLowerCase())).length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--foreground)' }}>Nenhuma aula criada</h3>
                                            <p style={{ color: '#666' }}>Comece criando sua primeira aula para seus alunos!</p>
                                            <button
                                                onClick={() => openModal()}
                                                style={{ marginTop: '1.5rem', padding: '12px 24px', background: 'var(--gold-gradient)', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                            >
                                                + Criar Minha Primeira Aula
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {selectedLesson && (
                    <LessonPlayerModal
                        lesson={selectedLesson}
                        onClose={closeLesson}
                        onComplete={() => {
                            setLearnLessons(prev => prev.map(l =>
                                l._id === selectedLesson._id ? { ...l, isCompleted: true } : l
                            ));
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1rem' }}
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'var(--paper)', borderRadius: '20px', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{editingLesson ? 'Editar Aula' : 'Nova Aula'}</h2>
                                <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--foreground)' }}>Vídeo</label>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setVideoInputMethod('upload')}
                                            style={{ flex: 1, padding: '10px', background: videoInputMethod === 'upload' ? 'var(--gold-gradient)' : 'rgba(0,0,0,0.05)', color: videoInputMethod === 'upload' ? '#000' : '#666', border: 'none', borderRadius: '8px', fontWeight: '600' }}
                                        >
                                            📤 Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVideoInputMethod('url')}
                                            style={{ flex: 1, padding: '10px', background: videoInputMethod === 'url' ? 'var(--gold-gradient)' : 'rgba(0,0,0,0.05)', color: videoInputMethod === 'url' ? '#000' : '#666', border: 'none', borderRadius: '8px', fontWeight: '600' }}
                                        >
                                            🔗 URL
                                        </button>
                                    </div>
                                    {!formData.videoUrl ? (
                                        <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
                                            {videoInputMethod === 'upload' ? (
                                                <input type="file" accept="video/*" onChange={handleVideoUpload} />
                                            ) : (
                                                <input type="url" placeholder="https://..." value={formData.videoUrl} onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                                            <video src={formData.videoUrl} controls style={{ width: '100%', height: '100%' }} />
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: '#fff', padding: '4px' }}><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: 'var(--foreground)', fontSize: '0.9rem' }}>Título da Aula</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Como configurar seu primeiro evento"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--paper)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '1rem', transition: 'all 0.2s' }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: 'var(--foreground)', fontSize: '0.9rem' }}>Descrição</label>
                                    <textarea
                                        placeholder="O que os alunos vão aprender nesta aula?"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--paper)', border: '1px solid var(--border)', color: 'var(--foreground)', minHeight: '100px', fontSize: '1rem', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: 'var(--foreground)', fontSize: '0.9rem' }}>Nível / Categoria</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'basico' | 'intermediario' | 'avancado' }))}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--paper)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '1rem', cursor: 'pointer' }}
                                        >
                                            <option value="basico">🌱 Básico</option>
                                            <option value="intermediario">🚀 Intermediário</option>
                                            <option value="avancado">⚡ Avançado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '700', color: 'var(--foreground)', fontSize: '0.9rem' }}>
                                            Público-Alvo
                                            <div title="Define quem poderá ver esta aula na academia ou nos eventos" style={{ cursor: 'help', color: '#999' }}><Info size={14} /></div>
                                        </label>
                                        <select
                                            value={formData.targetAudience}
                                            onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as 'mentors' | 'participants' | 'companies' | 'specialists' | 'both' | 'all' }))}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--paper)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '1rem', cursor: 'pointer' }}
                                        >
                                            <option value="mentors">🎓 Experts (Academia)</option>
                                            <option value="participants">👥 Participantes (Eventos)</option>
                                            <option value="companies">🏢 Empresas</option>
                                            <option value="specialists">⚡ Especialistas</option>
                                            <option value="both">🔄 Experts e Participantes</option>
                                            <option value="all">🌍 Todos os Públicos</option>
                                        </select>
                                    </div>
                                </div>

                                {mentorEvents.length > 0 && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: 'var(--foreground)', fontSize: '0.9rem' }}>Vincular a Eventos (Opcional)</label>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr',
                                            gap: '8px',
                                            maxHeight: '150px',
                                            overflowY: 'auto',
                                            padding: '12px',
                                            background: 'rgba(0,0,0,0.02)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)'
                                        }} className="no-scrollbar">
                                            {mentorEvents.map(event => (
                                                <label key={event._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', padding: '4px 0' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.associatedEvents?.includes(event._id)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                associatedEvents: checked
                                                                    ? [...(prev.associatedEvents || []), event._id]
                                                                    : (prev.associatedEvents || []).filter(id => id !== event._id)
                                                            }));
                                                        }}
                                                        style={{ width: '18px', height: '18px', accentColor: '#D4AF37' }}
                                                    />
                                                    <span style={{ color: 'var(--foreground)' }}>{event.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <p style={{ fontWeight: '700', color: 'var(--foreground)', fontSize: '0.9rem', margin: 0 }}>Aula Privada / Bloqueada</p>
                                        <p style={{ fontSize: '0.75rem', color: '#666', margin: '4px 0 0 0' }}>Apenas usuários com acesso podem visualizar</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, isLocked: !prev.isLocked }))}
                                        style={{
                                            width: '50px',
                                            height: '26px',
                                            borderRadius: '15px',
                                            background: formData.isLocked ? 'var(--gold-gradient)' : '#ccc',
                                            position: 'relative',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            position: 'absolute',
                                            top: '3px',
                                            left: formData.isLocked ? '27px' : '3px',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </button>
                                </div>

                                <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Award size={16} />
                                        <span><strong>Dica de Expert:</strong> Títulos claros e descrições detalhadas ajudam seus alunos a encontrar o conteúdo mais rápido.</span>
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!formData.videoUrl || !formData.title || isUploading}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '16px',
                                        background: isUploading ? '#ccc' : 'var(--gold-gradient)',
                                        color: '#000',
                                        borderRadius: '12px',
                                        fontWeight: '900',
                                        border: 'none',
                                        fontSize: '1rem',
                                        cursor: isUploading ? 'not-allowed' : 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        boxShadow: '0 10px 20px rgba(212,175,55,0.2)'
                                    }}
                                >
                                    {isUploading ? <><Loader2 className="animate-spin" size={18} /> Enviando Vídeo...</> : (editingLesson ? 'Salvar Alterações' : 'Publicar Aula')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
