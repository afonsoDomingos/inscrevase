/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Type,
    Square,
    Circle as CircleIcon,
    ArrowUpRight,
    MousePointer2,
    Moon,
    Sun,
    RotateCcw,
    Layers,
    Eraser,
    Undo,
    Save,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Hand,
    MessageSquare
} from 'lucide-react';
import Image from 'next/image';
import Whiteboard from './Whiteboard';
import { io, Socket } from 'socket.io-client';
import { authService } from '@/lib/authService';
import { getSocketUrl, getSocketOptions } from '@/lib/socketConfig';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';

interface LiveBoardContainerProps {
    formId: string;
    isMentor: boolean;
    mentorData: {
        name: string;
        photo: string;
        title: string;
    };
    onClose: () => void;
    primaryColor?: string;
}

export default function LiveBoardContainer({
    formId,
    isMentor,
    mentorData,
    onClose,
    primaryColor = '#CFB53B'
}: LiveBoardContainerProps) {
    const { t } = useTranslate();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [color, setColor] = useState('#000000');
    const brushSize = 3;
    const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'laser' | 'text'>('pen');
    const [isDark, setIsDark] = useState(false);
    const [undoTrigger, setUndoTrigger] = useState(0);
    const [isAudioActive, setIsAudioActive] = useState(false);
    const [isParticipantAudioMuted, setIsParticipantAudioMuted] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [reactions, setReactions] = useState<{ id: string, emoji: string, x: number, y: number }[]>([]);

    // Page Management
    const [pages, setPages] = useState<{ history: any[], backgroundImage: string | null }[]>([{ history: [], backgroundImage: null }]);
    const [currentPage, setCurrentPage] = useState(0);

    // Chat
    const [messages, setMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        const newSocket = io(getSocketUrl(), getSocketOptions());

        newSocket.on('connect', () => {
            console.log('[LiveBoard] Connected to socket');
            newSocket.emit('live_board:join', formId);
        });

        newSocket.on('live_board:hand_raised', ({ userData }: any) => {
            if (isMentor) {
                toast(t('hub.liveBoard.handRaisedToast', { name: userData.name }), {
                    description: "O participante tem uma pergunta.",
                    action: {
                        label: "Ok",
                        onClick: () => console.log("Hand raise acknowledged")
                    }
                });
            }
        });

        newSocket.on('live_board:participants', (list: any[]) => {
            console.log('[LiveBoard] Participants updated:', list);
            setParticipants(list);
        });

        if (!isMentor) {
            newSocket.on('live_board:audio_data', (data: ArrayBuffer) => {
                if (!isParticipantAudioMuted) {
                    playAudioChunk(data);
                }
            });
        }

        newSocket.on('live_board:reaction', (data: any) => {
            const id = Math.random().toString(36).substr(2, 9);
            setReactions(prev => [...prev, { ...data, id }]);
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 3000);
        });

        newSocket.on('live_board:page_change', ({ index, pages: syncedPages }: any) => {
            if (!isMentor) {
                setCurrentPage(index);
                if (syncedPages) setPages(syncedPages);
            }
        });

        newSocket.on('live_board:message', (msg: any) => {
            setMessages(prev => [...prev, msg]);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [formId, isMentor, isParticipantAudioMuted, t]);

    const playAudioChunk = async (data: ArrayBuffer) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        try {
            const buffer = await audioContextRef.current.decodeAudioData(data);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start();
        } catch (e) {
            console.error("Error playing audio chunk", e);
        }
    };

    const handleStartAudio = async () => {
        try {
            // Check if mediaDevices is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error("Seu navegador não suporta gravação de áudio.");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Detect supported MIME type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm');

            const recorder = new MediaRecorder(stream, { mimeType });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0 && socket) {
                    e.data.arrayBuffer().then(buffer => {
                        socket.emit('live_board:audio_stream', { formId, data: buffer });
                    });
                }
            };

            recorder.start(250); // Send chunks every 250ms
            mediaRecorderRef.current = recorder;
            setIsAudioActive(true);
            toast.success(t('hub.liveBoard.audioEnabled'));
        } catch (err: any) {
            console.error("Microphone error:", err);

            if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                toast.error("Nenhum microfone foi encontrado. Verifique se ele está conectado.");
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                toast.error("Permissão de microfone negada. Ative-a nas configurações do navegador.");
            } else {
                toast.error("Erro ao acessar microfone. Verifique as permissões.");
            }
        }
    };

    const handleStopAudio = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsAudioActive(false);
        }
    };

    const handleRaiseHand = () => {
        if (socket) {
            socket.emit('live_board:raise_hand', {
                formId,
                userData: authService.getCurrentUser()
            });
            setIsHandRaised(true);
            toast.success(t('hub.liveBoard.handRaisedSuccess'));
            setTimeout(() => setIsHandRaised(false), 5000);
        }
    };

    const addPage = () => {
        if (!isMentor) return;
        const newPages = [...pages, { history: [], backgroundImage: null }];
        setPages(newPages);
        setCurrentPage(newPages.length - 1);
        socket?.emit('live_board:page_change', { formId, index: newPages.length - 1, pages: newPages });
    };

    const changePage = (index: number) => {
        if (!isMentor) return;
        setCurrentPage(index);
        socket?.emit('live_board:page_change', { formId, index, pages });
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && isMentor) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                const newPages = [...pages];
                newPages[currentPage].backgroundImage = base64;
                setPages(newPages);
                socket?.emit('live_board:page_change', { formId, index: currentPage, pages: newPages });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !socket) return;

        const userData = authService.getCurrentUser();
        socket.emit('live_board:message', {
            formId,
            message: chatInput.trim(),
            userData: userData || mentorData // Fallback if user data not readily available
        });
        setChatInput("");
    };

    const sendReaction = (emoji: string) => {
        if (socket) {
            const data = {
                emoji,
                x: 40 + Math.random() * 20, // Bottom left area
                y: 80 + Math.random() * 10
            };
            socket.emit('live_board:reaction', { formId, ...data });
        }
    };

    const saveBoard = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `board-${formId}-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            toast.success(t('hub.liveBoard.saveSuccess'));
        }
    };

    if (!socket) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="live-board-main"
            style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                background: isDark ? '#1a1a1a' : '#fff',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                color: isDark ? '#fff' : '#111'
            }}
        >
            {/* Minimal Top Header */}
            <div style={{
                padding: '10px 25px',
                background: isDark ? '#1a1a1a' : '#fff',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '60px',
                backdropFilter: 'blur(10px)',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${primaryColor}` }}>
                        <Image
                            src={mentorData.photo || '/default-avatar.png'}
                            width={36}
                            height={36}
                            style={{ objectFit: 'cover' }}
                            alt={mentorData.name}
                        />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111' }}>{mentorData.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600 }}>{mentorData.title}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Participant Avatars (Overlap Style like Google Meet) */}
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                        {participants.slice(0, 5).map((p, idx) => (
                            <div
                                key={p.id || idx}
                                title={p.name}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '2px solid #fff',
                                    marginLeft: idx === 0 ? 0 : '-12px',
                                    overflow: 'hidden',
                                    background: '#f0f0f0',
                                    zIndex: 10 - idx,
                                    position: 'relative'
                                }}
                            >
                                <Image
                                    src={p.photo || '/default-avatar.png'}
                                    width={32}
                                    height={32}
                                    alt={p.name}
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ))}
                        {participants.length > 5 && (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#111',
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #fff',
                                marginLeft: '-12px',
                                zIndex: 0
                            }}>
                                +{participants.length - 5}
                            </div>
                        )}
                        <span style={{ marginLeft: '12px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>
                            {participants.length} {participants.length === 1 ? 'conetado' : 'conectados'}
                        </span>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isDark ? '#fff' : '#444'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff4757' }} className="animate-pulse" />
                        <span>LIVE BOARD</span>
                    </div>

                    {isMentor && (
                        <button
                            onClick={onClose}
                            style={{
                                background: '#fee2e2',
                                color: '#ef4444',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <X size={16} /> Encerramento
                        </button>
                    )}
                </div>
            </div>

            {/* Canvas Area */}
            <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
                <Whiteboard
                    isMentor={isMentor}
                    socket={socket}
                    formId={formId}
                    color={color}
                    brushSize={brushSize}
                    isEraser={tool === 'eraser'}
                    undoTrigger={undoTrigger}
                    tool={tool}
                    isDark={isDark}
                    backgroundImage={pages[currentPage]?.backgroundImage}
                />

                {/* Floating Reactions Render */}
                <AnimatePresence>
                    {reactions.map((r) => (
                        <motion.div
                            key={r.id}
                            initial={{ y: 0, x: `${r.x}%`, opacity: 0, scale: 0.5 }}
                            animate={{ y: -400, opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.5, 1] }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                bottom: '20px',
                                fontSize: '2rem',
                                left: 0,
                                pointerEvents: 'none',
                                zIndex: 50
                            }}
                        >
                            {r.emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Participant Audio Control */}
                {!isMentor && (
                    <div style={{ position: 'absolute', bottom: 30, right: 30 }}>
                        <button
                            onClick={() => setIsParticipantAudioMuted(!isParticipantAudioMuted)}
                            style={{
                                background: isParticipantAudioMuted ? '#111' : primaryColor,
                                color: '#fff',
                                width: '54px',
                                height: '54px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            }}
                        >
                            {isParticipantAudioMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                    </div>
                )}

                <div style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    padding: '8px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                    zIndex: 200
                }}>
                    {isMentor ? (
                        <>
                            {/* Colors */}
                            <div style={{ display: 'flex', gap: '4px', paddingRight: '4px', borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0' }}>
                                {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ff4757', '#ffffff'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: c,
                                            border: '2px solid transparent',
                                            borderColor: color === c && tool !== 'eraser' ? (isDark ? '#fff' : '#000') : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            transform: color === c && tool !== 'eraser' ? 'scale(1.1)' : 'scale(1)',
                                            boxShadow: color === c && tool !== 'eraser' ? `0 4px 12px ${c}40` : 'none'
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Main Tools */}
                            <div style={{ display: 'flex', gap: '2px', padding: '0 4px', borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0' }}>
                                {[
                                    { id: 'pen', icon: <RotateCcw size={18} style={{ transform: 'rotate(90deg)' }} /> }, // Pencil replacement
                                    { id: 'eraser', icon: <Eraser size={18} /> },
                                    { id: 'laser', icon: <MousePointer2 size={18} /> },
                                    { id: 'rectangle', icon: <Square size={18} /> },
                                    { id: 'circle', icon: <CircleIcon size={18} /> },
                                    { id: 'arrow', icon: <ArrowUpRight size={18} /> },
                                    { id: 'text', icon: <Type size={18} /> }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTool(t.id as any)}
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '10px',
                                            background: tool === t.id ? (isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0') : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: tool === t.id ? (isDark ? '#fff' : '#111') : (isDark ? '#aaa' : '#666'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        title={t.id}
                                    >
                                        {t.id === 'pen' ? <Save size={0} /> : null} {/* placeholder logic removed */}
                                        {t.icon}
                                    </button>
                                ))}
                                {/* Actual Pen Icon Fix */}
                                <button
                                    onClick={() => setTool('pen')}
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '10px',
                                        background: tool === 'pen' ? (isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0') : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: tool === 'pen' ? (isDark ? '#fff' : '#111') : (isDark ? '#aaa' : '#666'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <button onClick={() => setUndoTrigger(prev => prev + 1)} style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Undo"><Undo size={18} /></button>

                                <input type="file" id="bg-upload" hidden accept="image/*" onChange={handleBackgroundUpload} />
                                <button onClick={() => document.getElementById('bg-upload')?.click()} style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Background Image"><Layers size={18} /></button>

                                <button onClick={() => setIsDark(!isDark)} style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Toggle Theme">{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>

                                <button onClick={saveBoard} style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Save"><Save size={18} /></button>

                                <div style={{ width: '1px', height: '24px', background: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0', margin: '0 4px' }} />

                                {/* Page Navigation */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0' }}>
                                    <button
                                        onClick={() => currentPage > 0 && changePage(currentPage - 1)}
                                        style={{ background: 'none', border: 'none', color: isDark ? '#fff' : '#666', cursor: 'pointer', opacity: currentPage === 0 ? 0.3 : 1 }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    </button>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{currentPage + 1} / {pages.length}</span>
                                    <button
                                        onClick={() => currentPage < pages.length - 1 ? changePage(currentPage + 1) : addPage()}
                                        style={{ background: 'none', border: 'none', color: isDark ? '#fff' : '#666', cursor: 'pointer' }}
                                    >
                                        {currentPage < pages.length - 1 ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                        )}
                                    </button>
                                </div>

                                <button
                                    onClick={isAudioActive ? handleStopAudio : handleStartAudio}
                                    style={{
                                        background: isAudioActive ? '#fee2e2' : (isDark ? 'rgba(14, 165, 233, 0.2)' : '#f0f9ff'),
                                        color: isAudioActive ? '#ef4444' : '#0ea5e9',
                                        border: 'none',
                                        padding: '0 12px',
                                        height: '38px',
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {isAudioActive ? <MicOff size={16} /> : <Mic size={16} />}
                                    {isAudioActive ? 'Silenciar' : 'Falar'}
                                </button>

                                <div style={{ width: '1px', height: '24px', background: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0', margin: '0 4px' }} />

                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#111',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0 12px',
                                        height: '38px',
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <MessageSquare size={16} /> Chat
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Participant View */}
                            <div style={{ display: 'flex', gap: '6px', padding: '4px' }}>
                                {['❤️', '👏', '🔥', '😮', '😂', '💯'].map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => sendReaction(emoji)}
                                        style={{
                                            fontSize: '1.4rem',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <div style={{ width: '1px', height: '24px', background: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0', margin: '0 8px' }} />
                            <button
                                onClick={handleRaiseHand}
                                disabled={isHandRaised}
                                style={{
                                    background: isHandRaised ? (isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8') : '#f0f9ff',
                                    color: isHandRaised ? '#888' : '#0ea5e9',
                                    border: 'none',
                                    padding: '0 16px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    cursor: isHandRaised ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.8rem'
                                }}
                            >
                                <Hand size={18} /> {isHandRaised ? 'Mão Levantada' : 'Dúvida'}
                            </button>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                style={{
                                    background: isDark ? 'rgba(255,255,255,0.1)' : '#111',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0 16px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.8rem'
                                }}
                            >
                                <MessageSquare size={18} /> Perguntas
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Sidebar Perguntas */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '320px',
                            height: '100%',
                            background: '#fff',
                            boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
                            zIndex: 10000,
                            display: 'flex',
                            flexDirection: 'column',
                            borderLeft: '1px solid #f0f0f0'
                        }}
                    >
                        <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111' }}>Perguntas e Chat</div>
                            <button onClick={() => setIsSidebarOpen(false)} style={{ background: '#f8f8f8', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
                        </div>
                        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                            {messages.length === 0 ? (
                                <div style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
                                    <p>Nenhuma pergunta ainda.</p>
                                    <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Seja o primeiro a mandar algo!</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f0f0f0' }}>
                                            <Image src={msg.userData?.photo || msg.userData?.profilePhoto || '/default-avatar.png'} width={30} height={30} alt="" style={{ objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#111', marginBottom: '2px' }}>{msg.userData?.name || 'Usuário'}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#444', lineHeight: '1.4', background: '#f8f8f8', padding: '8px 12px', borderRadius: '0 12px 12px 12px' }}>{msg.message}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid #f0f0f0' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Escreva algo..."
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #e0e0e0',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    style={{
                                        background: chatInput.trim() ? primaryColor : '#f0f0f0',
                                        color: chatInput.trim() ? '#fff' : '#ccc',
                                        border: 'none',
                                        padding: '0 20px',
                                        borderRadius: '12px',
                                        fontWeight: 800,
                                        cursor: chatInput.trim() ? 'pointer' : 'default'
                                    }}
                                >
                                    Enviar
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style jsx>{`
                @keyframes pulse-subtle {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s infinite ease-in-out;
                }
            `}</style>
        </motion.div>
    );
}
