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
    GraduationCap,
    Award,
    Sparkles,
    Clock,
    Eye,
    Plus,
    Video,
    Edit,
    Trash2,
    Upload,
    TrendingUp
} from 'lucide-react';
import LessonPlayerModal from '@/components/mentor/LessonPlayerModal';

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
    // Client-side augmented props
    isCompleted?: boolean;
    isFavorite?: boolean;
    progress?: number;
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

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        duration: 0,
        category: 'basico' as 'basico' | 'intermediario' | 'avancado',
        isPublished: false,
        order: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'learn') {
            fetchLearnLessons();
        } else {
            fetchManageLessons();
        }
    }, [activeTab]);

    const fetchLearnLessons = async () => {
        setLoading(true);
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            if (!token) return;

            // Fetch Lessons
            const lessonsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const lessonsData: Lesson[] = await lessonsRes.json();

            // Fetch Progress
            const progressRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/progress/my-progress`, {
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
            const favRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/favorites/my-favorites`, {
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
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/manage/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setManageLessons(data.lessons || []);
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
        const secs = seconds % 60;
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
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
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

            xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/upload-video`);
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
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const url = editingLesson
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${editingLesson._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/lessons`;

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
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}`, {
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
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}/toggle-publish`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchManageLessons();
        } catch (error) {
            console.error('Error toggling publish:', error);
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
                order: lesson.order || 0
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
                order: 0
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
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/generate`, {}, {
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
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a1a1a' }}>
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
                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                        borderRadius: '24px',
                        padding: '3rem 2rem',
                        marginBottom: '2rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                <GraduationCap size={40} color="#000" />
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#000', margin: 0 }}>
                                    Área de Aprendizado
                                </h1>
                            </div>
                            <p style={{ fontSize: '1.1rem', color: '#000', opacity: 0.8, maxWidth: '600px' }}>
                                Domine a plataforma com nossos cursos exclusivos para mentores
                            </p>

                            {/* Overall Progress */}
                            <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '16px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', maxWidth: '400px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#000', fontWeight: '600', fontSize: '0.9rem' }}>
                                    <span>Seu Progresso</span>
                                    <span>{Math.round((learnLessons.filter(l => l.isCompleted).length / (learnLessons.length || 1)) * 100)}%</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.4)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(learnLessons.filter(l => l.isCompleted).length / (learnLessons.length || 1)) * 100}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        style={{ height: '100%', background: '#000', borderRadius: '4px' }}
                                    />
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#000', opacity: 0.7 }}>
                                    {learnLessons.filter(l => l.isCompleted).length} de {learnLessons.length} aulas concluídas
                                </div>
                                {Math.round((learnLessons.filter(l => l.isCompleted).length / (learnLessons.length || 1)) * 100) === 100 && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={generateCertificate}
                                        style={{
                                            marginTop: '1rem',
                                            width: '100%',
                                            padding: '10px',
                                            background: '#000',
                                            color: '#FFD700',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontSize: '0.9rem'
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Award size={16} />
                                        Emitir Certificado
                                    </motion.button>
                                )}
                            </div>
                        </div>
                        <Sparkles size={120} style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.2, color: '#000' }} />
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Buscar aulas..."
                                value={learnSearch}
                                onChange={(e) => setLearnSearch(e.target.value)}
                                style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '1rem' }}
                            />
                        </div>
                        <select
                            value={learnCategory}
                            onChange={(e) => setLearnCategory(e.target.value)}
                            style={{ padding: '14px 20px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '1rem', cursor: 'pointer', background: 'white' }}
                        >
                            <option value="all">Todas Categorias</option>
                            <option value="basico">🌱 Básico</option>
                            <option value="intermediario">🚀 Intermediário</option>
                            <option value="avancado">⚡ Avançado</option>
                        </select>
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            style={{
                                padding: '14px 20px',
                                borderRadius: '12px',
                                border: showFavoritesOnly ? '2px solid #ef4444' : '1px solid #e0e0e0',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                background: showFavoritesOnly ? '#fef2f2' : 'white',
                                color: showFavoritesOnly ? '#ef4444' : '#666',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: showFavoritesOnly ? 'bold' : 'normal'
                            }}
                        >
                            <Heart size={18} fill={showFavoritesOnly ? '#ef4444' : 'none'} />
                            Favoritas
                        </button>
                    </div>

                    {/* Lessons Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
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
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: '#666' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {manageLessons.filter(l => l.title.toLowerCase().includes(manageSearch.toLowerCase())).map((lesson) => (
                                    <tr key={lesson._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={20} color="#666" /></div>
                                                <div><p style={{ fontWeight: '600' }}>{lesson.title}</p></div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', background: '#f3f4f6', color: '#666' }}>{lesson.category}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', background: lesson.isPublished ? '#dcfce7' : '#fef3c7', color: lesson.isPublished ? '#166534' : '#92400e' }}>
                                                {lesson.isPublished ? 'Publicada' : 'Rascunho'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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

            {/* Video Player Modal */}
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
                                    {!formData.videoUrl ? (
                                        <div style={{ border: '2px dashed #D4AF37', padding: '2rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                                            <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={isUploading} style={{ display: 'none' }} id="vid-upload" />
                                            <label htmlFor="vid-upload" style={{ cursor: 'pointer' }}>
                                                {isUploading ? <p>Enviando... {Math.round(uploadProgress)}%</p> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Upload size={40} color="#D4AF37" /><p>Clique para enviar vídeo</p></div>}
                                            </label>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }}>
                                            <video src={formData.videoUrl} controls style={{ width: '100%', borderRadius: '12px' }} />
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    )}
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
    );
}
