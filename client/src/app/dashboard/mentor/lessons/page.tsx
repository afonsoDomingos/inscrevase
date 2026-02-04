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
    Heart,
    Award,
    Clock,
    Eye,
    Plus,
    Video,
    Edit,
    Trash2,
    Upload,
    TrendingUp,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import LessonPlayerModal from '@/components/mentor/LessonPlayerModal';
import Cookies from 'js-cookie';
import Image from 'next/image';
import MentorDashboardShell from '@/components/mentor/MentorDashboardShell';

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
    targetAudience?: 'mentors' | 'participants' | 'both';
    // Client-side augmented props
    isCompleted?: boolean;
    isFavorite?: boolean;
    progress?: number;
    associatedEvents?: string[];
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



export default function MentorLessonsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'learn' | 'manage'>('learn');

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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [videoInputMethod, setVideoInputMethod] = useState<'upload' | 'url'>('upload');
    const [mentorEvents, setMentorEvents] = useState<MentorEvent[]>([]);

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
        targetAudience: 'mentors' as 'mentors' | 'participants' | 'both',
        associatedEvents: [] as string[]
    });

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const isMobile = windowWidth < 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

            // Fetch Lessons
            const lessonsRes = await fetch(`${API_URL}/lessons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const lessonsData: Lesson[] = await lessonsRes.json();

            // Fetch Progress
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

            // Fetch Favorites
            const favRes = await fetch(`${API_URL}/lessons/favorites/my-favorites`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const favData: Favorite[] = await favRes.json();
            const favSet = new Set(favData.map(l => l._id));

            // Merge Data
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

    // --- Learn Mode Functions ---

    const openLesson = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        // Views increment is handled by fetching details inside modal or backend route logic
    };

    const closeLesson = () => {
        setSelectedLesson(null);
        fetchLearnLessons(); // Refresh to update progress/views/favorites
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

    // --- Manage Mode Functions ---

    const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        const formDataUpload = new FormData();
        formDataUpload.append('video', file);

        try {
            const token = Cookies.get('token');
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(percentComplete);
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
                    setUploadProgress(100);
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

    const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', 'lesson-thumbnails');

        try {
            const token = Cookies.get('token');
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, thumbnailUrl: data.url }));
            }
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
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

        // Swap orders
        const currentOrder = currentLesson.order || 0;
        const targetOrder = targetLesson.order || 0;

        // If orders are same (e.g. both 0), we need to re-index all to be safe, 
        // but for now let's try simple swap or strict re-index logic if needed.
        // Simple swap logic:
        const token = Cookies.get('token');

        try {
            // Optimistic update
            const newLessons = [...manageLessons];
            // Find items in original array
            const realCurrentIndex = newLessons.findIndex(l => l._id === currentLesson._id);
            const realTargetIndex = newLessons.findIndex(l => l._id === targetLesson._id);

            if (realCurrentIndex !== -1) newLessons[realCurrentIndex].order = targetOrder;
            if (realTargetIndex !== -1) newLessons[realTargetIndex].order = currentOrder;

            setManageLessons(newLessons.sort((a, b) => (a.order || 0) - (b.order || 0)));

            // API Updates
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
            // fetchManageLessons(); // Optional: fetch to be sure
        } catch (error) {
            console.error('Error moving lesson:', error);
            toast.error('Erro ao mover aula');
            fetchManageLessons(); // Revert on error
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
                associatedEvents: lesson.associatedEvents || []
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
                associatedEvents: []
            });
        }
        setShowModal(true);
        setUploadProgress(0);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLesson(null);
        setUploadProgress(0);
    };

    const generateCertificate = async () => {
        try {
            const token = localStorage.getItem('token');
            // Check if already has a certificate recently issued? 
            // The backend handles creation. We just request it.
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

    // --- Rendering Helpers ---

    if (loading && learnLessons.length === 0 && manageLessons.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #D4AF37', borderRadius: '50%' }}></div>
            </div>
        );
    }

    return (
        <MentorDashboardShell activeRoute="lessons">
            <div style={{ padding: isMobile ? '1rem' : '2rem', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 style={{ fontSize: isMobile ? '1.75rem' : '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a1a1a' }}>
                            🎓 Academia Inscreva-se
                        </h1>
                        <p style={{ color: '#666' }}>Aprenda com especialistas ou compartilhe seu conhecimento</p>
                    </div>

                    <div style={{ background: '#f3f4f6', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                        <button
                            onClick={() => setActiveTab('learn')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: activeTab === 'learn' ? 'white' : 'transparent',
                                color: activeTab === 'learn' ? '#D4AF37' : '#666',
                                boxShadow: activeTab === 'learn' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Aprender
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: activeTab === 'manage' ? 'white' : 'transparent',
                                color: activeTab === 'manage' ? '#D4AF37' : '#666',
                                boxShadow: activeTab === 'manage' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Criar Aulas
                        </button>
                    </div>
                </div>

                {/* LEARN TAB CONTENT */}
                {activeTab === 'learn' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        {/* Hero Section */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '24px',
                            padding: isMobile ? '1.5rem 1rem' : '1rem 0',
                            marginBottom: '2rem',
                            position: 'relative',
                            overflow: 'hidden',
                            borderBottom: '1px solid #eee'
                        }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', margin: 0 }}>
                                        Área de Aprendizado
                                    </h1>
                                </div>
                                <p style={{ fontSize: '1rem', color: '#666', maxWidth: '600px' }}>
                                    Domine a plataforma com nossos cursos exclusivos para mentores
                                </p>

                                {/* Overall Progress */}
                                <div style={{ marginTop: '1.5rem', background: '#f9fafb', padding: '1.25rem', borderRadius: '20px', border: '1px solid #f0f0f0', maxWidth: '500px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#111', fontWeight: '700', fontSize: '0.95rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Seu Progresso
                                        </span>
                                        <span style={{ color: '#D4AF37' }}>{Math.round((learnLessons.filter(l => l.isCompleted).length / (learnLessons.length || 1)) * 100)}%</span>
                                    </div>
                                    <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(learnLessons.filter(l => l.isCompleted).length / (learnLessons.length || 1)) * 100}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            style={{ height: '100%', background: '#D4AF37', borderRadius: '5px' }}
                                        />
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                                        {learnLessons.filter(l => l.isCompleted).length} de {learnLessons.length} aulas concluídas
                                    </div>
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
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
                            <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : 1, minWidth: isMobile ? '100%' : '250px' }}>
                                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar aulas..."
                                    value={learnSearch}
                                    onChange={(e) => setLearnSearch(e.target.value)}
                                    style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '1rem', background: 'white' }}
                                />
                            </div>
                            <select
                                value={learnCategory}
                                onChange={(e) => setLearnCategory(e.target.value)}
                                style={{ flex: isMobile ? 1 : 'none', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '0.95rem', cursor: 'pointer', background: 'white' }}
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
                                    border: showFavoritesOnly ? '2px solid #ef4444' : '1px solid #e0e0e0',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    background: showFavoritesOnly ? '#fef2f2' : 'white',
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
                                        style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                    >
                                        <div style={{ position: 'relative', paddingTop: '56.25%', background: info.gradient }}>
                                            {lesson.thumbnailUrl && (
                                                <div style={{ position: 'absolute', inset: 0 }}>
                                                    <Image
                                                        src={lesson.thumbnailUrl}
                                                        alt={lesson.title}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
                                                </div>
                                            )}
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                                    <Play size={24} color={info.color} fill={info.color} />
                                                </div>
                                            </div>
                                            {lesson.isCompleted && (
                                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#10b981', padding: '6px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} title="Concluída">
                                                    <CheckCircle size={20} color="white" />
                                                </div>
                                            )}
                                            {lesson.isFavorite && (
                                                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255, 255, 255, 0.9)', padding: '6px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} title="Favorita">
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
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#666', background: '#f0f0f0', padding: '4px 10px', borderRadius: '20px' }}>
                                                    Aula {lesson.order || idx + 1}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem', lineHeight: '1.4' }}>{lesson.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999', fontSize: '0.875rem' }}>
                                                <Eye size={16} />
                                                <span>{lesson.views} visualizações</span>
                                            </div>
                                        </div>
                                        {/* Progress Bar for In-Progress Lessons */}
                                        {lesson.progress && lesson.progress > 0 && !lesson.isCompleted && (
                                            <div style={{ height: '4px', background: '#f3f4f6', width: '100%' }}>
                                                <div style={{ height: '100%', background: info.color, width: `${(lesson.progress / lesson.duration) * 100}%` }} />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* MANAGE TAB CONTENT */}
                {activeTab === 'manage' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {[
                                { icon: Video, label: 'Minhas Aulas', value: manageStats.total, color: '#D4AF37' },
                                { icon: CheckCircle, label: 'Publicadas', value: manageStats.published, color: '#10b981' },
                                { icon: Clock, label: 'Rascunhos', value: manageStats.unpublished, color: '#f59e0b' },
                                { icon: TrendingUp, label: 'Visualizações', value: manageStats.totalViews, color: '#3b82f6' }
                            ].map((stat, idx) => (
                                <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f0f0f0' }}>
                                    <div style={{ background: `${stat.color}15`, padding: '12px', borderRadius: '12px', color: stat.color }}><stat.icon size={24} /></div>
                                    <div><p style={{ fontSize: '0.875rem', color: '#666' }}>{stat.label}</p><p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</p></div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ position: 'relative', width: '300px' }}>
                                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar minhas aulas..."
                                    value={manageSearch}
                                    onChange={(e) => setManageSearch(e.target.value)}
                                    style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '12px', border: '1px solid #e0e0e0' }}
                                />
                            </div>
                            <button
                                onClick={() => openModal()}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)' }}
                            >
                                <Plus size={20} /> Nova Aula
                            </button>
                        </div>

                        {/* Management Table */}
                        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
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
                                            <tr key={lesson._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Video size={20} color="#666" />
                                                        </div>
                                                        <div><p style={{ fontWeight: '600' }}>{lesson.title}</p></div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', background: '#f3f4f6', color: '#666' }}>{lesson.category}</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '4px 8px',
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        background: lesson.targetAudience === 'both' ? '#fef3c7' : lesson.targetAudience === 'participants' ? '#f3f4f6' : '#e0f2fe',
                                                        color: lesson.targetAudience === 'both' ? '#92400e' : lesson.targetAudience === 'participants' ? '#4b5563' : '#0369a1'
                                                    }}>
                                                        {lesson.targetAudience === 'both' ? '👥🎓 Ambos' : lesson.targetAudience === 'participants' ? '👥 Alunos' : '🎓 Mentores'}
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
                                                                    title="Mover para cima"
                                                                >
                                                                    <ArrowUp size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => moveLesson(idx, 'down')}
                                                                    disabled={idx === manageLessons.length - 1}
                                                                    style={{ padding: '4px', border: 'none', background: 'transparent', cursor: idx === manageLessons.length - 1 ? 'not-allowed' : 'pointer', color: idx === manageLessons.length - 1 ? '#ccc' : '#666' }}
                                                                    title="Mover para baixo"
                                                                >
                                                                    <ArrowDown size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <button onClick={() => togglePublish(lesson._id)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }} title="Publicar/Despublicar">
                                                            {lesson.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                        <button onClick={() => openModal(lesson)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#3b82f6' }} title="Editar">
                                                            <Edit size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(lesson._id)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }} title="Excluir">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {manageLessons.length === 0 && (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                                    <Video size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                    <p>Você ainda não criou nenhuma aula</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}



                <AnimatePresence>
                    {selectedLesson && (
                        <LessonPlayerModal
                            lesson={selectedLesson}
                            onClose={closeLesson}
                            onComplete={() => {
                                // Update local state to reflect completion immediately
                                setLearnLessons(prev => prev.map(l =>
                                    l._id === selectedLesson._id ? { ...l, isCompleted: true } : l
                                ));
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Create/Edit Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
                            onClick={closeModal}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{editingLesson ? 'Editar Aula' : 'Nova Aula'}</h2>
                                    <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                                </div>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Vídeo</label>

                                        {/* Toggle entre Upload e URL */}
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setVideoInputMethod('upload')}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    background: videoInputMethod === 'upload' ? 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)' : '#f3f4f6',
                                                    color: videoInputMethod === 'upload' ? '#000' : '#666',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                📤 Upload de Arquivo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setVideoInputMethod('url')}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    background: videoInputMethod === 'url' ? 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)' : '#f3f4f6',
                                                    color: videoInputMethod === 'url' ? '#000' : '#666',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                🔗 URL do Vídeo
                                            </button>
                                        </div>

                                        {!formData.videoUrl ? (
                                            <div>
                                                {videoInputMethod === 'upload' ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            onChange={handleVideoUpload}
                                                            disabled={isUploading}
                                                            style={{ display: 'none' }}
                                                            id="vid-upload"
                                                        />
                                                        <label
                                                            htmlFor="vid-upload"
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: '2rem',
                                                                border: '2px dashed #D4AF37',
                                                                borderRadius: '12px',
                                                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                                                background: '#fafafa'
                                                            }}
                                                        >
                                                            <Upload size={40} color="#D4AF37" style={{ marginBottom: '0.5rem' }} />
                                                            <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                                {isUploading ? 'Fazendo upload...' : 'Clique para fazer upload'}
                                                            </p>
                                                            <p style={{ fontSize: '0.875rem', color: '#666' }}>MP4, AVI, MOV (máx. 500MB)</p>
                                                        </label>
                                                        {isUploading && (
                                                            <div style={{ marginTop: '1rem' }}>
                                                                <div style={{
                                                                    width: '100%',
                                                                    height: '8px',
                                                                    background: '#f0f0f0',
                                                                    borderRadius: '4px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <div style={{
                                                                        width: `${uploadProgress}%`,
                                                                        height: '100%',
                                                                        background: 'linear-gradient(90deg, #D4AF37, #F4D03F)',
                                                                        transition: 'width 0.3s ease'
                                                                    }} />
                                                                </div>
                                                                <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.875rem', color: '#666' }}>
                                                                    {Math.round(uploadProgress)}%
                                                                </p>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div>
                                                        <input
                                                            type="url"
                                                            placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                                                            value={formData.videoUrl}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px',
                                                                borderRadius: '12px',
                                                                border: '1px solid #e0e0e0',
                                                                fontSize: '1rem'
                                                            }}
                                                        />
                                                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px' }}>
                                                            💡 Suporta: YouTube, Vimeo, ou link direto para arquivo de vídeo (.mp4, .webm, etc.)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                                                {(formData.videoUrl.includes('youtube') || formData.videoUrl.includes('youtu.be') || formData.videoUrl.includes('vimeo')) ? (
                                                    <iframe
                                                        src={formData.videoUrl.includes('youtube') || formData.videoUrl.includes('youtu.be')
                                                            ? formData.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                                                            : formData.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <video src={formData.videoUrl} controls style={{ width: '100%', height: '100%' }} />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, videoUrl: '', thumbnailUrl: '' }))}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        background: 'rgba(0,0,0,0.7)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        zIndex: 10
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {/* Thumbnail Upload */}
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Capa da Aula (Opcional)</label>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '120px',
                                                    height: '68px',
                                                    background: '#f3f4f6',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #e0e0e0',
                                                    position: 'relative',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {formData.thumbnailUrl ? (
                                                        <Image src={formData.thumbnailUrl} alt="Thumbnail preview" fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <Video size={24} color="#ccc" />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleThumbnailUpload}
                                                        id="thumb-upload"
                                                        style={{ display: 'none' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <label
                                                            htmlFor="thumb-upload"
                                                            style={{
                                                                padding: '8px 16px',
                                                                background: '#fff',
                                                                border: '1px solid #D4AF37',
                                                                color: '#D4AF37',
                                                                borderRadius: '8px',
                                                                fontSize: '0.875rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Upload Capa
                                                        </label>
                                                        <input
                                                            type="url"
                                                            placeholder="Ou URL da imagem..."
                                                            value={formData.thumbnailUrl}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                                                            style={{
                                                                flex: 1,
                                                                padding: '8px 12px',
                                                                borderRadius: '8px',
                                                                border: '1px solid #e0e0e0',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Título</label>
                                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e0e0e0' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Descrição</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e0e0e0' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Categoria</label>
                                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as 'basico' | 'intermediario' | 'avancado' })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                                            <option value="basico">Básico</option>
                                            <option value="intermediario">Intermediário</option>
                                            <option value="avancado">Avançado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Público-Alvo</label>
                                        <select
                                            value={formData.targetAudience}
                                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as 'mentors' | 'participants' | 'both' })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e0e0e0' }}
                                        >
                                            <option value="mentors">Mentores (Academia)</option>
                                            <option value="participants">Participantes (Alunos)</option>
                                            <option value="both">Ambos (Mentores e Participantes)</option>
                                        </select>
                                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px' }}>
                                            Defina se esta aula é para treinamento de mentores, para alunos ou para ambos.
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Vincular a Eventos Específicos (Opcional)</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '10px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                                            {mentorEvents.length > 0 ? mentorEvents.map(event => (
                                                <label key={event._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.associatedEvents.includes(event._id)}
                                                        onChange={(e) => {
                                                            const newEvents = e.target.checked
                                                                ? [...formData.associatedEvents, event._id]
                                                                : formData.associatedEvents.filter(id => id !== event._id);
                                                            setFormData({ ...formData, associatedEvents: newEvents });
                                                        }}
                                                    />
                                                    {event.title}
                                                </label>
                                            )) : (
                                                <p style={{ fontSize: '0.8rem', color: '#888' }}>Nenhum evento encontrado.</p>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px' }}>
                                            Se selecionado, esta aula aparecerá apenas na HUB para inscritos nestes eventos.
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} id="pub" style={{ width: '20px', height: '20px' }} />
                                        <label htmlFor="pub" style={{ fontWeight: '600' }}>Publicar imediatamente</label>
                                    </div>
                                    <button type="submit" disabled={!formData.videoUrl || !formData.title} style={{ padding: '12px', background: formData.videoUrl ? '#D4AF37' : '#e5e7eb', color: formData.videoUrl ? 'black' : '#9ca3af', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: formData.videoUrl ? 'pointer' : 'not-allowed' }}>
                                        {editingLesson ? 'Salvar Alterações' : 'Criar Aula'}
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MentorDashboardShell >
    );
}
