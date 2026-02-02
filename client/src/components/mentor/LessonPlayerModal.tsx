"use client";

import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Heart,
    MessageCircle,
    Send,
    Trash2
} from 'lucide-react';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Comment {
    _id: string;
    user: string;
    userName: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
}

interface Lesson {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    category: string;
    views: number;
    order?: number;
    targetAudience?: 'mentors' | 'participants';
    comments?: Comment[];
}

interface LessonPlayerModalProps {
    lesson: Lesson;
    onClose: () => void;
    onComplete?: () => void;
}

export default function LessonPlayerModal({ lesson, onClose, onComplete }: LessonPlayerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    // const [progress, setProgress] = useState(0); // Removed unused state
    const [isCompleted, setIsCompleted] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>(lesson.comments || []);
    const [newComment, setNewComment] = useState('');
    const [currentUser, setCurrentUser] = useState<{ id: string, name: string, role: string } | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${API_URL}/lessons/${lesson._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.comments) setComments(data.comments);
        } catch (error) {
            console.error(error);
        }
    }, [lesson._id]);

    // Fetch initial data (user, progress, favorites)
    useEffect(() => {
        const fetchInitialData = async () => {
            const token = Cookies.get('token');
            if (!token) return;

            // Fetch user for comments
            try {
                const userRes = await fetch(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = await userRes.json();
                setCurrentUser(userData);
            } catch (err) { console.error(err); }

            // Fetch Progress
            try {
                const progRes = await fetch(`${API_URL}/lessons/progress/my-progress`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const progData: { progress: { lesson: { _id: string }, completed: boolean, watchTime: number }[] } = await progRes.json();
                const lessonProg = progData.progress?.find(p => p.lesson._id === lesson._id);
                if (lessonProg) {
                    setIsCompleted(lessonProg.completed);
                    if (videoRef.current && lessonProg.watchTime) {
                        videoRef.current.currentTime = lessonProg.watchTime;
                        // setProgress((lessonProg.watchTime / lesson.duration) * 100);
                    }
                }
            } catch (err) { console.error(err); }

            // Fetch Favorites
            try {
                const favRes = await fetch(`${API_URL}/lessons/favorites/my-favorites`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const favData: { _id: string }[] = await favRes.json();
                setIsFavorite(favData.some(l => l._id === lesson._id));
            } catch (err) { console.error(err); }

            // Fetch comments explicitly if not passed
            fetchComments();
        };

        fetchInitialData();
    }, [lesson._id, lesson.duration, fetchComments]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            const prog = (current / total) * 100;
            // setProgress(prog);

            // Mark as completed if > 90%
            if (prog > 90 && !isCompleted) {
                markAsCompleted();
            }

            // Sync progress every 10 seconds or so (debounced in real app, here simple)
            if (Math.floor(current) % 10 === 0) {
                updateProgress(current, false);
            }
        }
    };

    const updateProgress = async (watchTime: number, completed: boolean) => {
        try {
            const token = Cookies.get('token');
            await fetch(`${API_URL}/lessons/${lesson._id}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ watchTime, completed })
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const markAsCompleted = () => {
        setIsCompleted(true);
        if (videoRef.current) {
            updateProgress(videoRef.current.currentTime, true);
        }
        if (onComplete) onComplete();
    };

    const toggleFavorite = async () => {
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${API_URL}/lessons/${lesson._id}/favorite`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setIsFavorite(data.isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleCommentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const token = Cookies.get('token');
            const res = await fetch(`${API_URL}/lessons/${lesson._id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: newComment })
            });

            if (res.ok) {
                setNewComment('');
                fetchComments();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Deletar comentário?')) return;
        try {
            const token = Cookies.get('token');
            await fetch(`${API_URL}/lessons/${lesson._id}/comment/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchComments();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#1a1a1a',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '1200px',
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#1a1a1a'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                            {lesson.title}
                        </h2>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem', color: '#999' }}>
                            <span>{lesson.category}</span>
                            <span>•</span>
                            <span>{Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={toggleFavorite}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: isFavorite ? '#ef4444' : '#666',
                                transition: 'all 0.2s',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex'
                            }}
                            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                            <Heart size={24} fill={isFavorite ? '#ef4444' : 'none'} />
                        </button>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            style={{
                                background: showComments ? '#333' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: showComments ? '#D4AF37' : '#666',
                                transition: 'all 0.2s',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex'
                            }}
                            title="Comentários"
                        >
                            <MessageCircle size={24} />
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: '#333',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'white',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Video Player Section */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'black', position: 'relative' }}>
                        {(lesson.videoUrl.includes('youtube') || lesson.videoUrl.includes('youtu.be') || lesson.videoUrl.includes('vimeo')) ? (
                            <>
                                <iframe
                                    src={lesson.videoUrl.includes('youtube') || lesson.videoUrl.includes('youtu.be')
                                        ? lesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                                        : lesson.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                {!isCompleted && (
                                    <button
                                        onClick={markAsCompleted}
                                        style={{
                                            position: 'absolute',
                                            bottom: '20px',
                                            right: '20px',
                                            padding: '10px 20px',
                                            background: '#D4AF37',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            zIndex: 10
                                        }}
                                    >
                                        Marcar como Concluída
                                    </button>
                                )}
                            </>
                        ) : (
                            <video
                                ref={videoRef}
                                src={lesson.videoUrl}
                                style={{ width: '100%', height: '100%' }}
                                onTimeUpdate={handleTimeUpdate}
                                controlsList="nodownload"
                                controls
                            />
                        )}
                        {/* Optional Custom Controls Overlay could go here if native controls aren't enough */}
                    </div>

                    {/* Comments Sidebar (Collapsible) */}
                    <AnimatePresence>
                        {showComments && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '350px', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                style={{
                                    borderLeft: '1px solid #333',
                                    background: '#1a1a1a',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', color: 'white', fontWeight: 'bold' }}>
                                    Comentários ({comments.length})
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                                    {comments.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                                            <p>Seja o primeiro a comentar!</p>
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment._id} style={{ marginBottom: '1.5rem', color: '#e5e5e5' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#D4AF37' }}>{comment.userName}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', lineHeight: '1.4', color: '#ccc' }}>{comment.text}</p>
                                                {(currentUser && (currentUser.id === comment.user || currentUser.role === 'admin')) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#666',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            padding: 0,
                                                            marginTop: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <Trash2 size={12} /> Excluir
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleCommentSubmit} style={{ padding: '1rem', borderTop: '1px solid #333' }}>
                                    <div style={{ position: 'relative' }}>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Escreva um comentário..."
                                            style={{
                                                width: '100%',
                                                background: '#2a2a2a',
                                                border: '1px solid #333',
                                                borderRadius: '12px',
                                                padding: '12px 40px 12px 12px',
                                                color: 'white',
                                                resize: 'none',
                                                height: '50px'
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            style={{
                                                position: 'absolute',
                                                right: '8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                border: 'none',
                                                color: newComment.trim() ? '#D4AF37' : '#666',
                                                cursor: newComment.trim() ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
