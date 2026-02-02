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
    targetAudience?: 'mentors' | 'participants';
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
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 font-playfair">Aulas & Treinamentos</h1>
                <p className="text-gray-600">Aprimore suas habilidades com nosso conteúdo exclusivo.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar aulas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'basico', 'intermediario', 'avancado'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${categoryFilter === cat
                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {cat === 'all' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center md:justify-items-stretch">
                {filteredLessons.map((lesson) => (
                    <motion.div
                        key={lesson._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => setSelectedLesson(lesson)}
                    >
                        <div className="relative aspect-video bg-gray-100">
                            {lesson.thumbnailUrl ? (
                                <Image src={lesson.thumbnailUrl} alt={lesson.title} fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                    <Video className="text-gray-700" size={48} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white transform scale-0 group-hover:scale-100 transition-transform">
                                    <Play size={24} fill="currentColor" />
                                </div>
                            </div>
                            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${getCategoryBadge(lesson.category).color}`}>
                                {getCategoryBadge(lesson.category).label}
                            </span>
                            {lesson.isCompleted && (
                                <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full" title="Concluída">
                                    <CheckCircle size={16} />
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                    Aula {lesson.order || (lessons.indexOf(lesson) + 1)}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                                {lesson.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                {lesson.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{Math.floor(lesson.duration / 60)}:{(Math.floor(lesson.duration % 60)).toString().padStart(2, '0')}</span>
                                <span>{lesson.views} visualizações</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredLessons.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <Video size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Nenhuma aula encontrada nesta categoria.</p>
                </div>
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

