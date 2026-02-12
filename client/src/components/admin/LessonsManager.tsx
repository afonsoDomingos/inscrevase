"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Upload,
    Trash2,
    Edit,
    Eye,
    EyeOff,
    Plus,
    X,
    Search,
    TrendingUp,
    Video,
    Clock,
    CheckCircle,
    Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
// import { useTranslate } from '@/context/LanguageContext';

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
    order: number;
    targetAudience?: 'mentors' | 'participants' | 'both';
    createdAt: string;
}

interface Stats {
    total: number;
    published: number;
    unpublished: number;
    totalViews: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LessonsManager() {
    // const { t } = useTranslate(); // Unused
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, published: 0, unpublished: 0, totalViews: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [videoInputMethod, setVideoInputMethod] = useState<'upload' | 'url'>('upload');

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
        targetAudience: 'mentors' as 'mentors' | 'participants' | 'both'
    });

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const isMobile = windowWidth < 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const response = await fetch(`${API_URL}/lessons/manage/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setLessons(data.lessons || []);
            setStats(data.stats || { total: 0, published: 0, unpublished: 0, totalViews: 0 });
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    setFormData((prev) => ({
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
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
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

        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
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
                fetchLessons();
                closeModal();
            }
        } catch (error) {
            console.error('Error saving lesson:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar esta aula?')) return;

        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            await fetch(`${API_URL}/lessons/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchLessons();
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
    };

    const togglePublish = async (id: string) => {
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            await fetch(`${API_URL}/lessons/${id}/toggle-publish`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchLessons();
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
                order: lesson.order,
                targetAudience: lesson.targetAudience || 'mentors'
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
                targetAudience: 'mentors'
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

    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || lesson.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryBadge = (category: string) => {
        const badges = {
            basico: { label: 'Básico', color: 'bg-green-500' },
            intermediario: { label: 'Intermediário', color: 'bg-yellow-500' },
            avancado: { label: 'Avançado', color: 'bg-red-500' }
        };
        return badges[category as keyof typeof badges] || badges.basico;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #D4AF37', borderRadius: '50%' }}></div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a1a1a' }}>
                    🎓 Gerenciar Aulas
                </h1>
                <p style={{ color: '#666' }}>Crie e gerencie vídeos educativos para seus usuários</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { icon: Video, label: 'Total de Aulas', value: stats.total, color: '#D4AF37' },
                    { icon: CheckCircle, label: 'Publicadas', value: stats.published, color: '#10b981' },
                    { icon: Clock, label: 'Rascunhos', value: stats.unpublished, color: '#f59e0b' },
                    { icon: TrendingUp, label: 'Visualizações', value: stats.totalViews, color: '#3b82f6' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            border: '1px solid #f0f0f0'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                background: `${stat.color}15`,
                                padding: '12px',
                                borderRadius: '12px',
                                color: stat.color
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '4px' }}>{stat.label}</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a1a' }}>{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters and Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder="Buscar aulas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 44px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid #e0e0e0',
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">Todas Categorias</option>
                        <option value="basico">Básico</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="avancado">Avançado</option>
                    </select>
                </div>
                <button
                    onClick={() => openModal()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}
                >
                    <Plus size={20} />
                    Nova Aula
                </button>
            </div>

            {/* Lessons Table */}
            <div style={{ background: 'white', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Aula</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Categoria</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Duração</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Visualizações</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Público</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLessons.map((lesson, idx) => (
                            <motion.tr
                                key={lesson._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{ borderBottom: '1px solid #f0f0f0' }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '40px',
                                            background: '#f3f4f6',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            border: '1px solid #eee'
                                        }}>
                                            {lesson.thumbnailUrl ? (
                                                <Image src={lesson.thumbnailUrl} alt={lesson.title} width={60} height={40} style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <Play size={20} color="#D4AF37" />
                                            )}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '2px' }}>{lesson.title}</p>
                                            <p style={{ fontSize: '0.875rem', color: '#666' }}>
                                                {lesson.description?.substring(0, 50)}{lesson.description?.length > 50 ? '...' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: 'white',
                                        background: getCategoryBadge(lesson.category).color
                                    }}>
                                        {getCategoryBadge(lesson.category).label}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#666' }}>
                                    {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                                </td>
                                <td style={{ padding: '1rem', color: '#666' }}>{lesson.views}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        background: lesson.targetAudience === 'both' ? '#fef3c7' : lesson.targetAudience === 'mentors' ? '#e0f2fe' : '#f3f4f6',
                                        color: lesson.targetAudience === 'both' ? '#92400e' : lesson.targetAudience === 'mentors' ? '#0369a1' : '#4b5563',
                                        border: lesson.targetAudience === 'both' ? '1px solid #fde68a' : lesson.targetAudience === 'mentors' ? '1px solid #bae6fd' : '1px solid #e5e7eb'
                                    }}>
                                        {lesson.targetAudience === 'both' ? '👥🎓 Ambos' : lesson.targetAudience === 'mentors' ? '🎓 Mentor' : '👥 Participante'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: lesson.isPublished ? '#dcfce7' : '#fef3c7',
                                        color: lesson.isPublished ? '#166534' : '#92400e'
                                    }}>
                                        {lesson.isPublished ? 'Publicada' : 'Rascunho'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => togglePublish(lesson._id)}
                                            style={{
                                                padding: '8px',
                                                background: 'transparent',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                color: '#666'
                                            }}
                                            title={lesson.isPublished ? 'Despublicar' : 'Publicar'}
                                        >
                                            {lesson.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <button
                                            onClick={() => openModal(lesson)}
                                            style={{
                                                padding: '8px',
                                                background: 'transparent',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                color: '#666'
                                            }}
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lesson._id)}
                                            style={{
                                                padding: '8px',
                                                background: 'transparent',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                color: '#ef4444'
                                            }}
                                            title="Deletar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {filteredLessons.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                        <Video size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>Nenhuma aula encontrada</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '1rem'
                        }}
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: isMobile ? '0' : '20px',
                                padding: isMobile ? '1.5rem 1rem' : '2rem',
                                maxWidth: '600px',
                                width: '100%',
                                height: isMobile ? '100%' : 'auto',
                                maxHeight: isMobile ? '100%' : '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {editingLesson ? 'Editar Aula' : 'Nova Aula'}
                                </h2>
                                <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Video Upload */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Vídeo da Aula
                                    </label>
                                    {/* Toggle between Upload and URL */}
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

                                    <div style={{ marginTop: '1rem' }}>
                                        {videoInputMethod === 'url' ? (
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
                                                        border: '2px solid #D4AF37',
                                                        fontSize: '1rem',
                                                        outline: 'none',
                                                        background: '#fff'
                                                    }}
                                                />
                                                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px' }}>
                                                    💡 Suporta: YouTube, Vimeo, ou link direto para vídeo (.mp4, .webm, etc.).
                                                    {formData.videoUrl && " Cole um novo link acima para atualizar."}
                                                </p>
                                                {formData.videoUrl && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <p style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', color: '#666' }}>Prévia do Vídeo:</p>
                                                        {formData.videoUrl.includes('drive.google.com') ? (
                                                            <iframe
                                                                src={formData.videoUrl.replace('/view', '/preview').replace('/edit', '/preview').replace('usp=sharing', '')}
                                                                style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', border: 'none', background: '#000' }}
                                                                allowFullScreen
                                                            />
                                                        ) : !formData.videoUrl.includes('youtube') && !formData.videoUrl.includes('vimeo') ? (
                                                            <video
                                                                src={formData.videoUrl}
                                                                controls
                                                                style={{ width: '100%', borderRadius: '12px', background: '#000' }}
                                                            />
                                                        ) : (
                                                            <iframe
                                                                src={formData.videoUrl.includes('youtube') || formData.videoUrl.includes('youtu.be')
                                                                    ? formData.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                                                                    : formData.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                                                                style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', border: 'none', background: '#000' }}
                                                                allowFullScreen
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                {(!formData.videoUrl || isUploading) ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            onChange={handleVideoUpload}
                                                            disabled={isUploading}
                                                            style={{ display: 'none' }}
                                                            id="video-upload"
                                                        />
                                                        <label
                                                            htmlFor="video-upload"
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: '3rem',
                                                                border: '2px dashed #D4AF37',
                                                                borderRadius: '12px',
                                                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                                                background: '#fafafa'
                                                            }}
                                                        >
                                                            <Upload size={48} color="#D4AF37" style={{ marginBottom: '1rem' }} />
                                                            <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                                {isUploading ? 'Fazendo upload...' : 'Clique para fazer upload do novo vídeo'}
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
                                                    <div style={{ position: 'relative' }}>
                                                        <video
                                                            src={formData.videoUrl}
                                                            controls
                                                            style={{ width: '100%', borderRadius: '12px', background: '#000' }}
                                                        />
                                                        <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, videoUrl: '', thumbnailUrl: '' }))}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '10px',
                                                                    background: '#fee2e2',
                                                                    color: '#ef4444',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '8px'
                                                                }}
                                                            >
                                                                <Trash2 size={16} /> Remover e Escolher Novo Vídeo
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Thumbnail URL / Upload */}
                                <div style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '16px', background: '#fcfcfc', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label style={{ fontWeight: '600', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ImageIcon size={18} color="#D4AF37" /> Capa da Aula (Thumbnail)
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                        {formData.thumbnailUrl ? (
                                            <div style={{ position: 'relative', width: '200px', height: '112px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                <Image
                                                    src={formData.thumbnailUrl}
                                                    alt="Thumbnail preview"
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        right: '4px',
                                                        background: 'rgba(239, 68, 68, 0.9)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '112px',
                                                border: '2px dashed #ddd',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#fafafa',
                                                cursor: 'pointer'
                                            }}
                                                onClick={() => document.getElementById('thumb-upload-manager')?.click()}
                                            >
                                                <Upload size={24} color="#666" />
                                                <span style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>Upload da Capa</span>
                                                <input
                                                    type="file"
                                                    id="thumb-upload-manager"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={handleThumbnailUpload}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <input
                                                type="url"
                                                placeholder="Ou cole a URL da imagem aqui..."
                                                value={formData.thumbnailUrl}
                                                onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e0e0e0',
                                                    fontSize: '0.875rem'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Ex: Introdução à Plataforma"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid #e0e0e0',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Descreva o conteúdo da aula..."
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid #e0e0e0',
                                            fontSize: '1rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Categoria
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'basico' | 'intermediario' | 'avancado' }))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid #e0e0e0',
                                            fontSize: '1rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="basico">Básico</option>
                                        <option value="intermediario">Intermediário</option>
                                        <option value="avancado">Avançado</option>
                                    </select>
                                </div>

                                {/* Order */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Ordem de Exibição
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid #e0e0e0',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* Target Audience */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Público-Alvo
                                    </label>
                                    <select
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as 'mentors' | 'participants' | 'both' }))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid #e0e0e0',
                                            fontSize: '1rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="mentors">Mentores (Academia)</option>
                                        <option value="participants">Participantes</option>
                                        <option value="both">Ambos (Mentores e Participantes)</option>
                                    </select>
                                    <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px' }}>
                                        {formData.targetAudience === 'mentors'
                                            ? '🎓 Visível na "Academia" para mentores aprenderem a usar a plataforma.'
                                            : formData.targetAudience === 'participants'
                                                ? '👥 Visível para os participantes no dashboard deles.'
                                                : '👥🎓 Visível para mentores E participantes.'}
                                    </p>
                                </div>

                                {/* Published */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input
                                        type="checkbox"
                                        id="published"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="published" style={{ fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                                        Publicar aula imediatamente
                                    </label>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: '#f3f4f6',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!formData.videoUrl || !formData.title}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: formData.videoUrl && formData.title
                                                ? 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)'
                                                : '#e5e7eb',
                                            color: formData.videoUrl && formData.title ? '#000' : '#9ca3af',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            cursor: formData.videoUrl && formData.title ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        {editingLesson ? 'Atualizar' : 'Criar'} Aula
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
