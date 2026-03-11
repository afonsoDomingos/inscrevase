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
    X
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
    const [isEraser, setIsEraser] = useState(false);
    const [undoTrigger, setUndoTrigger] = useState(0);
    const [isAudioActive, setIsAudioActive] = useState(false);
    const [isParticipantAudioMuted, setIsParticipantAudioMuted] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);

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
                background: '#fff',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Minimal Top Header */}
            <div style={{
                padding: '10px 25px',
                background: '#fff',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '60px'
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
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#f8f8f8',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#444'
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
                    isEraser={isEraser}
                    undoTrigger={undoTrigger}
                />

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

                {/* FLOATING TOOLBAR - Baseado na Inspiração */}
                <div style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    padding: '8px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid #f0f0f0'
                }}>
                    {isMentor ? (
                        <>
                            <div style={{ display: 'flex', gap: '4px', paddingRight: '8px', borderRight: '1px solid #f0f0f0' }}>
                                {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => { setColor(c); setIsEraser(false); }}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: c,
                                            border: '3px solid transparent',
                                            borderColor: color === c && !isEraser ? '#f0f0f0' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            transform: color === c && !isEraser ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
                                            boxShadow: color === c && !isEraser ? `0 4px 12px ${c}40` : 'none'
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setIsEraser(!isEraser)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: isEraser ? '#f0f0f0' : 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isEraser ? '#111' : '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Eraser size={20} strokeWidth={2.5} />
                            </button>

                            <button
                                onClick={() => setUndoTrigger(prev => prev + 1)}
                                style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Undo size={20} strokeWidth={2.5} />
                            </button>

                            <button
                                onClick={saveBoard}
                                style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Save size={20} strokeWidth={2.5} />
                            </button>

                            <div style={{ width: '1px', height: '24px', background: '#f0f0f0', margin: '0 8px' }} />

                            <button
                                onClick={isAudioActive ? handleStopAudio : handleStartAudio}
                                style={{
                                    background: isAudioActive ? '#fee2e2' : '#f0f9ff',
                                    color: isAudioActive ? '#ef4444' : '#0ea5e9',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {isAudioActive ? <MicOff size={18} /> : <Mic size={18} />}
                                {isAudioActive ? 'Silenciar' : 'Falar'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleRaiseHand}
                                disabled={isHandRaised}
                                style={{
                                    background: isHandRaised ? '#f8f8f8' : '#f0f9ff',
                                    color: isHandRaised ? '#ccc' : '#0ea5e9',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    cursor: isHandRaised ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <Hand size={20} /> Levantar Mão
                            </button>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                style={{
                                    background: '#111',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <MessageSquare size={20} /> Perguntas
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
                            <div style={{ fontWeight: 800, fontSize: '1rem' }}>Perguntas</div>
                            <button onClick={() => setIsSidebarOpen(false)} style={{ background: '#f8f8f8', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ flex: 1, padding: '20px', color: '#999', fontSize: '0.9rem', textAlign: 'center', paddingTop: '100px' }}>
                            <p>O chat em tempo real aparecerá aqui em breve.</p>
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
