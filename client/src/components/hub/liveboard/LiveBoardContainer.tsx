/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eraser,
    Undo,
    Save,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Hand,
    MessageSquare,
    X,
    Users
} from 'lucide-react';
import Whiteboard from './Whiteboard';
import { io, Socket } from 'socket.io-client';
import { authService } from '@/lib/authService';
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
    const [brushSize, setBrushSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);
    const [undoTrigger, setUndoTrigger] = useState(0);
    const [clearTrigger, setClearTrigger] = useState(0);
    const [isAudioActive, setIsAudioActive] = useState(false);
    const [isParticipantAudioMuted, setIsParticipantAudioMuted] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [participantsCount, setParticipantsCount] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const token = authService.getToken();
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket']
        });

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

        if (!isMentor) {
            newSocket.on('live_board:audio_data', (data: ArrayBuffer) => {
                if (!isParticipantAudioMuted) {
                    playAudioChunk(data);
                }
            });
        }

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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

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
        } catch (err) {
            console.error("Microphone permission denied", err);
            toast.error("Erro ao acessar microfone. Verifique as permissões.");
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="live-board-main"
            style={{
                width: '100%',
                background: '#f0f0f0',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
                marginBottom: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: '75vh',
                position: 'relative',
                border: `1px solid ${primaryColor}40`
            }}
        >
            {/* Header */}
            <div style={{
                padding: '20px 30px',
                background: '#fff',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={mentorData.photo || '/default-avatar.png'}
                            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${primaryColor}` }}
                            alt={mentorData.name}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: -5,
                            right: -5,
                            background: '#ff4757',
                            color: '#fff',
                            fontSize: '0.65rem',
                            padding: '3px 7px',
                            borderRadius: '100px',
                            fontWeight: 900,
                            letterSpacing: '0.5px',
                            boxShadow: '0 4px 10px rgba(255,71,87,0.3)',
                            animation: 'pulse 1.5s infinite'
                        }}>{t('hub.liveBoard.liveNow')}</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111' }}>{mentorData.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{mentorData.title}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#f8f8f8',
                        padding: '8px 16px',
                        borderRadius: '100px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#666',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4757' }} />
                        <span>Live Board</span>
                    </div>
                    {isMentor && (
                        <button
                            onClick={onClose}
                            style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '100px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                        >
                            <X size={18} /> {t('hub.liveBoard.endSession')}
                        </button>
                    )}
                </div>
            </div>

            {/* Canvas Area */}
            <div style={{ flex: 1, position: 'relative', background: '#fff', overflow: 'hidden' }}>
                <Whiteboard
                    isMentor={isMentor}
                    socket={socket}
                    formId={formId}
                    color={color}
                    brushSize={brushSize}
                    isEraser={isEraser}
                    undoTrigger={undoTrigger}
                    clearTrigger={clearTrigger}
                />

                {/* Participant Audio Control */}
                {!isMentor && (
                    <div style={{ position: 'absolute', bottom: 25, left: 25, zIndex: 10 }}>
                        <button
                            onClick={() => setIsParticipantAudioMuted(!isParticipantAudioMuted)}
                            style={{
                                background: isParticipantAudioMuted ? '#111' : primaryColor,
                                color: '#fff',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isParticipantAudioMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <div style={{
                padding: '15px 30px',
                background: '#fff',
                borderTop: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '25px',
                zIndex: 10
            }}>
                {isMentor ? (
                    <>
                        <div style={{ display: 'flex', gap: '10px', borderRight: '1px solid #eee', paddingRight: '25px' }}>
                            {['#000000', '#ff4757', '#2e86de', '#27ae60', '#f1c40f'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => { setColor(c); setIsEraser(false); }}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: c,
                                        border: color === c && !isEraser ? '4px solid #f0f0f0' : '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        transform: color === c && !isEraser ? 'scale(1.2)' : 'scale(1)',
                                        boxShadow: color === c && !isEraser ? `0 0 15px ${c}50` : 'none'
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                                onClick={() => setIsEraser(!isEraser)}
                                style={{ background: isEraser ? `${primaryColor}15` : 'transparent', border: 'none', width: '45px', height: '45px', borderRadius: '14px', cursor: 'pointer', color: isEraser ? primaryColor : '#111', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title={t('hub.liveBoard.eraser')}
                            >
                                <Eraser size={24} />
                            </button>
                            <button
                                onClick={() => setUndoTrigger(prev => prev + 1)}
                                style={{ background: 'transparent', border: 'none', width: '45px', height: '45px', borderRadius: '14px', cursor: 'pointer', color: '#111', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title={t('hub.liveBoard.undo')}
                            >
                                <Undo size={24} />
                            </button>
                            <button
                                onClick={saveBoard}
                                style={{ background: 'transparent', border: 'none', width: '45px', height: '45px', borderRadius: '14px', cursor: 'pointer', color: '#111', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title={t('hub.liveBoard.save')}
                            >
                                <Save size={24} />
                            </button>
                            <div style={{ width: '1px', height: '30px', background: '#eee', margin: '0 10px' }}></div>
                            <button
                                onClick={isAudioActive ? handleStopAudio : handleStartAudio}
                                style={{
                                    background: isAudioActive ? '#ff475715' : `${primaryColor}15`,
                                    color: isAudioActive ? '#ff4757' : primaryColor,
                                    border: `1.5px solid ${isAudioActive ? '#ff475730' : `${primaryColor}30`}`,
                                    padding: '10px 25px',
                                    borderRadius: '100px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isAudioActive ? <MicOff size={20} /> : <Mic size={20} />}
                                {isAudioActive ? t('hub.liveBoard.muteAudio') : t('hub.liveBoard.unmuteAudio')}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleRaiseHand}
                            disabled={isHandRaised}
                            style={{
                                background: isHandRaised ? '#f8f8f8' : `${primaryColor}15`,
                                color: isHandRaised ? '#aaa' : primaryColor,
                                border: `1.5px solid ${isHandRaised ? '#eee' : `${primaryColor}30`}`,
                                padding: '14px 35px',
                                borderRadius: '100px',
                                fontWeight: 900,
                                cursor: isHandRaised ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Hand size={22} /> {t('hub.liveBoard.raiseHand')}
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            style={{
                                background: '#111',
                                color: '#fff',
                                border: 'none',
                                padding: '14px 35px',
                                borderRadius: '100px',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '1rem',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s'
                            }}
                        >
                            <MessageSquare size={22} /> {t('hub.liveBoard.questions')}
                        </button>
                    </>
                )}
            </div>

            {/* Chat Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '350px',
                            height: '100%',
                            background: '#fff',
                            boxShadow: '-20px 0 50px rgba(0,0,0,0.15)',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            borderLeft: '1px solid #eee'
                        }}
                    >
                        <div style={{ padding: '25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{t('hub.liveBoard.chatTitle')}</div>
                            <button onClick={() => setIsSidebarOpen(false)} style={{ background: '#f8f8f8', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>
                        <div style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
                            <div style={{ background: '#fcfcfc', border: '1px dashed #eee', padding: '30px 20px', borderRadius: '20px', color: '#888', fontSize: '0.9rem', textAlign: 'center', marginTop: '50px' }}>
                                <MessageSquare size={40} style={{ opacity: 0.1, marginBottom: '15px' }} />
                                <p>Pergunte ao mentor em tempo real. Suas mensagens aparecerão aqui.</p>
                            </div>
                        </div>
                        <div style={{ padding: '25px', borderTop: '1px solid #eee' }}>
                            <input
                                placeholder={t('hub.liveBoard.chatPlaceholder')}
                                style={{
                                    width: '100%',
                                    padding: '15px 20px',
                                    borderRadius: '16px',
                                    border: '1.5px solid #eee',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = primaryColor}
                                onBlur={(e) => e.target.style.borderColor = '#eee'}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </motion.div>
    );
}
